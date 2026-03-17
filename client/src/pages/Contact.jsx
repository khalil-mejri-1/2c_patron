import React, { useState, useEffect } from 'react';
import './contact_premium.css';
import { useLanguage } from '../context/LanguageContext';
import { FaMapMarkerAlt, FaUser, FaEnvelope, FaPhone, FaClock, FaPaperPlane, FaChevronRight, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import BASE_URL from '../apiConfig';

// 🌐 كائن الترجمة
const translations = {
    ar: {
        headerTitle: () => `تواصل مع   2C Patron`,
        headerAccent: "الورشة",

        formTitle: "أرسل لنا رسالة",
        namePlaceholder: "اسمك الكامل",
        emailPlaceholder: "بريدك الإلكتروني",
        subjectPlaceholder: "موضوع الرسالة",
        messagePlaceholder: "رسالتك...",
        submitBtn: "إرسال الرسالة",

        statusLoading: "جاري الإرسال... الرجاء الانتظار.",
        statusSuccess: "تم إرسال رسالتك بنجاح وتسجيلها! سنرد عليك قريباً.",
        statusError: "حدث خطأ أثناء الإرسال. يرجى التحقق من معلوماتك والمحاولة مرة أخرى.",

        infoTitle: "تفاصيل الاتصال",
        addressLabel: "العنوان",
        addressValue: "15، شارع الحرير، تونس، تونس",
        phoneLabel: "الهاتف",
        phoneValue: "+216 22 123 456",
        emailLabel: "البريد الإلكتروني",
        emailValue: "contact@atelier-couture.tn",
        hoursLabel: "ساعات العمل",
        hoursValue: "الإثنين - الجمعة: 09:00 - 18:00",
        sending: "إرسال..."
    },
    fr: {
        headerTitle: () => `Contactez 2C Patron`,
        headerAccent: "l'Atelier",

        formTitle: "Envoyez-nous un Message",
        namePlaceholder: "Votre Nom Complet",
        emailPlaceholder: "Votre E-mail",
        subjectPlaceholder: "Sujet du Message",
        messagePlaceholder: "Votre Message...",
        submitBtn: "Envoyer le Message",

        statusLoading: "Envoi en cours... Veuillez patienter.",
        statusSuccess: "Votre message a été envoyé avec succès et enregistré ! Nous vous répondrons bientôt.",
        statusError: "Une erreur s'est produite lors de l'envoi. Veuillez vérifier vos informations et réessayer.",

        infoTitle: "Détails de Contact",
        addressLabel: "Adresse",
        addressValue: "15, Rue de la Soie, Tunis, Tunisie",
        phoneLabel: "Téléphone",
        phoneValue: "+216 22 123 456",
        emailLabel: "Email",
        emailValue: "contact@atelier-couture.tn",
        hoursLabel: "Heures d'Ouverture",
        hoursValue: "Lun - Ven: 9h00 - 18h00",
        sending: "Envoi..."
    },
    en: {
        headerTitle: () => `Contact 2C Patron`,
        headerAccent: "the Workshop",

        formTitle: "Send Us a Message",
        namePlaceholder: "Your Full Name",
        emailPlaceholder: "Your E-mail",
        subjectPlaceholder: "Message Subject",
        messagePlaceholder: "Your Message...",
        submitBtn: "Send Message",

        statusLoading: "Sending... Please wait.",
        statusSuccess: "Your message has been successfully sent and recorded! We will reply soon.",
        statusError: "An error occurred during sending. Please check your information and try again.",

        infoTitle: "Contact Details",
        addressLabel: "Address",
        addressValue: "15, Silk Street, Tunis, Tunisia",
        phoneLabel: "Phone",
        phoneValue: "+216 22 123 456",
        emailLabel: "Email",
        emailValue: "contact@atelier-couture.tn",
        hoursLabel: "Opening Hours",
        hoursValue: "Mon - Fri: 9:00 AM - 6:00 PM",
        sending: "Sending..."
    }
};

const API_ENDPOINT = `${BASE_URL} /api/messages`;

export default function Contact() {
    const { appLanguage, languages } = useLanguage();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isEditingField, setIsEditingField] = useState(null);
    // Default structure for content
    const defaultStructure = {
        headerTitle: '', headerAccent: '', heroImage: '',
        formTitle: '', submitBtn: '',
        infoTitle: '', addressValue: '', phoneValue: '', emailValue: '', hoursValue: ''
    };

    const [contactContent, setContactContent] = useState({});
    const [editContactContent, setEditContactContent] = useState({});

    // 🔧 دالة مساعدة لتهيئة جميع اللغات المتاحة
    const initializeAllLanguages = (currentValues) => {
        const initialized = {};
        languages.forEach(lang => {
            const fallback = translations[lang.code] || translations.fr;
            initialized[lang.code] = {
                ...defaultStructure,
                headerTitle: currentValues[lang.code]?.headerTitle || (typeof fallback.headerTitle === 'function' ? fallback.headerTitle('') : fallback.headerTitle),
                headerAccent: currentValues[lang.code]?.headerAccent || fallback.headerAccent,
                formTitle: currentValues[lang.code]?.formTitle || fallback.formTitle,
                submitBtn: currentValues[lang.code]?.submitBtn || fallback.submitBtn,
                infoTitle: currentValues[lang.code]?.infoTitle || fallback.infoTitle,
                addressValue: currentValues[lang.code]?.addressValue || fallback.addressValue,
                phoneValue: currentValues[lang.code]?.phoneValue || fallback.phoneValue,
                emailValue: currentValues[lang.code]?.emailValue || fallback.emailValue,
                hoursValue: currentValues[lang.code]?.hoursValue || fallback.hoursValue,
                heroImage: currentValues[lang.code]?.heroImage || currentValues.fr?.heroImage || '',
                ...(currentValues[lang.code] || {})
            };
        });
        return initialized;
    };

    // 1. ⚙️ جلب التحقق من المسؤول
    useEffect(() => {
        // Check Admin
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const email = localStorage.getItem('currentUserEmail') || localStorage.getItem('loggedInUserEmail');
        const currentUser = users.find(u => u.email === email);
        if (currentUser?.statut === 'admin') setIsAdmin(true);

        // Load Content
        fetch(`${BASE_URL}/api/settings/contact-content`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) {
                    setContactContent(data);
                    setEditContactContent(initializeAllLanguages(data));
                }
            })
            .catch(() => { });
    }, [languages]);

    const handleSaveContactContent = async () => {
        setContactContent(editContactContent);
        setIsEditingField(null);
        try {
            await fetch(`${BASE_URL}/api/settings/contact-content`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: editContactContent })
            });
        } catch (err) { }
    };

    const getT = (key, defaultVal) => {
        return (contactContent[appLanguage] && contactContent[appLanguage][key]) || defaultVal;
    };

    const EditBtn = ({ field, style = {} }) => {
        const getLabel = () => {
            if (field === 'hero') return appLanguage === 'ar' ? 'تعديل العنوان' : 'Modifier En-tête';
            if (field === 'heroImage') return appLanguage === 'ar' ? 'تعديل الصورة' : 'Modifier Image';
            if (field === 'form') return appLanguage === 'ar' ? 'تعديل النموذج' : 'Modifier Formulaire';
            if (field === 'info') return appLanguage === 'ar' ? 'تعديل المعلومات' : 'Modifier Infos';
            return appLanguage === 'ar' ? 'تعديل' : 'Modifier';
        };

        return (
            isAdmin && (
                <button
                    onClick={() => { setIsEditingField(field); }}
                    className="edit-btn-minimal-lux"
                    style={{
                        ...style,
                        width: 'auto',
                        height: 'auto',
                        borderRadius: '12px',
                        padding: '10px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}
                >
                    <FaEdit size={14} />
                    <span>{getLabel()}</span>
                </button>
            )
        );
    };

    const t = translations[appLanguage] || translations.fr;
    const direction = appLanguage === 'ar' ? 'rtl' : 'ltr';

    // 🌟 حالات النموذج 🌟
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState(''); // حالة الرسالة ('success', 'error', 'loading', '')

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading'); // تعيين حالة التحميل

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nom: name,
                    email: email,
                    sujet: subject,
                    message: message,
                }),
            });

            if (!response.ok) throw new Error('Erreur lors de l\'envoi du message.');

            // إعادة تعيين الحقول وعرض رسالة النجاح
            setName('');
            setEmail('');
            setSubject('');
            setMessage('');
            setStatus('success');
        } catch (err) {
            console.error(err);
            setStatus('error');
        }

        // مسح حالة الرسالة بعد 6 ثوانٍ
        setTimeout(() => setStatus(''), 6000);
    };


    // 🎨 عرض رسالة التحميل (محدثة باللغات)
    const renderStatusMessage = () => {
        if (status === 'loading') {
            return (
                <div className="status-message loading" dir={direction}>
                    <FaPaperPlane /> {t.statusLoading}
                </div>
            );
        }
        if (status === 'success') {
            return (
                <div className="status-message success" dir={direction}>
                    <FaPaperPlane /> {t.statusSuccess}
                </div>
            );
        }
        if (status === 'error') {
            return (
                <div className="status-message error" dir={direction}>
                    {t.statusError}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="atelier-contact-page">
            <Navbar />

            {/* --- CINEMATIC HERO --- */}
            <header
                className="atelier-contact-hero"
                dir={direction}
                style={{
                    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.4)), url(${getT('heroImage', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2670&auto=format&fit=crop')})`
                }}
            >
                <div className="atelier-contact-hero-overlay"></div>

                <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                    <div className="atelier-contact-badge">
                        {appLanguage === 'ar' ? '2C Patron Studio' : '2C Patron Studio'}
                    </div>
                    <h1 className="atelier-contact-title">
                        {appLanguage === 'en' ? getT('headerAccent', t.headerAccent) : getT('headerTitle', t.headerTitle(''))}
                        <span> {appLanguage === 'en' ? getT('headerTitle', t.headerTitle('')) : getT('headerAccent', t.headerAccent)}</span>
                    </h1>
                    <div style={{ marginTop: '35px', display: 'flex', justifyContent: 'center', gap: '20px', position: 'relative', zIndex: 20, flexWrap: 'wrap' }}>
                        <EditBtn field="hero" />
                        <EditBtn field="heroImage" />
                    </div>
                </div>
            </header>

            {/* --- MAIN CONTENT GRID --- */}
            <main className="atelier-contact-grid" dir={direction}>

                {/* A. PREMIUM FORM BLOCK */}
                <div className="atelier-contact-card" style={{ position: 'relative' }}>
                    <EditBtn field="form" style={{ position: 'absolute', top: '20px', right: '20px' }} />
                    <div className="atelier-contact-form-header">
                        <h2>
                            {getT('formTitle', t.formTitle)}
                        </h2>
                        <p>Laissez-nous un mot, nous vous répondrons dans les plus brefs délais.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="atelier-contact-form">
                        <div className="atelier-contact-inputs-grid">
                            <div className="atelier-contact-field">
                                <label>{t.namePlaceholder}</label>
                                <div style={{ position: 'relative' }}>
                                    <FaUser className="atelier-contact-field-icon" />
                                    <input
                                        type="text"
                                        placeholder={t.namePlaceholder}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        disabled={status === 'loading'}
                                    />
                                </div>
                            </div>

                            <div className="atelier-contact-field">
                                <label>{t.emailPlaceholder}</label>
                                <div style={{ position: 'relative' }}>
                                    <FaEnvelope className="atelier-contact-field-icon" />
                                    <input
                                        type="email"
                                        placeholder={t.emailPlaceholder}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={status === 'loading'}
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="atelier-contact-field" style={{ marginTop: '25px' }}>
                            <label>{t.subjectPlaceholder}</label>
                            <div style={{ position: 'relative' }}>
                                <FaEdit className="atelier-contact-field-icon" />
                                <input
                                    type="text"
                                    placeholder={t.subjectPlaceholder}
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    required
                                    disabled={status === 'loading'}
                                />
                            </div>
                        </div>

                        <div className="atelier-contact-field" style={{ marginTop: '20px' }}>
                            <label>{t.messagePlaceholder}</label>
                            <textarea
                                placeholder={t.messagePlaceholder}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                                disabled={status === 'loading'}
                                rows="6"
                            ></textarea>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '30px' }}>
                            <button type="submit" className="atelier-contact-submit-btn" disabled={status === 'loading'}>
                                {status === 'loading' ? (
                                    <> {t.sending} <FaEdit className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> </>
                                ) : (
                                    <> {getT('submitBtn', t.submitBtn)} <FaPaperPlane /> </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* B. LUXURY INFO SIDEBAR */}
                <div className="atelier-contact-sidebar" style={{ position: 'relative' }}>
                    <EditBtn field="info" style={{ position: 'absolute', top: '0', right: '0' }} />

                    <div className="atelier-contact-info-card">
                        <div className="atelier-contact-info-icon"><FaMapMarkerAlt /></div>
                        <div className="atelier-contact-info-text">
                            <h4>{t.addressLabel}</h4>
                            <p>{getT('addressValue', t.addressValue)}</p>
                        </div>
                    </div>

                    <div className="atelier-contact-info-card">
                        <div className="atelier-contact-info-icon"><FaPhone /></div>
                        <div className="atelier-contact-info-text">
                            <h4>{t.phoneLabel}</h4>
                            <p dir="ltr">{getT('phoneValue', t.phoneValue)}</p>
                        </div>
                    </div>

                    <div className="atelier-contact-info-card">
                        <div className="atelier-contact-info-icon"><FaEnvelope /></div>
                        <div className="atelier-contact-info-text">
                            <h4>{t.emailLabel}</h4>
                            <p dir="ltr">{getT('emailValue', t.emailValue)}</p>
                        </div>
                    </div>

                    <div className="atelier-contact-info-card">
                        <div className="atelier-contact-info-icon"><FaClock /></div>
                        <div className="atelier-contact-info-text">
                            <h4>{t.hoursLabel}</h4>
                            <p>{getT('hoursValue', t.hoursValue)}</p>
                        </div>
                    </div>

                    <div className="atelier-contact-map">
                        <div className="atelier-contact-map-overlay">
                            <FaMapMarkerAlt className="pin-icon" />
                            <h3>Atelier Couture</h3>
                            <p>Vous êtes toujours les bienvenus dans notre espace de création.</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* --- STATUS TOAST NOTIFICATION --- */}
            {status && (
                <div className="atelier-contact-status-toast">
                    <div className={`atelier-contact-status-alert ${status} `}>
                        {status === 'loading' && <FaEdit className="spinner" style={{ animation: 'spin 1s linear infinite' }} />}
                        {status === 'success' && <FaPaperPlane />}
                        {status === 'error' && <FaTimes />}
                        <span>
                            {status === 'loading' ? t.statusLoading :
                                status === 'success' ? t.statusSuccess : t.statusError}
                        </span>
                    </div>
                </div>
            )}

            <Footer />

            {/* Admin Editing Modal (Unchanged) */}
            {isEditingField && (
                <div className="atelier-contact-modal-backdrop" onClick={() => setIsEditingField(null)}>
                    <div className="atelier-contact-modal-content large" onClick={(e) => e.stopPropagation()}>
                        <button className="atelier-contact-modal-close-icon" onClick={() => setIsEditingField(null)}><FaTimes /></button>
                        <h2 className="atelier-contact-modal-title">
                            Modifier: {
                                isEditingField === 'hero' ? 'En-tête (Hero)' :
                                    isEditingField === 'heroImage' ? 'Image de Fond (Hero)' :
                                        isEditingField === 'form' ? 'Formulaire & Bouton' :
                                            isEditingField === 'info' ? 'Coordonnées de Contact' :
                                                isEditingField
                            }
                        </h2>

                        <div className="atelier-contact-modal-form-grid">
                            {languages.filter(l => l.code === appLanguage).map(lang => (
                                <div key={lang.code} className="atelier-contact-modal-lang-section" style={{ border: 'none', background: 'none' }}>
                                    <h4 className="atelier-contact-modal-lang-indicator" style={{ background: '#d4af37' }}>{lang.label}</h4>

                                    {isEditingField === 'heroImage' && (
                                        <div className="atelier-contact-modal-field">
                                            <label>URL Image de Fond (Hero)</label>
                                            <input
                                                type="text"
                                                value={editContactContent[lang.code]?.heroImage || ''}
                                                onChange={e => setEditContactContent({ ...editContactContent, [lang.code]: { ...editContactContent[lang.code], heroImage: e.target.value } })}
                                                placeholder="https://..."
                                            />
                                        </div>
                                    )}

                                    {isEditingField === 'hero' && (
                                        <>
                                            <div className="atelier-contact-modal-field">
                                                <label>Titre Principal</label>
                                                <input
                                                    type="text"
                                                    value={editContactContent[lang.code]?.headerTitle || ''}
                                                    onChange={e => setEditContactContent({ ...editContactContent, [lang.code]: { ...editContactContent[lang.code], headerTitle: e.target.value } })}
                                                />
                                            </div>
                                            <div className="atelier-contact-modal-field">
                                                <label>Accent</label>
                                                <input
                                                    type="text"
                                                    value={editContactContent[lang.code]?.headerAccent || ''}
                                                    onChange={e => setEditContactContent({ ...editContactContent, [lang.code]: { ...editContactContent[lang.code], headerAccent: e.target.value } })}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {isEditingField === 'form' && (
                                        <>
                                            <div className="atelier-contact-modal-field">
                                                <label>Titre du Formulaire</label>
                                                <input
                                                    type="text"
                                                    value={editContactContent[lang.code]?.formTitle || ''}
                                                    onChange={e => setEditContactContent({ ...editContactContent, [lang.code]: { ...editContactContent[lang.code], formTitle: e.target.value } })}
                                                />
                                            </div>
                                            <div className="atelier-contact-modal-field">
                                                <label>Texte du Bouton</label>
                                                <input
                                                    type="text"
                                                    value={editContactContent[lang.code]?.submitBtn || ''}
                                                    onChange={e => setEditContactContent({ ...editContactContent, [lang.code]: { ...editContactContent[lang.code], submitBtn: e.target.value } })}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {isEditingField === 'info' && (
                                        <>
                                            <div className="atelier-contact-modal-field">
                                                <label>Adresse</label>
                                                <input
                                                    type="text"
                                                    value={editContactContent[lang.code]?.addressValue || ''}
                                                    onChange={e => setEditContactContent({ ...editContactContent, [lang.code]: { ...editContactContent[lang.code], addressValue: e.target.value } })}
                                                />
                                            </div>
                                            <div className="atelier-contact-modal-field">
                                                <label>Téléphone</label>
                                                <input
                                                    type="text"
                                                    value={editContactContent[lang.code]?.phoneValue || ''}
                                                    onChange={e => setEditContactContent({ ...editContactContent, [lang.code]: { ...editContactContent[lang.code], phoneValue: e.target.value } })}
                                                />
                                            </div>
                                            <div className="atelier-contact-modal-field">
                                                <label>E-mail</label>
                                                <input
                                                    type="text"
                                                    value={editContactContent[lang.code]?.emailValue || ''}
                                                    onChange={e => setEditContactContent({ ...editContactContent, [lang.code]: { ...editContactContent[lang.code], emailValue: e.target.value } })}
                                                />
                                            </div>
                                            <div className="atelier-contact-modal-field">
                                                <label>Heures d'Ouverture</label>
                                                <input
                                                    type="text"
                                                    value={editContactContent[lang.code]?.hoursValue || ''}
                                                    onChange={e => setEditContactContent({ ...editContactContent, [lang.code]: { ...editContactContent[lang.code], hoursValue: e.target.value } })}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="atelier-contact-modal-btn-group">
                            <button className="atelier-contact-modal-btn secondary" onClick={() => setIsEditingField(null)}>
                                Annuler
                            </button>
                            <button className="atelier-contact-modal-btn gold" onClick={handleSaveContactContent}>
                                <FaSave /> Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}