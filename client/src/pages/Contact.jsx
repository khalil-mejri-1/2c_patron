import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaUser, FaEnvelope, FaPhone, FaClock, FaPaperPlane, FaChevronRight } from 'react-icons/fa';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';

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

const API_ENDPOINT = 'http://localhost:3000/api/messages';

export default function Contact() {
    const [appLanguage, setAppLanguage] = useState('fr');
    
    // 1. ⚙️ جلب اللغة من LocalStorage
    useEffect(() => {
        const lang = localStorage.getItem('appLanguage') || 'fr';
        setAppLanguage(lang);
    }, []);

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
                        {t.headerTitle(<span className="contact-accent-text">{t.headerAccent}</span>)}
                    </h1>
                    <p className="contact-sub-text">
                        {t.headerSubtitle}
                    </p>
                </div>

                {/* 2. حاوية المحتوى الرئيسية (النموذج والمعلومات) */}
                <div className="contact-content-wrapper">

                    {/* A. نموذج الاتصال (محدث باللغات) */}
                    <div className="contact-form-block">
                        <h2 className="form-title">{t.formTitle}</h2>

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

                            <button type="submit" className="contact-submit-btn" disabled={status === 'loading'}>
                                {status === 'loading' ? t.sending : t.submitBtn} <FaChevronRight />
                            </button>
                        </form>
                    </div>

                    {/* B. معلومات الاتصال الجانبية (محدثة باللغات) */}
                    <div className="contact-info-block">
                        <h2 className="info-title">{t.infoTitle}</h2>

                        <div className="contact-detail">
                            <FaMapMarkerAlt className="detail-icon" />
                            <div>
                                <h4>{t.addressLabel}</h4>
                                <p dir="ltr">{t.addressValue}</p>
                            </div>
                        </div>

                        <div className="contact-detail">
                            <FaPhone className="detail-icon" />
                            <div>
                                <h4>{t.phoneLabel}</h4>
                                <p dir="ltr">{t.phoneValue}</p>
                            </div>
                        </div>

                        <div className="contact-detail">
                            <FaEnvelope className="detail-icon" />
                            <div>
                                <h4>{t.emailLabel}</h4>
                                <p dir="ltr">{t.emailValue}</p>
                            </div>
                        </div>

                        <div className="contact-detail">
                            <FaClock className="detail-icon" />
                            <div>
                                <h4>{t.hoursLabel}</h4>
                                <p dir="ltr">{t.hoursValue}</p>
                            </div>
                        </div>

                        {/* تضمين خريطة وهمية */}
                        <div className="map-placeholder">
                            
                        </div>
                    </div>

                </div>
            </section>
            <Footer />
        </>
    );
}