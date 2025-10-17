/**
 * Ultra-minimal SQLite backup uploader
 * 
 * Quick script to backup SQLite to Nextcloud
 */

const axios = require('axios');
const fs = require('fs');

// Configuration - Update these
const NEXTCLOUD_URL = 'http://localhost:8080';
const USERNAME = '';
const PASSWORD = '';
const SQLITE_FILE = './daily_takings.sqlite3'; // Path to your SQLite file
const BACKUP_FOLDER = 'cashier';     // Folder name on Nextcloud (without leading /)

// Generate backup filename with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const backupFileName = `backup_${timestamp}.db`;

// Build WebDAV URL
const encodedUsername = encodeURIComponent(USERNAME);
const uploadUrl = `${NEXTCLOUD_URL}/remote.php/dav/files/${encodedUsername}/${BACKUP_FOLDER}/${backupFileName}`;

console.log('Uploading backup...');

// Create folder first (ignore error if exists)
const folderUrl = `${NEXTCLOUD_URL}/remote.php/dav/files/${encodedUsername}/${BACKUP_FOLDER}`;
axios({
    method: 'MKCOL',
    url: folderUrl,
    auth: { username: USERNAME, password: PASSWORD }
}).catch(() => {}); // Ignore error if folder exists

// Upload file
fs.readFile(SQLITE_FILE, async (err, data) => {
    if (err) {
        console.error('Error reading file:', err.message);
        return;
    }
    
    try {
        await axios({
            method: 'PUT',
            url: uploadUrl,
            auth: { username: USERNAME, password: PASSWORD },
            headers: { 'Content-Type': 'application/octet-stream' },
            data: data,
            maxBodyLength: Infinity
        });
        
        console.log('✓ Backup uploaded successfully!');
        console.log(`  File: ${backupFileName}`);
        console.log(`  Size: ${(data.length / 1024).toFixed(2)} KB`);
    } catch (error) {
        console.error('✗ Upload failed:', error.message);
    }
});
