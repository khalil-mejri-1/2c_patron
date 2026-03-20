import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
    FaBars, FaTimes, FaUsers, FaBoxOpen, FaShoppingCart,
    FaEnvelope, FaComments, FaCrown, FaVideo, FaCog, FaChartBar, FaHome
} from 'react-icons/fa';
import BASE_URL from '../apiConfig';

export default function NavbarAdmin() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const [counts, setCounts] = useState({
        commands: 0,
        messages: 0,
        comments: 0
    });

    // Styles pour les badges premium
    const getBadgeStyle = (to) => {
        let colors = {
            bg: '#D4AF37',
            glow: 'rgba(212, 175, 55, 0.4)'
        };
        if (to === '/admin_message') {
            colors = { bg: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' };
        } else if (to === '/admin_commentaire') {
            colors = { bg: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' };
        }

        return {
            marginLeft: '10px',
            background: `linear-gradient(135deg, ${colors.bg}, ${colors.bg}dd)`,
            color: '#fff',
            minWidth: '20px',
            height: '20px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7rem',
            fontWeight: '900',
            padding: '0 6px',
            boxShadow: `0 0 15px ${colors.glow}`,
            border: '1px solid rgba(255,255,255,0.2)',
            animation: 'pulseBadge 2s infinite ease-in-out'
        };
    };

    useEffect(() => {
        // Ajouter l'animation au document une seule fois
        const styleSheet = document.createElement("style");
        styleSheet.innerText = `
            @keyframes pulseBadge {
                0% { transform: scale(1); box-shadow: 0 0 5px rgba(255,255,255,0.2); }
                50% { transform: scale(1.1); box-shadow: 0 0 15px rgba(255,255,255,0.5); }
                100% { transform: scale(1); box-shadow: 0 0 5px rgba(255,255,255,0.2); }
            }
        `;
        document.head.appendChild(styleSheet);
        
        const fetchCounts = async () => {
            try {
                const [cmdRes, msgRes, cmtRes] = await Promise.all([
                    fetch(`${BASE_URL}/api/commands`).then(r => r.json()).catch(() => []),
                    fetch(`${BASE_URL}/api/messages`).then(r => r.json()).catch(() => []),
                    fetch(`${BASE_URL}/api/commentaires`).then(r => r.json()).catch(() => [])
                ]);

                setCounts({
                    commands: cmdRes.filter(c => c.status === 'En attente').length,
                    messages: msgRes.filter(m => !m.estTraite).length,
                    comments: cmtRes.filter(c => c.statut === 'En attente').length
                });
            } catch (err) {
                console.error("Error fetching navbar counts", err);
            }
        };
        fetchCounts();
        // Optionnel: rafraîchir toutes les 30s
        const interval = setInterval(fetchCounts, 30000);
        return () => clearInterval(interval);
    }, []);

    const navLinks = [
        { to: "/admin", label: "Dashboard", icon: <FaChartBar /> },
        { to: "/admin_clients", label: "Clients", icon: <FaUsers /> },
        { to: "/admin_command", label: "Commandes", icon: <FaShoppingCart />, badge: counts.commands },
        { to: "/admin_message", label: "Messages", icon: <FaEnvelope />, badge: counts.messages },
        { to: "/admin_commentaire", label: "Avis", icon: <FaComments />, badge: counts.comments },
        { to: "/admin_all_videos", label: "Vidéos", icon: <FaVideo /> },
        { to: "/admin_settings", label: "Réglages", icon: <FaCog /> },
        { to: "/", label: "Retour au Site", icon: <FaHome /> },
    ];

    return (
        <nav className="navbar-admin">
            <div className="navbar-admin-brand">Atelier Sfax <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>ADMIN</span></div>

            <button onClick={toggleMenu} className="menu-toggle-button">
                {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>

            <div className={`navbar-admin-links ${isMenuOpen ? 'open' : ''}`}>
                {navLinks.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => `navbar-admin-link ${isActive ? 'active' : ''}`}
                        onClick={() => isMenuOpen && toggleMenu()}
                        end={link.to === "/admin"}
                        style={{ display: 'flex', alignItems: 'center', position: 'relative' }}
                    >
                        <span style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }}>{link.icon}</span>
                        {link.label}
                        {link.badge > 0 && (
                            <span style={getBadgeStyle(link.to)}>
                                {link.badge}
                            </span>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
