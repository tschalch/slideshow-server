# Slideshow Collection Platform

A web-based platform for hosting and displaying multiple interactive slideshows with automatic discovery and SFTP upload support.

## Features

- **Auto-Discovery**: Automatically detects and displays slideshows from folders starting with `__Slideshow `
- **SFTP Upload**: Upload slideshows remotely via SFTP
- **Docker Ready**: Complete Docker Compose setup with automatic regeneration
- **Mobile Friendly**: Responsive design that works on all devices
- **PWA Support**: Progressive Web App capabilities with offline support

## Quick Start (Docker)

1. Start the services:
   ```bash
   docker-compose up -d
   ```

2. Access the site:
   - Web: http://localhost:8881
   - SFTP: localhost:2222 (user: `slides`, password in docker-compose.yml)

3. Upload slideshows via SFTP to the root directory with names starting with `__Slideshow `

4. Slideshows appear automatically on the main page!

## Manual Setup (Without Docker)

1. Install Node.js (v16 or higher)

2. Generate the slideshow list:
   ```bash
   node generate-slideshows.js
   ```

3. Serve the files with any web server:
   ```bash
   python -m http.server 8080
   ```
   or
   ```bash
   npx serve
   ```

## Adding Slideshows

### Via SFTP (Docker)
Upload a folder starting with `__Slideshow ` containing an `index.html` file.

### Manually
1. Create a folder with the `__Slideshow ` prefix:
   ```bash
   mkdir "__Slideshow My Topic"
   ```

2. Add your slideshow files (must include `index.html`)

3. If using Docker, changes are detected automatically. Otherwise:
   ```bash
   node generate-slideshows.js
   ```

## File Structure

```
.
├── index.html                  # Main landing page
├── manifest.json              # PWA manifest
├── sw.js                      # Service worker
├── generate-slideshows.js     # Slideshow discovery script
├── watch-and-generate.js      # File watcher for auto-regeneration
├── docker-compose.yml         # Docker setup
├── slideshows.json           # Generated slideshow list (auto-created)
├── __Slideshow Gene Expression/
│   └── index.html
├── __Slideshow Module Intro/
│   └── index.html
└── ...
```

## Development

### Watch for Changes (Local)
```bash
node watch-and-generate.js
```

### View Logs (Docker)
```bash
docker-compose logs -f slideshow-generator
```

### Restart Services
```bash
docker-compose restart
```

## Metadata

Slideshows can include metadata in their `index.html`:

```html
<title>Your Slideshow Title</title>
<meta name="description" content="Description of your slideshow">
```

This metadata is automatically extracted and displayed on the main page.

## Ports

- **8881**: Web server (nginx)
- **2222**: SFTP server

## License

This project is for educational and presentation purposes.
