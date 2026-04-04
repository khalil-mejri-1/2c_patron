import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FaInstagram, FaEnvelope, FaFacebookF, FaPinterestP, FaYoutube, FaLongArrowAltRight, FaMapMarkerAlt, FaPhoneAlt, FaEdit, FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import BASE_URL from '../apiConfig';

const translations = {
    ar: {
        tagline: "التميز في فن الخياطة الرفيعة.",
        navTitle: "الملاحة السريعة",
        helpTitle: "مساعدة ومعلومات",
        newsTitle: "ابق على اطلاع بأحدث الموضات",
        newsSubtitle: "احصل على نصائحنا الحصرية وآخر المستجدات.",
        newsPlaceholder: "بريدك الإلكتروني الأنيق",
        newsBtn: "اشتراك",
        copy: (year) => `© ${year} . جميع الحقوق محفوظة 2C Patron.`,
    },
    fr: {
        tagline: "L'excellence dans l'art du vêtement.",
        navTitle: "Navigation Rapide",
        helpTitle: "Aide & Infos",
        newsTitle: "Restez à la Pointe de la Mode",
        newsSubtitle: "Recevez nos astuces couture exclusives et les dernières nouveautés.",
        newsPlaceholder: "Votre email élégant",
        newsBtn: "S'inscrire",
        copy: (year) => `© ${year}  . Tous droits réservés 2C Patron.`,
    },
    en: {
        tagline: "Excellence in the art of clothing.",
        navTitle: "Quick Navigation",
        helpTitle: "Help & Info",
        newsTitle: "Stay Ahead in Fashion",
        newsSubtitle: "Receive our exclusive sewing tips and latest news.",
        newsPlaceholder: "Your elegant email",
        newsBtn: "Subscribe",
        copy: (year) => `© ${year}  All rights reserved 2C Patron.`,
    }
};

