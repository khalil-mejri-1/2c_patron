import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes, FaPlus, FaTrash, FaEdit, FaVideo, FaSave, FaExclamationTriangle, FaSpinner, FaLink } from 'react-icons/fa';

// --- الثوابت المشتركة (Shared Constants) ---
const dangerRed = '#dc3545';
const primaryBlue = '#007bff';
import BASE_URL from '../../apiConfig';
const VIDEOS_API_URL = `${BASE_URL}/api/specialized-videos`;

// --- الأنماط المشتركة (Shared Styles) ---
const modalStyles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 3000,
        padding: '20px',
    },
    modalContent: {
        background: '#ffffff',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 15px 40px rgba(0, 0, 0, 0.25)',
        maxWidth: '650px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        animation: 'fadeIn 0.3s ease-out',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '25px',
        borderBottom: '2px solid #e9ecef',
        paddingBottom: '15px',
    },
    title: {
        color: '#343a40',
        fontSize: '1.5rem',
        margin: 0,
        display: 'flex',
        alignItems: 'center',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '15px',
    },
    input: {
        padding: '12px',
        border: '1px solid #ced4da',
        borderRadius: '6px',
        fontSize: '1rem',
        width: '100%',
        boxSizing: 'border-box',
    },
    select: {
        padding: '12px',
        border: '1px solid #ced4da',
        borderRadius: '6px',
        fontSize: '1rem',
        backgroundColor: '#fff',
        width: '100%',
        boxSizing: 'border-box',
    },
    buttonGroup: {
        display: 'flex',
        gap: '10px',
        marginTop: '20px',
    },
    actionButton: {
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
        transition: 'color 0.2s',
    },
    submitButton: {
        padding: '12px 20px',
        border: 'none',
        borderRadius: '6px',
        fontWeight: 'bold',
        cursor: 'pointer',
        color: 'white',
        backgroundColor: primaryBlue, // Base Blue
        transition: 'background-color 0.2s',
        flexGrow: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        padding: '12px 20px',
        border: 'none',
        borderRadius: '6px',
        fontWeight: 'bold',
        cursor: 'pointer',
        color: 'white',
        backgroundColor: '#6c757d',
        transition: 'background-color 0.2s',
    },
    disabled: {
        cursor: 'not-allowed',
        opacity: 0.7,
        filter: 'grayscale(30%)',
    },
    // CSS for responsiveness on smaller screens
    '@media (min-width: 500px)': {
        formGrid: {
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        },
        fullWidth: {
            gridColumn: '1 / -1',
        },
    }
};

