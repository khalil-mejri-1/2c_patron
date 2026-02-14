import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FaHeart, FaHandsHelping, FaLightbulb, FaTools, FaEdit, FaSave, FaTimes } from 'react-icons/fa'; // أيقونات للقيم
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import { Link } from 'react-router-dom';
import BASE_URL from '../apiConfig';

// 🌐 كائن الترجمة
const translations = {
    ar: {
        heroTitle: () => `فن الخياطة  `,
        heroAccent: "شغفنا",
        heroTagline: "أن نكون الورشة المرجعية لإتقان الباترون والمولاج في شمال إفريقيا وخارجها.",

        storyTitle: "قصتنا: ورشة كوتور",
        storyPara1: "تأسست ورشتنا في عام 2015 على يد خياطة ماهرة شغوفة، وولدت من ملاحظة بسيطة: صعوبة العثور على تدريب عبر الإنترنت يجمع بين دقة الخياطة الراقية الفرنسية وإمكانية الوصول المحلية. ومنذ ذلك الحين، قمنا بتوجيه الآلاف من الطلاب، من المبتدئين إلى المحترفين، من خلال دروس فيديو حصرية وباترونات معتمدة.",
        storyPara2: "نحن نؤمن بأن الإتقان الحقيقي لا يتحقق بالسرعة، بل بالتكرار والصبر والتميز في الأدوات. مهمتنا هي نشر أسرار الحرفية الفاخرة للجميع.",
        contactBtn: "مقابلة الفريق",

        valuesTitle: "قيمنا الأساسية",
        values: [
            {
                icon: FaHeart,
                title: "الشغف والتميز",
                description: "نشارك حبنا غير المشروط للخياطة، ونسعى دائمًا لأعلى مستويات الجودة في تدريباتنا ومنتجاتنا."
            },
            {
                icon: FaLightbulb,
                title: "الابتكار والإبداع",
                description: "نحن نشجع التجريب واعتماد التقنيات الحديثة مع احترام تقاليد الحرف اليدوية."
            },
            {
                icon: FaHandsHelping,
                title: "الدعم المجتمعي",
                description: "نبني مجتمعًا متماسكًا حيث المساعدة المتبادلة وتبادل المعرفة هما جوهر عملية التعلم."
            },
            {
                icon: FaTools,
                title: "الإتقان التقني",
                description: "تم تصميم كل دورة لتزويدك بالمهارات العملية والدقيقة اللازمة لتصبح حرفيًا ماهرًا."
            }
        ]
    },
    fr: {
        heroTitle: () => `L'Art de la Couture`,
        heroAccent: "Passion",
        heroTagline: "Devenir l'atelier de référence pour la maîtrise du patronage et du moulage en Afrique du Nord et au-delà.",

        storyTitle: "Notre Histoire : L'Atelier Couture",
        storyPara1: "Fondé en 2015 par une maître tailleur passionnée, notre atelier est né d'une simple observation : la difficulté à trouver des formations en ligne qui allient la précision de la haute couture française et l'accessibilité locale. Depuis, nous avons guidé des milliers d'étudiants, des débutants aux professionnels, à travers des leçons vidéo exclusives et des patrons certifiés.",
        storyPara2: "Nous croyons que la véritable maîtrise ne s'acquiert pas par la vitesse, mais par la répétition, la patience et l'excellence des outils. Notre mission est de démocratiser les secrets de l'artisanat de luxe.",
        contactBtn: "Rencontrer l'équipe",

        valuesTitle: "Nos Valeurs Fondamentales",
        values: [
            {
                icon: FaHeart,
                title: "Passion et Excellence",
                description: "Nous partageons notre amour inconditionnel pour la couture, visant toujours la plus haute qualité dans nos formations et produits."
            },
            {
                icon: FaLightbulb,
                title: "Innovation et Créativité",
                description: "Nous encourageons l'expérimentation et l'adoption de techniques modernes tout en respectant les traditions de l'artisanat."
            },
            {
                icon: FaHandsHelping,
                title: "Soutien Communautaire",
                description: "Nous construisons une communauté soudée où l'entraide et le partage de connaissances sont au cœur de l'apprentissage."
            },
            {
                icon: FaTools,
                title: "Maîtrise Technique",
                description: "Chaque cours est conçu pour vous doter des compétences pratiques et précises nécessaires pour devenir un maître artisan."
            }
        ]
    },
    en: {
        heroTitle: () => `The Art of Sewing`,
        heroAccent: "Passion",
        heroTagline: "To become the reference workshop for mastering pattern-making and draping in North Africa and beyond.",

        storyTitle: "Our Story: The Couture Workshop",
        storyPara1: "Founded in 2015 by a passionate master tailor, our workshop was born from a simple observation: the difficulty in finding online training that combines the precision of French haute couture with local accessibility. Since then, we have guided thousands of students, from beginners to professionals, through exclusive video lessons and certified patterns.",
        storyPara2: "We believe that true mastery is achieved not through speed, but through repetition, patience, and excellence of tools. Our mission is to democratize the secrets of luxury craftsmanship.",
        contactBtn: "Meet the Team",

        valuesTitle: "Our Core Values",
        values: [
            {
                icon: FaHeart,
                title: "Passion and Excellence",
                description: "We share our unconditional love for sewing, always aiming for the highest quality in our training and products."
            },
            {
                icon: FaLightbulb,
                title: "Innovation and Creativity",
                description: "We encourage experimentation and the adoption of modern techniques while respecting the traditions of craftsmanship."
            },
            {
                icon: FaHandsHelping,
                title: "Community Support",
                description: "We build a close-knit community where mutual aid and knowledge sharing are at the heart of learning."
            },
            {
                icon: FaTools,
                title: "Technical Mastery",
                description: "Every course is designed to equip you with the practical and precise skills needed to become a master artisan."
            }
        ]
    }
};


