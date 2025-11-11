import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom'; 
import { FaBars, FaTimes } from 'react-icons/fa'; // Icons for the Hamburger menu

export default function NavbarAdmin() { // Renamed to PascalCase for convention
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="navbar-admin"> 
            <div className="navbar-admin-brand">Admin</div>

            {/* 🚀 Hamburger Menu Button (Visible on mobile) */}
            <button 
                onClick={toggleMenu} 
                className="menu-toggle-button"
                aria-label="Toggle navigation menu"
            >
                {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>

            {/* Navigation Links Container */}
            <div 
                // Conditionally apply the 'open' class for mobile responsiveness
                className={`navbar-admin-links ${isMenuOpen ? 'open' : ''}`}
            >
                
                <NavLink to="/admin_clients" className="navbar-admin-link" onClick={isMenuOpen ? toggleMenu : null}>
                    Gestion de Client
               </NavLink>

                <NavLink to="/admin_products" className="navbar-admin-link" onClick={isMenuOpen ? toggleMenu : null}>
                    Gestion de Produit
               </NavLink>
               

                <NavLink to="/admin_videos" className="navbar-admin-link" onClick={isMenuOpen ? toggleMenu : null}>
                    Gestion de Vidéo
               </NavLink>
                
                <NavLink to="/admin_command" className="navbar-admin-link" onClick={isMenuOpen ? toggleMenu : null}>
                    Gestion de Commande
               </NavLink>
                  <NavLink to="/admin_message" className="navbar-admin-link" onClick={isMenuOpen ? toggleMenu : null}>
                    Gestion de Message
               </NavLink>

                 <NavLink to="/admin_commentaire" className="navbar-admin-link" onClick={isMenuOpen ? toggleMenu : null}>
                    Gestion de Commentaire
               </NavLink>

                 <NavLink to="/admin_abonnement" className="navbar-admin-link" onClick={isMenuOpen ? toggleMenu : null}>
                    Gestion de Abonnement
               </NavLink>
            </div>
        </nav>
    );
}