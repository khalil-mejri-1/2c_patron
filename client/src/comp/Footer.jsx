import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FaInstagram, FaPinterestP, FaEnvelope, FaLongArrowAltRight } from 'react-icons/fa';
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
        <footer className="couture-footer" dir={appLanguage === 'ar' ? 'rtl' : 'ltr'}>
            <div className="footer-content">

                {/* 1. Bloc du Logo et Média Sociaux */}
                <div className="footer-section footer-brand">
                    <h3 className="footer-logo">2C Patron</h3>
                    <p className="footer-tagline">
                        {t.tagline}
                    </p>
                    <div className="social-links">
                        <a href="https://instagram.com" aria-label="Instagram"><FaInstagram /></a>
                        <a href="mailto:contact@atelier.com" aria-label="Email"><FaEnvelope /></a>
                    </div>
                </div>

                {/* 2. Bloc de Navigation */}
                <div className="footer-section footer-links">
                    <h4>{t.navTitle}</h4>
                    <ul>
                        <li><Link to="/magasin">{t.navPatterns}</Link></li>
                        <li><Link to="/Vip-access">{t.navCourses}</Link></li>
                        <li><Link to="/about">{t.navAbout}</Link></li>

                    </ul>
                </div>

                {/* 3. Bloc Aide & Support */}
                <div className="footer-section footer-links">
                    <h4>{t.helpTitle}</h4>
                    <ul>
                        <li><a >{t.helpFaq}</a></li>
                        <li><a >{t.helpShipping}</a></li>
                        <li><a >{t.helpTerms}</a></li>
                        <li><a >{t.helpPrivacy}</a></li>
                    </ul>
                </div>

                {/* 4. Bloc Newsletter (Unique et Stylisé) */}
                <div className="footer-section footer-newsletter">
                    <h4>{t.newsTitle}</h4>
                    <p>{t.newsSubtitle}</p>
                    <form className={`newsletter-form ${appLanguage === 'ar' ? 'rtl-form' : ''}`}>
                        <input type="email" placeholder={t.newsPlaceholder} required dir="ltr" />
                        <button type="submit" aria-label={t.newsBtn}>
                            <FaLongArrowAltRight />
                        </button>
                    </form>
                </div>

            </div>

            <div className="footer-bottom">
                <p>{t.copy(currentYear)}</p>
            </div>
        </footer>
    );
}