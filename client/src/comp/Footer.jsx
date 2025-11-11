import React from 'react';
import { FaInstagram, FaPinterestP, FaEnvelope, FaLongArrowAltRight } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="couture-footer">
      <div className="footer-content">

        {/* 1. Bloc du Logo et Média Sociaux */}
        <div className="footer-section footer-brand">
          <h3 className="footer-logo">COUTURE ATELIER</h3>
          <p className="footer-tagline">
            L'excellence dans l'art du vêtement.
          </p>
          <div className="social-links">
            <a href="https://instagram.com" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://pinterest.com" aria-label="Pinterest"><FaPinterestP /></a>
            <a href="mailto:contact@atelier.com" aria-label="Email"><FaEnvelope /></a>
          </div>
        </div>

        {/* 2. Bloc de Navigation */}
        <div className="footer-section footer-links">
          <h4>Navigation Rapide</h4>
          <ul>
            <li><a href="/patterns">Patrons</a></li>
            <li><a href="/courses">Cours Spécialisés</a></li>
            <li><a href="/vip-access">Master Atelier VIP</a></li>
            <li><a href="/about">À Propos</a></li>
          </ul>
        </div>

        {/* 3. Bloc Aide & Support */}
        <div className="footer-section footer-links">
          <h4>Aide & Infos</h4>
          <ul>
            <li><a href="/faq">FAQ</a></li>
            <li><a href="/shipping">Livraison & Retours</a></li>
            <li><a href="/terms">Conditions Générales</a></li>
            <li><a href="/privacy">Politique de Confidentialité</a></li>
          </ul>
        </div>

        {/* 4. Bloc Newsletter (Unique et Stylisé) */}
        <div className="footer-section footer-newsletter">
          <h4>Restez à la Pointe de la Mode</h4>
          <p>Recevez nos astuces couture exclusives et les dernières nouveautés.</p>
          <form className="newsletter-form">
            <input type="email" placeholder="Votre email élégant" required />
            <button type="submit" aria-label="S'inscrire">
                <FaLongArrowAltRight />
            </button>
          </form>
        </div>

      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} COUTURE ATELIER. Tous droits réservés.</p>
      </div>
    </footer>
  );
}