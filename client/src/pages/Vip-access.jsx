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



    const handleModalFileUpload = async (e, langCode = null) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsModalUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);

            const uploadRes = await axios.post(`${BASE_URL}/api/upload`, formData);
            const imageUrl = uploadRes.data.url;

            if (langCode) {
                setCategoryFormData(prev => ({
                    ...prev,
                    image: {
                        ...(typeof prev.image === 'object' ? prev.image : { fr: prev.image || '' }),
                        [langCode]: imageUrl
                    }
                }));
            } else {
                setCategoryFormData(prev => ({ ...prev, image: imageUrl }));
            }
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
        const image = typeof data.image === 'object' ? { ...data.image } : { fr: data.image || '' };

        languages.forEach(lang => {
            if (!title[lang.code]) title[lang.code] = title.fr || '';
            if (!description[lang.code]) description[lang.code] = description.fr || '';
            if (!duration[lang.code]) duration[lang.code] = duration.fr || '';
            if (!image[lang.code]) image[lang.code] = image.fr || '';
        });

        return {
            title,
            description,
            image,
            technicalName: data.technicalName || '',
            duration,
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
                                
                                // Logic for title and image per language
                                const displayTitle = typeof course.title === 'object' ? (course.title[appLanguage] || course.title.fr) : course.title;
                                const displayImage = typeof course.image === 'object' ? (course.image[appLanguage] || course.image.fr || course.image['fr']) : (course.image || '');
                                const technicalLink = course.technicalName ? encodeURIComponent(course.technicalName) : encodeURIComponent(typeof course.title === 'object' ? (course.title.fr || course.title[Object.keys(course.title)[0]]) : course.title);

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
                                                navigate(`/les_cours/${technicalLink}`);
                                            } else {
                                                setShowVipModal(true);
                                            }
                                        }}

                                    >
                                        <div className="vip-card-img-wrapper">
                                            <img src={displayImage} alt={displayTitle} className="vip-card-img" style={{ objectFit: course.imageFit || 'cover' }} />
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
                                                {displayTitle}
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

                {/* 🛑 Modal Accès Limité */}
                {showVipModal && (
                    <div className="premium-modal-backdrop" onClick={() => !isSubmittingVip && setShowVipModal(false)}>
                        <div className="creative-modal-content" onClick={(e) => e.stopPropagation()} style={{ overflow: 'visible' }}>
                            <div className="creative-crown-wrapper">
                                <FaCrown />
                            </div>

                            <div className="creative-modal-header">
                                <button className="creative-close-btn" onClick={() => setShowVipModal(false)}><FaTimes /></button>
                                <h2 className="creative-title">{t.limitedAccess}</h2>
                            </div>

                            <div className="creative-modal-body">
                                {!vipRequestSuccess ? (
                                    <>
                                        <p className="creative-subtitle">{t.vipMessage}</p>
                                        <div className="creative-benefit-pill">{t.vipBenefits}</div>
                                        <form onSubmit={handleVipRequest} style={{ width: '100%' }}>
                                            <div className="creative-input-group">
                                                <label>{appLanguage === 'ar' ? 'رقم الهاتف' : 'Numéro de Téléphone'}</label>
                                                <div className="creative-input-wrapper">
                                                    <FaPhoneAlt />
                                                    <input type="tel" placeholder="Ex: 22 222 222" value={vipPhone} onChange={(e) => setVipPhone(e.target.value.replace(/\D/g, ''))} minLength={8} required className="creative-input" />
                                                </div>
                                            </div>
                                            <div className="creative-input-group">
                                                <label>{appLanguage === 'ar' ? 'الاسم الكامل' : 'Nom Complet'}</label>
                                                <div className="creative-input-wrapper">
                                                    <FaUser />
                                                    <input type="text" placeholder={appLanguage === 'ar' ? 'اسمك الكامل' : 'Votre Nom et Prénom'} value={vipFullName} onChange={(e) => setVipFullName(e.target.value.replace(/[^a-zA-Z\s\u0600-\u06FF]/g, ''))} required className="creative-input" />
                                                </div>
                                            </div>
                                            <button type="submit" className="creative-submit-btn" disabled={isSubmittingVip}>
                                                {isSubmittingVip ? (appLanguage === 'ar' ? 'جاري الإرسال...' : 'Envoi...') : (appLanguage === 'ar' ? 'إرسال الطلب' : 'Envoyer la demande')}
                                            </button>
                                            <button type="button" className="creative-later-btn" onClick={() => setShowVipModal(false)}>
                                                {t.later}
                                            </button>
                                        </form>
                                    </>
                                ) : (
                                    <div style={{ padding: '15px 0' }}>
                                        <div className="success-icon-badge"><FaCheckCircle /></div>
                                        <h3 style={{ color: '#0f172a', fontSize: '1.6rem', marginBottom: '10px', fontWeight: '900' }}>{t.requestSentTitle}</h3>
                                        <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.6', maxWidth: '300px', margin: '0 auto' }}>{t.requestSentMsg}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 🏅 CERTIFICATION MODAL PREMIUM */}
                {showCertifModal && (
                    <div className="premium-modal-backdrop">
                        <div className="premium-modal-content">
                            <button className="premium-modal-close-icon" onClick={handleCloseCertifModal}><FaTimes /></button>
                            <div className="vip-cert-icon-wrapper"><FaCertificate /></div>
                            <h2 className="premium-modal-title">{t.modalTitle}</h2>
                            <p className="vip-modal-text">{t.modalText(true)}</p>
                            <div className="vip-modal-whatsapp">
                                <span className="whatsapp-label">{t.modalSmallText}</span>
                                <span className="whatsapp-value">{t.whatsappNum}</span>
                            </div>
                            <button className="premium-btn-cta gold" onClick={handleCloseCertifModal}>{t.modalBtn}</button>
                        </div>
                    </div>
                )}

                {/* 📝 MANAGE CATEGORY MODAL */}
                {showCategoryModal && (
                    <div className="premium-modal-backdrop" onClick={() => setShowCategoryModal(false)}>
                        <div className="premium-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <button className="premium-modal-close-icon" onClick={() => setShowCategoryModal(false)}><FaTimes /></button>
                            <h2 className="premium-modal-title">
                                {categoryMode === 'add' ? t.addCategory : t.editCategory}
                            </h2>

                            <div className="premium-form-grid" style={{ gridTemplateColumns: '1fr' }}>

                                {/* --- Shared Technical Name Field --- */}
                                <div className="premium-form-group" style={{ marginBottom: '25px' }}>
                                    <label style={{ fontWeight: 'bold', color: '#1e293b' }}>
                                        {appLanguage === 'ar' ? 'الاسم التقني (يستخدم في الرابط)' : 'Nom Technique (Utilisé dans le lien)'}
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            placeholder="ex: Master Corsage"
                                            value={categoryFormData.technicalName || ''}
                                            onChange={(e) => setCategoryFormData({ ...categoryFormData, technicalName: e.target.value })}
                                            style={{ paddingLeft: appLanguage === 'ar' ? '12px' : '35px', paddingRight: appLanguage === 'ar' ? '35px' : '12px' }}
                                        />
                                    </div>
                                    <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                                        {appLanguage === 'ar' ? 'هذا الاسم مشترك بين جميع اللغات ولا يسمح بالرموز الخاصة.' : 'Ce nom est partagé entre toutes les langues. Pas de caractères spéciaux.'}
                                    </small>
                                </div>

                                {/* --- Language Specific Fields (Filtered by current appLanguage) --- */}
                                {languages.filter(l => l.code === appLanguage).map(lang => (
                                    <div key={lang.code} className="premium-lang-section" style={{ border: 'none', background: '#f8fafc', borderRadius: '15px', padding: '20px', marginBottom: '20px' }}>
                                        <h4 className="lang-indicator" style={{ background: '#d4af37', display: 'inline-block', marginBottom: '15px', color: 'white', padding: '4px 12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                                            {appLanguage === 'ar' ? `البيانات باللغة: ${lang.label}` : `Données en : ${lang.label}`}
                                        </h4>
                                        
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
                                                rows="3"
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

                                        <div className="premium-form-group">
                                            <label>{appLanguage === 'ar' ? 'صورة الكارت' : 'Image de la carte'}</label>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <input
                                                    type="text"
                                                    placeholder="URL"
                                                    value={typeof categoryFormData.image === 'object' ? (categoryFormData.image[lang.code] || '') : (lang.code === 'fr' ? categoryFormData.image : '')}
                                                    readOnly
                                                    style={{ flex: 1 }}
                                                />
                                                <input
                                                    type="file"
                                                    id={`file-${lang.code}`}
                                                    onChange={(e) => handleModalFileUpload(e, lang.code)}
                                                    style={{ display: 'none' }}
                                                    accept="image/*"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => document.getElementById(`file-${lang.code}`).click()}
                                                    className="premium-btn-cta gold"
                                                    style={{ padding: '8px 12px', minWidth: 'auto' }}
                                                    disabled={isModalUploading}
                                                >
                                                    {isModalUploading ? <FaSpinner className="spinner" /> : <FaUpload />}
                                                </button>
                                            </div>
                                            {(typeof categoryFormData.image === 'object' ? categoryFormData.image[lang.code] : (lang.code === 'fr' ? categoryFormData.image : null)) && (
                                                <div style={{ marginTop: '12px' }}>
                                                    <img 
                                                        src={typeof categoryFormData.image === 'object' ? categoryFormData.image[lang.code] : categoryFormData.image} 
                                                        alt="Preview" 
                                                        style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #e2e8f0' }} 
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                <div className="premium-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div className="premium-form-group">
                                        <label>{appLanguage === 'ar' ? 'الترتيب' : 'Ordre'}</label>
                                        <input
                                            type="number"
                                            value={categoryFormData.order}
                                            onChange={(e) => setCategoryFormData({ ...categoryFormData, order: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="premium-form-group">
                                        <label>{appLanguage === 'ar' ? 'نوع الورشة' : 'Type d\'accès'}</label>
                                        <select
                                            value={categoryFormData.accessType || 'vip'}
                                            onChange={(e) => setCategoryFormData({ ...categoryFormData, accessType: e.target.value })}
                                        >
                                            <option value="vip">VIP (Premium)</option>
                                            <option value="gratuit">Gratuit (Libre)</option>
                                        </select>
                                    </div>
                                </div>

                            </div>

                            <div className="premium-btn-group" style={{ marginTop: '30px' }}>
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

