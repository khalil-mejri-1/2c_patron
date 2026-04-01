import React, { useState, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';
import BASE_URL from '../apiConfig';

export default function AIChatbot() {
    const { appLanguage } = useLanguage();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState('');

    useEffect(() => {
        setChatMessages([{ sender: 'ai', text: appLanguage === 'ar' ? 'مرحباً! أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟' : 'Bonjour ! Je suis votre assistant intelligent. Comment puis-je vous aider ?' }]);
    }, [appLanguage]);

    const [isTyping, setIsTyping] = useState(false);

    const handleSendMessage = async () => {
        if(!currentMessage.trim() || isTyping) return;
        const msg = currentMessage;
        setChatMessages(prev => [...prev, { sender: 'user', text: msg }]);
        setCurrentMessage('');
        setIsTyping(true);
        
        try {
            const res = await axios.post(`${BASE_URL}/api/chatbot`, {
                message: msg,
                language: appLanguage
            });
            setChatMessages(prev => [...prev, { sender: 'ai', text: res.data.text }]);
        } catch (err) {
            console.error(err);
            setChatMessages(prev => [...prev, { sender: 'ai', text: appLanguage === 'ar' ? 'عذراً، حدث خطأ ما.' : 'Désolé, une erreur est survenue.' }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontFamily: appLanguage === 'ar' ? 'Cairo, sans-serif' : 'inherit' }}>
            {isChatOpen && (
                <div style={{ background: '#fff', width: '320px', height: '420px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', marginBottom: '15px', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                    <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: 'white', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '50%' }}>
                                <FaRobot size={20} color="#D4AF37" />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: '700', fontSize: '1.05rem', letterSpacing: '0.05em' }}>{appLanguage === 'ar' ? 'المساعد الذكي' : 'Assistant IA'}</span>
                                <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>{appLanguage === 'ar' ? 'متصل الآن' : 'En ligne'}</span>
                            </div>
                        </div>
                        <button onClick={() => setIsChatOpen(false)} style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color='white'} onMouseLeave={e => e.currentTarget.style.color='#cbd5e1'}><FaTimes size={18} /></button>
                    </div>
                    <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc' }} dir={appLanguage === 'ar' ? 'rtl' : 'ltr'}>
                        {chatMessages.map((m, i) => (
                            <div key={i} style={{ 
                                alignSelf: m.sender === 'user' ? (appLanguage === 'ar' ? 'flex-start' : 'flex-end') : (appLanguage === 'ar' ? 'flex-end' : 'flex-start'), 
                                background: m.sender === 'user' ? '#D4AF37' : '#ffffff', 
                                color: m.sender === 'user' ? 'white' : '#334155', 
                                padding: '12px 16px', 
                                borderRadius: '16px', 
                                borderBottomRightRadius: m.sender === 'user' ? '4px' : '16px',
                                borderBottomLeftRadius: m.sender !== 'user' ? '4px' : '16px',
                                maxWidth: '85%', 
                                fontSize: '0.9rem',
                                lineHeight: '1.5',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                            }}>
                                {m.text}
                            </div>
                        ))}
                        {isTyping && (
                            <div style={{ 
                                alignSelf: appLanguage === 'ar' ? 'flex-end' : 'flex-start',
                                background: '#eceef1', color: '#94a3b8', padding: '10px 15px', borderRadius: '16px', borderBottomLeftRadius: appLanguage === 'ar' ? '16px' : '4px', borderBottomRightRadius: appLanguage === 'ar' ? '4px' : '16px', maxWidth: '85%', fontSize: '0.8rem'
                            }}>
                                {appLanguage === 'ar' ? 'يكتب...' : 'En train d\'écrire...'}
                            </div>
                        )}
                    </div>
                    <div style={{ padding: '15px', borderTop: '1px solid #e2e8f0', background: 'white', display: 'flex', gap: '10px' }} dir={appLanguage === 'ar' ? 'rtl' : 'ltr'}>
                        <input 
                            type="text" 
                            value={currentMessage} 
                            onChange={e => setCurrentMessage(e.target.value)} 
                            onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                            placeholder={appLanguage === 'ar' ? 'اكتب رسالتك هنا...' : 'Écrivez votre message...'} 
                            style={{ flex: 1, padding: '12px 15px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', fontSize: '0.9rem' }} 
                        />
                        <button onClick={handleSendMessage} style={{ background: '#1e293b', color: 'white', border: 'none', borderRadius: '12px', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.3s' }} onMouseEnter={e => e.currentTarget.style.background='#0f172a'} onMouseLeave={e => e.currentTarget.style.background='#1e293b'}>
                            <FaPaperPlane />
                        </button>
                    </div>
                </div>
            )}
            <button 
                onClick={() => setIsChatOpen(!isChatOpen)} 
                style={{ background: '#1e293b', color: '#D4AF37', width: '65px', height: '65px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', boxShadow: '0 8px 20px rgba(0,0,0,0.2)', cursor: 'pointer', border: '3px solid #D4AF37', transition: 'transform 0.3s ease-out' }} 
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08) translateY(-5px)'} 
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
            >
                <FaRobot />
            </button>
        </div>
    );
}
