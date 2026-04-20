import React, { useState, useEffect, useRef } from 'react';
import { FaPlayCircle, FaCheckCircle, FaSpinner, FaCertificate, FaTimes, FaChevronRight, FaEdit, FaPlus, FaTrash, FaUpload, FaLock, FaUnlock, FaUser, FaPhoneAlt, FaCrown } from 'react-icons/fa';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../apiConfig';
import { useAlert } from '../context/AlertContext';
import { useLanguage } from '../context/LanguageContext';
import './vip_premium.css';

// Clé de localStorage pour mémoriser l'état
const CERTIF_MODAL_KEY = 'hasSeenVipCertifModal';

// 🌐 كائن الترجمة
const translations = {
    ar: {
        badge: "دخول حصري",
        title: "الوصول لـ",
        accent: "الورشة الماستر VIP",
        loading: "جاري تحميل المجموعات المتميزة...",
        error: "فشل في تحميل البيانات. الرجاء المحاولة لاحقًا.",
        button: "ابدأ الآن",
        modalTitle: "تهانينا!",
        modalText: (certif) => `بعد إكمال هذا التدريب بنجاح، ستحصل على **شهادة معتمدة** ${certif ? ' VIP' : ''} تعزز مسيرتك المهنية.`,
        modalSmallText: "لمزيد من التفاصيل، يرجى الاتصال بالدعم الفني عبر واتساب:",
        modalBtn: "فهمت، شكراً",
        whatsappNum: "26 123 456",
        courseTag: "دورة VIP",
        durationLabel: "مدة العرض",
        addCategory: "إضافة ورشة جديدة",
        editCategory: "تعديل الورشة",
        deleteConfirm: "هل أنت متأكد من حذف هذه الورشة؟",
        categoryTitle: "عنوان الورشة",
        categoryDesc: "وصف الورشة",
        categoryImg: "رابط الصورة",
        categoryDuration: "المدة (مثلاً: Access 24/7)",
        save: "حفظ",
        cancel: "إلغاء",
        adminActions: "إدارة المحتوى",
        breadcrumbHome: "الرئيسية",
        breadcrumbShop: "الباتيرنات / المتجر",
        breadcrumbCurrent: "دخول VIP",
        limitedAccess: "دخول محدود",
        vipMessage: "دخول 'Master Atelier (VIP)' هو تجربة حصرية مخصصة لأعضائنا المميزين.",
        vipBenefits: "✦ اكتشف الباترونات السرية والدروس المتقدمة",
        later: "لاحقاً",
        requestSentTitle: "تم استلام طلبك!",
        requestSentMsg: "سنقوم بمراجعة طلبك والاتصال بك في أقرب وقت ممكن. شكراً لاهتمامك!"
    },
    fr: {
        badge: "ACCÈS EXCLUSIF",
        title: "ACCÈS",
        accent: "MASTER ATELIER VIP",
        loading: "Chargement des collections premium...",
        error: "Échec du chargement. Veuillez réessayer plus tard.",
        button: "Commencer",
        modalTitle: "Félicitations !",
        modalText: (certif) => `Après avoir terminé cette formation, vous obtiendrez un **Certificat Agréé** ${certif ? ' VIP' : ''} pour valoriser vos compétences.`,
        modalSmallText: "Pour plus de détails, contactez l’administrateur sur WhatsApp :",
        modalBtn: "J'ai Compris",
        whatsappNum: "26 123 456",
        courseTag: "COURS VIP",
        durationLabel: "Durée",
        addCategory: "Ajouter une Catégorie VIP",
        editCategory: "Modifier la Catégorie",
        deleteConfirm: "Voulez-vous vraiment supprimer cette catégorie ?",
        categoryTitle: "Titre de la catégorie",
        categoryDesc: "Description",
        categoryImg: "Lien de l'image (URL)",
        categoryDuration: "Durée (ex: Access 24/7)",
        save: "Enregistrer",
        cancel: "Annuler",
        adminActions: "Gestion VIP",
        breadcrumbHome: "Accueil",
        breadcrumbShop: "Boutique",
        breadcrumbCurrent: "Accès VIP",
        limitedAccess: "Accès Limité",
        vipMessage: "L'accès 'Master Atelier (VIP)' est une expérience exclusive réservée à nos membres privilégiés.",
        vipBenefits: "✦ Débloquez des patrons secrets & tutoriels d'experts",
        later: "PLUS TARD",
        requestSentTitle: "Demande Reçue !",
        requestSentMsg: "Nous avons bien reçu votre demande. Un administrateur vous contactera sous peu. Merci !"
    },
    en: {
        badge: "EXCLUSIVE ACCESS",
        title: "VIP",
        accent: "MASTER ATELIER ACCESS",
        loading: "Loading premium collections...",
        error: "Failed to load data. Please try again later.",
        button: "Start",
        modalTitle: "Congratulations!",
        modalText: (certif) => `Upon successful completion, you will receive an **Accredited Certificate** ${certif ? ' VIP' : ''} to enhance your career.`,
        modalSmallText: "For more details, contact the administrator via WhatsApp:",
        modalBtn: "I Understand",
        whatsappNum: "26 123 456",
        courseTag: "VIP COURSE",
        durationLabel: "Duration",
        addCategory: "Add VIP Category",
        editCategory: "Edit Category",
        deleteConfirm: "Are you sure you want to delete this category?",
        categoryTitle: "Category Title",
        categoryDesc: "Description",
        categoryImg: "Image URL",
        categoryDuration: "Duration (e.g., Access 24/7)",
        save: "Save",
        cancel: "Cancel",
        adminActions: "VIP Management",
        breadcrumbHome: "Home",
        breadcrumbShop: "Shop",
        breadcrumbCurrent: "VIP Access",
        limitedAccess: "Limited Access",
        vipMessage: "'Master Atelier (VIP)' access is an exclusive experience reserved for our premium members.",
        vipBenefits: "✦ Unlock secret patterns & expert tutorials",
        later: "LATER",
        requestSentTitle: "Request Received!",
        requestSentMsg: "We have received your request. An administrator will contact you shortly. Thank you!"
    }
};

