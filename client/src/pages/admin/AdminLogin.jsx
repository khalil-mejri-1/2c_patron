import React, { useState } from 'react';
import { FaLock, FaUser, FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (email === 'taher@cpatron.com' && password === 'taher123') {
            localStorage.setItem('isAdminLoggedIn', 'true');
            // We can also store session expiry if needed
            navigate('/admin');
        } else {
            setError('Identifiants admin incorrects');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                padding: '40px',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{
                        width: '70px',
                        height: '70px',
                        background: '#D4AF37',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        color: '#fff',
                        margin: '0 auto 15px',
                        boxShadow: '0 10px 20px rgba(212, 175, 55, 0.3)'
                    }}>
                        <FaShieldAlt />
                    </div>
                    <h2 style={{ color: '#fff', fontSize: '1.8rem', margin: 0 }}>Accès Admin</h2>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '8px' }}>Espace de gestion sécurisé</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ position: 'relative' }}>
                        <FaUser style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="email"
                            placeholder="Email Admin"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '15px 15px 15px 45px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                color: '#fff',
                                fontSize: '0.95rem',
                                outline: 'none',
                                transition: 'all 0.3s'
                            }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <FaLock style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Mot de passe"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '15px 45px 15px 45px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                color: '#fff',
                                fontSize: '0.95rem',
                                outline: 'none',
                                transition: 'all 0.3s'
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '15px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                color: '#94a3b8',
                                cursor: 'pointer'
                            }}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    {error && (
                        <div style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '15px',
                            background: '#D4AF37',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            marginTop: '10px',
                            transition: 'all 0.3s',
                            boxShadow: '0 10px 20px rgba(212, 175, 55, 0.2)'
                        }}
                    >
                        Se connecter
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '25px' }}>
                    <button 
                        onClick={() => navigate('/')}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        Retour au site
                    </button>
                </div>
            </div>
        </div>
    );
}
