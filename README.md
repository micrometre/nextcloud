# Nextcloud JavaScript API Examples

This repository contains examples for interacting with Nextcloud using JavaScript.

## Setup

1. Start Nextcloud with Docker:
   ```bash
   docker-compose up -d
   ```

2. Access Nextcloud at http://localhost:8080 and complete the setup wizard to create an admin account.

3. Install Node.js dependencies:
   ```bash
   npm install
   ```

4. Update the credentials in the JavaScript files:
   - `USERNAME`: Your Nextcloud username
   - `PASSWORD`: Your Nextcloud password or app password
   - `NEXTCLOUD_URL`: Your Nextcloud URL (default: http://localhost:8080)

## Usage

### Option 1: Using Axios (Recommended for Node.js)

```bash
node list-folders-axios.js
```

This uses the `axios` library for HTTP requests and `xml2js` for parsing XML responses.

### Option 2: Using Fetch API

```bash
node list-folders.js
```

This uses the native Fetch API (available in Node.js 18+ or browsers).

## API Functions

### `listFolders(path)`
Lists all files and folders in the specified path.

```javascript
const items = await listFolders('/Photos');
console.log(items);
```

### `listFoldersOnly(path)`
Lists only folders in the specified path.

```javascript
const folders = await listFoldersOnly('/');
folders.forEach(folder => {
    console.log(folder.name);
});
```

### `createFolder(path)`
Creates a new folder (axios version only).

```javascript
await createFolder('/MyNewFolder');
```

## Using in Browser

You can also use these functions in a browser. For the fetch-based version (`list-folders.js`):

1. Remove the `Buffer` usage and use `btoa()` instead:
   ```javascript
   const auth = btoa(`${USERNAME}:${PASSWORD}`);
   ```

2. Include the script in your HTML:
   ```html
   <script src="list-folders.js"></script>
   <script>
       listFolders('/').then(items => {
           console.log(items);
       });
   </script>
   ```

## Security Notes

- **Never commit credentials to version control**
- Use **App Passwords** instead of your main password (Settings → Security → Devices & sessions)
- For production, use HTTPS instead of HTTP
- Consider using environment variables for credentials

## Nextcloud WebDAV Endpoints

- List files: `PROPFIND /remote.php/dav/files/{username}/{path}`
- Upload file: `PUT /remote.php/dav/files/{username}/{path}`
- Download file: `GET /remote.php/dav/files/{username}/{path}`
- Delete: `DELETE /remote.php/dav/files/{username}/{path}`
- Create folder: `MKCOL /remote.php/dav/files/{username}/{path}`
- Move/Rename: `MOVE /remote.php/dav/files/{username}/{path}`
- Copy: `COPY /remote.php/dav/files/{username}/{path}`

## Additional Resources

- [Nextcloud WebDAV Documentation](https://docs.nextcloud.com/server/latest/user_manual/en/files/access_webdav.html)
- [WebDAV API Reference](https://docs.nextcloud.com/server/latest/developer_manual/client_apis/WebDAV/index.html)
