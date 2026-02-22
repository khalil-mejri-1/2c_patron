import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes, FaPlus, FaTrash, FaEdit, FaVideo, FaSave, FaExclamationTriangle, FaSpinner, FaLink } from 'react-icons/fa';
import BASE_URL from '../../apiConfig';

const VIDEOS_API_URL = `${BASE_URL}/api/specialized-videos`;
const COURSES_API_URL = `${BASE_URL}/api/specialized-courses`;

// ----------------------------------------------------------------
// --- 1. مكون VideoFormModal ---
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

    useEffect(() => {
        if (initialVideo) {
            setTitle(initialVideo.title || '');
            setDescription(initialVideo.description || '');
            setCategory(initialVideo.category || '');
            setCurrentVideoUrl(initialVideo.url || '');
        } else {
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
        const videoData = { title, description, category, videoUrl: currentVideoUrl };

        try {
            if (isEditing) {
                await axios.put(`${VIDEOS_API_URL}/${initialVideo._id}`, videoData);
            } else {
                await axios.post(VIDEOS_API_URL, videoData);
            }
            onSaveSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de l'opération.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="premium-modal-backdrop" onClick={onClose}>
            <div className="premium-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div className="premium-modal-header">
                    <h2 className="premium-modal-title">
                        <FaVideo style={{ marginRight: '10px', color: '#D4AF37' }} />
                        {isEditing ? `Modifier : ${initialVideo.title}` : "Nouvelle Vidéo"}
                    </h2>
                    <button onClick={onClose} className="premium-modal-close-icon"><FaTimes /></button>
                </div>

                {error && <div className="premium-error-alert" style={{ marginBottom: '20px' }}>{error}</div>}

                <form onSubmit={handleSubmit} className="premium-form-grid">
                    <div className="premium-form-group" style={{ gridColumn: '1 / -1' }}>
                        <label>URL de la Vidéo *</label>
                        <div style={{ position: 'relative' }}>
                            <FaLink style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#D4AF37' }} />
                            <input
                                type="text"
                                placeholder="https://example.com/video.mp4"
                                value={currentVideoUrl}
                                onChange={(e) => setCurrentVideoUrl(e.target.value)}
                                style={{ paddingLeft: '40px' }}
                                required
                            />
                        </div>
                    </div>

                    <div className="premium-form-group">
                        <label>Titre *</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Titre de la vidéo" />
                    </div>

                    <div className="premium-form-group">
                        <label>Catégorie *</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                            <option value="">-- Choisir --</option>
                            {categories.map((cat, idx) => (
                                <option key={idx} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="premium-form-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Description</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description facultative" style={{ minHeight: '100px' }} />
                    </div>

                    <div className="premium-btn-group" style={{ gridColumn: '1 / -1' }}>
                        <button type="button" onClick={onClose} className="premium-btn-cta secondary">Annuler</button>
                        <button type="submit" disabled={isSubmitting} className="premium-btn-cta gold">
                            {isSubmitting ? <FaSpinner className="spinner" /> : (isEditing ? <FaSave /> : <FaPlus />)}
                            {isEditing ? "Enregistrer" : "Ajouter"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------
// --- 2. المكون الأب: GestionVedioSpecialises ---
// ----------------------------------------------------------------
export default function GestionVedioSpecialises({ onClose }) {
    const [videos, setVideos] = useState([]);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [videoToEdit, setVideoToEdit] = useState(null);

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

    const handleAdd = () => {
        setVideoToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (video) => {
        setVideoToEdit(video);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        setConfirmDialog(null);
        try {
            await axios.delete(`${VIDEOS_API_URL}/${id}`);
            fetchVideos();
        } catch (err) {
            setError("Erreur lors de la suppression.");
        }
    };

    return (
        <div style={{ padding: '30px' }}>
            <VideoFormModal
                isVisible={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSaveSuccess={fetchVideos}
                initialVideo={videoToEdit}
                categories={categories}
            />

            {confirmDialog && (
                <div className="premium-modal-backdrop" onClick={() => setConfirmDialog(null)}>
                    <div className="premium-modal-content" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ textAlign: 'center' }}>
                            <FaExclamationTriangle style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '15px' }} />
                            <h3 className="premium-modal-title">Confirmation</h3>
                            <p style={{ color: '#64748b' }}>Supprimer la vidéo <strong>"{confirmDialog.title}"</strong> ? Cette action est irréversible.</p>
                        </div>
                        <div className="premium-btn-group" style={{ marginTop: '25px' }}>
                            <button onClick={() => setConfirmDialog(null)} className="premium-btn-cta secondary">Annuler</button>
                            <button onClick={() => handleDelete(confirmDialog.id)} className="premium-btn-cta gold" style={{ background: '#ef4444', borderColor: '#dc2626' }}>Oui, Supprimer</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="premium-modal-header" style={{ marginBottom: '30px' }}>
                <h2 className="premium-modal-title">
                    <FaVideo style={{ marginRight: '10px', color: '#D4AF37' }} /> Gestion des Vidéos Spécialisées
                </h2>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <button onClick={handleAdd} className="premium-btn-cta gold" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
                        <FaPlus /> Ajouter
                    </button>
                    <button onClick={onClose} className="premium-modal-close-icon"><FaTimes /></button>
                </div>
            </div>

            {error && <div className="premium-error-alert" style={{ marginBottom: '20px' }}>{error}</div>}

            <div className="premium-list-container">
                <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginBottom: '20px', borderLeft: '4px solid #D4AF37', paddingLeft: '12px' }}>
                    Vidéos en ligne ({videos.length})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {videos.length > 0 ? videos.map(video => {
                        const videoSrc = video.url && (video.url.startsWith('http') || video.url.startsWith('https'))
                            ? video.url
                            : `${BASE_URL}${video.url}`;

                        return (
                            <div key={video._id} className="premium-list-item" style={{ background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                <div style={{ width: '200px', flexShrink: 0 }}>
                                    <video
                                        controls
                                        src={videoSrc}
                                        style={{ width: '100%', borderRadius: '8px', background: '#000', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                        controlsList="nodownload"
                                        muted
                                    />
                                </div>

                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>{video.title}</h4>
                                    <span style={{ fontSize: '0.8rem', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>{video.category}</span>
                                    <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem', color: '#64748b', lineHeight: '1.4' }}>{video.description}</p>
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => handleEdit(video)} className="premium-btn-cta secondary" style={{ padding: '8px', minWidth: 'auto', background: '#fef3c7', color: '#d97706', borderColor: '#fde68a' }}>
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => setConfirmDialog({ id: video._id, title: video.title })} className="premium-btn-cta secondary" style={{ padding: '8px', minWidth: 'auto', background: '#fee2e2', color: '#ef4444', borderColor: '#fecaca' }}>
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        );
                    }) : (
                        <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0', color: '#64748b' }}>
                            Aucune vidéo trouvée.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}