import React, { useState, useEffect } from 'react';
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
        headerSubtitle: "نحن هنا للإجابة على جميع أسئلتكم المتعلقة بدوراتنا، باتروناتنا، وخدماتنا.",

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
        headerSubtitle: "Nous sommes là pour répondre à toutes vos questions concernant nos cours, patrons et services.",

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
        headerSubtitle: "We are here to answer all your questions about our courses, patterns, and services.",

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

const API_ENDPOINT = `${BASE_URL}/api/messages`;

export default function Contact() {
    const { appLanguage, languages } = useLanguage();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isEditingField, setIsEditingField] = useState(null);
    const [contactContent, setContactContent] = useState({
        fr: { headerTitle: '', headerAccent: '', headerSubtitle: '', formTitle: '', infoTitle: '', addressValue: '', phoneValue: '', emailValue: '', hoursValue: '', submitBtn: '' },
        ar: { headerTitle: '', headerAccent: '', headerSubtitle: '', formTitle: '', infoTitle: '', addressValue: '', phoneValue: '', emailValue: '', hoursValue: '', submitBtn: '' },
        en: { headerTitle: '', headerAccent: '', headerSubtitle: '', formTitle: '', infoTitle: '', addressValue: '', phoneValue: '', emailValue: '', hoursValue: '', submitBtn: '' }
    });
    const [editContactContent, setEditContactContent] = useState({
        fr: { headerTitle: '', headerAccent: '', headerSubtitle: '', formTitle: '', infoTitle: '', addressValue: '', phoneValue: '', emailValue: '', hoursValue: '', submitBtn: '' },
        ar: { headerTitle: '', headerAccent: '', headerSubtitle: '', formTitle: '', infoTitle: '', addressValue: '', phoneValue: '', emailValue: '', hoursValue: '', submitBtn: '' },
        en: { headerTitle: '', headerAccent: '', headerSubtitle: '', formTitle: '', infoTitle: '', addressValue: '', phoneValue: '', emailValue: '', hoursValue: '', submitBtn: '' }
    });

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
            .then(data => data && setContactContent(data))
            .catch(() => { });
    }, []);

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

    // 🔧 دالة مساعدة لتهيئة جميع اللغات المتاحة
    const initializeAllLanguages = (currentValues) => {
        const initialized = {};
        languages.forEach(lang => {
            initialized[lang.code] = currentValues[lang.code] || {
                headerTitle: '', headerAccent: '', headerSubtitle: '', formTitle: '', infoTitle: '',
                addressValue: '', phoneValue: '', emailValue: '', hoursValue: '', submitBtn: ''
            };
        });
        return initialized;
    };

    const getT = (key, defaultVal) => {
        return (contactContent[appLanguage] && contactContent[appLanguage][key]) || defaultVal;
    };

    const EditBtn = ({ field }) => (
        isAdmin && (
            <button
                onClick={() => { setEditContactContent(initializeAllLanguages(contactContent)); setIsEditingField(field); }}
                className="edit-btn-minimal"
                title="Modifier"
                style={{
                    background: 'rgba(212, 175, 55, 0.1)',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    color: '#D4AF37',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    verticalAlign: 'middle'
                }}
            >
                <FaEdit size={14} />
            </button>
        )
    );

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
        <>
            <Navbar />
            <section className="contact-section" dir={direction}>

                {/* 1. رأس الصفحة (محدث باللغات) */}
                <div className="contact-header">
                    <h1 className="contact-main-title">
                        {getT('headerTitle', t.headerTitle(''))} <span className="contact-accent-text">{getT('headerAccent', t.headerAccent)}</span>
                        <EditBtn field="headerTitle" />
                    </h1>
                    <p className="contact-sub-text">
                        {getT('headerSubtitle', t.headerSubtitle)}
                        <EditBtn field="headerSubtitle" />
                    </p>
                </div>

                {/* 2. حاوية المحتوى الرئيسية (النموذج والمعلومات) */}
                <div className="contact-content-wrapper">

                    {/* A. نموذج الاتصال (محدث باللغات) */}
                    <div className="contact-form-block">
                        <h2 className="form-title">
                            {getT('formTitle', t.formTitle)}
                            <EditBtn field="formTitle" />
                        </h2>

                        {/* رسالة الحالة المُحدثة */}
                        {renderStatusMessage()}

                        <form onSubmit={handleSubmit} className="contact-form">

                            <div className="input-group">
                                <FaUser className="input-icon" />
                                <input
                                    type="text"
                                    placeholder={t.namePlaceholder}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    disabled={status === 'loading'}
                                    dir={direction}
                                />
                            </div>

                            <div className="input-group">
                                <FaEnvelope className="input-icon" />
                                <input
                                    type="email"
                                    placeholder={t.emailPlaceholder}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={status === 'loading'}
                                    dir="ltr" // البريد الإلكتروني يبقى لغة لاتينية
                                />
                            </div>

                            <div className="input-group">
                                <input
                                    type="text"
                                    placeholder={t.subjectPlaceholder}
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    required
                                    disabled={status === 'loading'}
                                    dir={direction}
                                />
                            </div>

                            <div className="input-group">
                                <textarea
                                    placeholder={t.messagePlaceholder}
                                    rows="6"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                    disabled={status === 'loading'}
                                    dir={direction}
                                ></textarea>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <button type="submit" className="contact-submit-btn" disabled={status === 'loading'} style={{ flex: 1 }}>
                                    {status === 'loading' ? t.sending : getT('submitBtn', t.submitBtn)} <FaChevronRight />
                                </button>
                                <EditBtn field="submitBtn" />
                            </div>
                        </form>
                    </div>

                    {/* B. معلومات الاتصال الجانبية (محدثة باللغات) */}
                    <div className="contact-info-block">
                        <h2 className="info-title">
                            {getT('infoTitle', t.infoTitle)}
                            <EditBtn field="infoTitle" />
                        </h2>

                        <div className="contact-detail">
                            <FaMapMarkerAlt className="detail-icon" />
                            <div>
                                <h4>{t.addressLabel}</h4>
                                <p dir="ltr">
                                    {getT('addressValue', t.addressValue)}
                                    <EditBtn field="addressValue" />
                                </p>
                            </div>
                        </div>

                        <div className="contact-detail">
                            <FaPhone className="detail-icon" />
                            <div>
                                <h4>{t.phoneLabel}</h4>
                                <p dir="ltr">
                                    {getT('phoneValue', t.phoneValue)}
                                    <EditBtn field="phoneValue" />
                                </p>
                            </div>
                        </div>

                        <div className="contact-detail">
                            <FaEnvelope className="detail-icon" />
                            <div>
                                <h4>{t.emailLabel}</h4>
                                <p dir="ltr">
                                    {getT('emailValue', t.emailValue)}
                                    <EditBtn field="emailValue" />
                                </p>
                            </div>
                        </div>

                        <div className="contact-detail">
                            <FaClock className="detail-icon" />
                            <div>
                                <h4>{t.hoursLabel}</h4>
                                <p dir="ltr">
                                    {getT('hoursValue', t.hoursValue)}
                                    <EditBtn field="hoursValue" />
                                </p>
                            </div>
                        </div>

                        {/* تضمين خريطة وهمية */}
                        <div className="map-placeholder">

                        </div>
                    </div>

                </div>

                {/* 🛑 Admin Editing Modal */}
                {isEditingField && (
                    <div className="modal-overlay" style={{ zIndex: 2000 }}>
                        <div className="modal-content" style={{
                            background: '#fff', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '600px',
                            maxHeight: '80vh', overflowY: 'auto'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0 }}>Modifier: {isEditingField}</h3>
                                <button onClick={() => setIsEditingField(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><FaTimes size={20} /></button>
                            </div>

                            {languages.map(lang => (
                                <div key={lang.code} style={{ marginBottom: '25px', padding: '15px', border: '1px solid #eee', borderRadius: '10px' }}>
                                    <h4 style={{ marginBottom: '10px', textTransform: 'uppercase', color: '#D4AF37' }}>
                                        {lang.label}
                                    </h4>

                                    {isEditingField === 'headerTitle' && (
                                        <>
                                            <div style={{ marginBottom: '10px' }}>
                                                <label style={{ display: 'block', fontSize: '12px', color: '#888' }}>Titre Principal</label>
                                                <input
                                                    type="text"
                                                    value={editContactContent[lang.code]?.headerTitle || ''}
                                                    onChange={e => setEditContactContent({ ...editContactContent, [lang.code]: { ...editContactContent[lang.code], headerTitle: e.target.value } })}
                                                    style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                                                />
                                            </div>
                                            <div style={{ marginBottom: '10px' }}>
                                                <label style={{ display: 'block', fontSize: '12px', color: '#888' }}>Accent</label>
                                                <input
                                                    type="text"
                                                    value={editContactContent[lang.code]?.headerAccent || ''}
                                                    onChange={e => setEditContactContent({ ...editContactContent, [lang.code]: { ...editContactContent[lang.code], headerAccent: e.target.value } })}
                                                    style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {isEditingField === 'headerSubtitle' && (
                                        <textarea
                                            value={editContactContent[lang.code]?.headerSubtitle || ''}
                                            onChange={e => setEditContactContent({ ...editContactContent, [lang.code]: { ...editContactContent[lang.code], headerSubtitle: e.target.value } })}
                                            style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd', minHeight: '80px' }}
                                        />
                                    )}

                                    {isEditingField === 'formTitle' && (
                                        <input
                                            type="text"
                                            value={editContactContent[lang.code]?.formTitle || ''}
                                            onChange={e => setEditContactContent({ ...editContactContent, [lang.code]: { ...editContactContent[lang.code], formTitle: e.target.value } })}
                                            style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                                        />
                                    )}

                                    {isEditingField === 'infoTitle' && (
                                        <input
                                            type="text"
                                            value={editContactContent[lang.code]?.infoTitle || ''}
                                            onChange={e => setEditContactContent({ ...editContactContent, [lang.code]: { ...editContactContent[lang.code], infoTitle: e.target.value } })}
                                            style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                                        />
                                    )}

                                    {isEditingField === 'addressValue' && (
                                        <input
                                            type="text"
                                            value={editContactContent[lang]?.addressValue || ''}
                                            onChange={e => setEditContactContent({ ...editContactContent, [lang]: { ...editContactContent[lang], addressValue: e.target.value } })}
                                            style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                                        />
                                    )}

                                    {isEditingField === 'phoneValue' && (
                                        <input
                                            type="text"
                                            value={editContactContent[lang.code]?.officeLabel || ''}
                                            onChange={e => setEditContactContent({ ...editContactContent, [lang.code]: { ...editContactContent[lang.code], officeLabel: e.target.value } })}
                                            style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                                        />
                                    )}

                                    {isEditingField === 'emailValue' && (
                                        <input
                                            type="text"
                                            value={editContactContent[lang.code]?.emailLabel || ''}
                                            onChange={e => setEditContactContent({ ...editContactContent, [lang.code]: { ...editContactContent[lang.code], emailLabel: e.target.value } })}
                                            style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                                        />
                                    )}

                                    {isEditingField === 'hoursValue' && (
                                        <input
                                            type="text"
                                            value={editContactContent[lang.code]?.infoSubtitle || ''}
                                            onChange={e => setEditContactContent({ ...editContactContent, [lang.code]: { ...editContactContent[lang.code], infoSubtitle: e.target.value } })}
                                            style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                                        />
                                    )}

                                    {isEditingField === 'submitBtn' && (
                                        <input
                                            type="text"
                                            value={editContactContent[lang.code]?.submitBtn || ''}
                                            onChange={e => setEditContactContent({ ...editContactContent, [lang.code]: { ...editContactContent[lang.code], submitBtn: e.target.value } })}
                                            style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                                        />
                                    )}
                                </div>
                            ))}

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button
                                    onClick={handleSaveContactContent}
                                    style={{ flex: 1, padding: '12px', background: '#D4AF37', color: '#fff', border: 'none', borderRadius: '50px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                >
                                    <FaSave /> Enregistrer
                                </button>
                                <button
                                    onClick={() => setIsEditingField(null)}
                                    style={{ padding: '12px 25px', background: '#f5f5f5', color: '#333', border: 'none', borderRadius: '50px', fontWeight: 'bold' }}
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </section>
            <Footer />
        </>
    );
}