import React, { useState, useEffect } from 'react';
import NavbarAdmin from '../../comp/Navbar_admin';
import { FaVideo, FaTrash, FaEdit, FaSave, FaTimes, FaCloudUploadAlt, FaExclamationCircle, FaSpinner, FaPlus, FaPlay } from 'react-icons/fa';
import BASE_URL from '../../apiConfig';
import { useAlert } from '../../context/AlertContext';

export default function Gestion_de_Vidéo() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newVideoData, setNewVideoData] = useState({ titre: '', description: '', categorie: '' });
    const [newVideoFile, setNewVideoFile] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [currentEditFile, setCurrentEditFile] = useState(null);
    const { showAlert } = useAlert();

    const categoriesList = ["Tutoriel", "Cours", "Actualités", "Divertissement", "Autre"];

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/videos`);
            if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
            const data = await response.json();
            setVideos(data);
        } catch (err) {
            showAlert('error', 'Erreur', 'Échec du chargement des vidéos.');
        } finally {
            setLoading(false);
        }
    };

    const handleDataChange = (e) => {
        const { name, value } = e.target;
        setNewVideoData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setNewVideoFile(e.target.files[0]);
    };

    const handleAddVideo = async (e) => {
        e.preventDefault();
        if (!newVideoFile || !newVideoData.titre || !newVideoData.categorie) {
            showAlert('error', 'Erreur', 'Veuillez remplir tous les champs obligatoires.');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('titre', newVideoData.titre);
        formData.append('description', newVideoData.description);
        formData.append('categorie', newVideoData.categorie);
        formData.append('videoFile', newVideoFile);

        try {
            const response = await fetch(`${BASE_URL}/api/videos`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Échec de l'ajout.");
            setVideos(prev => [data, ...prev]);
            setNewVideoData({ titre: '', description: '', categorie: '' });
            setNewVideoFile(null);
            showAlert('success', 'Succès', 'Vidéo ajoutée avec succès !');
        } catch (err) {
            showAlert('error', 'Erreur', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteVideo = (video) => {
        showAlert('confirm', 'Supprimer Vidéo', `Voulez-vous supprimer "${video.titre}" ?`, async () => {
            setLoading(true);
            try {
                const response = await fetch(`${BASE_URL}/api/videos/${video._id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Échec de la suppression.');
                setVideos(prev => prev.filter(v => v._id !== video._id));
                showAlert('success', 'Succès', 'Vidéo supprimée.');
            } catch (err) {
                showAlert('error', 'Erreur', err.message);
            } finally {
                setLoading(false);
            }
        });
    };

    const handleUpdateVideo = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append('titre', currentVideo.titre);
        formData.append('description', currentVideo.description);
        formData.append('categorie', currentVideo.categorie);
        if (currentEditFile) formData.append('videoFile', currentEditFile);

        try {
            const response = await fetch(`${BASE_URL}/api/videos/${currentVideo._id}`, {
                method: 'PUT',
                body: formData,
            });
            const updatedVideo = await response.json();
            if (!response.ok) throw new Error(updatedVideo.message || "Échec.");
            setVideos(prev => prev.map(v => v._id === updatedVideo._id ? updatedVideo : v));
            showAlert('success', 'Succès', 'Vidéo mise à jour !');
            setIsEditModalOpen(false);
        } catch (err) {
            showAlert('error', 'Erreur', err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <NavbarAdmin />

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.2rem', color: '#1e293b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FaVideo style={{ color: '#D4AF37' }} /> Gestion de Vidéothèque
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '10px' }}>Gérez les vidéos publiées sur la plateforme.</p>
                </div>

                <div className="premium-card" style={{ padding: '30px', marginBottom: '40px' }}>
                    <h3 style={{ marginBottom: '25px', color: '#1e293b', borderLeft: '4px solid #D4AF37', paddingLeft: '15px' }}>Ajouter une Vidéo</h3>
                    <form onSubmit={handleAddVideo} className="premium-form-grid">
                        <div className="premium-form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Titre *</label>
                            <input type="text" name="titre" value={newVideoData.titre} onChange={handleDataChange} required />
                        </div>
                        <div className="premium-form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Catégorie *</label>
                            <select name="categorie" value={newVideoData.categorie} onChange={handleDataChange} required>
                                <option value="">-- Choisir --</option>
                                {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="premium-form-group" style={{ gridColumn: 'span 4' }}>
                            <label>Fichier Vidéo *</label>
                            <div style={{ position: 'relative' }}>
                                <input type="file" accept="video/*" onChange={handleFileChange} style={{ padding: '10px' }} required />
                                {newVideoFile && <div style={{ fontSize: '0.8rem', color: '#D4AF37', marginTop: '5px' }}>Sélectionné : {newVideoFile.name}</div>}
                            </div>
                        </div>
                        <div className="premium-form-group" style={{ gridColumn: 'span 4' }}>
                            <label>Description</label>
                            <textarea name="description" value={newVideoData.description} onChange={handleDataChange} rows="3" />
                        </div>
                        <div style={{ gridColumn: 'span 4' }}>
                            <button type="submit" disabled={loading} className="premium-btn-cta gold" style={{ width: '100%', padding: '15px' }}>
                                {loading ? <FaSpinner className="spinner" /> : <FaCloudUploadAlt />} Enregistrer la Vidéo
                            </button>
                        </div>
                    </form>
                </div>

                <div className="premium-list-container">
                    <h3 style={{ marginBottom: '30px', color: '#1e293b', borderLeft: '4px solid #D4AF37', paddingLeft: '15px' }}>
                        Galerie ({videos.length})
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                        {videos.map(video => (
                            <div key={video._id} className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
                                <div style={{ position: 'relative', background: '#000', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <video
                                        src={`${BASE_URL}/api/videos/stream/${video._id}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        controlsList="nodownload"
                                        muted
                                    />
                                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(212, 175, 55, 0.9)', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                        {video.categorie}
                                    </div>
                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.5 }}>
                                        <FaPlay size={30} color="#fff" />
                                    </div>
                                </div>
                                <div style={{ padding: '20px' }}>
                                    <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>{video.titre}</h4>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 20px 0', height: '40px', overflow: 'hidden' }}>{video.description}</p>
                                    <div className="premium-btn-group" style={{ gap: '10px' }}>
                                        <button onClick={() => { setCurrentVideo(video); setIsEditModalOpen(true); }} className="premium-btn-cta secondary" style={{ flex: 1, padding: '8px' }}><FaEdit /> Editer</button>
                                        <button onClick={() => handleDeleteVideo(video)} className="premium-btn-cta secondary" style={{ flex: 1, padding: '8px', color: '#ef4444', borderColor: '#fecaca' }}><FaTrash /> Supprimer</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {videos.length === 0 && !loading && (
                        <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '20px', color: '#64748b', border: '2px dashed #e2e8f0' }}>
                            Aucune vidéo trouvée.
                        </div>
                    )}
                </div>
            </div>

            {isEditModalOpen && currentVideo && (
                <div className="premium-modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
                    <div className="premium-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="premium-modal-header">
                            <h3 className="premium-modal-title">Modifier Vidéo</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="premium-modal-close-icon"><FaTimes /></button>
                        </div>
                        <form onSubmit={handleUpdateVideo} className="premium-form-grid" style={{ marginTop: '25px' }}>
                            <div className="premium-form-group" style={{ gridColumn: 'span 4' }}>
                                <label>Titre</label>
                                <input type="text" value={currentVideo.titre} onChange={e => setCurrentVideo({ ...currentVideo, titre: e.target.value })} required />
                            </div>
                            <div className="premium-form-group" style={{ gridColumn: 'span 4' }}>
                                <label>Catégorie</label>
                                <select value={currentVideo.categorie} onChange={e => setCurrentVideo({ ...currentVideo, categorie: e.target.value })} required>
                                    {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div className="premium-form-group" style={{ gridColumn: 'span 4' }}>
                                <label>Remplacer le fichier (optionnel)</label>
                                <input type="file" accept="video/*" onChange={e => setCurrentEditFile(e.target.files[0])} />
                            </div>
                            <div className="premium-form-group" style={{ gridColumn: 'span 4' }}>
                                <label>Description</label>
                                <textarea value={currentVideo.description} onChange={e => setCurrentVideo({ ...currentVideo, description: e.target.value })} rows="3" />
                            </div>
                            <div className="premium-btn-group" style={{ gridColumn: 'span 4', marginTop: '20px' }}>
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="premium-btn-cta secondary">Annuler</button>
                                <button type="submit" disabled={loading} className="premium-btn-cta gold">
                                    {loading ? <FaSpinner className="spinner" /> : <FaSave />} Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