export default function About() {
    const { appLanguage, languages } = useLanguage();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isEditingField, setIsEditingField] = useState(null);
    const [aboutContent, setAboutContent] = useState({
        fr: { heroTitle: '', heroAccent: '', heroTagline: '', storyTitle: '', storyPara1: '', storyPara2: '', contactBtn: '', valuesTitle: '', vt1: '', vd1: '', vt2: '', vd2: '', vt3: '', vd3: '', vt4: '', vd4: '' },
        ar: { heroTitle: '', heroAccent: '', heroTagline: '', storyTitle: '', storyPara1: '', storyPara2: '', contactBtn: '', valuesTitle: '', vt1: '', vd1: '', vt2: '', vd2: '', vt3: '', vd3: '', vt4: '', vd4: '' },
        en: { heroTitle: '', heroAccent: '', heroTagline: '', storyTitle: '', storyPara1: '', storyPara2: '', contactBtn: '', valuesTitle: '', vt1: '', vd1: '', vt2: '', vd2: '', vt3: '', vd3: '', vt4: '', vd4: '' }
    });
    const [editAboutContent, setEditAboutContent] = useState({
        fr: { heroTitle: '', heroAccent: '', heroTagline: '', storyTitle: '', storyPara1: '', storyPara2: '', contactBtn: '', valuesTitle: '', vt1: '', vd1: '', vt2: '', vd2: '', vt3: '', vd3: '', vt4: '', vd4: '' },
        ar: { heroTitle: '', heroAccent: '', heroTagline: '', storyTitle: '', storyPara1: '', storyPara2: '', contactBtn: '', valuesTitle: '', vt1: '', vd1: '', vt2: '', vd2: '', vt3: '', vd3: '', vt4: '', vd4: '' },
        en: { heroTitle: '', heroAccent: '', heroTagline: '', storyTitle: '', storyPara1: '', storyPara2: '', contactBtn: '', valuesTitle: '', vt1: '', vd1: '', vt2: '', vd2: '', vt3: '', vd3: '', vt4: '', vd4: '' }
    });

    // 1. ⚙️ جلب التحقق من المسؤول
    useEffect(() => {

        // Check Admin
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const email = localStorage.getItem('currentUserEmail') || localStorage.getItem('loggedInUserEmail');
        const currentUser = users.find(u => u.email === email);
        if (currentUser?.statut === 'admin') setIsAdmin(true);

        // Load Content
        fetch(`${BASE_URL}/api/settings/about-content`)
            .then(res => res.ok ? res.json() : null)
            .then(data => data && setAboutContent(data))
            .catch(() => { });
    }, []);

    const handleSaveAboutContent = async () => {
        setAboutContent(editAboutContent);
        setIsEditingField(null);
        try {
            await fetch(`${BASE_URL}/api/settings/about-content`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: editAboutContent })
            });
        } catch (err) { }
    };

    // 🔧 دالة مساعدة لتهيئة جميع اللغات المتاحة
    const initializeAllLanguages = (currentValues) => {
        const initialized = {};
        languages.forEach(lang => {
            initialized[lang.code] = currentValues[lang.code] || {
                heroTitle: '', heroAccent: '', heroTagline: '', storyTitle: '', storyPara1: '', storyPara2: '',
                contactBtn: '', valuesTitle: '', vt1: '', vd1: '', vt2: '', vd2: '', vt3: '', vd3: '', vt4: '', vd4: ''
            };
        });
        return initialized;
    };

    const getT = (key, defaultVal) => {
        return (aboutContent[appLanguage] && aboutContent[appLanguage][key]) || defaultVal;
    };

    const EditBtn = ({ field }) => (
        isAdmin && (
            <button
                onClick={() => { setEditAboutContent(initializeAllLanguages(aboutContent)); setIsEditingField(field); }}
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
    const accentText = <span className="about-accent">{getT('heroAccent', t.heroAccent)}</span>;

    return (
        <>
            <Navbar />
            <div className="simple-about-page" dir={direction}>

                {/* 1. Hero Section - Clean & Centered */}
                <header className="simple-hero">
                    <div className="container">
                        <h1 className="simple-hero-title">
                            {getT('heroTitle', t.heroTitle(''))} {accentText}
                            <EditBtn field="title" />
                        </h1>
                        <p className="simple-hero-subtitle">
                            {getT('heroTagline', t.heroTagline)}
                            <EditBtn field="heroTagline" />
                        </p>
                    </div>
                </header>

                {/* 2. Story Section - Standard Two Column */}
                <section className="simple-story-section">
                    <div className="container story-grid">
                        <div className="story-image-wrapper">
                            <img
                                src="https://images.unsplash.com/photo-1537832816519-689ad163238b?q=80&w=2559&auto=format&fit=crop"
                                alt="Atelier Interior"
                                className="story-img"
                            />
                        </div>
                        <div className="story-text-wrapper">
                            <h2 className="section-title">
                                {getT('storyTitle', t.storyTitle)}
                                <EditBtn field="storyTitle" />
                            </h2>
                            <div className="story-divider"></div>
                            <p className="story-text">
                                {getT('storyPara1', t.storyPara1)}
                                <EditBtn field="storyPara1" />
                            </p>
                            <p className="story-text">
                                {getT('storyPara2', t.storyPara2)}
                                <EditBtn field="storyPara2" />
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Link to="/contact" className="simple-btn">
                                    {getT('contactBtn', t.contactBtn)}
                                </Link>
                                <EditBtn field="contactBtn" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Values Section - Uniform Grid */}
                <section className="simple-values-section">
                    <div className="container">
                        <h2 className="section-title center-text">
                            {getT('valuesTitle', t.valuesTitle)}
                            <EditBtn field="valuesTitle" />
                        </h2>
                        <div className="values-grid-simple">
                            {t.values.map((value, index) => (
                                <div key={index} className="simple-value-card">
                                    <div className="icon-wrapper">
                                        <value.icon />
                                    </div>
                                    <h3 className="value-title">
                                        {getT(`vt${index + 1}`, value.title)}
                                        <EditBtn field={`vt${index + 1}`} />
                                    </h3>
                                    <p className="value-desc">
                                        {getT(`vd${index + 1}`, value.description)}
                                        <EditBtn field={`vd${index + 1}`} />
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

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

                                    {isEditingField === 'title' && (
                                        <>
                                            <div style={{ marginBottom: '10px' }}>
                                                <label style={{ display: 'block', fontSize: '12px', color: '#888' }}>Titre Principal</label>
                                                <input
                                                    type="text"
                                                    value={editAboutContent[lang.code]?.heroTitle || ''}
                                                    onChange={e => setEditAboutContent({ ...editAboutContent, [lang.code]: { ...editAboutContent[lang.code], heroTitle: e.target.value } })}
                                                    style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                                                />
                                            </div>
                                            <div style={{ marginBottom: '10px' }}>
                                                <label style={{ display: 'block', fontSize: '12px', color: '#888' }}>Accent (Or)</label>
                                                <input
                                                    type="text"
                                                    value={editAboutContent[lang.code]?.heroAccent || ''}
                                                    onChange={e => setEditAboutContent({ ...editAboutContent, [lang.code]: { ...editAboutContent[lang.code], heroAccent: e.target.value } })}
                                                    style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {isEditingField === 'heroTagline' && (
                                        <textarea
                                            value={editAboutContent[lang.code]?.heroTagline || ''}
                                            onChange={e => setEditAboutContent({ ...editAboutContent, [lang.code]: { ...editAboutContent[lang.code], heroTagline: e.target.value } })}
                                            style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd', minHeight: '80px' }}
                                        />
                                    )}

                                    {isEditingField === 'storyTitle' && (
                                        <input
                                            type="text"
                                            value={editAboutContent[lang.code]?.storyTitle || ''}
                                            onChange={e => setEditAboutContent({ ...editAboutContent, [lang.code]: { ...editAboutContent[lang.code], storyTitle: e.target.value } })}
                                            style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                                        />
                                    )}

                                    {isEditingField === 'storyPara1' && (
                                        <textarea
                                            value={editAboutContent[lang.code]?.storyPara1 || ''}
                                            onChange={e => setEditAboutContent({ ...editAboutContent, [lang.code]: { ...editAboutContent[lang.code], storyPara1: e.target.value } })}
                                            style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd', minHeight: '100px' }}
                                        />
                                    )}

                                    {isEditingField === 'storyPara2' && (
                                        <textarea
                                            value={editAboutContent[lang.code]?.storyPara2 || ''}
                                            onChange={e => setEditAboutContent({ ...editAboutContent, [lang.code]: { ...editAboutContent[lang.code], storyPara2: e.target.value } })}
                                            style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd', minHeight: '100px' }}
                                        />
                                    )}

                                    {isEditingField === 'contactBtn' && (
                                        <input
                                            type="text"
                                            value={editAboutContent[lang.code]?.contactBtn || ''}
                                            onChange={e => setEditAboutContent({ ...editAboutContent, [lang.code]: { ...editAboutContent[lang.code], contactBtn: e.target.value } })}
                                            style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                                        />
                                    )}

                                    {isEditingField === 'valuesTitle' && (
                                        <input
                                            type="text"
                                            value={editAboutContent[lang.code]?.valuesTitle || ''}
                                            onChange={e => setEditAboutContent({ ...editAboutContent, [lang.code]: { ...editAboutContent[lang.code], valuesTitle: e.target.value } })}
                                            style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                                        />
                                    )}

                                    {isEditingField.startsWith('vt') && (
                                        <input
                                            type="text"
                                            value={editAboutContent[lang]?.[isEditingField] || ''}
                                            onChange={e => setEditAboutContent({ ...editAboutContent, [lang]: { ...editAboutContent[lang], [isEditingField]: e.target.value } })}
                                            style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                                        />
                                    )}

                                    {isEditingField.startsWith('vd') && (
                                        <textarea
                                            value={editAboutContent[lang]?.[isEditingField] || ''}
                                            onChange={e => setEditAboutContent({ ...editAboutContent, [lang]: { ...editAboutContent[lang], [isEditingField]: e.target.value } })}
                                            style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd', minHeight: '80px' }}
                                        />
                                    )}
                                </div>
                            ))}

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button
                                    onClick={handleSaveAboutContent}
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

            </div>
            <Footer />
        </>
    );
}