export default function Footer() {
    const { appLanguage, languages } = useLanguage();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isEditingField, setIsEditingField] = useState(null);
    const [footerContent, setFooterContent] = useState({});
    const [editFooterContent, setEditFooterContent] = useState({});

    const defaultStructure = {
        tagline: '', address: 'Sfax, Tunisie', phone: '+216 22 123 456', email: 'contact@2cpatron.com',
        navTitle: '', helpTitle: '', newsTitle: '', newsDesc: '',
        facebookLink: 'https://facebook.com', instagramLink: 'https://instagram.com', 
        youtubeLink: 'https://youtube.com', pinterestLink: 'https://pinterest.com',
        navLinks: [
            { label: 'Boutique', url: '/magasin' },
            { label: 'Cours VIP', url: '/Vip-access' },
            { label: 'À Propos', url: '/about' }
        ],
        helpLinks: [
            { label: 'Contact/FAQ', url: '/contact' },
            { label: 'Livraison', url: '#!' },
            { label: 'Conditions', url: '#!' }
        ]
    };

    const initializeAllLanguages = (currentValues) => {
        const initialized = {};
        languages.forEach(lang => {
            const fallback = translations[lang.code] || translations.fr;
            initialized[lang.code] = {
                ...defaultStructure,
                tagline: currentValues[lang.code]?.tagline || fallback.tagline,
                navTitle: currentValues[lang.code]?.navTitle || fallback.navTitle,
                helpTitle: currentValues[lang.code]?.helpTitle || fallback.helpTitle,
                newsTitle: currentValues[lang.code]?.newsTitle || fallback.newsTitle,
                newsDesc: currentValues[lang.code]?.newsDesc || fallback.newsSubtitle,
                navLinks: currentValues[lang.code]?.navLinks || defaultStructure.navLinks,
                helpLinks: currentValues[lang.code]?.helpLinks || defaultStructure.helpLinks,
                ...(currentValues[lang.code] || {})
            };
        });
        return initialized;
    };

    useEffect(() => {
        const email = localStorage.getItem('currentUserEmail') || localStorage.getItem('loggedInUserEmail');
        const storedRole = localStorage.getItem('userRole') || localStorage.getItem('role');
        const storedIsAdmin = localStorage.getItem('isAdmin');
        if (storedRole === 'admin' || storedIsAdmin === 'true' || (email && email.toLowerCase() === 'admin@admin.com')) {
            setIsAdmin(true);
        }
        fetch(`${BASE_URL}/api/settings/footer-content`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) {
                    setFooterContent(data);
                    setEditFooterContent(initializeAllLanguages(data));
                }
            })
            .catch(() => { });
    }, [languages]);

    const handleSaveFooterContent = async () => {
        setFooterContent(editFooterContent);
        setIsEditingField(null);
        try {
            await fetch(`${BASE_URL}/api/settings/footer-content`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: editFooterContent })
            });
        } catch (err) { }
    };

    const getT = (key, defaultVal) => {
        return (footerContent[appLanguage] && footerContent[appLanguage][key]) || defaultVal;
    };

    const EditBtn = ({ field, style = {} }) => (
        isAdmin && (
            <button onClick={() => setIsEditingField(field)} className="edit-btn-minimal-lux" style={{ ...style, width: 'auto', height: 'auto', padding: '8px', zIndex: 100 }} title="Modifier">
                <FaEdit size={14} />
            </button>
        )
    );

    const fw = translations[appLanguage] || translations.fr;
    const currentYear = new Date().getFullYear();

    const renderLinks = (linksKey, fallbackLinks) => {
        const links = getT(linksKey, fallbackLinks);
        return links.map((link, idx) => (
            <li key={idx}>
                {link.url.startsWith('/') ? <Link to={link.url}>{link.label}</Link> : <a href={link.url}>{link.label}</a>}
            </li>
        ));
    };

    return (
        <footer className="prestige-footer" dir={appLanguage === 'ar' ? 'rtl' : 'ltr'}>
            <div className="footer-wave-divider">
                <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
                </svg>
            </div>

            <div className="footer-main">
                <div className="footer-grid-container">
                    <div className="footer-column brand-column" style={{ position: 'relative' }}>
                        <EditBtn field="brand" style={{ position: 'absolute', top: '-10px', right: '-10px' }} />
                        <Link to="/" className="footer-logo-premium">2C <span>Patron</span></Link>
                        <p className="brand-tagline">{getT('tagline', fw.tagline)}</p>
                        <div className="footer-contact-info">
                            <div className="contact-item"><FaMapMarkerAlt className="contact-icon" /><span>{getT('address', 'Sfax, Tunisie')}</span></div>
                            <div className="contact-item"><FaPhoneAlt className="contact-icon" /><span dir="ltr">{getT('phone', '+216 22 123 456')}</span></div>
                            <div className="contact-item"><FaEnvelope className="contact-icon" /><span>{getT('email', 'contact@2cpatron.com')}</span></div>
                        </div>
                    </div>

                    <div className="footer-column" style={{ position: 'relative' }}>
                        <EditBtn field="navLinks" style={{ position: 'absolute', top: '-10px', right: '-10px' }} />
                        <h4 className="column-title">{getT('navTitle', fw.navTitle)}</h4>
                        <ul className="footer-nav-list">{renderLinks('navLinks', defaultStructure.navLinks)}</ul>
                    </div>

                    <div className="footer-column" style={{ position: 'relative' }}>
                        <EditBtn field="helpLinks" style={{ position: 'absolute', top: '-10px', right: '-10px' }} />
                        <h4 className="column-title">{getT('helpTitle', fw.helpTitle)}</h4>
                        <ul className="footer-nav-list">{renderLinks('helpLinks', defaultStructure.helpLinks)}</ul>
                    </div>

                    <div className="footer-column newsletter-column" style={{ position: 'relative' }}>
                        <EditBtn field="newsletter" style={{ position: 'absolute', top: '-10px', right: '-10px' }} />
                        <h4 className="column-title">{getT('newsTitle', fw.newsTitle)}</h4>
                        <p className="news-desc">{getT('newsDesc', fw.newsSubtitle)}</p>
                        <form className="prestige-news-form" onSubmit={(e) => e.preventDefault()}>
                            <input type="email" placeholder={getT('newsPlaceholder', fw.newsPlaceholder)} required />
                            <button type="submit"><FaLongArrowAltRight /></button>
                        </form>
                        <div className="social-pill">
                            <a href={getT('facebookLink', 'https://facebook.com')} className="social-icon"><FaFacebookF /></a>
                            <a href={getT('instagramLink', 'https://instagram.com')} className="social-icon"><FaInstagram /></a>
                            <a href={getT('youtubeLink', 'https://youtube.com')} className="social-icon"><FaYoutube /></a>
                            <a href={getT('pinterestLink', 'https://pinterest.com')} className="social-icon"><FaPinterestP /></a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="footer-bottom-bar">
                <div className="bottom-content">
                    <p className="copyright-text">{fw.copy(currentYear)}</p>
                    <div className="bottom-links">
                        <Link to="/">Accueil</Link>
                        <Link to="/magasin">Boutique</Link>
                        <Link to="/contact">Contact</Link>
                    </div>
                </div>
            </div>

            {isEditingField && (
                <div className="premium-modal-backdrop" onClick={() => setIsEditingField(null)}>
                    <div className="premium-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                        <button className="premium-modal-close-icon" onClick={() => setIsEditingField(null)}><FaTimes /></button>
                        <h2 className="premium-modal-title">Modifier {isEditingField}</h2>
                        <div className="premium-modal-scroll-area">
                            {languages.filter(l => l.code === appLanguage).map(lang => (
                                <div key={lang.code} className="premium-modal-lang-tab active">
                                    {isEditingField === 'brand' && (
                                        <>
                                            <div className="premium-form-group"><label>Slogan</label><input type="text" value={editFooterContent[lang.code]?.tagline || ''} onChange={e => setEditFooterContent({...editFooterContent, [lang.code]: {...editFooterContent[lang.code], tagline: e.target.value}})} /></div>
                                            <div className="premium-form-group"><label>Adresse</label><input type="text" value={editFooterContent[lang.code]?.address || ''} onChange={e => setEditFooterContent({...editFooterContent, [lang.code]: {...editFooterContent[lang.code], address: e.target.value}})} /></div>
                                            <div className="premium-form-group"><label>Téléphone</label><input type="text" value={editFooterContent[lang.code]?.phone || ''} onChange={e => setEditFooterContent({...editFooterContent, [lang.code]: {...editFooterContent[lang.code], phone: e.target.value}})} /></div>
                                            <div className="premium-form-group"><label>Email</label><input type="text" value={editFooterContent[lang.code]?.email || ''} onChange={e => setEditFooterContent({...editFooterContent, [lang.code]: {...editFooterContent[lang.code], email: e.target.value}})} /></div>
                                        </>
                                    )}
                                    {(isEditingField === 'navLinks' || isEditingField === 'helpLinks') && (
                                        <>
                                            <div className="premium-form-group">
                                                <label>Titre de la Colonne</label>
                                                <input type="text" value={editFooterContent[lang.code]?.[isEditingField === 'navLinks' ? 'navTitle' : 'helpTitle'] || ''} onChange={e => setEditFooterContent({...editFooterContent, [lang.code]: {...editFooterContent[lang.code], [isEditingField === 'navLinks' ? 'navTitle' : 'helpTitle']: e.target.value}})} />
                                            </div>
                                            <div style={{ marginTop: '20px' }}>
                                                { (editFooterContent[lang.code]?.[isEditingField] || []).map((link, lIdx) => (
                                                    <div key={lIdx} style={{ display: 'flex', gap: '10px', marginBottom: '15px', padding: '15px', background: '#f8fafc', borderRadius: '15px', border: '1px solid #e2e8f0', alignItems: 'center' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <div className="premium-form-group" style={{ marginBottom: '8px' }}><label>Label</label><input type="text" value={link.label} onChange={e => {
                                                                const newLinks = [...editFooterContent[lang.code][isEditingField]];
                                                                newLinks[lIdx].label = e.target.value;
                                                                setEditFooterContent({...editFooterContent, [lang.code]: {...editFooterContent[lang.code], [isEditingField]: newLinks}});
                                                            }} /></div>
                                                            <div className="premium-form-group" style={{ marginBottom: 0 }}><label>URL/Path</label><input type="text" value={link.url} onChange={e => {
                                                                const newLinks = [...editFooterContent[lang.code][isEditingField]];
                                                                newLinks[lIdx].url = e.target.value;
                                                                setEditFooterContent({...editFooterContent, [lang.code]: {...editFooterContent[lang.code], [isEditingField]: newLinks}});
                                                            }} /></div>
                                                        </div>
                                                        <button onClick={() => {
                                                            const newLinks = editFooterContent[lang.code][isEditingField].filter((_, i) => i !== lIdx);
                                                            setEditFooterContent({...editFooterContent, [lang.code]: {...editFooterContent[lang.code], [isEditingField]: newLinks}});
                                                        }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><FaTrash /></button>
                                                    </div>
                                                ))}
                                                <button onClick={() => {
                                                    const newLinks = [...(editFooterContent[lang.code][isEditingField] || []), { label: 'New Link', url: '/' }];
                                                    setEditFooterContent({...editFooterContent, [lang.code]: {...editFooterContent[lang.code], [isEditingField]: newLinks}});
                                                }} className="premium-btn-cta secondary" style={{ padding: '10px', fontSize: '0.8rem' }}><FaPlus /> Ajouter un lien</button>
                                            </div>
                                        </>
                                    )}
                                    {isEditingField === 'newsletter' && (
                                        <>
                                            <div className="premium-form-group"><label>Titre News</label><input type="text" value={editFooterContent[lang.code]?.newsTitle || ''} onChange={e => setEditFooterContent({...editFooterContent, [lang.code]: {...editFooterContent[lang.code], newsTitle: e.target.value}})} /></div>
                                            <div className="premium-form-group"><label>Description</label><textarea value={editFooterContent[lang.code]?.newsDesc || ''} onChange={e => setEditFooterContent({...editFooterContent, [lang.code]: {...editFooterContent[lang.code], newsDesc: e.target.value}})} /></div>
                                            <hr style={{ margin: '20px 0', opacity: 0.1 }} />
                                            {['facebookLink', 'instagramLink', 'youtubeLink', 'pinterestLink'].map(key => (
                                                <div key={key} className="premium-form-group"><label>{key.replace('Link', '')}</label><input type="text" value={editFooterContent[lang.code]?.[key] || ''} onChange={e => setEditFooterContent({...editFooterContent, [lang.code]: {...editFooterContent[lang.code], [key]: e.target.value}})} /></div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="premium-btn-group">
                            <button className="premium-btn-cta secondary" onClick={() => setIsEditingField(null)}>Annuler</button>
                            <button className="premium-btn-cta gold" onClick={handleSaveFooterContent}><FaSave /> Enregistrer</button>
                        </div>
                    </div>
                </div>
            )}
        </footer>
    );
}
