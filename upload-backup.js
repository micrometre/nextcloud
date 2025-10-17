/**
 * Upload SQLite3 file to Nextcloud backup folder
 * 
 * Minimal script to upload database backups to Nextcloud
 * Usage: node upload-backup.js <path-to-sqlite-file>
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const NEXTCLOUD_URL = 'http://localhost:8080';
const USERNAME = '';
const PASSWORD = '';
const BACKUP_FOLDER = '/cashier'; // Backup folder on Nextcloud

/**
 * Create a folder on Nextcloud if it doesn't exist
 * @param {string} folderPath - The folder path to create
 */
async function createFolder(folderPath) {
    const encodedUsername = encodeURIComponent(USERNAME);
    const webdavUrl = `${NEXTCLOUD_URL}/remote.php/dav/files/${encodedUsername}${folderPath}`;
    
    try {
        await axios({
            method: 'MKCOL',
            url: webdavUrl,
            auth: {
                username: USERNAME,
                password: PASSWORD
            }
        });
        console.log(`✓ Created folder: ${folderPath}`);
    } catch (error) {
        if (error.response && error.response.status === 405) {
            // 405 means folder already exists
            console.log(`✓ Folder already exists: ${folderPath}`);
        } else {
            throw error;
        }
    }
}

/**
 * Upload a file to Nextcloud
 * @param {string} localFilePath - Local path to the file
 * @param {string} remoteFilePath - Remote path on Nextcloud
 */
async function uploadFile(localFilePath, remoteFilePath) {
    const encodedUsername = encodeURIComponent(USERNAME);
    const webdavUrl = `${NEXTCLOUD_URL}/remote.php/dav/files/${encodedUsername}${remoteFilePath}`;
    
    console.log(`Uploading: ${localFilePath} → ${remoteFilePath}`);
    
    try {
        // Read the file
        const fileContent = fs.readFileSync(localFilePath);
        const fileSize = fs.statSync(localFilePath).size;
        
        // Upload to Nextcloud
        const response = await axios({
            method: 'PUT',
            url: webdavUrl,
            auth: {
                username: USERNAME,
                password: PASSWORD
            },
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Length': fileSize
            },
            data: fileContent,
            maxBodyLength: Infinity,
            maxContentLength: Infinity
        });
        
        console.log(`✓ Upload successful! Status: ${response.status}`);
        return true;
    } catch (error) {
        if (error.response) {
            console.error(`✗ HTTP Error: ${error.response.status} ${error.response.statusText}`);
        } else {
            console.error(`✗ Error: ${error.message}`);
        }
        throw error;
    }
}

/**
 * Upload SQLite backup with timestamp
 * @param {string} sqliteFilePath - Path to the SQLite file
 */
async function uploadBackup(sqliteFilePath) {
    try {
        // Check if file exists
        if (!fs.existsSync(sqliteFilePath)) {
            console.error(`✗ File not found: ${sqliteFilePath}`);
            process.exit(1);
        }
        
        console.log('\n📦 Starting backup upload...\n');
        
        // Ensure backup folder exists
        await createFolder(BACKUP_FOLDER);
        
        // Generate timestamped filename
        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        const originalName = path.basename(sqliteFilePath);
        const extension = path.extname(originalName);
        const baseName = path.basename(originalName, extension);
        const backupFileName = `${baseName}_${timestamp}${extension}`;
        
        // Upload the file
        const remotePath = `${BACKUP_FOLDER}/${backupFileName}`;
        await uploadFile(sqliteFilePath, remotePath);
        
        console.log(`\n✓ Backup completed successfully!`);
        console.log(`   Remote path: ${remotePath}`);
        console.log(`   File size: ${(fs.statSync(sqliteFilePath).size / 1024).toFixed(2)} KB\n`);
        
    } catch (error) {
        console.error('\n✗ Backup failed:', error.message);
        process.exit(1);
    }
}

// Main execution
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Usage: node upload-backup.js <path-to-sqlite-file>');
        console.log('Example: node upload-backup.js ./database.db');
        process.exit(1);
    }
    
    const sqliteFile = args[0];
    uploadBackup(sqliteFile);
}

module.exports = { uploadFile, createFolder, uploadBackup };
