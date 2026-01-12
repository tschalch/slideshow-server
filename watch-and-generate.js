#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const SLIDESHOW_PREFIX = '__Slideshow ';
const WATCH_DIR = __dirname;
const DEBOUNCE_MS = 2000;

let debounceTimer = null;

function runGenerator() {
    console.log('[%s] Running generate-slideshows.js...', new Date().toISOString());

    const child = spawn('node', ['generate-slideshows.js'], {
        cwd: __dirname,
        stdio: 'inherit'
    });

    child.on('exit', (code) => {
        if (code === 0) {
            console.log('[%s] Generation complete', new Date().toISOString());
        } else {
            console.error('[%s] Generation failed with code %d', new Date().toISOString(), code);
        }
    });
}

function scheduleGeneration() {
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
        runGenerator();
        debounceTimer = null;
    }, DEBOUNCE_MS);
}

function watchDirectory() {
    console.log('[%s] Slideshow Watcher Started', new Date().toISOString());
    console.log('[%s] Watching: %s', new Date().toISOString(), WATCH_DIR);
    console.log('[%s] Looking for folders: %s*', new Date().toISOString(), SLIDESHOW_PREFIX);

    // Run initial generation
    runGenerator();

    // Watch for changes
    const watcher = fs.watch(WATCH_DIR, { recursive: false }, (eventType, filename) => {
        if (!filename) return;

        // Only care about __Slideshow folders
        if (filename.startsWith(SLIDESHOW_PREFIX)) {
            console.log('[%s] Detected %s on %s', new Date().toISOString(), eventType, filename);
            scheduleGeneration();
        }
    });

    // Also watch inside each __Slideshow folder for index.html changes
    try {
        const items = fs.readdirSync(WATCH_DIR, { withFileTypes: true });

        items.forEach(item => {
            if (item.isDirectory() && item.name.startsWith(SLIDESHOW_PREFIX)) {
                const slideshowPath = path.join(WATCH_DIR, item.name);

                fs.watch(slideshowPath, { recursive: false }, (eventType, filename) => {
                    if (filename === 'index.html') {
                        console.log('[%s] Detected %s on %s/index.html', new Date().toISOString(), eventType, item.name);
                        scheduleGeneration();
                    }
                });

                console.log('[%s] Watching: %s/', new Date().toISOString(), item.name);
            }
        });
    } catch (err) {
        console.error('[%s] Error setting up watchers: %s', new Date().toISOString(), err.message);
    }

    // Periodically rescan for new folders
    setInterval(() => {
        try {
            const items = fs.readdirSync(WATCH_DIR, { withFileTypes: true });
            items.forEach(item => {
                if (item.isDirectory() && item.name.startsWith(SLIDESHOW_PREFIX)) {
                    const slideshowPath = path.join(WATCH_DIR, item.name);

                    // Check if we need to watch this folder
                    try {
                        fs.watch(slideshowPath, { recursive: false }, (eventType, filename) => {
                            if (filename === 'index.html') {
                                scheduleGeneration();
                            }
                        });
                    } catch (err) {
                        // Already watching
                    }
                }
            });
        } catch (err) {
            console.error('[%s] Rescan error: %s', new Date().toISOString(), err.message);
        }
    }, 60000); // Rescan every minute

    process.on('SIGTERM', () => {
        console.log('[%s] Received SIGTERM, shutting down...', new Date().toISOString());
        watcher.close();
        process.exit(0);
    });
}

watchDirectory();
