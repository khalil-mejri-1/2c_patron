import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    FaBars, FaTimes, FaUsers, FaBoxOpen, FaShoppingCart,
    FaEnvelope, FaComments, FaCrown, FaVideo, FaCog, FaChartBar
} from 'react-icons/fa';

export default function NavbarAdmin() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const navLinks = [
        { to: "/admin", label: "Dashboard", icon: <FaChartBar /> },
        { to: "/admin_clients", label: "Clients", icon: <FaUsers /> },
        { to: "/admin_products", label: "Produits", icon: <FaBoxOpen /> },
        { to: "/admin_command", label: "Commandes", icon: <FaShoppingCart /> },
        { to: "/admin_videos", label: "Vidéos", icon: <FaVideo /> },
        { to: "/admin_espace_vip", label: "Espace VIP", icon: <FaCrown /> },
        { to: "/admin_message", label: "Messages", icon: <FaEnvelope /> },
        { to: "/admin_commentaire", label: "Avis", icon: <FaComments /> },
        { to: "/admin_settings", label: "Réglages", icon: <FaCog /> },
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
                    >
                        <span style={{ marginRight: '8px' }}>{link.icon}</span>
                        {link.label}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