// ----------------------------------------------------------------
// --- 2. مكون VideoFormModal ---
// ----------------------------------------------------------------
export function VideoFormModal({ isVisible, onClose, onSaveSuccess, initialVideo, categories }) {
    if (!isVisible) return null;

    const isEditing = initialVideo && initialVideo._id;
    const [title, setTitle] = useState(initialVideo?.title || '');
    const [description, setDescription] = useState(initialVideo?.description || '');
    const [category, setCategory] = useState(initialVideo?.category || '');
    const [currentVideoUrl, setCurrentVideoUrl] = useState(initialVideo?.url || '');
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // تحديث الحالة عند تغيير الفيديو الأولي (عند فتح نموذج فيديو مختلف)
    useEffect(() => {
        if (initialVideo) {
            setTitle(initialVideo.title || '');
            setDescription(initialVideo.description || '');
            setCategory(initialVideo.category || '');
            setCurrentVideoUrl(initialVideo.url || '');
        } else {
            // حالة الإضافة الجديدة
            setTitle('');
            setDescription('');
            setCategory('');
            setCurrentVideoUrl('');
        }
        setError(null);
        setIsSubmitting(false);
    }, [initialVideo]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!currentVideoUrl || !title || !category) {
            setError("Veuillez saisir l'URL de la vidéo, le titre et la catégorie.");
            return;
        }

        setIsSubmitting(true);

        const videoData = {
            title,
            description,
            category,
            videoUrl: currentVideoUrl,
        };

        try {
            if (isEditing) {
                await axios.put(`${VIDEOS_API_URL}/${initialVideo._id}`, videoData, {
                    headers: { 'Content-Type': 'application/json' },
                });
            } else {
                await axios.post(VIDEOS_API_URL, videoData, {
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            onSaveSuccess(); // لإعادة تحميل البيانات في المكون الأب
            onClose(); // إغلاق النافذة المنبثقة

        } catch (err) {
            const message = err.response?.data?.message || "Erreur serveur lors de l'opération. Assurez-vous que l'URL est valide.";
            setError(message);
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const submitButtonContent = isSubmitting ? (
        <>
            <FaSpinner className="spinner" style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
            {"Sauvegarde..."}
        </>
    ) : (
        <>
            {isEditing ? <FaSave style={{ marginRight: '0.5rem' }} /> : <FaPlus style={{ marginRight: '0.5rem' }} />}
            {isEditing ? "Sauvegarder les Modifications" : "Ajouter la Vidéo par URL"}
        </>
    );

    return (
        <div style={modalStyles.overlay}>
            <div style={modalStyles.modalContent}>
                <div style={modalStyles.header}>
                    <h2 style={modalStyles.title}>
                        <FaVideo style={{ marginRight: '0.5rem', color: primaryBlue }} />
                        {isEditing ? `Modifier : ${initialVideo.title}` : "Ajouter une Nouvelle Vidéo"}
                    </h2>
                    <button onClick={onClose} style={{ ...modalStyles.actionButton, color: dangerRed }} title="Fermer">
                        <FaTimes />
                    </button>
                </div>

                {error && <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '10px', borderRadius: '6px', marginBottom: '15px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ ...modalStyles.formGrid, ...(window.innerWidth < 500 ? {} : modalStyles['@media (min-width: 500px)'].formGrid) }}>

                        {/* Champ URL de la Vidéo (Full Width) */}
                        <div style={modalStyles['@media (min-width: 500px)'].fullWidth}>
                            <label style={{ fontWeight: '600', display: 'block', marginBottom: '5px', color: '#495057' }}>
                                URL de la Vidéo (Obligatoire) :
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #ced4da' }}>
                                <FaLink style={{ marginLeft: '12px', color: primaryBlue }} />
                                <input
                                    type="text"
                                    placeholder="Ex: https://example.com/ma-video.mp4"
                                    value={currentVideoUrl}
                                    onChange={(e) => setCurrentVideoUrl(e.target.value)}
                                    required
                                    style={{ ...modalStyles.input, flexGrow: 1, border: 'none', background: 'transparent' }}
                                    disabled={isSubmitting}
                                />
                            </div>
                            {isEditing && <p style={{ fontSize: '0.9em', color: '#6c757d', marginTop: '5px' }}>Modifier l'URL uniquement si le fichier a changé d'emplacement.</p>}
                        </div>

                        {/* Titre */}
                        <input
                            type="text"
                            placeholder="Titre de la vidéo (Ex: Leçon 1 - La Base)"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            style={modalStyles.input}
                            disabled={isSubmitting}
                        />

                        {/* الفئة */}
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                            style={modalStyles.select}
                            disabled={isSubmitting}
                        >
                            <option value="">-- Choisir une catégorie --</option>
                            {categories.map((cat, idx) => (
                                <option key={idx} value={cat}>{cat}</option>
                            ))}
                        </select>

                        {/* الوصف (Full Width) */}
                        <div style={modalStyles['@media (min-width: 500px)'].fullWidth}>
                            <textarea
                                placeholder="Description courte (facultatif)"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                style={{ ...modalStyles.input, resize: 'vertical', minHeight: '80px' }}
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* أزرار الإرسال والإلغاء (Full Width) */}
                        <div style={{ ...modalStyles.buttonGroup, ...modalStyles['@media (min-width: 500px)'].fullWidth }}>
                            <button
                                type="submit"
                                style={{
                                    ...modalStyles.submitButton,
                                    backgroundColor: isEditing ? '#ffc107' : '#28a745', // Jaune pour Modifier, Vert pour Ajouter
                                    ...(isSubmitting ? modalStyles.disabled : {})
                                }}
                                disabled={isSubmitting}
                            >
                                {submitButtonContent}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                style={modalStyles.cancelButton}
                                disabled={isSubmitting}
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------
// --- 3. المكون الأب: GestionVedioSpecialises (مع تحديثات الحالة) ---
// ----------------------------------------------------------------

// قم بتغيير اسم المكون الأب إذا أردت تضمين المكون الجديد في نفس الملف
// أو تأكد من استيراد المكون الجديد: import { VideoFormModal } from './VideoFormModal'; 

export default function GestionVedioSpecialises({ onClose }) {
    const [videos, setVideos] = useState([]);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState(null);

    // 🆕 حالة لإدارة ظهور النموذج المنبثق
    const [isModalOpen, setIsModalOpen] = useState(false);
    // 🆕 حالة لتخزين بيانات الفيديو الذي يتم تعديله (null للإضافة)
    const [videoToEdit, setVideoToEdit] = useState(null);

    const COURSES_API_URL = `${BASE_URL}/api/specialized-courses`;
    const VIDEOS_API_URL = `${BASE_URL}/api/specialized-videos`;


    useEffect(() => {
        fetchVideos();
        fetchCategories();
    }, []);

    const fetchVideos = async () => {
        try {
            const res = await axios.get(VIDEOS_API_URL);
            setVideos(res.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Erreur lors du chargement des vidéos.");
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get(COURSES_API_URL);
            const uniqueCategories = Array.from(new Set(res.data.flatMap(g => g.courses.map(c => c.title))));
            setCategories(uniqueCategories);
        } catch (err) {
            console.error(err);
        }
    };

    // 🆕 دالة لفتح النموذج للإضافة
    const handleAdd = () => {
        setVideoToEdit(null); // تأكد من أنه فارغ للإضافة
        setIsModalOpen(true);
    };

    // 🆕 دالة لفتح النموذج للتعديل (تستبدل handleEdit القديمة)
    const handleEdit = (video) => {
        setVideoToEdit(video); // تعيين الفيديو المراد تعديله
        setIsModalOpen(true);
    };

    // دالة لغلق النموذج المنبثق
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setVideoToEdit(null); // مسح البيانات عند الإغلاق
    };

    // دالة لفتح نافذة التأكيد
    const confirmDelete = (id, title) => {
        setConfirmDialog({ id, title });
    };

    // دالة الحذف الفعلية
    const handleDelete = async (id) => {
        setConfirmDialog(null);
        try {
            await axios.delete(`${VIDEOS_API_URL}/${id}`);
            fetchVideos();
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de la suppression.");
            console.error(err);
        }
    };

    // مكون نافذة التأكيد (ConfirmationDialog) كما كان سابقاً
    const ConfirmationDialog = ({ onConfirm, onCancel, itemTitle }) => (
        <div style={styles.confirmOverlay}>
            <div style={styles.confirmBox}>
                <h3 style={styles.confirmTitle}>
                    <FaExclamationTriangle size={24} /> Confirmation de Suppression
                </h3>
                <p style={styles.confirmText}>
                    Êtes-vous sûr de vouloir supprimer la vidéo **"{itemTitle}"** ? Cela supprimera également le fichier sur le serveur.
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


    // ... (هنا يجب وضع الأنماط styles من الكود الأصلي) ...

    // --- 1. ثوابت الأنماط (Styles Constants) من الكود الأصلي ---
    const dangerRed = '#dc3545';
    const primaryBlue = '#007bff';

    const styles = {
        modalContainer: {
            background: '#f8f9fa',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            maxWidth: '900px',
            width: '100%',
            margin: '20px auto',
        },
        modalHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '25px',
            borderBottom: '2px solid #e9ecef',
            paddingBottom: '15px',
        },
        title: {
            color: '#343a40',
            fontSize: '1.8rem',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
        },
        actionButton: {
            background: 'none',
            border: 'none',
            fontSize: '1.1rem',
            cursor: 'pointer',
            marginLeft: '10px',
            transition: 'color 0.2s',
        },
        listTitle: {
            fontSize: '1.5rem',
            color: '#495057',
            borderLeft: `4px solid ${primaryBlue}`,
            paddingLeft: '10px',
            marginBottom: '15px',
        },
        videoItem: {
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '10px',
            padding: '15px',
            borderRadius: '8px',
            background: '#ffffff',
            borderLeft: '5px solid #28a745',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
        },
        videoPlayer: {
            width: '180px',
            height: '100px',
            borderRadius: '4px',
            backgroundColor: '#000',
            objectFit: 'cover',
            marginRight: '15px',
        },
        videoDetails: {
            flexGrow: 1,
            marginRight: '20px',
        },
        // Styles pour la fenêtre de confirmation personnalisée
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
            zIndex: 2000,
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
            color: dangerRed,
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
            backgroundColor: dangerRed,
            color: 'white',
        },
        confirmNo: {
            backgroundColor: '#f8f9fa',
            color: '#495057',
            border: '1px solid #ced4da',
        },
    };


    // ... (نهاية الأنماط) ...


    return (
        <div style={styles.modalContainer}>

            {/* 🆕 نموذج الإضافة/التعديل المنبثق */}
            <VideoFormModal
                isVisible={isModalOpen}
                onClose={handleCloseModal}
                onSaveSuccess={fetchVideos} // لإعادة تحميل القائمة
                initialVideo={videoToEdit} // بيانات الفيديو (null للإضافة)
                categories={categories}
            />

            {/* AFFICHER LA FENÊTRE DE CONFIRMATION */}
            {confirmDialog && (
                <ConfirmationDialog
                    itemTitle={confirmDialog.title}
                    onConfirm={() => handleDelete(confirmDialog.id)}
                    onCancel={() => setConfirmDialog(null)}
                />
            )}

            <div style={styles.modalHeader}>
                <h2 style={styles.title}><FaVideo style={{ marginRight: '0.5rem', color: primaryBlue }} /> Gestion des Vidéos Spécialisées</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* 🆕 زر إضافة فيديو جديد يفتح النموذج المنبثق */}
                    <button
                        onClick={handleAdd}
                        style={{
                            ...styles.actionButton,
                            padding: '8px 15px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                        }}
                        title="Ajouter une nouvelle vidéo par URL"
                    >
                        <FaPlus style={{ marginRight: '5px' }} /> Ajouter
                    </button>
                    <button onClick={onClose} style={{ ...styles.actionButton, fontSize: '1.8rem' }} className="close-button" title="Fermer"><FaTimes color="#dc3545" /></button>
                </div>
            </div>

            {error && <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '10px', borderRadius: '6px', marginBottom: '15px' }}>{error}</div>}

            {/* --- ملاحظة: تم حذف النموذج المدمج (Inline Form) من هنا --- */}


            {/* --- Liste des Vidéos Existantes --- */}
            <h3 style={styles.listTitle}>Vidéos en ligne ({videos.length})</h3>

            <div className="videos-list">
                {videos.length > 0 ? videos.map(video => {
                    const videoSrc = video.url && (video.url.startsWith('http') || video.url.startsWith('https'))
                        ? video.url
                        : `${BASE_URL}${video.url}`;

                    return (
                        <div key={video._id} style={styles.videoItem}>

                            <video
                                controls
                                src={videoSrc}
                                style={styles.videoPlayer}
                                onContextMenu={(e) => e.preventDefault()}
                                controlsList="nodownload"
                                muted
                            >
                                متصفحك لا يدعم الفيديو.
                            </video>

                            <div style={styles.videoDetails}>
                                <div style={{ fontWeight: 'bold', color: primaryBlue, marginBottom: '5px' }}>{video.title}</div>
                                <div style={{ fontSize: '0.9em', color: '#6c757d', marginBottom: '5px' }}>Catégorie: {video.category}</div>
                                <p style={{ margin: '0', fontSize: '0.95em' }}>{video.description}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                {/* 🆕 استدعاء دالة handleEdit الجديدة لفتح النموذج المنبثق */}
                                <button onClick={() => handleEdit(video)} title="Modifier la vidéo" style={{ ...styles.actionButton, color: '#ffc107' }}><FaEdit /></button>
                                <button onClick={() => confirmDelete(video._id, video.title)} title="Supprimer la vidéo et le fichier" style={{ ...styles.actionButton, color: dangerRed }}><FaTrash /></button>
                            </div>
                        </div>
                    )
                }) : (
                    <p style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
                        Aucune vidéo spécialisée n'est encore enregistrée.
                    </p>
                )}
            </div>
        </div>
    );
}