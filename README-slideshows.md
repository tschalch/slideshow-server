# Slideshow Auto-Discovery

This site automatically discovers and displays slideshows from folders starting with `__Slideshow `.

## How It Works

1. **Folder Structure**: Create slideshow folders with the prefix `__Slideshow ` (e.g., `__Slideshow Gene Expression`)
2. **Generation**: Run the generator script to scan for slideshow folders (or use Docker for automatic watching)
3. **Display**: The index.html automatically loads and displays all discovered slideshows

## Docker Setup (Automatic)

When using Docker Compose, the slideshow list regenerates automatically:

```bash
docker-compose up -d
```

The `slideshow-generator` service watches for:
- New folders starting with `__Slideshow `
- Changes to `index.html` files in slideshow folders
- Automatically runs `generate-slideshows.js` when changes are detected

Upload slideshows via SFTP on port 2222, and they'll appear automatically!

## Manual Setup (Without Docker)

### Adding New Slideshows

1. Create a new folder with the `__Slideshow ` prefix:
   ```bash
   mkdir "__Slideshow Your Topic"
   ```

2. Add your slideshow content inside (must include `index.html`)

3. Regenerate the slideshow list:
   ```bash
   node generate-slideshows.js
   ```
   or
   ```bash
   ./generate-slideshows.js
   ```

4. The new slideshow will automatically appear on the main page

### Continuous Watching (Local Development)

To automatically regenerate when files change:
```bash
node watch-and-generate.js
```

## Metadata Extraction

The generator automatically extracts:
- **Title**: From the `<title>` tag in the slideshow's index.html
- **Description**: From the `<meta name="description">` tag
- **Icon**: Auto-generated from the folder name (first letters of words)

If no title is found, it uses the folder name without the prefix.

## Files

- `generate-slideshows.js` - Script to scan and generate slideshow list
- `slideshows.json` - Generated list of slideshows (auto-created)
- `index.html` - Main page that displays slideshows
