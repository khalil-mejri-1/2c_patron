import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';
import { FaPlay, FaPause, FaCog, FaExpand, FaVolumeUp } from 'react-icons/fa';
import '../comp/hls-player.css'; // Add a CSS file for premium styling

/**
 * Premium HLS Adaptive Bitrate Player
 * Built with Hls.js for Mobile/Desktop Performance
 */
const HLSStreamingPlayer = ({ src, title = 'HLS Stream' }) => {
    const videoRef = useRef(null);
    const [hls, setHls] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [qualityLevels, setQualityLevels] = useState([]);
    const [currentQuality, setCurrentQuality] = useState(-1);
    const [showQualityMenu, setShowQualityMenu] = useState(false);
    const [volume, setVolume] = useState(1);

    useEffect(() => {
        if (Hls.isSupported() && videoRef.current) {
            const hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90 // Cache for slow networks
            });
            hlsInstance.loadSource(src);
            hlsInstance.attachMedia(videoRef.current);
            setHls(hlsInstance);

            hlsInstance.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                setQualityLevels(data.levels);
            });

            return () => hlsInstance.destroy();
        } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari native HLS support
            videoRef.current.src = src;
        }
    }, [src]);

    const togglePlay = () => {
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleTimeUpdate = () => {
        setCurrentTime(videoRef.current.currentTime);
        setDuration(videoRef.current.duration);
    };

    const changeQuality = (index) => {
        if (hls) {
            hls.currentLevel = index;
            setCurrentQuality(index);
            setShowQualityMenu(false);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            videoRef.current.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const handleVolume = (e) => {
        const value = e.target.value;
        setVolume(value);
        videoRef.current.volume = value;
    };

    return (
        <div className="hls-player-container-lux">
            <video 
                ref={videoRef} 
                className="hls-video-element"
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                playsInline
            />

            {/* Custom Control Bar (Glassmorphic) */}
            <div className="hls-controls-overlay">
                <div className="hls-progress-bar">
                    <input 
                        type="range" 
                        min="0" 
                        max={duration || 0} 
                        value={currentTime} 
                        onChange={(e) => videoRef.current.currentTime = e.target.value}
                    />
                </div>

                <div className="hls-buttons-flex">
                    <div className="hls-left-controls">
                        <button onClick={togglePlay} className="hls-icon-btn">
                            {isPlaying ? <FaPause /> : <FaPlay />}
                        </button>
                        <div className="hls-time-display">
                            {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')} / 
                            {Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}
                        </div>
                    </div>

                    <div className="hls-right-controls">
                        <div className="hls-volume-box">
                            <FaVolumeUp />
                            <input type="range" min="0" max="1" step="0.1" value={volume} onChange={handleVolume} />
                        </div>

                        <div className="hls-quality-selector">
                            <button onClick={() => setShowQualityMenu(!showQualityMenu)} className="hls-icon-btn">
                                <FaCog />
                            </button>
                            {showQualityMenu && (
                                <div className="hls-quality-menu">
                                    <button onClick={() => changeQuality(-1)} className={currentQuality === -1 ? 'active' : ''}>Auto (Adaptive)</button>
                                    {qualityLevels.map((lvl, idx) => (
                                        <button key={idx} onClick={() => changeQuality(idx)} className={currentQuality === idx ? 'active' : ''}>
                                            {lvl.height}p
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button onClick={toggleFullscreen} className="hls-icon-btn">
                            <FaExpand />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HLSStreamingPlayer;
