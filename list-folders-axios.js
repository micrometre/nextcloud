/**
 * Nextcloud Folder Listing using Axios
 * 
 * Alternative implementation using axios library for easier HTTP requests
 * Install with: npm install axios xml2js
 */

const axios = require('axios');
const xml2js = require('xml2js');

// Configuration
const NEXTCLOUD_URL = 'http://localhost:8080';
const USERNAME = '';
const PASSWORD = '';

/**
 * List folders and files in a Nextcloud directory using axios
 * @param {string} path - The path to list
 * @returns {Promise<Array>} - Array of items
 */
async function listFolders(path = '/') {
    // URL encode the username to handle special characters like @ 
    const encodedUsername = encodeURIComponent(USERNAME);
    const webdavUrl = `${NEXTCLOUD_URL}/remote.php/dav/files/${encodedUsername}${path}`;
    
    console.log('Requesting:', webdavUrl);
    
    const propfindBody = `<?xml version="1.0"?>
        <d:propfind xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns">
            <d:prop>
                <d:displayname />
                <d:getlastmodified />
                <d:getetag />
                <d:getcontenttype />
                <d:resourcetype />
                <d:getcontentlength />
                <oc:fileid />
            </d:prop>
        </d:propfind>`;
    
    try {
        const response = await axios({
            method: 'PROPFIND',
            url: webdavUrl,
            auth: {
                username: USERNAME,
                password: PASSWORD
            },
            headers: {
                'Content-Type': 'application/xml',
                'Depth': '1'
            },
            data: propfindBody
        });
        
        return await parseWebDAVResponse(response.data);
    } catch (error) {
        if (error.response) {
            console.error('HTTP Error:', error.response.status, error.response.statusText);
            console.error('Response data:', error.response.data);
        }
        console.error('Error listing folders:', error.message);
        throw error;
    }
}

/**
 * Parse WebDAV XML response using xml2js
 * @param {string} xmlData - The XML response
 * @returns {Promise<Array>} - Parsed array of items
 */
async function parseWebDAVResponse(xmlData) {
    const parser = new xml2js.Parser({
        explicitArray: false,
        tagNameProcessors: [xml2js.processors.stripPrefix]
    });
    
    try {
        const result = await parser.parseStringPromise(xmlData);
        
        // Handle both single and multiple responses
        if (!result.multistatus || !result.multistatus.response) {
            console.error('Invalid WebDAV response structure');
            return [];
        }
        
        const responses = Array.isArray(result.multistatus.response) 
            ? result.multistatus.response 
            : [result.multistatus.response];
        
        const items = [];
        
        // Skip the first item (parent directory)
        for (let i = 1; i < responses.length; i++) {
            const response = responses[i];
            
            // Handle propstat - it might be an array or object
            let propstat = response.propstat;
            if (Array.isArray(propstat)) {
                // Find the propstat with status 200 OK
                propstat = propstat.find(ps => ps.status && ps.status.includes('200'));
            }
            
            if (!propstat || !propstat.prop) {
                console.warn('Skipping item without valid propstat:', response.href);
                continue;
            }
            
            const prop = propstat.prop;
            
            // Check if it's a directory
            const isDirectory = prop.resourcetype && 
                               (prop.resourcetype.collection !== undefined || 
                                prop.resourcetype === '' ||
                                typeof prop.resourcetype === 'object');
            
            items.push({
                name: prop.displayname || '',
                path: response.href,
                isDirectory: isDirectory,
                type: isDirectory ? 'directory' : 'file',
                size: parseInt(prop.getcontentlength || 0),
                lastModified: prop.getlastmodified ? new Date(prop.getlastmodified) : null,
                contentType: prop.getcontenttype || '',
                fileId: prop.fileid || ''
            });
        }
        
        return items;
    } catch (parseError) {
        console.error('XML parsing error:', parseError.message);
        console.error('Raw XML data:', xmlData);
        throw parseError;
    }
}

/**
 * List only folders
 */
async function listFoldersOnly(path = '/') {
    const items = await listFolders(path);
    return items.filter(item => item.isDirectory);
}

/**
 * Create a folder
 * @param {string} path - The path of the new folder
 */
async function createFolder(path) {
    const webdavUrl = `${NEXTCLOUD_URL}/remote.php/dav/files/${USERNAME}${path}`;
    
    try {
        await axios({
            method: 'MKCOL',
            url: webdavUrl,
            auth: {
                username: USERNAME,
                password: PASSWORD
            }
        });
        console.log(`Folder created: ${path}`);
    } catch (error) {
        console.error('Error creating folder:', error.message);
        throw error;
    }
}

// Example usage
async function main() {
    try {
        console.log('Connecting to Nextcloud...\n');
        
        // List all items
        const items = await listFolders('/');
        console.log('All items in root:');
        items.forEach(item => {
            const icon = item.isDirectory ? '📁' : '📄';
            const size = item.isDirectory ? '' : `(${formatBytes(item.size)})`;
            console.log(`${icon} ${item.name} ${size}`);
        });
        
        console.log('\n---\n');
        
        // List only folders
        const folders = await listFoldersOnly('/');
        console.log('Folders only:');
        folders.forEach(folder => {
            console.log(`📁 ${folder.name}`);
        });
        
    } catch (error) {
        console.error('Failed:', error.message);
    }
}

/**
 * Format bytes to human readable size
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { listFolders, listFoldersOnly, createFolder };
