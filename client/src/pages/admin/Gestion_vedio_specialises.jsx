// GestionVedioSpecialises.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes, FaPlus, FaTrash, FaEdit, FaVideo, FaSave, FaExclamationTriangle } from 'react-icons/fa'; 

const VIDEOS_API_URL = 'http://localhost:3000/api/specialized-videos';
const COURSES_API_URL = 'http://localhost:3000/api/specialized-courses';

// --- 1. ثوابت الأنماط (Styles Constants) ---
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
    form: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        padding: '20px',
        marginBottom: '20px',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        background: '#ffffff',
    },
    fullWidth: {
        gridColumn: '1 / -1',
    },
    input: {
        padding: '12px',
        border: '1px solid #ced4da',
        borderRadius: '6px',
        fontSize: '1rem',
        transition: 'border-color 0.2s',
    },
    select: {
        padding: '12px',
        border: '1px solid #ced4da',
        borderRadius: '6px',
        fontSize: '1rem',
        backgroundColor: '#fff',
    },
    buttonGroup: {
        display: 'flex',
        gap: '10px',
        gridColumn: '1 / -1',
        marginTop: '10px',
    },
    addButton: {
        padding: '12px 20px',
        border: 'none',
        borderRadius: '6px',
        fontWeight: 'bold',
        cursor: 'pointer',
        color: 'white',
        backgroundColor: '#28a745', // Vert pour ajouter
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
    videoDetails: {
        flexGrow: 1,
        marginRight: '20px',
    },
    actionButton: {
        background: 'none',
        border: 'none',
        fontSize: '1.1rem',
        cursor: 'pointer',
        marginLeft: '10px',
        transition: 'color 0.2s',
    },
    videoPlayer: {
        width: '180px',
        height: '100px',
        borderRadius: '4px',
        backgroundColor: '#000',
        objectFit: 'cover',
        marginRight: '15px',
    },
    // 🆕 Styles pour la fenêtre de confirmation personnalisée
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
    }
};

