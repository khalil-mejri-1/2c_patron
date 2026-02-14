// GestionCoursSpecialises.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes, FaPlusCircle, FaTrash, FaSave, FaVideo, FaEdit, FaLayerGroup, FaExclamationTriangle, FaCog, FaListUl, FaChevronRight } from 'react-icons/fa';
import BASE_URL from '../../apiConfig';

const COURS_API_URL = `${BASE_URL}/api/specialized-courses`;
const CATEGORIES_API_URL = `${BASE_URL}/api/vip-categories`;

// --- 1. ثوابت الأنماط (Styles Constants) ---
const primaryBlue = '#3b82f6';
const secondaryGreen = '#10b981';
const dangerRed = '#ef4444';
const grayText = '#6b7280';
const borderColor = '#e5e7eb';
const lightGrayBg = '#f9fafb';
const lightBlueBg = '#eff6ff'; // New style for Modal background

const alertBase = {
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontWeight: '600',
    lineHeight: '1.5',
};

const actionButtonBase = {
    padding: '14px 25px',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    cursor: 'pointer',
    color: 'white',
    transition: 'background-color 0.3s ease-in-out, transform 0.2s ease-in-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    fontSize: '1.1rem',
    width: '100%',
    boxSizing: 'border-box',
};

const styles = {
    modalInner: {
        background: '#ffffff',
        padding: '15px',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        maxWidth: '1000px',
        width: '100%',
        margin: '5px auto',
        maxHeight: '99vh',
        overflowY: 'auto',
        fontFamily: 'Arial, sans-serif',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `2px solid ${borderColor}`,
        marginBottom: '15px',
        paddingBottom: '10px',
    },
    title: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '1.4rem',
        color: '#374151',
        fontWeight: 700,
    },
    closeButton: {
        background: 'none',
        border: 'none',
        color: dangerRed,
        fontSize: '1.5rem',
        cursor: 'pointer',
    },
    errorAlert: {
        background: '#fef2f2',
        color: '#b91c1c',
        border: `1px solid #fecaca`,
    },
    successAlert: {
        background: '#ecfdf5',
        color: '#047857',
        border: `1px solid #d1fae5`,
    },
    formContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    videoContainer: {
        padding: '15px',
        background: lightGrayBg,
        border: `2px dashed ${primaryBlue}`,
        borderRadius: '12px',
    },
    inputBase: {
        padding: '12px',
        border: `1px solid ${borderColor}`,
        borderRadius: '8px',
        fontSize: '1rem',
        width: '100%',
        boxSizing: 'border-box',
    },
    courseBlock: {
        border: `1px solid ${borderColor}`,
        padding: '12px',
        borderRadius: '12px',
        background: '#fff',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(100%, 1fr))',
        gap: '10px',
        position: 'relative',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)',
    },
    courseTitle: {
        gridColumn: '1 / -1',
        marginBottom: '10px',
        fontSize: '1.2rem',
        fontWeight: '600',
        color: '#374151',
    },
    removeButton: {
        position: 'absolute',
        top: '12px',
        right: '12px',
        background: dangerRed,
        color: 'white',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontWeight: '600',
        fontSize: '0.8rem',
    },
    addButton: {
        background: secondaryGreen,
    },
    saveButton: {
        background: primaryBlue,
    },
    listContainer: {
        marginTop: '40px',
        paddingTop: '20px',
        borderTop: `1px solid ${borderColor}`,
    },
    groupItem: {
        display: 'flex',
        flexDirection: 'column',
        padding: '15px',
        marginBottom: '15px',
        borderRadius: '8px',
        background: '#ffffff',
        borderLeft: `5px solid ${primaryBlue}`,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        gap: '10px',
    },
    groupHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
    },
    groupDetails: {
        flexGrow: 1,
        minWidth: '200px',
    },
    groupActions: {
        display: 'flex',
        gap: '8px',
        marginTop: '5px',
    },
    deleteGroupBtn: {
        background: dangerRed,
        color: 'white',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '600',
    },
    courseBadge: {
        display: 'inline-block',
        background: secondaryGreen,
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '0.8rem',
        marginRight: '5px',
        marginTop: '5px',
    },
    videoPlayerPreview: {
        maxWidth: '250px',
        width: '100%',
        maxHeight: '150px',
        borderRadius: '8px',
        margin: '10px 0',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        backgroundColor: '#000',
    },
    // Styles لنافذة التأكيد
    confirmOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 3000,
    },
    confirmBox: {
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        maxWidth: '400px',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
    },
    confirmTitle: {
        color: '#dc3545',
        fontSize: '1.5rem',
        marginBottom: '15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
    },
    confirmText: {
        color: '#495057',
        marginBottom: '25px',
    },
    confirmButtons: {
        display: 'flex',
        justifyContent: 'space-around',
        gap: '10px',
    },
    confirmButtonBase: {
        padding: '10px 20px',
        borderRadius: '6px',
        fontWeight: '600',
        cursor: 'pointer',
        border: 'none',
        flexGrow: 1,
    },
    confirmYes: {
        backgroundColor: '#dc3545',
        color: 'white',
    },
    confirmNo: {
        backgroundColor: '#f8f9fa',
        color: '#495057',
        border: '1px solid #ced4da',
    },
    // New Styles for Options Modal (Liste des sous-catégories)
    optionModalContent: {
        background: lightBlueBg,
        padding: '30px',
        borderRadius: '12px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
        maxHeight: '80vh',
        overflowY: 'auto',
    },
    optionModalTitle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: primaryBlue,
        borderBottom: `2px solid ${primaryBlue}`,
        paddingBottom: '10px',
        marginBottom: '20px',
        fontSize: '1.5rem',
    },
    subCategoryItem: {
        padding: '12px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        marginBottom: '10px',
        border: `1px solid ${borderColor}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    }
};

export default function GestionCoursSpecialises({ onClose }) {
    const [videoLink, setVideoLink] = useState('');
    const [categories, setCategories] = useState([]);
    const [courses, setCourses] = useState([{ title: '', duration: '', image: '', vip_category: '' }]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    const [existingGroups, setExistingGroups] = useState({});
    const [confirmDialog, setConfirmDialog] = useState(null);
    const [openCategoryDropdownIndex, setOpenCategoryDropdownIndex] = useState(-1);
    const [optionModal, setOptionModal] = useState(null);

    useEffect(() => {
        fetchCategories();
        fetchGroups();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openCategoryDropdownIndex !== -1 && event.target.closest('.category-dropdown-container') === null) {
                setOpenCategoryDropdownIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openCategoryDropdownIndex]);

    const fetchCategories = async () => {
        try {
            const res = await axios.get(CATEGORIES_API_URL);
            setCategories(res.data);
            setLoading(false);
        } catch {
            setError('Erreur lors du chargement des catégories.');
            setLoading(false);
        }
    };

    // دالة جلب المجموعات وتجميعها حسب الفئة الرئيسية
    const fetchGroups = async () => {
        try {
            const res = await axios.get(COURS_API_URL);
            const data = res.data;

            const groupedCourses = data.reduce((acc, group) => {
                const categoryTitle = group.courses[0]?.vip_category;
                if (categoryTitle) {
                    if (!acc[categoryTitle]) {
                        acc[categoryTitle] = {
                            _id: group._id,
                            video_link: group.video_link,
                            subCategories: []
                        };
                    }
                    group.courses.forEach(course => {
                        if (course.title && !acc[categoryTitle].subCategories.includes(course.title)) {
                            acc[categoryTitle].subCategories.push(course.title);
                        }
                    });
                }
                return acc;
            }, {});

            setExistingGroups(groupedCourses);
        } catch (err) {
            console.error("Erreur lors du chargement des groupes:", err);
        }
    };

    const handleCourseChange = (index, field, value) => {
        const updated = [...courses];
        updated[index][field] = value;
        setCourses(updated);
        setError(null);
        setSuccess('');
    };

    // 🔄 دالة جديدة للتعامل مع اختيار الفئة الفرعية من النافذة المنبثقة
    const handleSubCategorySelection = (courseIndex, subCategoryTitle) => {
        // ⬅️ تحديث حقل 'vip_category' للدورة المحددة بقيمة الفئة الفرعية
        handleCourseChange(courseIndex, 'vip_category', subCategoryTitle);
        setOptionModal(null); // إغلاق النافذة المنبثقة
    };

    const addCourse = () => setCourses([...courses, { title: '', duration: '', image: '', vip_category: '' }]);
    const removeCourse = (i) => {
        const updated = courses.filter((_, idx) => idx !== i);
        setCourses(updated.length > 0 ? updated : [{ title: '', duration: '', image: '', vip_category: '' }]);

        if (openCategoryDropdownIndex === i) {
            setOpenCategoryDropdownIndex(-1);
        } else if (openCategoryDropdownIndex > i) {
            setOpenCategoryDropdownIndex(openCategoryDropdownIndex - 1);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validCourses = courses.filter(c => c.title.trim() && c.vip_category.trim() && c.image.trim());
        if (validCourses.length === 0) {
            setError("Veuillez remplir les champs obligatoires pour au moins un cours.");
            return;
        }
        try {
            await axios.post(`${COURS_API_URL}/group`, { video_link: videoLink.trim() || undefined, courses: validCourses });
            setSuccess('Cours enregistrés avec succès !');
            setCourses([{ title: '', duration: '', image: '', vip_category: '' }]);
            setVideoLink('');
            fetchGroups();
            setOpenCategoryDropdownIndex(-1);
        } catch {
            setError('Erreur lors de la sauvegarde. Vérifiez les données.');
        }
    };

    const confirmDeleteGroup = (id, categoryTitle) => {
        setConfirmDialog({ id, title: categoryTitle });
    };

    const handleDeleteGroup = async (groupId) => {
        setConfirmDialog(null);
        try {
            await axios.delete(`${COURS_API_URL}/${groupId}`);
            setSuccess('Groupe de cours supprimé avec succès.');
            fetchGroups();
        } catch (err) {
            setError('Erreur lors de la suppression du groupe.');
        }
    };

    // 🆕 مكون نافذة التأكيد (Fixes the ReferenceError)
    const ConfirmationDialog = ({ onConfirm, onCancel, itemTitle }) => (
        <div style={styles.confirmOverlay}>
            <div style={styles.confirmBox}>
                <h3 style={styles.confirmTitle}>
                    <FaExclamationTriangle size={24} /> Suppression du Groupe
                </h3>
                <p style={styles.confirmText}>
                    Êtes-vous sûr de vouloir supprimer le groupe de cours de catégorie **"{itemTitle}"** ? Cette action est irréversible.
                </p>
                <div style={styles.confirmButtons}>
                    <button
                        onClick={onCancel}
                        style={{ ...styles.confirmButtonBase, ...styles.confirmNo }}
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{ ...styles.confirmButtonBase, ...styles.confirmYes }}
                    >
                        Oui, Supprimer
                    </button>
                </div>
            </div>
        </div>
    );

    // مكون النافذة المنبثقة للخيارات (Category Options Modal)
    const CategoryOptionsModal = ({ categoryTitle, subCategories, courseIndex, onSelectSubCategory, onClose }) => {

        return (
            <div style={styles.confirmOverlay}>
                <div style={styles.optionModalContent}>
                    <div style={styles.optionModalTitle}>
                        <span><FaListUl style={{ marginRight: '10px' }} />Sous-catégories de
                            {categoryTitle}</span>
                        <button onClick={onClose} style={{ ...styles.closeButton, color: primaryBlue }}><FaTimes /></button>
                    </div>

                    <p style={{ color: grayText, marginBottom: '15px' }}>
                        Cliquez pour sélectionner la sous-catégorie « Catégorie VIP » pour la session en cours.
                    </p>

                    {subCategories.length > 0 ? (
                        subCategories.map((subTitle, index) => (
                            // 🔄 تطبيق دالة الاختيار عند النقر
                            <div
                                key={index}
                                style={styles.subCategoryItem}
                                onClick={() => onSelectSubCategory(courseIndex, subTitle)}
                                // For better UX (using className instead of inline style pseudo-class)
                                className="sub-category-item-hover"
                            >
                                {subTitle}
                                <FaChevronRight style={{ color: secondaryGreen }} />
                            </div>
                        ))
                    ) : (
                        <div style={{ ...styles.errorAlert, background: '#fff', textAlign: 'center' }}>
                            Aucune sous-catégorie trouvée pour cette catégorie principale.
                        </div>
                    )}
                </div>
                {/* 🆕 إضافة نمط داخلي مخصص للـ hover effect */}
                <style>
                    {`
                        .sub-category-item-hover:hover {
                            background-color: ${lightGrayBg} !important;
                            border-color: ${primaryBlue} !important;
                        }
                    `}
                </style>
            </div>
        );
    };

    // المكون المخصص لاختيار الفئة
    const CategorySelectorWithSubMenu = ({ i, course, categories, handleCourseChange, openIndex, setOpenIndex, setOptionModal, existingGroups }) => {
        const isDropdownOpen = openIndex === i;
        const currentCategory = categories.find(c => c.title === course.vip_category);

        // 🔄 تغيير العنوان المعروض بناءً على ما إذا كانت الفئة المختارة موجودة في قائمة الفئات الرئيسية أم لا
        const isSelectedSubCategory = course.vip_category && !categories.some(c => c.title === course.vip_category);
        const currentCategoryTitle = isSelectedSubCategory
            ? course.vip_category // عرض الفئة الفرعية المختارة
            : (currentCategory ? currentCategory.title : '-- Catégorie VIP * --');

        const handleSelectCategory = (categoryTitle) => {
            handleCourseChange(i, 'vip_category', categoryTitle);
            setOpenIndex(-1);
        };

        const handleToggleMainDropdown = (e) => {
            e.stopPropagation();
            setOpenIndex(isDropdownOpen ? -1 : i);
        };

        // دالة فتح النافذة المنبثقة للخيارات
        const handleOpenOptionsModal = (categoryTitle, courseIndex, e) => {
            e.stopPropagation();
            const groupData = existingGroups[categoryTitle] || { subCategories: [] };

            setOptionModal({
                courseIndex: courseIndex,
                title: categoryTitle,
                subCategories: groupData.subCategories
            });
            setOpenIndex(-1);
        };

        // --- Inline Styles for the custom UI elements ---
        const customDropdownStyles = {
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 100,
            backgroundColor: '#fff',
            border: `1px solid ${primaryBlue}`,
            borderRadius: '8px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.15)',
            maxHeight: '300px',
            overflowY: 'auto',
            marginTop: '5px',
            padding: '5px 0',
        };

        const categoryOptionBaseStyle = {
            padding: '10px 15px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'background-color 0.2s',
            position: 'relative',
        };

        return (
            <div style={{ position: 'relative', width: '100%' }} className="category-dropdown-container">
                {/* 1. Display/Trigger */}
                <div
                    style={{
                        ...styles.inputBase,
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: isDropdownOpen ? lightGrayBg : (isSelectedSubCategory ? '#e6f7ff' : '#fff'), // تمييز إذا كانت فئة فرعية مختارة
                        fontWeight: isSelectedSubCategory ? 'bold' : 'normal',
                        color: isSelectedSubCategory ? primaryBlue : 'inherit'
                    }}
                    onClick={handleToggleMainDropdown}
                >
                    {currentCategoryTitle}
                </div>

                {/* 2. Custom Dropdown List */}
                {isDropdownOpen && (
                    <div style={customDropdownStyles}>
                        {/* Default Option */}
                        <div
                            style={{ ...categoryOptionBaseStyle, color: grayText, fontWeight: 'bold' }}
                            onClick={(e) => { e.stopPropagation(); handleSelectCategory(''); }}
                        >
                            -- Catégorie VIP * --
                        </div>
                        {categories.map(c => {
                            const hasSubCategories = existingGroups[c.title] && existingGroups[c.title].subCategories.length > 0;

                            return (
                                <div
                                    key={c._id}
                                    style={{
                                        ...categoryOptionBaseStyle,
                                        backgroundColor: currentCategory?.title === c.title ? '#e0f2f1' : 'transparent',
                                    }}
                                >
                                    {/* Span للتحديد */}
                                    <span
                                        onClick={(e) => { e.stopPropagation(); handleSelectCategory(c.title); }}
                                        style={{ flexGrow: 1, marginRight: '10px' }}
                                    >
                                        {c.title}
                                    </span>

                                    {/* 3. Button to open the Modal (يظهر فقط إذا كانت الفئة موجودة ولديها بيانات مسجلة) */}
                                    {hasSubCategories && (
                                        <button
                                            type="button"
                                            onClick={(e) => handleOpenOptionsModal(c.title, i, e)}
                                            style={{
                                                padding: '6px 12px',
                                                backgroundColor: primaryBlue,
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontWeight: '600',
                                            }}
                                        >
                                            <FaCog size={12} /> Options
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Chargement...</div>;

    return (
        <div style={styles.modalInner}>

            {/* 🆕 AFFICHER LA FENÊTRE المنبثقة للخيارات (تعرض Sous-catégories) */}
            {optionModal && (
                <CategoryOptionsModal
                    categoryTitle={optionModal.title}
                    subCategories={optionModal.subCategories}
                    courseIndex={optionModal.courseIndex}
                    onSelectSubCategory={handleSubCategorySelection}
                    onClose={() => setOptionModal(null)}
                />
            )}

            {/* AFFICHER LA FENÊTRE DE CONFIRMATION */}
            {confirmDialog && (
                <ConfirmationDialog
                    itemTitle={confirmDialog.title}
                    onConfirm={() => handleDeleteGroup(confirmDialog.id)}
                    onCancel={() => setConfirmDialog(null)}
                />
            )}

            <div style={styles.modalHeader}>
                <h2 style={styles.title}><FaVideo style={{ marginRight: '10px', color: primaryBlue }} /> Gérer les Cours Spécialisés</h2>
                <button onClick={onClose} style={styles.closeButton}><FaTimes /></button>
            </div>

            {/* --- Alertes --- */}
            {error && <div style={{ ...alertBase, ...styles.errorAlert }}>{error}</div>}
            {success && <div style={{ ...alertBase, ...styles.successAlert }}>{success}</div>}

            {/* --- 1. نموذج الإضافة --- */}
            <form onSubmit={handleSubmit} style={styles.formContainer}>
                {/* 🎥 Lien Vidéo Optionnel */}
                <div style={styles.videoContainer}>
                    <label style={{ color: primaryBlue, fontWeight: 700 }}>Lien de la vidéo d'introduction (optionnel)</label>
                    <input
                        type="url"
                        value={videoLink}
                        onChange={(e) => setVideoLink(e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                        style={styles.inputBase}
                    />
                </div>

                {/* 🧩 حقول الدورات الديناميكية */}
                {courses.map((course, i) => (
                    <div key={i} style={styles.courseBlock}>
                        <h4 style={styles.courseTitle}>Cours #{i + 1}</h4>
                        {courses.length > 1 && (
                            <button type="button" style={styles.removeButton} onClick={() => removeCourse(i)}>
                                <FaTrash /> Supprimer
                            </button>
                        )}
                        <input
                            type="text"
                            placeholder="Titre du cours *"
                            value={course.title}
                            onChange={(e) => handleCourseChange(i, 'title', e.target.value)}
                            style={styles.inputBase}
                        />

                        {/* 🆕 استخدام المكون المخصص مع زر يفتح نافذة منبثقة */}
                        <CategorySelectorWithSubMenu
                            i={i}
                            course={course}
                            categories={categories}
                            handleCourseChange={handleCourseChange}
                            openIndex={openCategoryDropdownIndex}
                            setOpenIndex={setOpenCategoryDropdownIndex}
                            setOptionModal={setOptionModal}
                            existingGroups={existingGroups}
                        />

                        <input
                            type="text"
                            placeholder="Durée (ex: 45 min)"
                            value={course.duration}
                            onChange={(e) => handleCourseChange(i, 'duration', e.target.value)}
                            style={styles.inputBase}
                        />
                        <input
                            type="url"
                            placeholder="URL de l'image *"
                            value={course.image}
                            onChange={(e) => handleCourseChange(i, 'image', e.target.value)}
                            style={styles.inputBase}
                        />
                    </div>
                ))}

                {/* ➕ أزرار الإضافة والحفظ */}
                <button type="button" onClick={addCourse} style={{ ...actionButtonBase, ...styles.addButton }}><FaPlusCircle /> Ajouter un autre cours</button>
                <button type="submit" style={{ ...actionButtonBase, ...styles.saveButton }}><FaSave /> Enregistrer</button>
            </form>

            {/* --- 2. قسم عرض الدورات الموجودة --- */}
            {Object.keys(existingGroups).length > 0 && (
                <div style={styles.listContainer}>
                    <h3 style={{ fontSize: '1.4rem', color: '#374151', marginBottom: '20px', borderBottom: `1px solid ${borderColor}`, paddingBottom: '10px' }}>
                        <FaLayerGroup style={{ marginRight: '5px', color: primaryBlue }} /> Groupes de Cours Existant ({Object.keys(existingGroups).length})
                    </h3>

                    {Object.keys(existingGroups).map(categoryTitle => {
                        const group = existingGroups[categoryTitle];
                        const totalCourses = group.subCategories.length;

                        return (
                            <div key={group._id || categoryTitle} style={styles.groupItem}>
                                <div style={styles.groupHeader}>
                                    <div style={styles.groupDetails}>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#374151' }}>
                                            Catégorie : {categoryTitle || 'N/A'}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: grayText, marginTop: '5px', marginBottom: '10px' }}>
                                            Nombre de sous-catégories : {totalCourses}
                                        </div>

                                        {group.video_link && (
                                            <video
                                                controls
                                                src={group.video_link}
                                                style={styles.videoPlayerPreview}
                                            >
                                                متصفحك لا يدعم هذا الفيديو.
                                            </video>
                                        )}

                                    </div>
                                    <div style={styles.groupActions}>
                                        <button
                                            onClick={() => confirmDeleteGroup(group._id || categoryTitle, categoryTitle || 'Groupe Inconnu')}
                                            style={styles.deleteGroupBtn}
                                            title="Supprimer ce groupe de cours"
                                        >
                                            <FaTrash /> Supprimer
                                        </button>
                                    </div>
                                </div>

                                <div style={{ marginTop: '10px' }}>
                                    {group.subCategories.map((subTitle, idx) => (
                                        <span key={idx} style={styles.courseBadge}>
                                            {subTitle}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}


            {/* 📱 Media Queries Inline */}
            <style>
                {`
                    @media (max-width: 768px) {
                        div[style*="modalInner"] {
                            padding: 15px !important;
                            margin: 5px;
                        }
                        h2 {
                            font-size: 1.3rem !important;
                        }
                        h3 {
                            font-size: 1.2rem !important;
                        }
                        button, a.action-button {
                            font-size: 0.9rem !important;
                            padding: 10px 16px !important;
                            width: 100%;
                            box-sizing: border-box;
                        }
                        input, select {
                            font-size: 0.9rem !important;
                            padding: 10px !important;
                        }
                        div[style*="groupHeader"] {
                            flex-direction: column;
                            align-items: stretch;
                        }
                        div[style*="groupActions"] {
                            margin-top: 10px;
                            flex-direction: column;
                            gap: 5px;
                        }
                        div[style*="optionModalContent"] {
                            padding: 15px !important;
                        }
                    }
                `}
            </style>
        </div>
    );
}