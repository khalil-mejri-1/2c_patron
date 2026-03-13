import React from 'react';
import BASE_URL from '../apiConfig';

/**
 * Universal Video Player Component
 * Supports: YouTube, Streamable, Google Drive, Direct MP4/WebM
 */
const UniversalVideoPlayer = ({ url, title = 'Video Player', autoPlay = true, className = '' }) => {
    if (!url) return <div className="video-player-placeholder">No video source provided</div>;

    // Normalize URL
    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

    // Detection Logic
    const getVideoConfig = (src) => {
        // YouTube
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const matchYoutube = src.match(youtubeRegex);
        if (matchYoutube) {
            return {
                type: 'iframe',
                src: `https://www.youtube.com/embed/${matchYoutube[1]}?autoplay=${autoPlay ? 1 : 0}&rel=0`
            };
        }

        // Streamable
        const streamableRegex = /streamable\.com\/([a-zA-Z0-9]+)/;
        const matchStreamable = src.match(streamableRegex);
        if (matchStreamable) {
            return {
                type: 'iframe',
                src: `https://streamable.com/e/${matchStreamable[1]}?autoplay=${autoPlay ? 1 : 0}`
            };
        }

        // Google Drive
        const driveRegex = /drive\.google\.com\/file\/d\/([^\/\?]+)/;
        const matchDrive = src.match(driveRegex);
        if (matchDrive) {
            return {
                type: 'iframe',
                isDrive: true,
                src: `https://drive.google.com/file/d/${matchDrive[1]}/preview`
            };
        }

        // Direct Video Files
        if (src.endsWith(".mp4") || src.endsWith(".webm") || src.endsWith(".ogg") || src.startsWith("/uploads") || src.includes("res.cloudinary.com")) {
            return { type: 'video', src: src.startsWith('http') ? src : `${BASE_URL}${src}` };
        }

        // Fallback (assume URL is already embed-ready or direct)
        return { type: 'iframe', src: src };
    };

    const config = getVideoConfig(url);

    return (
        <div className={`universal-video-container ${className}`} style={{ position: 'relative', width: '100%', height: '100%', minHeight: '300px', backgroundColor: '#000', borderRadius: 'inherit', overflow: 'hidden' }}>

            {/* UI Mask for Google Drive to block pop-out button interactions */}
            {config.isDrive && (
                <div
                    className="video-player-mask"
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '100px',
                        height: '100px',
                        zIndex: 100,
                        backgroundColor: 'transparent',
                        pointerEvents: 'auto',
                    }}
                ></div>
            )}

            {config.type === 'video' ? (
                <video
                    src={config.src}
                    controls
                    autoPlay={autoPlay}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    controlsList="nodownload"
                />
            ) : (
                <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', borderRadius: 'inherit' }}>
                    <iframe
                        src={config.src}
                        title={title}
                        width="100%"
                        height={config.isDrive ? 'calc(100% + 60px)' : '100%'}
                        frameBorder="0"
                        allow="autoplay; fullscreen; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        style={{
                            border: 0,
                            width: '100%',
                            minHeight: '500px',
                            marginTop: config.isDrive ? '-60px' : '0', // Shift up to hide Drive controls
                            position: 'relative'
                        }}
                        loading="lazy"
                    ></iframe>
                </div>
            )}
        </div>
    );
};

export default UniversalVideoPlayer;
