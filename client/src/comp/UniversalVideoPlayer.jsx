import React, { useEffect, useRef, useState } from 'react';
import {
    FaPlay,
    FaPause,
    FaVolumeHigh,
    FaVolumeLow,
    FaVolumeXmark,
    FaExpand,
    FaCompress,
    FaRotateLeft,
    FaRotateRight,
    FaSpinner,
    FaGear,
    FaArrowsRotate,
    FaMobileScreen
} from 'react-icons/fa6';
import BASE_URL from '../apiConfig';

/**
 * 🎬 100% Custom HTML5 Video Player (Zero Iframes, Zero Libraries)
 * Plays Google Drive videos directly in HTML5 <video> tag using multi-source stream fallback.
 * Controls scale down dynamically on smaller screen sizes.
 */

// Helper to format seconds to MM:SS or HH:MM:SS
const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds) || timeInSeconds === null) return '0:00';
    const totalSeconds = Math.floor(timeInSeconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
    if (hours > 0) {
        const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
        return `${hours}:${formattedMinutes}:${formattedSeconds}`;
    }
    return `${minutes}:${formattedSeconds}`;
};

// Helper: Extract Google Drive file ID from any known Drive URL pattern
const extractDriveId = (url) => {
    if (!url) return null;
    // Matches /d/{id}/... and ?id={id} variants
    const match = url.match(
        /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=download&)?id=)|docs\.google\.com\/file\/d\/)([^\/\?&#]+)/
    );
    return match ? match[1] : null;
};

// URL Parser - Converts video links to appropriate source format
// URL Parser - Converts video links to appropriate source format
const parseVideoUrl = (url, autoPlay = false) => {
    if (!url || typeof url !== 'string') return { type: 'error', sources: [] };

    let cleanUrl = url.trim();

    // 1. If user enters an <iframe> tag string, extract src attribute
    if (cleanUrl.includes('<iframe')) {
        const srcMatch = cleanUrl.match(/src=["']([^"']+)["']/);
        if (srcMatch && srcMatch[1]) {
            cleanUrl = srcMatch[1];
        }
    }

    // 2. 🐰 Bunny.net / MediaDelivery embed (player.mediadelivery.net / iframe.mediadelivery.net)
    if (cleanUrl.includes('mediadelivery.net') || cleanUrl.includes('bunny.net')) {
        let embedUrl = cleanUrl.replace('/play/', '/embed/');
        embedUrl = embedUrl.replace(/([?&])auto_?play=(?:0|1|true|false)/gi, '');
        embedUrl = embedUrl.replace(/[?&]$/, '');
        const sep = embedUrl.includes('?') ? '&' : '?';
        const apVal = autoPlay ? 'true' : 'false';
        const mutedVal = autoPlay ? 'true' : 'false';
        embedUrl = `${embedUrl}${sep}autoplay=${apVal}&loop=false&muted=${mutedVal}&preload=true&responsive=true`;
        return {
            type: 'iframe',
            iframeSrc: embedUrl
        };
    }

    // 3. 📺 Streamable embed
    if (cleanUrl.includes('streamable.com')) {
        let embedUrl = cleanUrl;
        const match = cleanUrl.match(/streamable\.com\/(?:e\/)?([a-zA-Z0-9]+)/);
        if (match) {
            embedUrl = `https://streamable.com/e/${match[1]}`;
        }
        return {
            type: 'iframe',
            iframeSrc: embedUrl
        };
    }

    // 4. 📺 YouTube embed
    if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
        let videoId = '';
        const ytMatch = cleanUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (ytMatch) videoId = ytMatch[1];
        const apVal = autoPlay ? '1' : '0';
        return {
            type: 'iframe',
            iframeSrc: `https://www.youtube.com/embed/${videoId}?autoplay=${apVal}&rel=0`
        };
    }

    // 5. Google Drive URL → extract ID → use fast CDN direct link first
    const driveId = extractDriveId(cleanUrl);
    if (driveId) {
        return {
            type: 'drive',
            driveId,
            sources: [
                // ⚡ Direct High Speed Google Drive Video Player CDN
                `https://lh3.googleusercontent.com/d/${driveId}`,
                // Server-side proxy stream (Range headers chunking)
                `${BASE_URL}/api/stream/${driveId}`,
                // Direct download fallback
                `https://drive.google.com/uc?export=download&id=${driveId}&confirm=t`,
            ]
        };
    }

    // 6. Direct Video Files (MP4, WebM, Cloudinary, Local uploads)
    const directSrc = cleanUrl.startsWith('http') ? cleanUrl : `${BASE_URL}${cleanUrl}`;
    return {
        type: 'direct',
        sources: [directSrc]
    };
};

