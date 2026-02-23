import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FaInstagram, FaEnvelope, FaFacebookF, FaPinterestP, FaYoutube, FaLongArrowAltRight, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// 🌐 كائن الترجمة
const translations = {
    ar: {
        tagline: "التميز في فن الخياطة الرفيعة.",
        navTitle: "الملاحة السريعة",
        navPatterns: "باترونات",
        navCourses: "دورات متخصصة",
        navVip: "ورشة عمل ماستر VIP",
        navAbout: "حولنا",
        helpTitle: "مساعدة ومعلومات",
        helpFaq: "الأسئلة الشائعة",
        helpShipping: "الشحن والإرجاع",
        helpTerms: "الشروط العامة",
        helpPrivacy: "سياسة الخصوصية",
        newsTitle: "ابق على اطلاع بأحدث الموضات",
        newsSubtitle: "احصل على نصائحنا الحصرية وآخر المستجدات.",
        newsPlaceholder: "بريدك الإلكتروني الأنيق",
        newsBtn: "اشتراك",
        copy: (year) => `© ${year} . جميع الحقوق محفوظة 2C Patron.`,
    },
    fr: {
        tagline: "L'excellence dans l'art du vêtement.",
        navTitle: "Navigation Rapide",
        navPatterns: "Patrons",
        navCourses: "Cours Spécialisés",
        navVip: "Master Atelier VIP",
        navAbout: "À Propos",
        helpTitle: "Aide & Infos",
        helpFaq: "FAQ",
        helpShipping: "Livraison & Retours",
        helpTerms: "Conditions Générales",
        helpPrivacy: "Politique de Confidentialité",
        newsTitle: "Restez à la Pointe de la Mode",
        newsSubtitle: "Recevez nos astuces couture exclusives et les dernières nouveautés.",
        newsPlaceholder: "Votre email élégant",
        newsBtn: "S'inscrire",
        copy: (year) => `© ${year}  . Tous droits réservés 2C Patron.`,
    },
    en: {
        tagline: "Excellence in the art of clothing.",
        navTitle: "Quick Navigation",
        navPatterns: "Patterns",
        navCourses: "Specialized Courses",
        navVip: "Master Atelier VIP",
        navAbout: "About Us",
        helpTitle: "Help & Info",
        helpFaq: "FAQ",
        helpShipping: "Shipping & Returns",
        helpTerms: "General Terms",
        helpPrivacy: "Privacy Policy",
        newsTitle: "Stay Ahead in Fashion",
        newsSubtitle: "Receive our exclusive sewing tips and latest news.",
        newsPlaceholder: "Your elegant email",
        newsBtn: "Subscribe",
        copy: (year) => `© ${year}  All rights reserved 2C Patron.`,
    }
};



export default function Footer() {
    const { appLanguage } = useLanguage();



    const t = translations[appLanguage] || translations.fr;
    const currentYear = new Date().getFullYear();

    return (
        <footer className="prestige-footer" dir={appLanguage === 'ar' ? 'rtl' : 'ltr'}>
            <div className="footer-wave-divider">
                <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
                </svg>
            </div>

            <div className="footer-main">
                <div className="footer-grid-container">

                    {/* 1. Brand Identity */}
                    <div className="footer-column brand-column">
                        <Link to="/" className="footer-logo-premium">
                            2C <span>Patron</span>
                        </Link>
                        <p className="brand-tagline">{t.tagline}</p>
                        <div className="footer-contact-info">
                            <div className="contact-item">
                                <FaMapMarkerAlt className="contact-icon" />
                                <span>Sfax, Tunisie</span>
                            </div>
                            <div className="contact-item">
                                <FaPhoneAlt className="contact-icon" />
                                <span>+216 22 123 456</span>
                            </div>
                            <div className="contact-item">
                                <FaEnvelope className="contact-icon" />
                                <span>contact@2cpatron.com</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Quick Navigation */}
                    <div className="footer-column">
                        <h4 className="column-title">{t.navTitle}</h4>
                        <ul className="footer-nav-list">
                            <li><Link to="/magasin">{t.navPatterns}</Link></li>
                            <li><Link to="/Vip-access">{t.navCourses}</Link></li>
                            <li><Link to="/about">{t.navAbout}</Link></li>
                        </ul>
                    </div>

                    {/* 3. Customer Care */}
                    <div className="footer-column">
                        <h4 className="column-title">{t.helpTitle}</h4>
                        <ul className="footer-nav-list">
                            <li><Link to="/contact">{t.helpFaq}</Link></li>
                            <li><a href="#!">{t.helpShipping}</a></li>
                            <li><a href="#!">{t.helpTerms}</a></li>
                            <li><a href="#!">{t.helpPrivacy}</a></li>
                        </ul>
                    </div>

                    {/* 4. Newsletter & Social */}
                    <div className="footer-column newsletter-column">
                        <h4 className="column-title">{t.newsTitle}</h4>
                        <p className="news-desc">{t.newsSubtitle}</p>
                        <form className="prestige-news-form">
                            <input type="email" placeholder={t.newsPlaceholder} required />
                            <button type="submit">
                                <FaLongArrowAltRight />
                            </button>
                        </form>
                        <div className="social-pill">
                            <a href="https://facebook.com" className="social-icon" aria-label="Facebook"><FaFacebookF /></a>
                            <a href="https://instagram.com" className="social-icon" aria-label="Instagram"><FaInstagram /></a>
                            <a href="https://youtube.com" className="social-icon" aria-label="YouTube"><FaYoutube /></a>
                            <a href="https://pinterest.com" className="social-icon" aria-label="Pinterest"><FaPinterestP /></a>
                        </div>
                    </div>

                </div>
            </div>

            <div className="footer-bottom-bar">
                <div className="bottom-content">
                    <p className="copyright-text">{t.copy(currentYear)}</p>
                    <div className="bottom-links">
                        <Link to="/">Accueil</Link>
                        <Link to="/magasin">Boutique</Link>
                        <Link to="/contact">Contact</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
