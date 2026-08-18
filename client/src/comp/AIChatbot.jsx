import React, { useState, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';
import BASE_URL from '../apiConfig';
import logo from '../img/logo.png';
import './AIChatbot.css';

export default function AIChatbot() {
    const { appLanguage } = useLanguage();
    const navigate = useNavigate();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setChatMessages([{ sender: 'ai', text: appLanguage === 'ar' ? 'مرحباً! أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟' : 'Bonjour ! Je suis votre assistant intelligent. Comment puis-je vous aider ?' }]);
    }, [appLanguage]);

    const handleSendMessage = async () => {
        if(!currentMessage.trim() || isLoading) return;
        const msg = currentMessage;
        setChatMessages(prev => [...prev, { sender: 'user', text: msg }]);
        setCurrentMessage('');
        setIsLoading(true);
        
        try {
            const response = await axios.post(`${BASE_URL}/api/ai-chat`, {
                message: msg,
                language: appLanguage
            });
            
            if (response.data && response.data.reply) {
                setChatMessages(prev => [...prev, { sender: 'ai', text: response.data.reply }]);
            }
        } catch (error) {
            console.error("AI Chat Error:", error);
            setChatMessages(prev => [...prev, { sender: 'ai', text: appLanguage === 'ar' ? 'عذراً، حدث خطأ في الاتصال بالمساعد الذكي.' : 'Désolé, une erreur s\'est produite lors de la connexion à l\'assistant.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const renderMessageText = (text) => {
        // Match Markdown links [Text](Route)
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        
        let parts = [];
        let lastIndex = 0;
        let match;
        
        while ((match = linkRegex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push(text.substring(lastIndex, match.index));
            }
            
            const linkText = match[1];
            const route = match[2];
            
            parts.push(
                <span key={match.index} style={{ display: 'block', margin: '6px 0' }}>
                    <button 
                        onClick={() => {
                            setIsChatOpen(false);
                            navigate(route);
                        }}
                        style={{
                            background: 'linear-gradient(135deg, #D4AF37, #AA7C11)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '8px 14px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 3px 10px rgba(212, 175, 55, 0.25)',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            fontSize: '0.76rem',
                            fontFamily: 'inherit'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'scale(1.03)';
                            e.currentTarget.style.boxShadow = '0 5px 14px rgba(212, 175, 55, 0.35)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 3px 10px rgba(212, 175, 55, 0.25)';
                        }}
                    >
                        {linkText}
                    </button>
                </span>
            );
            
            lastIndex = linkRegex.lastIndex;
        }
        
        if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex));
        }
        
        if (parts.length === 0) {
            parts = [text];
        }
        
        // Parse bolding **text** and newlines \n within parts
        return parts.map((part, index) => {
            if (typeof part === 'string') {
                const boldRegex = /\*\*([^*]+)\*\*/g;
                let subParts = [];
                let subLastIndex = 0;
                let subMatch;
                while ((subMatch = boldRegex.exec(part)) !== null) {
                    if (subMatch.index > subLastIndex) {
                        const plainText = part.substring(subLastIndex, subMatch.index);
                        const textLines = plainText.split('\n');
                        textLines.forEach((line, lineIdx) => {
                            if (lineIdx > 0) subParts.push(<br key={`br-${subLastIndex}-${lineIdx}`} />);
                            subParts.push(line);
                        });
                    }
                    subParts.push(<strong key={subMatch.index} style={{ fontWeight: '700', color: '#0f172a' }}>{subMatch[1]}</strong>);
                    subLastIndex = boldRegex.lastIndex;
                }
                if (subLastIndex < part.length) {
                    const plainText = part.substring(subLastIndex);
                    const textLines = plainText.split('\n');
                    textLines.forEach((line, lineIdx) => {
                        if (lineIdx > 0) subParts.push(<br key={`br-end-${lineIdx}`} />);
                        subParts.push(line);
                    });
                }
                return subParts.length > 0 ? <React.Fragment key={index}>{subParts}</React.Fragment> : part;
            }
            return part;
        });
    };

    return (
        <div className="chatbot-container" style={{ fontFamily: appLanguage === 'ar' ? 'Cairo, sans-serif' : 'inherit' }}>
            {isChatOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <div className="chat-header-info">
                            <div className="chat-header-logo-wrapper">
                                <img src={logo} alt="Atelier Sfax Logo" />
                            </div>
                            <div className="chat-header-title-container">
                                <span className="chat-header-title">{appLanguage === 'ar' ? 'المساعد الذكي' : 'Assistant IA'}</span>
                                <span className="chat-header-status">
                                    <span className="chat-status-dot"></span>
                                    {appLanguage === 'ar' ? 'متصل الآن' : 'En ligne'}
                                </span>
                            </div>
                        </div>
                        <button className="chat-close-btn" onClick={() => setIsChatOpen(false)}>
                            <FaTimes size={16} />
                        </button>
                    </div>

                    <div className="chat-body" dir={appLanguage === 'ar' ? 'rtl' : 'ltr'}>
                        {chatMessages.map((m, i) => (
                            <div key={i} className={`chat-message ${m.sender}`}>
                                {renderMessageText(m.text)}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="chat-typing-indicator">
                                <div className="chat-typing-dots">
                                    <span className="chat-dot"></span>
                                    <span className="chat-dot"></span>
                                    <span className="chat-dot"></span>
                                </div>
                                <span>{appLanguage === 'ar' ? 'جاري التفكير...' : 'En train de réfléchir...'}</span>
                            </div>
                        )}
                    </div>

                    <div className="chat-input-area" dir={appLanguage === 'ar' ? 'rtl' : 'ltr'}>
                        <input 
                            type="text" 
                            value={currentMessage} 
                            onChange={e => setCurrentMessage(e.target.value)} 
                            onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                            placeholder={appLanguage === 'ar' ? 'اكتب رسالتك هنا...' : 'Écrivez votre message...'} 
                            className="chat-input-field"
                        />
                        <button className="chat-send-btn" onClick={handleSendMessage}>
                            <FaPaperPlane size={14} />
                        </button>
                    </div>
                </div>
            )}
            
            <button className="chatbot-trigger" onClick={() => setIsChatOpen(!isChatOpen)}>
                <span className="chatbot-pulse"></span>
                <img src={logo} alt="Atelier Sfax Logo" />
            </button>
        </div>
    );
}
