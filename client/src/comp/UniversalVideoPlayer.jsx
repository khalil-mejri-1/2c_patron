import React, { useState } from 'react';
import { FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import BASE_URL from '../apiConfig';

/**
 * Universal Video Player Component
 * Mobile-Optimized with Fallbacks & Loaders
 */
const UniversalVideoPlayer = ({ url, title = 'Video Player', autoPlay = false, className = '' }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    if (!url) return <div className="video-player-placeholder" style={{ padding: '20px', textAlign: 'center', background: '#000', color: '#fff' }}>No video source provided</div>;

    // Normalize URL
    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

    // Detection Logic
    const getVideoConfig = (src) => {
        if (!src) return { type: 'error' };

        // YouTube
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const matchYoutube = src.match(youtubeRegex);
        if (matchYoutube) {
            return {
                type: 'iframe',
                src: `https://www.youtube.com/embed/${matchYoutube[1]}?autoplay=${autoPlay ? 1 : 0}&rel=0&playsinline=1`
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
        const driveRegex = /(?:drive\.google\.com\/file\/d\/|drive\.google\.com\/open\?id=|drive\.google\.com\/uc\?id=)([^\/\?&]+)/;
        const matchDrive = src.match(driveRegex);
        if (matchDrive) {
            return {
                type: 'iframe',
                src: `https://drive.google.com/file/d/${matchDrive[1]}/preview`
            };
        }

        // Cloudinary HTML Embed Player
        if (src.includes("player.cloudinary.com")) {
            return { type: 'iframe', src: src };
        }

        // Direct Video Files & Cloudinary Direct URLs
        if (src.endsWith(".mp4") || src.endsWith(".webm") || src.endsWith(".ogg") || src.startsWith("/uploads") || src.includes("res.cloudinary.com")) {
            return { type: 'video', src: src.startsWith('http') ? src : `${BASE_URL}${src}` };
        }

        // Only allow external iframes if they clearly look like external HTTPS links
        // This prevents relative "junk" strings from being interpreted as same-domain routes (which causes the recursion)
        if (src.startsWith('https://') || src.startsWith('http://')) {
            return { type: 'iframe', src: src };
        }

        // Fallback for everything else: Treat as error to avoid site-in-site recursion
        return { type: 'error', src: null };
    };

    const config = getVideoConfig(url);

    const handleVideoReady = () => setIsLoading(false);
    const handleVideoError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    // If it's a detected error from the start, just render black
    if (config.type === 'error') {
        return <div className={`universal-video-container ${className}`} style={{ width: '100%', height: '100%', background: '#000', borderRadius: 'inherit' }} />;
    }

    return (
        <div 
            className={`universal-video-container ${className}`} 
            style={{ 
                position: 'relative', 
                width: '100%', 
                height: '100%', 
                backgroundColor: '#000', 
                borderRadius: 'inherit', 
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >

            <style>{`
                @keyframes player-spin { 100% { transform: rotate(360deg); } }
                .player-spinner { animation: player-spin 1s linear infinite; }
            `}</style>
            
            {/* Loading Indicator */}
            {isLoading && !hasError && (
                <div style={{ position: 'absolute', zIndex: 10, color: '#D4AF37', display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
                    <FaSpinner className="player-spinner" size={34} style={{ marginBottom: '10px' }} />
                    <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: '500', letterSpacing: '1px' }}>Chargement...</span>
                </div>
            )}

            {/* Error Fallback - Just show black as requested by user */}
            {hasError && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: '#000' }}></div>
            )}

            {/* Renderer based on detected type */}
            {config.type === 'video' ? (
                <video
                    src={config.src}
                    controls
                    autoPlay={autoPlay}
                    muted={autoPlay}
                    playsInline={true}
                    webkit-playsinline="true"
                    preload="auto"
                    onCanPlay={handleVideoReady}
                    onLoadedData={handleVideoReady}
                    onWaiting={() => setIsLoading(true)}
                    onPlaying={() => setIsLoading(false)}
                    onError={handleVideoError}
                    style={{ 
                        width: '100%', height: '100%', objectFit: 'cover', 
                        display: hasError ? 'none' : 'block'
                    }}
                    controlsList="nodownload"
                />
            ) : (
                <div style={{ width: '100%', height: '100%', position: 'relative', flex: 1, display: hasError ? 'none' : 'block' }}>
                    <iframe
                        src={config.src}
                        title={title}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        allow="autoplay; fullscreen; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        onLoad={handleVideoReady}
                        onError={handleVideoError}
                        style={{
                            border: 0,
                            width: '100%',
                            height: '100%'
                        }}
                    ></iframe>
                </div>
            )}
        </div>
    );
};

export default UniversalVideoPlayer;
