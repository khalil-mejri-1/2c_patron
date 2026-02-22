import React, { useEffect, useState } from 'react';
import { FaCheck, FaExclamationTriangle, FaInfoCircle, FaTimes, FaQuestionCircle } from 'react-icons/fa';
import './CreativeAlert.css';

const CreativeAlert = ({ type, title, message, onConfirm, onCancel, show, confirmLabel, cancelLabel }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [progress, setProgress] = useState(100);

    const isConfirm = type === 'confirm';

    useEffect(() => {
        if (show) {
            setIsClosing(false);
            setProgress(100);
            if (!isConfirm) {
                const duration = 4000;
                const interval = 10;
                const step = (interval / duration) * 100;

                const timer = setTimeout(() => {
                    handleClose();
                }, duration);

                const progressInterval = setInterval(() => {
                    setProgress((prev) => Math.max(0, prev - step));
                }, interval);

                return () => {
                    clearTimeout(timer);
                    clearInterval(progressInterval);
                };
            }
        }
    }, [show, type, isConfirm]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onConfirm(); // hideAlert
        }, 400);
    };

    if (!show) return null;

    const icons = {
        success: <FaCheck />,
        error: <FaTimes />,
        warning: <FaExclamationTriangle />,
        info: <FaInfoCircle />,
        confirm: <FaQuestionCircle />
    };

    return (
        <div
            className={`creative-alert-overlay ${isConfirm ? 'has-confirm' : ''} ${isClosing ? 'closing' : ''}`}
            onClick={isConfirm ? null : handleClose}
        >
            <div
                className={`creative-alert-box ${type} ${isClosing ? 'closing' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`alert-icon-container ${type}`}>
                    {icons[type] || icons.info}
                </div>

                <div className="alert-content">
                    {title && <h3 className="alert-title">{title}</h3>}
                    {message && <p className="alert-message">{message}</p>}
                </div>

                {isConfirm ? (
                    <div className="alert-footer">
                        {cancelLabel !== 'null' && cancelLabel !== '' && (
                            <button className="alert-btn cancel-btn" onClick={onCancel}>
                                {cancelLabel}
                            </button>
                        )}
                        <button className="alert-btn confirm-btn" onClick={onConfirm}>
                            {confirmLabel}
                        </button>
                    </div>
                ) : (
                    <div className="alert-progress">
                        <div
                            className="alert-progress-fill"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreativeAlert;