export default function Vipaccess() {
    const navigate = useNavigate();
    const { appLanguage, languages } = useLanguage();
    const [vipCategories, setVipCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const { showAlert } = useAlert();
    const [isModalUploading, setIsModalUploading] = useState(false);
    const modalFileInputRef = useRef(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Access Control Modal State
    const [showVipModal, setShowVipModal] = useState(false);
    const [vipPhone, setVipPhone] = useState('');
    const [vipFullName, setVipFullName] = useState('');
    const [isSubmittingVip, setIsSubmittingVip] = useState(false);
    const [vipRequestSuccess, setVipRequestSuccess] = useState(false);


    const [vipHeroSettings, setVipHeroSettings] = useState({});
    const [isEditingVipHero, setIsEditingVipHero] = useState(false);
    const [editVipHeroData, setEditVipHeroData] = useState({});

    // Categories Management State
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [categoryMode, setCategoryMode] = useState('add'); // 'add' or 'edit'
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [categoryFormData, setCategoryFormData] = useState({
        title: '',
        description: '',
        image: '',
        duration: '',
        order: 0,
        accessType: 'vip',
        imageFit: 'cover'
    });


    const t = translations[appLanguage] || translations.fr;
    const direction = appLanguage === 'ar' ? 'rtl' : 'ltr';

    // 🌟 Initialiser l'état basé sur localStorage
    const [showCertifModal, setShowCertifModal] = useState(() => {
        return !localStorage.getItem(CERTIF_MODAL_KEY);
    });

    const handleCloseCertifModal = () => {
        setShowCertifModal(false);
        localStorage.setItem(CERTIF_MODAL_KEY, 'true');
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/vip-categories`);
            setVipCategories(response.data);
            setLoading(false);
            window.scrollTo({ top: 0, behavior: 'instant' });
        } catch (err) {
            console.error("Erreur API:", err);
            setError(t.error);
            setLoading(false);
        }
    };



    const handleModalFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsModalUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);

            const uploadRes = await axios.post(`${BASE_URL}/api/upload`, formData);
            const imageUrl = uploadRes.data.url;

            setCategoryFormData(prev => ({ ...prev, image: imageUrl }));
            showAlert('success', 'Succès', 'Image téléchargée !');
        } catch (err) {
            console.error("Upload error:", err);
            showAlert('error', 'Erreur', "Échec de l'upload.");
        } finally {
            setIsModalUploading(false);
            e.target.value = '';
        }
    };


    useEffect(() => {
        // Auth Check
        setIsLoggedIn(localStorage.getItem('login') === 'true');

        // Admin Check
        const email =
            localStorage.getItem('loggedInUserEmail') ||
            localStorage.getItem('currentUserEmail') ||
            null;

        if (email) {
            fetch(`${BASE_URL}/api/users/${email}`)
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (data && data.statut === 'admin') {
                        setIsAdmin(true);
                    } else {
                        setIsAdmin(false);
                    }
                })
                .catch(() => { setIsAdmin(false); });
        } else {
            setIsAdmin(false);
        }

        // Fetch Hero Settings
        fetch(`${BASE_URL}/api/settings/vip-hero`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                const initialized = data || {};
                languages.forEach(lang => {
                    if (!initialized[lang.code]) {
                        initialized[lang.code] = {
                            badge: translations[lang.code]?.badge || translations.fr.badge,
                            title: translations[lang.code]?.title || translations.fr.title,
                            accent: translations[lang.code]?.accent || translations.fr.accent,
                            heroImage: initialized.fr?.heroImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop'
                        };
                    }
                });
                setVipHeroSettings(initialized);
                setEditVipHeroData(initialized);
            })
            .catch(() => { });

        fetchCategories();
    }, [t.error, languages]);

    const handleSaveVipHero = async () => {
        setVipHeroSettings(editVipHeroData);
        setIsEditingVipHero(false);
        try {
            await fetch(`${BASE_URL}/api/settings/vip-hero`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: editVipHeroData })
            });
            showAlert('success', appLanguage === 'ar' ? 'تم الحفظ' : 'Enregistré', appLanguage === 'ar' ? 'تم تحديث الواجهة بنجاح' : 'Interface mise à jour');
        } catch (err) {
            showAlert('error', 'Error', 'Failed to save');
        }
    };

    const initializeCategoryData = (data = {}) => {
        const title = typeof data.title === 'object' ? { ...data.title } : { fr: data.title || '' };
        const description = typeof data.description === 'object' ? { ...data.description } : { fr: data.description || '' };
        const duration = typeof data.duration === 'object' ? { ...data.duration } : { fr: data.duration || '' };

        languages.forEach(lang => {
            if (!title[lang.code]) title[lang.code] = title.fr || '';
            if (!description[lang.code]) description[lang.code] = description.fr || '';
            if (!duration[lang.code]) duration[lang.code] = duration.fr || '';
        });

        return {
            title,
            description,
            image: data.image || '',
            duration: duration,
            order: data.order || 0,
            accessType: data.accessType || 'vip',
            imageFit: data.imageFit || 'cover'
        };
    };

    // Management Functions
    const handleOpenAdd = () => {
        setCategoryMode('add');
        setCategoryFormData(initializeCategoryData());
        setShowCategoryModal(true);
    };

    const handleOpenEdit = (cat) => {
        setCategoryMode('edit');
        setSelectedCategoryId(cat._id);
        setCategoryFormData(initializeCategoryData(cat));
        setShowCategoryModal(true);
    };

    const handleDelete = (id) => {
        showAlert('confirm', t.deleteConfirm, '', async () => {
            try {
                await axios.delete(`${BASE_URL}/api/vip-categories/${id}`);
                fetchCategories();
                showAlert('success', 'Deleted', 'Category removed successfully');
            } catch (err) {
                showAlert('error', 'Error', 'Failed to delete category');
            }
        });
    };

    const handleCategorySubmit = async () => {
        try {
            if (categoryMode === 'add') {
                await axios.post(`${BASE_URL}/api/vip-categories`, categoryFormData);
                showAlert('success', 'Created', 'New category added');
            } else {
                await axios.put(`${BASE_URL}/api/vip-categories/${selectedCategoryId}`, categoryFormData);
                showAlert('success', 'Updated', 'Category updated successfully');
            }
            setShowCategoryModal(false);
            fetchCategories();
        } catch (err) {
            showAlert('error', 'Error', 'Operation failed');
        }
    };

    const handleVipRequest = async (e) => {
        e.preventDefault();
        const userEmail = localStorage.getItem('loggedInUserEmail') || localStorage.getItem('currentUserEmail') || 'invite@ateliersfax.com';
        
        if (!vipPhone) return;
        setIsSubmittingVip(true);
        try {
            const res = await fetch(`${BASE_URL}/api/abonnement`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nom: vipFullName || 'Client',
                    mail: userEmail,
                    telephone: vipPhone
                })
            });
            if (res.ok) {
                setVipRequestSuccess(true);
                setTimeout(() => {
                    setShowVipModal(false);
                    setVipRequestSuccess(false);
                    setVipFullName('');
                    setVipPhone('');
                }, 5000);
            } else {
                const data = await res.json();
                showAlert('error', 'Error', data.message || 'Erreur lors de l\'envoi');
            }
        } catch (err) {
            console.error(err);
            showAlert('error', 'Error', 'Connection error');
        } finally {
            setIsSubmittingVip(false);
        }
    };


    const currentHero = (vipHeroSettings && (vipHeroSettings[appLanguage] || vipHeroSettings.fr)) || {};

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }} dir="ltr">
            <Navbar />
            <div className="vip-premium-page" dir={direction}>

                {/* --- 🌟 HERO SECTION 🌟 --- */}
                <header
                    className="vip-hero-premium"
                    style={{
                        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.4)), url(${currentHero.heroImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop'})`
                    }}
                >
                    <div className="vip-hero-overlay"></div>

                    <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                        <div className="vip-badge-premium">{currentHero.badge}</div>
                        <h1 className="vip-main-title-premium vip-main-title-premium-mobile">
                            {appLanguage === 'en' ? currentHero.accent : currentHero.title} <span className="accent-text">{appLanguage === 'en' ? currentHero.title : currentHero.accent}</span>
                        </h1>

                        <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'center', gap: '20px', position: 'relative', zIndex: 20, flexWrap: 'wrap' }}>
                            {isAdmin && (
                                <button className="edit-btn-minimal-lux" onClick={() => {
                                    const initialized = { ...vipHeroSettings };
                                    languages.forEach(lang => {
                                        if (!initialized[lang.code]) {
                                            initialized[lang.code] = {
                                                badge: translations[lang.code]?.badge || translations.fr.badge,
                                                title: translations[lang.code]?.title || translations.fr.title,
                                                accent: translations[lang.code]?.accent || translations.fr.accent,
                                                heroImage: initialized.fr?.heroImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop'
                                            };
                                        }
                                    });
                                    setEditVipHeroData(initialized);
                                    setIsEditingVipHero(true);
                                }}>
                                    <FaEdit size={14} /> {appLanguage === 'ar' ? 'تعديل الواجهة' : 'Modifier'}
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                {/* --- 🥖 BREADCRUMB NAVIGATION 🥖 --- */}
                <nav className="breadcrumb-container">
                    <NavLink to="/" className="breadcrumb-link">
                        {t.breadcrumbHome}
                    </NavLink>
                    <FaChevronRight className="breadcrumb-separator" />
                    <NavLink to="/magasin" className="breadcrumb-link">
                        {t.breadcrumbShop}
                    </NavLink>
                    <FaChevronRight className="breadcrumb-separator" />
                    <div className="breadcrumb-current">
                        {t.breadcrumbCurrent}
                    </div>
                </nav>

                {/* --- 🏛️ CATEGORIES GRID 🏛️ --- */}
                <section className="vip-content-section">
                    {isAdmin && (
                        <div className="admin-actions-bar">
                            <button className="premium-btn-add" onClick={handleOpenAdd}>
                                <FaPlus /> {t.addCategory}
                            </button>
                        </div>
                    )}

                    {loading ? (
                        <div className="vip-courses-grid">
                            {[1, 2, 3].map((n) => (
                                <div key={n} className="skeleton-card">
                                    <div className="skeleton-img-box skeleton-shimmer"></div>
                                    <div className="skeleton-body">
                                        <div className="skeleton-line skeleton-title-line skeleton-shimmer"></div>
                                        <div className="skeleton-line skeleton-desc-line skeleton-shimmer"></div>
                                        <div className="skeleton-line skeleton-desc-line skeleton-shimmer"></div>
                                        <div className="skeleton-line skeleton-desc-line short skeleton-shimmer"></div>
                                        <div className="skeleton-footer-grid">
                                            <div className="skeleton-meta skeleton-shimmer"></div>
                                            <div className="skeleton-btn skeleton-shimmer"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="error-container" style={{ textAlign: 'center', padding: '100px 0', color: '#e11d48' }}>
                            <p>{error}</p>
                        </div>
                    ) : (
                        <div className="vip-courses-grid">
                            {vipCategories.map((course, index) => {
                                const actualAccessType = course.accessType || 'vip';
                                const isLocked = actualAccessType === 'vip' && !isLoggedIn;

                                return (
                                    <div
                                        key={course.id || course._id}
                                        className="vip-card-premium"
                                        style={{
                                            animationDelay: `${index * 0.1}s`,
                                            cursor: isLocked ? 'not-allowed' : 'pointer',
                                            filter: isLocked ? 'grayscale(100%)' : 'none',
                                            opacity: isLocked ? 0.7 : 1
                                        }}
                                        onClick={() => {
                                            if (!isLocked) {
                                                navigate(`/les_cours/${encodeURIComponent(typeof course.title === 'object' ? (course.title.fr || course.title[Object.keys(course.title)[0]]) : course.title)}`);
                                            } else {
                                                setShowVipModal(true);
                                            }
                                        }}

                                    >
                                        <div className="vip-card-img-wrapper">
                                            {/* <div className="vip-card-tag" style={{ background: actualAccessType === 'gratuit' ? '#10b981' : 'rgba(212, 175, 55, 0.9)', color: actualAccessType === 'gratuit' ? 'white' : 'black' }}>
                                                {actualAccessType === 'gratuit' ? (appLanguage === 'ar' ? 'مجاني' : 'GRATUIT') : (appLanguage === 'ar' ? 'دورة VIP' : 'COURS VIP')}
                                            </div> */}
                                            <img src={course.image} alt={course.title} className="vip-card-img" style={{ objectFit: course.imageFit || 'cover' }} />
                                            <div className="vip-card-overlay">
                                                {isAdmin && (
                                                    <div className="admin-card-controls" onClick={(e) => e.stopPropagation()}>
                                                        <button className="control-btn edit" onClick={() => handleOpenEdit(course)}><FaEdit /></button>
                                                        <button className="control-btn delete" onClick={() => handleDelete(course._id)}><FaTrash /></button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="vip-card-body">
                                            <h3 className="vip-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {typeof course.title === 'object' ? (course.title[appLanguage] || course.title.fr) : course.title}
                                                {isLocked && <FaLock style={{ color: '#ef4444', fontSize: '1rem' }} />}
                                                {!isLocked && actualAccessType === 'gratuit' && <FaUnlock style={{ color: '#10b981', fontSize: '1rem' }} />}
                                            </h3>
                                            <p className="vip-card-desc">
                                                {typeof course.description === 'object' ? (course.description[appLanguage] || course.description.fr) : course.description}
                                            </p>

                                            <div className="vip-card-footer">
                                                <div className="vip-meta-item">
                                                    <FaPlayCircle />
                                                    <span>
                                                        {typeof course.duration === 'object' ? (course.duration[appLanguage] || course.duration.fr) : (course.duration || 'Access 24/7')}
                                                    </span>
                                                </div>
                                                <button className="vip-access-btn" disabled={isLocked} style={{ opacity: isLocked ? 0.3 : 1 }}>
                                                    <span>{t.button}</span>
                                                    <FaChevronRight className="btn-arrow" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                <Footer />

                {/* 🛑 Modal Accès Limité (Creative Design - Synced with Home) */}
                {showVipModal && (
                    <div className="premium-modal-backdrop" onClick={() => !isSubmittingVip && setShowVipModal(false)}>
                        <div className="creative-modal-content" onClick={(e) => e.stopPropagation()} style={{ overflow: 'visible' }}>
                            {/* ABSOLUTE CROWN */}
                            <div className="creative-crown-wrapper">
                                <FaCrown />
                            </div>

                            {/* Top Header Section */}
                            <div className="creative-modal-header">
                                <button
                                    className="creative-close-btn"
                                    onClick={() => setShowVipModal(false)}
                                >
                                    <FaTimes />
                                </button>

                                <h2 className="creative-title">
                                    {t.limitedAccess}
                                </h2>
                            </div>

                            {/* Body Section */}
                            <div className="creative-modal-body">
                                {!vipRequestSuccess ? (
                                    <>
                                        <p className="creative-subtitle">
                                            {t.vipMessage}
                                        </p>

                                        <div className="creative-benefit-pill">
                                            {t.vipBenefits}
                                        </div>

                                        <form onSubmit={handleVipRequest} style={{ width: '100%' }}>
                                            <div className="creative-input-group">
                                                <label>{appLanguage === 'ar' ? 'رقم الهاتف' : 'Numéro de Téléphone'}</label>
                                                <div className="creative-input-wrapper">
                                                    <FaPhoneAlt />
                                                    <input
                                                        type="tel"
                                                        placeholder="Ex: 22 222 222"
                                                        value={vipPhone}
                                                        onChange={(e) => setVipPhone(e.target.value.replace(/\D/g, ''))}
                                                        minLength={8}
                                                        required
                                                        className="creative-input"
                                                    />
                                                </div>
                                            </div>

                                            <div className="creative-input-group">
                                                <label>{appLanguage === 'ar' ? 'الاسم الكامل' : 'Nom Complet'}</label>
                                                <div className="creative-input-wrapper">
                                                    <FaUser />
                                                    <input
                                                        type="text"
                                                        placeholder={appLanguage === 'ar' ? 'اسمك الكامل' : 'Votre Nom et Prénom'}
                                                        value={vipFullName}
                                                        onChange={(e) => setVipFullName(e.target.value.replace(/[^a-zA-Z\s\u0600-\u06FF]/g, ''))}
                                                        required
                                                        className="creative-input"
                                                    />
                                                </div>
                                            </div>

                                            <button type="submit" className="creative-submit-btn" disabled={isSubmittingVip}>
                                                {isSubmittingVip ? (appLanguage === 'ar' ? 'جاري الإرسال...' : 'Envoi...') : (appLanguage === 'ar' ? 'إرسال الطلب' : 'Envoyer la demande')}
                                            </button>

                                            <button
                                                type="button"
                                                className="creative-later-btn"
                                                onClick={() => setShowVipModal(false)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#b5bac1',
                                                    marginTop: '15px',
                                                    cursor: 'pointer',
                                                    fontWeight: '800',
                                                    fontSize: '0.85rem',
                                                    textTransform: 'uppercase'
                                                }}
                                            >
                                                {t.later}
                                            </button>
                                        </form>
                                    </>
                                ) : (
                                    <div style={{ padding: '15px 0' }}>
                                        <div style={{
                                            width: '70px',
                                            height: '70px',
                                            background: '#ecfdf5',
                                            color: '#34d399',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '2.5rem',
                                            margin: '0 auto 20px',
                                            boxShadow: '0 15px 35px rgba(52, 211, 153, 0.15)'
                                        }}>
                                            <FaCheckCircle />
                                        </div>
                                        <h3 style={{ color: '#0f172a', fontSize: '1.6rem', marginBottom: '10px', fontWeight: '900' }}>
                                            {t.requestSentTitle}
                                        </h3>
                                        <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.6', maxWidth: '300px', margin: '0 auto' }}>
                                            {t.requestSentMsg}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- 🏅 CERTIFICATION MODAL PREMIUM 🏅 --- */}
                {showCertifModal && (
                    <div className="premium-modal-backdrop">
                        <div className="premium-modal-content">
                            <button className="premium-modal-close-icon" onClick={handleCloseCertifModal}><FaTimes /></button>
                            <div className="vip-cert-icon-wrapper">
                                <FaCertificate />
                            </div>
                            <h2 className="premium-modal-title">{t.modalTitle}</h2>
                            <p className="vip-modal-text">{t.modalText(true)}</p>

                            <div className="vip-modal-whatsapp">
                                <span className="whatsapp-label">{t.modalSmallText}</span>
                                <span className="whatsapp-value">{t.whatsappNum}</span>
                            </div>

                            <button className="premium-btn-cta gold" onClick={handleCloseCertifModal}>
                                {t.modalBtn}
                            </button>
                        </div>
                    </div>
                )}

                {/* --- 📝 MANAGE CATEGORY MODAL 📝 --- */}
                {showCategoryModal && (
                    <div className="premium-modal-backdrop" onClick={() => setShowCategoryModal(false)}>
                        <div className="premium-modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="premium-modal-close-icon" onClick={() => setShowCategoryModal(false)}><FaTimes /></button>
                            <h2 className="premium-modal-title">
                                {categoryMode === 'add' ? t.addCategory : t.editCategory}
                            </h2>

                            <div className="premium-form-grid" style={{ gridTemplateColumns: '1fr' }}>
                                {languages.filter(l => l.code === appLanguage).map(lang => (
                                    <div key={lang.code} className="premium-lang-section" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '15px', marginBottom: '15px' }}>
                                        <h4 className="lang-indicator" style={{ background: '#d4af37', display: 'inline-block', marginBottom: '10px' }}>{lang.label}</h4>
                                        <div className="premium-form-group">
                                            <label>{t.categoryTitle}</label>
                                            <input
                                                type="text"
                                                value={categoryFormData.title[lang.code] || ''}
                                                onChange={(e) => {
                                                    const newTitle = { ...categoryFormData.title, [lang.code]: e.target.value };
                                                    setCategoryFormData({ ...categoryFormData, title: newTitle });
                                                }}
                                                dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                                            />
                                        </div>
                                        <div className="premium-form-group">
                                            <label>{t.categoryDesc}</label>
                                            <textarea
                                                value={categoryFormData.description[lang.code] || ''}
                                                onChange={(e) => {
                                                    const newDesc = { ...categoryFormData.description, [lang.code]: e.target.value };
                                                    setCategoryFormData({ ...categoryFormData, description: newDesc });
                                                }}
                                                dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                                            />
                                        </div>
                                        <div className="premium-form-group">
                                            <label>{t.categoryDuration}</label>
                                            <input
                                                type="text"
                                                value={categoryFormData.duration[lang.code] || ''}
                                                onChange={(e) => {
                                                    const newDur = { ...categoryFormData.duration, [lang.code]: e.target.value };
                                                    setCategoryFormData({ ...categoryFormData, duration: newDur });
                                                }}
                                                dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                                            />
                                        </div>
                                    </div>
                                ))}

                                <div className="premium-form-group">
                                    <label>{t.categoryImg}</label>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            placeholder="URL de l'image"
                                            value={categoryFormData.image}
                                            readOnly
                                            style={{ flex: 1 }}
                                        />
                                        <input
                                            type="file"
                                            ref={modalFileInputRef}
                                            onChange={handleModalFileUpload}
                                            style={{ display: 'none' }}
                                            accept="image/*"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => modalFileInputRef.current.click()}
                                            className="premium-btn-cta gold"
                                            style={{ padding: '8px 12px', minWidth: 'auto' }}
                                            disabled={isModalUploading}
                                        >
                                            {isModalUploading ? <FaSpinner className="spinner" /> : <FaUpload />}
                                        </button>
                                    </div>
                                    {categoryFormData.image && (
                                        <div style={{ marginTop: '10px', background: '#f8fafc', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                            <label style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px', display: 'block', fontWeight: 'bold' }}>
                                                Aperçu / العرض الفعلي في الكارد (العرض: 360px | الطول: 260px)
                                            </label>
                                            <div style={{ width: '100%', maxWidth: '360px', height: '260px', overflow: 'hidden', borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                                <img src={categoryFormData.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: categoryFormData.imageFit || 'cover' }} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="premium-form-group">
                                    <label>{appLanguage === 'ar' ? 'الترتيب' : 'Ordre'}</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 1"
                                        value={categoryFormData.order}
                                        onChange={(e) => setCategoryFormData({ ...categoryFormData, order: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="premium-form-grid" style={{ marginTop: '20px' }}>
                                <div className="premium-form-group" style={{ gridColumn: 'span 3' }}>
                                    <label>{appLanguage === 'ar' ? 'نوع الورشة (VIP أو مجاني)' : 'Type d\'accès'}</label>
                                    <select
                                        value={categoryFormData.accessType || 'vip'}
                                        onChange={(e) => setCategoryFormData({ ...categoryFormData, accessType: e.target.value })}
                                    >
                                        <option value="vip">VIP (Accès premium/connecté)</option>
                                        <option value="gratuit">Gratuit (Accès libre)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="premium-btn-group">
                                <button className="premium-btn-cta secondary" onClick={() => setShowCategoryModal(false)}>
                                    {t.cancel}
                                </button>
                                <button className="premium-btn-cta gold" onClick={handleCategorySubmit}>
                                    {t.save}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- 📝 EDIT HERO MODAL 📝 --- */}
                {isEditingVipHero && (
                    <div className="premium-modal-backdrop" onClick={() => setIsEditingVipHero(false)}>
                        <div className="premium-modal-content large" onClick={(e) => e.stopPropagation()}>
                            <button className="premium-modal-close-icon" onClick={() => setIsEditingVipHero(false)}><FaTimes /></button>
                            <h2 className="premium-modal-title">{appLanguage === 'ar' ? 'تعديل الواجهة' : 'Modifier le Hero'}</h2>

                            <div className="premium-form-grid">
                                {languages.filter(l => l.code === appLanguage).map(lang => (
                                    <div key={lang.code} className="premium-lang-section" style={{ border: 'none', background: 'none' }}>
                                        <h4 className="lang-indicator" style={{ background: '#d4af37' }}>{lang.label}</h4>
                                        <div className="premium-form-group">
                                            <label>Badge</label>
                                            <input
                                                type="text"
                                                value={editVipHeroData[lang.code]?.badge || ''}
                                                onChange={(e) => setEditVipHeroData({ ...editVipHeroData, [lang.code]: { ...editVipHeroData[lang.code], badge: e.target.value } })}
                                            />
                                        </div>
                                        <div className="premium-form-group">
                                            <label>{lang.code === 'en' ? 'Accent Text' : 'Title'}</label>
                                            <input
                                                type="text"
                                                value={editVipHeroData[lang.code]?.title || ''}
                                                onChange={(e) => setEditVipHeroData({ ...editVipHeroData, [lang.code]: { ...editVipHeroData[lang.code], title: e.target.value } })}
                                            />
                                        </div>
                                        <div className="premium-form-group">
                                            <label>{lang.code === 'en' ? 'Main Title' : 'Accent Text'}</label>
                                            <input
                                                type="text"
                                                value={editVipHeroData[lang.code]?.accent || ''}
                                                onChange={(e) => setEditVipHeroData({ ...editVipHeroData, [lang.code]: { ...editVipHeroData[lang.code], accent: e.target.value } })}
                                            />
                                        </div>
                                        <div className="premium-form-group">
                                            <label>URL Image de Fond</label>
                                            <input
                                                type="text"
                                                value={editVipHeroData[lang.code]?.heroImage || ''}
                                                onChange={(e) => setEditVipHeroData({ ...editVipHeroData, [lang.code]: { ...editVipHeroData[lang.code], heroImage: e.target.value } })}
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="premium-btn-group">
                                <button type="button" className="premium-btn-cta secondary" onClick={() => setIsEditingVipHero(false)}>
                                    {appLanguage === 'ar' ? 'إلغاء' : 'Annuler'}
                                </button>
                                <button type="button" className="premium-btn-cta gold" onClick={handleSaveVipHero}>
                                    {appLanguage === 'ar' ? 'حفظ التغييرات' : 'Enregistrer'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