export default function GestionVedioSpecialises({ onClose }) {
    const [videos, setVideos] = useState([]);
    const [videoFile, setVideoFile] = useState(null); 
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);
    const [currentVideoUrl, setCurrentVideoUrl] = useState(''); 
    // 🆕 حالة نافذة التأكيد
    const [confirmDialog, setConfirmDialog] = useState(null); 


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

    const resetForm = () => {
        setVideoFile(null);
        setTitle('');
        setDescription('');
        setCategory('');
        setEditingId(null);
        setCurrentVideoUrl('');
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        if (!editingId && (!videoFile || !title || !category)) {
            setError("Veuillez sélectionner un fichier vidéo، un titre et une catégorie.");
            return;
        }

        const formData = new FormData();
        
        if (videoFile) {
            formData.append('videoFile', videoFile); 
        } 
        
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category', category);

        try {
            if (editingId) {
                await axios.put(`${VIDEOS_API_URL}/${editingId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await axios.post(VIDEOS_API_URL, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
            
            resetForm();
            fetchVideos();
        } catch (err) {
            const message = err.response?.data?.message || "Erreur serveur lors de l'opération.";
            setError(message);
            console.error(err);
        }
    };

    // 🆕 دالة لفتح نافذة التأكيد
    const confirmDelete = (id, title) => {
        setConfirmDialog({ id, title });
    };

    // 🗑️ دالة الحذف الفعلية
    const handleDelete = async (id) => {
        setConfirmDialog(null); // إغلاق نافذة التأكيد
        try {
            await axios.delete(`${VIDEOS_API_URL}/${id}`); 
            fetchVideos();
        } catch (err) { 
            setError(err.response?.data?.message || "Erreur lors de la suppression.");
            console.error(err); 
        }
    };

    const handleEdit = (video) => {
        setEditingId(video._id);
        setTitle(video.title);
        setDescription(video.description || '');
        setCategory(video.category);
        setCurrentVideoUrl(video.url); 
        setVideoFile(null);
    };
    
    const handleCancelEdit = () => {
        resetForm();
    };

    // 🆕 مكون نافذة التأكيد
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
                        style={{...styles.confirmButtonBase, ...styles.confirmNo}}
                    >
                        Annuler
                    </button>
                    <button 
                        onClick={onConfirm} 
                        style={{...styles.confirmButtonBase, ...styles.confirmYes}}
                    >
                        Oui, Supprimer
                    </button>
                </div>
            </div>
        </div>
    );


    return (
        <div style={styles.modalContainer}>
            
            {/* 🆕 AFFICHER LA FENÊTRE DE CONFIRMATION */}
            {confirmDialog && (
                <ConfirmationDialog
                    itemTitle={confirmDialog.title}
                    onConfirm={() => handleDelete(confirmDialog.id)}
                    onCancel={() => setConfirmDialog(null)}
                />
            )}
            
            <div style={styles.modalHeader}>
                <h2 style={styles.title}><FaVideo style={{ marginRight: '0.5rem', color: primaryBlue }}/> Gestion des Vidéos Spécialisées</h2>
                <button onClick={onClose} style={styles.actionButton} className="close-button" title="Fermer"><FaTimes color="#dc3545" /></button>
            </div>
            
            {error && <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '10px', borderRadius: '6px', marginBottom: '15px' }}>{error}</div>}

            {/* --- Formulaire d'Ajout / Modification --- */}
            <form onSubmit={handleSubmit} style={styles.form}>
                
                <div style={styles.fullWidth}>
                    <label style={{ fontWeight: '600', display: 'block', marginBottom: '5px', color: '#495057' }}>
                        {editingId ? "Remplacer le fichier vidéo (facultatif)" : "Fichier Vidéo (obligatoire)"} :
                    </label>
                    <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => setVideoFile(e.target.files[0])}
                        required={!editingId} 
                        style={{...styles.input, paddingTop: '10px', paddingBottom: '10px', background: '#f8f9fa'}}
                    />
                    {editingId && <p style={{ fontSize: '0.9em', color: '#6c757d', marginTop: '5px' }}>المسار الحالي: {currentVideoUrl}</p>}
                </div>
                
                <input
                    type="text"
                    placeholder="Titre de la vidéo (Ex: Leçon 1 - La Base)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    style={styles.input}
                />
                <input
                    type="text"
                    placeholder="Description courte (facultatif)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={styles.input}
                />

                <select value={category} onChange={(e) => setCategory(e.target.value)} required style={styles.select}>
                    <option value="">-- Choisir une catégorie (Cours parent) --</option>
                    {categories.map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                    ))}
                </select>

                <div style={styles.buttonGroup}>
                    <button type="submit" style={{...styles.addButton, backgroundColor: editingId ? '#ffc107' : '#28a745'}}>
                        {editingId ? <FaSave style={{ marginRight: '0.5rem' }}/> : <FaPlus style={{ marginRight: '0.5rem' }}/>} {editingId ? "Sauvegarder les Modifications" : "Téléverser et Ajouter"}
                    </button>
                    {editingId && (
                        <button type="button" onClick={handleCancelEdit} style={styles.cancelButton}>
                            Annuler l'Édition
                        </button>
                    )}
                </div>
            </form>

            {/* --- Liste des Vidéos Existantes --- */}
            <h3 style={styles.listTitle}>Vidéos en ligne ({videos.length})</h3>
            
            <div className="videos-list">
                {videos.length > 0 ? videos.map(video => (
                    <div key={video._id} style={styles.videoItem}>
                        
                        <video
                            controls
                            src={`http://localhost:3000${video.url}`} 
                            style={styles.videoPlayer}
                            onContextMenu={(e) => e.preventDefault()}
                            controlsList="nodownload"
                            muted
                        >
                            متصفحك لا يدعم الفيديو.
                        </video>

                        <div style={styles.videoDetails}>
                            <div style={{fontWeight: 'bold', color: primaryBlue, marginBottom: '5px'}}>{video.title}</div>
                            <div style={{fontSize: '0.9em', color: '#6c757d', marginBottom: '5px'}}>Catégorie: {video.category}</div>
                            <p style={{ margin: '0', fontSize: '0.95em' }}>{video.description}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <button onClick={() => handleEdit(video)} title="Modifier la vidéo" style={{...styles.actionButton, color: '#ffc107'}}><FaEdit /></button>
                            {/* 🆕 APPEL À LA FENÊTRE DE CONFIRMATION PERSONNALISÉE */}
                            <button onClick={() => confirmDelete(video._id, video.title)} title="Supprimer la vidéo et le fichier" style={{...styles.actionButton, color: dangerRed}}><FaTrash /></button>
                        </div>
                    </div>
                )) : (
                    <p style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
                        Aucune vidéo spécialisée n'est encore enregistrée.
                    </p>
                )}
            </div>
        </div>
    );
}