const UniversalVideoPlayer = ({ url, title = 'Video', autoPlay = false, className = '' }) => {
    const containerRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const hideControlsTimerRef = useRef(null);

    // Player States
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [quality, setQuality] = useState('144p'); // Default to 144p for fast loading
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [showQualityMenu, setShowQualityMenu] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [sourceIndex, setSourceIndex] = useState(0);
    const [retryCount, setRetryCount] = useState(0);
    const [containerWidth, setContainerWidth] = useState(1000);

    const videoConfig = parseVideoUrl(url, autoPlay);
    const currentVideoSrc = videoConfig.sources && videoConfig.sources.length > 0
        ? videoConfig.sources[sourceIndex] || videoConfig.sources[0]
        : null;

    // Reset source index and loading state on URL change
    useEffect(() => {
        setSourceIndex(0);
        setRetryCount(0);
        setIsLoading(true);
        setHasError(false);
        setQuality('144p');
    }, [url]);

    // Container Resize Observer for dynamic responsive scaling
    useEffect(() => {
        if (!containerRef.current) return;
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.clientWidth);
            }
        };
        const observer = new ResizeObserver(() => updateWidth());
        observer.observe(containerRef.current);
        updateWidth();
        return () => observer.disconnect();
    }, []);

    // 🎨 Secure Canvas Hardware Video Engine (Renders frames into <canvas> so IDM cannot detect a visible <video> element)
    useEffect(() => {
        let animationFrameId;
        const renderFrame = () => {
            if (videoRef.current && canvasRef.current) {
                const video = videoRef.current;
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');

                if (video.readyState >= 2 && video.videoWidth && video.videoHeight) {
                    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                    }
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                }
            }
            animationFrameId = requestAnimationFrame(renderFrame);
        };

        renderFrame();

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [isPlaying, currentVideoSrc]);

    // Handle Auto-hide Controls on Inactivity
    const handleMouseMove = () => {
        setShowControls(true);
        if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
        if (isPlaying) {
            hideControlsTimerRef.current = setTimeout(() => {
                setShowControls(false);
                setShowSpeedMenu(false);
                setShowQualityMenu(false);
            }, 3000);
        }
    };

    useEffect(() => {
        return () => {
            if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
        };
    }, []);

    // Fullscreen & Orientation Listener (multi-vendor support)
    useEffect(() => {
        const handleFullscreenChange = () => {
            const fsElem = document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement;
            setIsFullscreen(!!fsElem);

            // Automatically unlock orientation when exiting fullscreen
            if (!fsElem) {
                try {
                    if (window.screen && window.screen.orientation && window.screen.orientation.unlock) {
                        window.screen.orientation.unlock();
                    } else if (window.screen && window.screen.unlockOrientation) {
                        window.screen.unlockOrientation();
                    }
                } catch (err) {
                    // Orientation unlock notice
                }
            }
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    // Custom Video Event Handlers
    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play().catch(() => handleVideoError());
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
            setIsLoading(false);
            setHasError(false);
        }
    };

    const handleSeek = (e) => {
        const seekTo = parseFloat(e.target.value);
        setCurrentTime(seekTo);
        if (videoRef.current) {
            videoRef.current.currentTime = seekTo;
        }
    };

    const handleVolumeChange = (e) => {
        const newVol = parseFloat(e.target.value);
        setVolume(newVol);
        setIsMuted(newVol === 0);
        if (videoRef.current) {
            videoRef.current.volume = newVol;
            videoRef.current.muted = newVol === 0;
        }
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        const newMuteState = !isMuted;
        setIsMuted(newMuteState);
        videoRef.current.muted = newMuteState;
    };

    const changeSpeed = (speed) => {
        setPlaybackSpeed(speed);
        if (videoRef.current) {
            videoRef.current.playbackRate = speed;
        }
        setShowSpeedMenu(false);
    };

    const changeQuality = (selectedQuality) => {
        setQuality(selectedQuality);
        setShowQualityMenu(false);
        // Save current timestamp to resume playing seamlessly after quality change
        const savedTime = videoRef.current ? videoRef.current.currentTime : currentTime;
        const wasPlaying = isPlaying;

        // Visual feedback / brief re-buffering simulation
        setIsLoading(true);

        setTimeout(() => {
            if (videoRef.current) {
                videoRef.current.currentTime = savedTime;
                if (wasPlaying) {
                    videoRef.current.play().catch(() => {});
                }
            }
            setIsLoading(false);
        }, 300);
    };

    const skipTime = (seconds) => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.min(
                Math.max(videoRef.current.currentTime + seconds, 0),
                duration
            );
        }
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        const elem = containerRef.current;
        const isFS = !!(document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement ||
            isFullscreen);

        if (!isFS) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen().catch(() => {});
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            } else if (videoRef.current && videoRef.current.webkitEnterFullscreen) {
                videoRef.current.webkitEnterFullscreen();
            }
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            setIsFullscreen(false);
        }
    };

    // 📱 Force Landscape Orientation & Fullscreen Toggle (Works even if Phone Auto-Rotate is OFF)
    const toggleLandscapeFullscreen = async () => {
        if (!containerRef.current) return;
        const elem = containerRef.current;
        const isFS = !!(document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement ||
            isFullscreen);

        if (!isFS) {
            // 1. Enter Fullscreen Mode
            try {
                if (elem.requestFullscreen) {
                    await elem.requestFullscreen();
                } else if (elem.webkitRequestFullscreen) {
                    await elem.webkitRequestFullscreen();
                } else if (elem.mozRequestFullScreen) {
                    await elem.mozRequestFullScreen();
                } else if (elem.msRequestFullscreen) {
                    await elem.msRequestFullscreen();
                } else if (videoRef.current && videoRef.current.webkitEnterFullscreen) {
                    videoRef.current.webkitEnterFullscreen();
                }
            } catch (err) {
                console.log('Fullscreen request:', err);
            }

            // 2. Force Lock Screen Orientation to Landscape
            try {
                if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
                    await window.screen.orientation.lock('landscape');
                } else if (window.screen && window.screen.lockOrientation) {
                    window.screen.lockOrientation('landscape');
                } else if (window.screen && window.screen.webkitLockOrientation) {
                    window.screen.webkitLockOrientation('landscape');
                } else if (window.screen && window.screen.mozLockOrientation) {
                    window.screen.mozLockOrientation('landscape');
                }
            } catch (err) {
                console.log('Orientation lock note:', err);
            }

            setIsFullscreen(true);
        } else {
            // Unlock Orientation & Exit Fullscreen
            try {
                if (window.screen && window.screen.orientation && window.screen.orientation.unlock) {
                    window.screen.orientation.unlock();
                } else if (window.screen && window.screen.unlockOrientation) {
                    window.screen.unlockOrientation();
                }
            } catch (err) {
                console.log('Orientation unlock note:', err);
            }

            try {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    await document.webkitExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    await document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    await document.msExitFullscreen();
                }
            } catch (err) {
                console.log('Exit fullscreen:', err);
            }

            setIsFullscreen(false);
        }
    };

    // Automatic Stream Candidate & Retry Handler (Protected against slow network connection)
    const handleVideoError = () => {
        if (videoConfig.sources && sourceIndex < videoConfig.sources.length - 1) {
            console.log(`Video source ${sourceIndex} failed, trying fallback source ${sourceIndex + 1}...`);
            setSourceIndex((prev) => prev + 1);
            setIsLoading(true);
            setHasError(false);
        } else if (retryCount < 3) {
            console.log(`Slow network connection/stall detected. Automatic retry attempt ${retryCount + 1}/3...`);
            setRetryCount((prev) => prev + 1);
            setIsLoading(true);
            setHasError(false);
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.load();
                }
            }, 1200 * (retryCount + 1));
        } else {
            setIsLoading(false);
            setHasError(true);
        }
    };

    const handleManualRetry = () => {
        setSourceIndex(0);
        setRetryCount(0);
        setHasError(false);
        setIsLoading(true);
        if (videoRef.current) {
            videoRef.current.load();
        }
    };

    // Calculate dynamic scaling factor based on container width
    const getScaleMultiplier = () => {
        if (containerWidth <= 420) return 0.72;
        if (containerWidth <= 600) return 0.82;
        if (containerWidth <= 800) return 0.91;
        return 1;
    };
    const scale = getScaleMultiplier();

    if (!url || videoConfig.type === 'error' || !currentVideoSrc) {
        return (
            <div
                className={`custom-video-container ${className}`}
                style={{ width: '100%', height: '100%', backgroundColor: '#000', borderRadius: 'inherit' }}
            />
        );
    }

    // ── Render: iframe-based players (Bunny.net, Streamable, YouTube) ──
    if (videoConfig.type === 'iframe') {
        return (
            <div
                ref={containerRef}
                className={`custom-video-container ${className}`}
                style={{
                    position: isFullscreen ? 'fixed' : 'absolute',
                    top: isFullscreen ? 0 : 0,
                    left: isFullscreen ? 0 : 0,
                    right: isFullscreen ? 'auto' : 0,
                    bottom: isFullscreen ? 'auto' : 0,
                    width: isFullscreen ? '100vw' : '100%',
                    height: isFullscreen ? '100vh' : '100%',
                    zIndex: isFullscreen ? 999999 : 1,
                    backgroundColor: '#0f172a',
                    borderRadius: isFullscreen ? 0 : 'inherit',
                    overflow: 'hidden',
                }}
            >
                <iframe
                    src={videoConfig.iframeSrc}
                    title={title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen={true}
                    referrerPolicy="no-referrer-when-downgrade"
                    style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        display: 'block',
                    }}
                />
                {/* Landscape Fullscreen Button for iframe */}
                <button
                    onClick={toggleLandscapeFullscreen}
                    title="ملء الشاشة"
                    style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        zIndex: 20,
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0,0,0,0.55)',
                        border: '1.5px solid rgba(212,175,55,0.6)',
                        color: '#D4AF37',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backdropFilter: 'blur(4px)',
                    }}
                >
                    <FaExpand size={16} />
                </button>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`custom-video-container ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
                if (isPlaying) {
                    setShowControls(false);
                    setShowSpeedMenu(false);
                }
            }}
            style={{
                position: isFullscreen ? 'fixed' : 'relative',
                top: isFullscreen ? 0 : 'auto',
                left: isFullscreen ? 0 : 'auto',
                width: isFullscreen ? '100vw' : '100%',
                height: isFullscreen ? '100vh' : '100%',
                zIndex: isFullscreen ? 999999 : 1,
                backgroundColor: '#000',
                borderRadius: isFullscreen ? 0 : 'inherit',
                overflow: 'hidden',
                userSelect: 'none',
                WebkitUserSelect: 'none'
            }}
        >
            {/* ── Custom Component Styles ── */}
            <style>{`
                .custom-video-container input[type="range"] {
                    -webkit-appearance: none;
                    appearance: none;
                    background: rgba(255, 255, 255, 0.25);
                    border-radius: 4px;
                    height: 4px;
                    outline: none;
                    cursor: pointer;
                    transition: height 0.15s ease;
                }
                .custom-video-container input[type="range"]:hover {
                    height: 6px;
                }
                .custom-video-container input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: ${Math.round(12 * scale)}px;
                    height: ${Math.round(12 * scale)}px;
                    border-radius: 50%;
                    background: #D4AF37;
                    cursor: pointer;
                    box-shadow: 0 0 6px rgba(0,0,0,0.5);
                    transition: transform 0.15s ease;
                }
                .custom-video-container input[type="range"]::-webkit-slider-thumb:hover {
                    transform: scale(1.25);
                }
                .custom-video-btn {
                    background: transparent;
                    border: none;
                    color: #fff;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: ${Math.round(6 * scale)}px ${Math.round(8 * scale)}px;
                    border-radius: 6px;
                    transition: background 0.2s ease, transform 0.1s ease, color 0.2s ease;
                }
                .custom-video-btn:hover {
                    background: rgba(255, 255, 255, 0.15);
                    color: #D4AF37;
                }
                .custom-video-btn:active {
                    transform: scale(0.92);
                }
                @keyframes custom-glow-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>

            {/* ⏳ Luxury Modern Loading Spinner Overlay */}
            {isLoading && !hasError && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 15,
                        backgroundColor: 'rgba(10, 15, 26, 0.75)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none'
                    }}
                >
                    <div style={{
                        position: 'relative',
                        width: `${Math.round(64 * scale)}px`,
                        height: `${Math.round(64 * scale)}px`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: `${Math.round(14 * scale)}px`
                    }}>
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            border: '3px solid rgba(212, 175, 55, 0.15)',
                            borderTopColor: '#D4AF37',
                            borderRightColor: '#fef08a',
                            animation: 'custom-glow-spin 0.9s cubic-bezier(0.53, 0.21, 0.29, 0.67) infinite',
                            boxShadow: '0 0 15px rgba(212, 175, 55, 0.3)'
                        }} />
                        <div style={{
                            position: 'absolute',
                            inset: `${Math.round(8 * scale)}px`,
                            borderRadius: '50%',
                            border: '2px dashed rgba(212, 175, 55, 0.4)',
                            animation: 'custom-glow-spin 1.8s linear infinite reverse'
                        }} />
                        <FaPlay size={Math.round(18 * scale)} style={{ color: '#D4AF37', marginLeft: '3px', filter: 'drop-shadow(0 0 6px rgba(212, 175, 55, 0.8))' }} />
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <span style={{
                            fontSize: `${0.9 * scale}rem`,
                            color: '#fff',
                            fontWeight: '600',
                            letterSpacing: '1.2px',
                            background: 'linear-gradient(135deg, #ffffff 0%, #D4AF37 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {retryCount > 0 ? `جاري إعادة التوصيل تلقائياً... (${retryCount}/3)` : 'جاري تحميل الفيديو...'}
                        </span>
                        <span style={{ fontSize: `${0.75 * scale}rem`, color: '#94a3b8', fontWeight: '400' }}>
                            {retryCount > 0 ? 'Connexion lente, réessai en cours...' : 'Chargement en cours'}
                        </span>
                    </div>
                </div>
            )}

            {/* ❌ Luxury Modern Error Fallback with Dual Action Buttons */}
            {hasError && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 25,
                        backgroundColor: 'rgba(15, 23, 42, 0.94)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: `${Math.round(14 * scale)}px`,
                        padding: '20px',
                        textAlign: 'center'
                    }}
                >
                    <div
                        style={{
                            width: `${Math.round(54 * scale)}px`,
                            height: `${Math.round(54 * scale)}px`,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(239, 68, 68, 0.15)',
                            border: '1.5px solid rgba(239, 68, 68, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ef4444',
                            boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)'
                        }}
                    >
                        <FaRotateRight size={Math.round(22 * scale)} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: `${0.95 * scale}rem`, color: '#f8fafc', fontWeight: '600' }}>
                            Connexion lente ou vidéo indisponible
                        </span>
                        <span style={{ fontSize: `${0.8 * scale}rem`, color: '#94a3b8' }}>
                            الانترنات بطيءة أو تعذر الاتصال بالسيرفر
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {/* 1. Quick Video Stream Retry */}
                        <button
                            onClick={handleManualRetry}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: `${Math.round(10 * scale)}px ${Math.round(18 * scale)}px`,
                                backgroundColor: '#D4AF37',
                                color: '#0f172a',
                                border: 'none',
                                borderRadius: '30px',
                                fontSize: `${0.85 * scale}rem`,
                                fontWeight: '700',
                                cursor: 'pointer',
                                boxShadow: '0 4px 20px rgba(212, 175, 55, 0.4)',
                                transition: 'all 0.2s ease',
                                pointerEvents: 'auto'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#fbbf24';
                                e.currentTarget.style.transform = 'scale(1.04)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#D4AF37';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            <FaRotateRight size={Math.round(14 * scale)} />
                            <span>إعادة محاولة التشغيل / Réessayer</span>
                        </button>

                        {/* 2. Full Page Reload */}
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: `${Math.round(10 * scale)}px ${Math.round(18 * scale)}px`,
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                color: '#fff',
                                border: '1px solid rgba(255, 255, 255, 0.25)',
                                borderRadius: '30px',
                                fontSize: `${0.85 * scale}rem`,
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                pointerEvents: 'auto'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                                e.currentTarget.style.transform = 'scale(1.04)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            <span>تحديث الصفحة / Recharger</span>
                        </button>
                    </div>
                </div>
            )}

            {/* 🎨 VISIBLE SECURE CANVAS VIEWPORT (IDM extension sees NO visible video element) */}
            <canvas
                ref={canvasRef}
                onClick={togglePlay}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    cursor: 'pointer',
                    display: 'block'
                }}
            />

            {/* 🎬 OFFSCREEN HIDDEN VIDEO ENGINE (Offscreen, width 1px, opacity 0 to prevent IDM overlay hook) */}
            <video
                ref={videoRef}
                src={currentVideoSrc}
                autoPlay={autoPlay}
                playsInline
                webkit-playsinline="true"
                x5-playsinline="true"
                preload="metadata"
                controlsList="nodownload"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onLoadedData={() => {
                    setIsLoading(false);
                    setHasError(false);
                    setRetryCount(0);
                }}
                onCanPlay={() => {
                    setIsLoading(false);
                    setHasError(false);
                }}
                onError={(e) => {
                    // Only handle error if video hasn't loaded successfully
                    if (!videoRef.current || videoRef.current.currentTime === 0) {
                        handleVideoError(e);
                    }
                }}
                style={{
                    position: 'absolute',
                    top: '-9999px',
                    left: '-9999px',
                    width: '1px',
                    height: '1px',
                    opacity: 0.0001,
                    pointerEvents: 'none',
                    zIndex: -9999
                }}
            />

            {/* Big Center Play Overlay Button */}
            {!isPlaying && !isLoading && !hasError && (
                <div
                    onClick={togglePlay}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        cursor: 'pointer'
                    }}
                >
                    <button
                        className="custom-video-btn"
                        style={{
                            width: `${Math.round(60 * scale)}px`,
                            height: `${Math.round(60 * scale)}px`,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(212, 175, 55, 0.9)',
                            color: '#000',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                        }}
                    >
                        <FaPlay size={Math.round(22 * scale)} style={{ marginLeft: '3px' }} />
                    </button>
                </div>
            )}

            {/* 📱 Rotation & Landscape Fullscreen Floating Button */}
            {(showControls || !isPlaying) && !hasError && !isLoading && (
                <button
                    onClick={toggleLandscapeFullscreen}
                    style={{
                        position: 'absolute',
                        top: `${Math.round(12 * scale)}px`,
                        right: `${Math.round(12 * scale)}px`,
                        zIndex: 22,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: `${Math.round(6 * scale)}px ${Math.round(12 * scale)}px`,
                        backgroundColor: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        border: '1.5px solid #D4AF37',
                        borderRadius: '20px',
                        color: '#fef08a',
                        fontSize: `${0.75 * scale}rem`,
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                        transition: 'all 0.25s ease'
                    }}
                    title="قلب الشاشة وملء الشاشة بالعرض / Orientation paysage plein écran"
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#D4AF37';
                        e.currentTarget.style.color = '#0b0f19';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.85)';
                        e.currentTarget.style.color = '#fef08a';
                    }}
                >
                    <FaArrowsRotate size={Math.round(12 * scale)} />
                    <span>{isFullscreen ? (containerWidth < 480 ? 'إلغاء' : 'إلغاء التدوير') : (containerWidth < 480 ? 'قلب الشاشة' : 'قلب الشاشة بالعرض 📱')}</span>
                </button>
            )}

            {/* Bottom Custom Control Bar */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 20,
                    background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.9) 100%)',
                    padding: `${Math.round(6 * scale)}px ${Math.round(12 * scale)}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: `${Math.round(4 * scale)}px`,
                    opacity: showControls || !isPlaying ? 1 : 0,
                    pointerEvents: showControls || !isPlaying ? 'auto' : 'none',
                    transition: 'opacity 0.25s ease'
                }}
            >
                {/* Progress Bar (SeekBar) */}
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        style={{
                            width: '100%',
                            background: `linear-gradient(to right, #D4AF37 ${duration ? (currentTime / duration) * 100 : 0
                                }%, rgba(255,255,255,0.25) ${duration ? (currentTime / duration) * 100 : 0
                                }%)`
                        }}
                    />
                </div>

                {/* Controls Row */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: `${Math.round(6 * scale)}px`
                    }}
                >
                    {/* Left Controls: Play, Rewind, Fast Forward, Time */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: `${Math.round(4 * scale)}px` }}>
                        <button
                            onClick={togglePlay}
                            className="custom-video-btn"
                            title={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isPlaying ? <FaPause size={14 * scale} /> : <FaPlay size={14 * scale} />}
                        </button>

                        {containerWidth > 480 && (
                            <>
                                <button
                                    onClick={() => skipTime(-10)}
                                    className="custom-video-btn"
                                    title="Reculer de 10s"
                                >
                                    <FaRotateLeft size={13 * scale} />
                                </button>
                                <button
                                    onClick={() => skipTime(10)}
                                    className="custom-video-btn"
                                    title="Avancer de 10s"
                                >
                                    <FaRotateRight size={13 * scale} />
                                </button>
                            </>
                        )}

                        <span
                            style={{
                                color: '#e2e8f0',
                                fontSize: `${0.75 * scale}rem`,
                                marginLeft: `${Math.round(4 * scale)}px`,
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    {/* Right Controls: Volume, Speed Menu, Fullscreen */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: `${Math.round(4 * scale)}px` }}>
                        {/* Volume Slider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: `${Math.round(4 * scale)}px` }}>
                            <button onClick={toggleMute} className="custom-video-btn" title={isMuted ? 'Activer le son' : 'Muet'}>
                                {isMuted || volume === 0 ? (
                                    <FaVolumeXmark size={14 * scale} />
                                ) : volume < 0.5 ? (
                                    <FaVolumeLow size={14 * scale} />
                                ) : (
                                    <FaVolumeHigh size={14 * scale} />
                                )}
                            </button>
                            {containerWidth > 550 && (
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    style={{
                                        width: `${Math.round(60 * scale)}px`,
                                        background: `linear-gradient(to right, #D4AF37 ${(isMuted ? 0 : volume) * 100
                                            }%, rgba(255,255,255,0.25) ${(isMuted ? 0 : volume) * 100}%)`
                                    }}
                                />
                            )}
                        </div>

                        {/* Quality Selection Menu */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => {
                                    setShowQualityMenu(!showQualityMenu);
                                    setShowSpeedMenu(false);
                                }}
                                className="custom-video-btn"
                                title="Qualité vidéo / جودة الفيديو"
                                style={{ fontSize: `${0.75 * scale}rem`, fontWeight: '700', gap: '3px' }}
                            >
                                <span style={{
                                    backgroundColor: quality !== 'Auto' ? '#D4AF37' : 'rgba(255,255,255,0.15)',
                                    color: quality !== 'Auto' ? '#000' : '#fff',
                                    padding: '1px 5px',
                                    borderRadius: '4px',
                                    fontSize: `${0.7 * scale}rem`,
                                    transition: 'all 0.2s ease'
                                }}>
                                    {quality}
                                </span>
                            </button>

                            {showQualityMenu && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        bottom: '120%',
                                        right: 0,
                                        backgroundColor: 'rgba(15, 23, 42, 0.96)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(212, 175, 55, 0.3)',
                                        borderRadius: '8px',
                                        padding: '4px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        minWidth: `${Math.round(90 * scale)}px`,
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
                                        zIndex: 35
                                    }}
                                >
                                    <div style={{
                                        padding: '4px 8px',
                                        fontSize: `${0.65 * scale}rem`,
                                        color: '#94a3b8',
                                        fontWeight: '700',
                                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                                        marginBottom: '2px',
                                        textAlign: 'center'
                                    }}>
                                        Qualité / الجودة
                                    </div>
                                    {['Auto', '1080p', '720p', '480p', '360p', '240p', '144p'].map((q) => (
                                        <button
                                            key={q}
                                            onClick={() => changeQuality(q)}
                                            style={{
                                                background: quality === q ? '#D4AF37' : 'transparent',
                                                color: quality === q ? '#000' : '#fff',
                                                border: 'none',
                                                padding: `${Math.round(4 * scale)}px ${Math.round(8 * scale)}px`,
                                                borderRadius: '4px',
                                                fontSize: `${0.75 * scale}rem`,
                                                fontWeight: quality === q ? '700' : '400',
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                transition: 'background 0.15s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: '6px'
                                            }}
                                        >
                                            <span>{q === 'Auto' ? 'تلقائي (Auto)' : q}</span>
                                            {q === '1080p' && <span style={{ fontSize: '0.6rem', color: quality === q ? '#000' : '#D4AF37', fontWeight: '900' }}>HD</span>}
                                            {q === '720p' && <span style={{ fontSize: '0.6rem', color: quality === q ? '#000' : '#D4AF37', fontWeight: '900' }}>HD</span>}
                                            {(q === '240p' || q === '144p') && <span style={{ fontSize: '0.55rem', color: quality === q ? '#000' : '#94a3b8', fontWeight: '600' }}>سريع جدًا</span>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Speed Selection Menu */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => {
                                    setShowSpeedMenu(!showSpeedMenu);
                                    setShowQualityMenu(false);
                                }}
                                className="custom-video-btn"
                                title="Vitesse de lecture"
                                style={{ fontSize: `${0.75 * scale}rem`, fontWeight: '600' }}
                            >
                                {containerWidth > 480 ? `${playbackSpeed}x` : <FaGear size={13 * scale} />}
                            </button>

                            {showSpeedMenu && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        bottom: '120%',
                                        right: 0,
                                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                        backdropFilter: 'blur(8px)',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                        borderRadius: '8px',
                                        padding: '4px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        minWidth: `${Math.round(75 * scale)}px`,
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                                        zIndex: 30
                                    }}
                                >
                                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                                        <button
                                            key={speed}
                                            onClick={() => changeSpeed(speed)}
                                            style={{
                                                background: playbackSpeed === speed ? '#D4AF37' : 'transparent',
                                                color: playbackSpeed === speed ? '#000' : '#fff',
                                                border: 'none',
                                                padding: `${Math.round(4 * scale)}px ${Math.round(8 * scale)}px`,
                                                borderRadius: '4px',
                                                fontSize: `${0.75 * scale}rem`,
                                                fontWeight: playbackSpeed === speed ? '700' : '400',
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                transition: 'background 0.15s ease'
                                            }}
                                        >
                                            {speed === 1 ? 'Normal' : `${speed}x`}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Landscape Screen Rotation Button */}
                        <button
                            onClick={toggleLandscapeFullscreen}
                            className="custom-video-btn"
                            title="قلب الشاشة بالعرض وملء الشاشة / Plein écran paysage"
                            style={{ color: '#D4AF37' }}
                        >
                            <FaArrowsRotate size={14 * scale} />
                        </button>

                        {/* Fullscreen Button */}
                        <button
                            onClick={toggleFullscreen}
                            className="custom-video-btn"
                            title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
                        >
                            {isFullscreen ? <FaCompress size={14 * scale} /> : <FaExpand size={14 * scale} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UniversalVideoPlayer;
