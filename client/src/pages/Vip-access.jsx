import React, { useState, useEffect } from 'react';
import { FaPlayCircle, FaCheckCircle, FaSpinner, FaCertificate, FaTimes, FaChevronRight, FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../apiConfig';
import { useAlert } from '../context/AlertContext';
import './vip_premium.css';

// Clé de localStorage pour mémoriser l'état
const CERTIF_MODAL_KEY = 'hasSeenVipCertifModal';

// 🌐 كائن الترجمة
const translations = {
    ar: {
        badge: "دخول حصري",
        title: "الوصول لـ",
        accent: "الورشة الماستر VIP",
        subtitle: "افتح دورات حصرية وحوّل شغفك إلى خبرة تحت إشراف خبراء الخياطة.",
        loading: "جاري تحميل المجموعات المتميزة...",
        error: "فشل في تحميل البيانات. الرجاء المحاولة لاحقًا.",
        button: "ابدأ الدورة الآن",
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
        adminActions: "إدارة المحتوى"
    },
    fr: {
        badge: "ACCÈS EXCLUSIF",
        title: "ACCÈS",
        accent: "MASTER ATELIER VIP",
        subtitle: "Débloquez des cours exclusifs et transformez votre passion en expertise professionnelle.",
        loading: "Chargement des collections premium...",
        error: "Échec du chargement. Veuillez réessayer plus tard.",
        button: "Commencer le cours",
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
        adminActions: "Gestion VIP"
    },
    en: {
        badge: "EXCLUSIVE ACCESS",
        title: "VIP",
        accent: "MASTER ATELIER ACCESS",
        subtitle: "Unlock exclusive courses and transform your passion into professional expertise.",
        loading: "Loading premium collections...",
        error: "Failed to load data. Please try again later.",
        button: "Start Course Now",
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
        adminActions: "VIP Management"
    }
};

export default function Vipaccess() {
    const [appLanguage, setAppLanguage] = useState('fr');
    const [vipCategories, setVipCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const { showAlert } = useAlert();

    const [vipHeroSettings, setVipHeroSettings] = useState({
        fr: { badge: "ACCÈS EXCLUSIF", title: "ACCÈS", accent: "MASTER ATELIER VIP", subtitle: "Débloquez des cours exclusifs et transformez votre passion en expertise professionnelle." },
        ar: { badge: "دخول حصري", title: "الوصول لـ", accent: "الورشة الماستر VIP", subtitle: "افتح دورات حصرية وحوّل شغفك إلى خبرة تحت إشراف خبراء الخياطة." },
        en: { badge: "EXCLUSIVE ACCESS", title: "VIP", accent: "MASTER ATELIER ACCESS", subtitle: "Unlock exclusive courses and transform your passion into professional expertise." }
    });

    const [isEditingVipHero, setIsEditingVipHero] = useState(false);
    const [editVipHeroData, setEditVipHeroData] = useState(vipHeroSettings);

    // Categories Management State
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [categoryMode, setCategoryMode] = useState('add'); // 'add' or 'edit'
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [categoryFormData, setCategoryFormData] = useState({
        title: '',
        description: '',
        image: '',
        duration: ''
    });

    // 1. ⚙️ جلب اللغة من LocalStorage
    useEffect(() => {
        const lang = localStorage.getItem('appLanguage') || 'fr';
        setAppLanguage(lang);
    }, []);

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
        } catch (err) {
            console.error("Erreur API:", err);
            setError(t.error);
            setLoading(false);
        }
    };

    useEffect(() => {
        // Admin Check
        const email =
            localStorage.getItem('loggedInUserEmail') ||
            localStorage.getItem('currentUserEmail') ||
            null;

        const checkAdmin = async () => {
            if (email) {
                try {
                    const response = await fetch(`${BASE_URL}/api/users/${email}`);
                    const data = await response.json();
                    if (data && data.statut === 'admin') setIsAdmin(true);
                } catch (e) { }
            }
        }
        checkAdmin();

        // Fetch Hero Settings
        fetch(`${BASE_URL}/api/settings/vip-hero`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) {
                    setVipHeroSettings(data);
                    setEditVipHeroData(data);
                }
            })
            .catch(() => { });

        fetchCategories();
    }, [t.error]);

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

    // Management Functions
    const handleOpenAdd = () => {
        setCategoryMode('add');
        setCategoryFormData({ title: '', description: '', image: '', duration: '' });
        setShowCategoryModal(true);
    };

    const handleOpenEdit = (cat) => {
        setCategoryMode('edit');
        setSelectedCategoryId(cat._id);
        setCategoryFormData({
            title: cat.title,
            description: cat.description,
            image: cat.image,
            duration: cat.duration || ''
        });
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

    const currentHero = vipHeroSettings[appLanguage] || vipHeroSettings.fr;

    return (
        <div className="vip-premium-page" dir={direction}>
            <Navbar />

            {/* --- 🌟 HERO SECTION 🌟 --- */}
            <header className="vip-hero-premium">
                {isAdmin && (
                    <button className="admin-edit-hero-btn admin-edit-master-btn" onClick={() => setIsEditingVipHero(true)}>
                        <FaEdit /> {appLanguage === 'ar' ? 'تعديل الواجهة' : 'Modifier Hero'}
                    </button>
                )}
                <div className="vip-badge-premium">{currentHero.badge}</div>
                <h1 className="vip-main-title-premium">
                    {appLanguage === 'en' ? currentHero.accent : currentHero.title} <span className="accent-text">{appLanguage === 'en' ? currentHero.title : currentHero.accent}</span>
                </h1>
                <p className="vip-sub-text-premium">{currentHero.subtitle}</p>
            </header>

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
                        {vipCategories.map((course, index) => (
                            <div key={course.id || course._id} className="vip-card-premium" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className="vip-card-img-wrapper">
                                    <div className="vip-card-tag">{t.courseTag}</div>
                                    <img src={course.image} alt={course.title} className="vip-card-img" />
                                    <div className="vip-card-overlay">
                                        {isAdmin && (
                                            <div className="admin-card-controls">
                                                <button className="control-btn edit" onClick={() => handleOpenEdit(course)}><FaEdit /></button>
                                                <button className="control-btn delete" onClick={() => handleDelete(course._id)}><FaTrash /></button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="vip-card-body">
                                    <h3 className="vip-card-title">{course.title}</h3>
                                    <p className="vip-card-desc">{course.description}</p>

                                    <div className="vip-card-footer">
                                        <div className="vip-meta-item">
                                            <FaPlayCircle />
                                            <span>{course.duration || 'Access 24/7'}</span>
                                        </div>
                                        <NavLink to={`/cours_Manches/${encodeURIComponent(course.title)}`}>
                                            <button className="vip-access-btn">
                                                <span>{t.button}</span>
                                                <FaChevronRight className="btn-arrow" />
                                            </button>
                                        </NavLink>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <Footer />

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

                        <div className="premium-form-grid-single">
                            <div className="premium-form-group">
                                <label>{t.categoryTitle}</label>
                                <input
                                    type="text"
                                    value={categoryFormData.title}
                                    onChange={(e) => setCategoryFormData({ ...categoryFormData, title: e.target.value })}
                                />
                            </div>
                            <div className="premium-form-group">
                                <label>{t.categoryDesc}</label>
                                <textarea
                                    value={categoryFormData.description}
                                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                                />
                            </div>
                            <div className="premium-form-group">
                                <label>{t.categoryImg}</label>
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    value={categoryFormData.image}
                                    onChange={(e) => setCategoryFormData({ ...categoryFormData, image: e.target.value })}
                                />
                            </div>
                            <div className="premium-form-group">
                                <label>{t.categoryDuration}</label>
                                <input
                                    type="text"
                                    value={categoryFormData.duration}
                                    onChange={(e) => setCategoryFormData({ ...categoryFormData, duration: e.target.value })}
                                />
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
                            {['fr', 'ar', 'en'].map(lang => (
                                <div key={lang} className="premium-lang-section">
                                    <h4 className="lang-indicator">{lang.toUpperCase()}</h4>
                                    <div className="premium-form-group">
                                        <label>Badge</label>
                                        <input
                                            type="text"
                                            value={editVipHeroData[lang].badge}
                                            onChange={(e) => setEditVipHeroData({ ...editVipHeroData, [lang]: { ...editVipHeroData[lang], badge: e.target.value } })}
                                        />
                                    </div>
                                    <div className="premium-form-group">
                                        <label>{lang === 'en' ? 'Accent Text' : 'Title'}</label>
                                        <input
                                            type="text"
                                            value={editVipHeroData[lang].title}
                                            onChange={(e) => setEditVipHeroData({ ...editVipHeroData, [lang]: { ...editVipHeroData[lang], title: e.target.value } })}
                                        />
                                    </div>
                                    <div className="premium-form-group">
                                        <label>{lang === 'en' ? 'Main Title' : 'Accent Text'}</label>
                                        <input
                                            type="text"
                                            value={editVipHeroData[lang].accent}
                                            onChange={(e) => setEditVipHeroData({ ...editVipHeroData, [lang]: { ...editVipHeroData[lang], accent: e.target.value } })}
                                        />
                                    </div>
                                    <div className="premium-form-group">
                                        <label>Subtitle</label>
                                        <textarea
                                            value={editVipHeroData[lang].subtitle}
                                            onChange={(e) => setEditVipHeroData({ ...editVipHeroData, [lang]: { ...editVipHeroData[lang], subtitle: e.target.value } })}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="premium-btn-group">
                            <button className="premium-btn-cta secondary" onClick={() => setIsEditingVipHero(false)}>
                                {appLanguage === 'ar' ? 'إلغاء' : 'Annuler'}
                            </button>
                            <button className="premium-btn-cta gold" onClick={handleSaveVipHero}>
                                {appLanguage === 'ar' ? 'حفظ التغييرات' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
