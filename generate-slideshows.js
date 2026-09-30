#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SLIDESHOW_PREFIX = '__Slideshow ';
const OUTPUT_FILE = 'slideshows.json';

function extractMetadata(htmlPath) {
    try {
        const content = fs.readFileSync(htmlPath, 'utf8');

        const titleMatch = content.match(/<title>(.*?)<\/title>/);
        const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);

        return {
            title: titleMatch?.[1]?.trim() || '',
            description: descMatch?.[1]?.trim() || ''
        };
    } catch (err) {
        console.error(`Error reading ${htmlPath}:`, err.message);
        return { title: '', description: '' };
    }
}

function generateIcon(folderName) {
    const name = folderName.replace(SLIDESHOW_PREFIX, '');
    const words = name.split(' ').filter(w => w.length > 0);

    if (words.length >= 2) {
        return words[0][0].toUpperCase() + words[1][0].toUpperCase();
    } else if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }
    return 'SS';
}

// SFTP clients often preserve restrictive local modes (e.g. 600/700), which
// leaves uploads unreadable for the nginx worker. Add world read (and traverse
// for directories) bits without touching anything else.
function makeReadable(targetPath) {
    const stat = fs.lstatSync(targetPath);
    if (stat.isSymbolicLink()) return;

    const wanted = stat.mode | (stat.isDirectory() ? 0o755 : 0o644);
    if ((stat.mode & 0o7777) !== (wanted & 0o7777)) {
        fs.chmodSync(targetPath, wanted & 0o7777);
        console.log(`Fixed permissions: ${targetPath}`);
    }

    if (stat.isDirectory()) {
        for (const entry of fs.readdirSync(targetPath)) {
            makeReadable(path.join(targetPath, entry));
        }
    }
}

function fixSlideshowPermissions() {
    const items = fs.readdirSync(__dirname, { withFileTypes: true });

    for (const item of items) {
        if (item.isDirectory() && item.name.startsWith(SLIDESHOW_PREFIX)) {
            try {
                makeReadable(path.join(__dirname, item.name));
            } catch (err) {
                console.error(`Error fixing permissions for ${item.name}:`, err.message);
            }
        }
    }
}

function discoverSlideshows() {
    const currentDir = __dirname;
    const items = fs.readdirSync(currentDir, { withFileTypes: true });

    const slideshows = [];

    for (const item of items) {
        if (item.isDirectory() && item.name.startsWith(SLIDESHOW_PREFIX)) {
            const indexPath = path.join(currentDir, item.name, 'index.html');

            if (fs.existsSync(indexPath)) {
                const metadata = extractMetadata(indexPath);
                const displayName = item.name.replace(SLIDESHOW_PREFIX, '');

                slideshows.push({
                    folder: item.name,
                    title: metadata.title || displayName,
                    description: metadata.description || `${displayName} - Interactive Presentation`,
                    icon: generateIcon(item.name)
                });

                console.log(`Found: ${item.name}`);
            }
        }
    }

    slideshows.sort((a, b) => a.title.localeCompare(b.title));

    return slideshows;
}

function main() {
    console.log('Discovering slideshows...\n');

    fixSlideshowPermissions();

    const slideshows = discoverSlideshows();

    console.log(`\nFound ${slideshows.length} slideshow(s)`);

    const outputPath = path.join(__dirname, OUTPUT_FILE);
    fs.writeFileSync(outputPath, JSON.stringify(slideshows, null, 2));

    console.log(`\nGenerated ${OUTPUT_FILE}`);
}

if (require.main === module) {
    main();
}

module.exports = { fixSlideshowPermissions };
