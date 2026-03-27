const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * HLS Production-Ready Streaming Server Implementation
 * (Optimized for VPS: 5 CPU, 6GB RAM)
 */

const router = express.Router();

// 📂 Folder Structure Setup
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const PROCESSED_DIR = path.join(__dirname, 'processed');

[UPLOAD_DIR, PROCESSED_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// 🚀 Multer Storage Design (High-Perf NVMe Storage)
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// 🎬 FFmpeg Processing Engine (HLS Adaptive Bitrate)
// Generates Multi-Quality HLS Playlists (.m3u8)
const processToHLS = (inputFile, outputFolder) => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder, { recursive: true });

        // Adaptive qualities: Master Playlist will automatically switch
        // Resolutions: 360p (Low), 480p (Middle), 720p (High)
        // Split into 6s segments for fast mobile start
        
        ffmpeg(inputFile)
            .outputOptions([
                '-preset ultrafast',     // VPS Optimized Speed
                '-g 48',                 // Keyframe every 2s for 24fps
                '-sc_threshold 0',
                '-map 0:v', '-map 0:a', '-map 0:v', '-map 0:a', '-map 0:v', '-map 0:a',
                '-s:v:0 640x360', '-b:v:0 800k',    // 360p
                '-s:v:1 854x480', '-b:v:1 1400k',   // 480p
                '-s:v:2 1280x720', '-b:v:2 2800k',  // 720p
                '-c:v h264', '-c:a aac',            // Max Compatibility
                '-f hls',
                '-hls_time 6',                      // 6s segments
                '-hls_playlist_type event',
                '-master_pl_name master.m3u8',      // Master Playlist File
                '-hls_segment_filename', path.join(outputFolder, 'v%v/file%03d.ts'),
                '-var_stream_map', 'v:0,a:0 v:1,a:1 v:2,a:2' // map variant streams
            ])
            .output(path.join(outputFolder, 'v%v/index.m3u8'))
            .on('start', (cmd) => console.log('📽️ Streaming Engine Started: ', cmd))
            .on('error', (err) => {
                console.error('❌ FFmpeg Error: ', err.message);
                reject(err);
            })
            .on('end', () => {
                console.log('✅ HLS Conversion Successful!');
                resolve();
            })
            .run();
    });
};

// 🛰️ API Routes
// 1. Upload & Process
router.post('/api/stream/upload', upload.single('video'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No video file provided' });

        const videoId = path.parse(req.file.filename).name;
        const inputPath = req.file.path;
        const outputPath = path.join(PROCESSED_DIR, videoId);

        // Run processing in background (Async Response)
        // Real-world: Use a job queue like BullMQ for high traffic
        processToHLS(inputPath, outputPath)
            .catch(err => console.error("Background processing failed", err));

        res.status(202).json({ 
            message: 'Video upload successful. Server is currently processing HLS segments.',
            videoId: videoId,
            playlistUrl: `/processed/${videoId}/master.m3u8`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Serve HLS files with caching headers
// This allows Cloudflare to cache segments for faster global streaming
router.use('/processed', express.static(PROCESSED_DIR, {
    setHeaders: (res, path) => {
        if (path.endsWith('.ts')) {
            res.set('Cache-Control', 'public, max-age=31104000'); // Cache segments for 1 year
        } else if (path.endsWith('.m3u8')) {
            res.set('Cache-Control', 'no-cache'); // Don't cache playlists to allow dynamic updates
        }
    }
}));

module.exports = router;
