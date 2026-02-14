import React, { useState, useEffect } from 'react';
import NavbarAdmin from '../../comp/Navbar_admin';
import '../admin_css/GestionDeVedio.css';
import BASE_URL from '../../apiConfig';

// 🚨 NOTE : Le serveur Node.js doit fonctionner sur ${BASE_URL} et être configuré pour recevoir des fichiers avec Multer.
// Assurez-vous également d'ajouter la ligne app.use('/uploads/videos', express.static(...)) pour servir les fichiers statiques.

export default function Gestion_de_Vidéo() {

    // -------------------- 1. États du Composant (States) --------------------
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);

    // États de l'Ajout (Upload)
    // 💡 Ajout de 'categorie' ici
    const [newVideoData, setNewVideoData] = useState({ titre: '', description: '', categorie: '' });
    const [newVideoFile, setNewVideoFile] = useState(null);

    // États de la Modification (Modal d'édition) - Le chemin du fichier (filePath) est stocké ici
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    // currentVideo contient maintenant titre, description, fileName, filePath, categorie
    const [currentVideo, setCurrentVideo] = useState(null);
    const [currentEditFile, setCurrentEditFile] = useState(null); // Pour stocker un nouveau fichier pour la mise à jour si nécessaire

    // États de la Confirmation (Modal de confirmation)
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [videoToDelete, setVideoToDelete] = useState(null);

    // État des Notifications (Notification/Toast)
    const [notification, setNotification] = useState({ message: '', type: '' });

    // 💡 Liste des catégories disponibles (pour la liste déroulante)
    const categoriesList = ["Tutoriel", "Cours", "Actualités", "Divertissement", "Autre"];

    // -------------------- 2. Fonctions Auxiliaires (Helper Functions) --------------------

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification({ message: '', type: '' });
        }, 3000);
    };

    // Ajout : Traitement des données texte et de la catégorie
    const handleDataChange = (e) => {
        const { name, value } = e.target;
        setNewVideoData(prev => ({ ...prev, [name]: value }));
    };

    // Ajout : Traitement du téléchargement de fichier
    const handleFileChange = (e) => {
        setNewVideoFile(e.target.files[0]);
    };

    // Modification : Ouverture de la fenêtre de modification
    const handleEditClick = (video) => {
        setCurrentVideo(video);
        setCurrentEditFile(null); // Réinitialisation du fichier de mise à jour
        setIsEditModalOpen(true);
    };

    // Modification : Fermeture de la fenêtre de modification
    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setCurrentVideo(null);
        setCurrentEditFile(null);
    };

    // Modification : Traitement du changement des champs de modification (Titre, Description & Catégorie)
    const handleEditDataChange = (e) => {
        const { name, value } = e.target;
        setCurrentVideo(prev => ({ ...prev, [name]: value }));
    };

    // Modification : Traitement du changement du nouveau champ de fichier (optionnel)
    const handleEditFileChange = (e) => {
        setCurrentEditFile(e.target.files[0]);
    };

    // Confirmation : Ouverture de la fenêtre de confirmation
    const handleOpenConfirm = (videoId) => {
        setVideoToDelete(videoId);
        setIsConfirmModalOpen(true);
    };

    // Confirmation : Fermeture de la fenêtre de confirmation
    const handleCloseConfirm = () => {
        setVideoToDelete(null);
        setIsConfirmModalOpen(false);
    };

    // -------------------- 3. Fonctions d'Appel au Serveur (API Calls) --------------------

    // 💡 Récupérer les Vidéos (GET)
    const fetchVideos = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/videos`);
            if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}. Vérifiez le serveur Node.js.`);

            const data = await response.json();
            setVideos(data);
        } catch (err) {
            console.error("Erreur de récupération des vidéos:", err);
            showNotification(err.message || 'Échec de la récupération des vidéos.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, []);

    // 💡 Ajouter une Vidéo (POST) - Utilisation de FormData
    const handleAddVideo = async (e) => {
        e.preventDefault();

        if (!newVideoFile || !newVideoData.titre || !newVideoData.categorie) {
            showNotification('Veuillez remplir le titre, la catégorie et sélectionner un fichier vidéo.', 'error');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('titre', newVideoData.titre);
        formData.append('description', newVideoData.description);
        formData.append('categorie', newVideoData.categorie); // 💡 Ajout de la catégorie
        formData.append('videoFile', newVideoFile);

        try {
            const response = await fetch(`${BASE_URL}/api/videos`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Échec de l'ajout de la vidéo.");

            setVideos(prev => [data, ...prev]);
            // 💡 Réinitialisation de l'état, y compris la catégorie
            setNewVideoData({ titre: '', description: '', categorie: '' });
            setNewVideoFile(null);
            const fileInput = document.getElementById('videoFile');
            if (fileInput) fileInput.value = null;

            showNotification(`Vidéo "${data.titre}" ajoutée avec succès.`, 'success');

        } catch (err) {
            console.error("Erreur d'ajout:", err);
            showNotification(err.message || "Échec de l'ajout de la vidéo.", 'error');
        } finally {
            setLoading(false);
        }
    };

    // 💡 Supprimer une Vidéo (DELETE)
    const handleDeleteVideo = async () => {
        const videoId = videoToDelete;
        if (!videoId) return;

        handleCloseConfirm();
        setLoading(true);

        const deleteUrl = `${BASE_URL}/api/videos/${videoId}`;

        try {
            const response = await fetch(deleteUrl, { method: 'DELETE' });
            const data = await response.json();

            if (!response.ok) throw new Error(data.message || `Échec de la suppression de la vidéo ID ${videoId}.`);

            setVideos(prev => prev.filter(v => v._id !== videoId));
            showNotification(`Vidéo ID ${videoId} supprimée avec succès.`, 'success');

        } catch (err) {
            console.error("Erreur de suppression:", err);
            showNotification(err.message || 'Échec de la suppression de la vidéo.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // 💡 Mettre à jour une Vidéo (PUT) - Envoi des métadonnées uniquement ou d'un nouveau fichier
    const handleUpdateVideo = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!currentVideo || !currentVideo._id) return;

        const updateUrl = `${BASE_URL}/api/videos/${currentVideo._id}`;

        const isFileUpdate = !!currentEditFile;

        let fetchOptions;

        if (isFileUpdate) {
            // Mise à jour avec un nouveau fichier (FormData)
            const formData = new FormData();
            formData.append('titre', currentVideo.titre);
            formData.append('description', currentVideo.description);
            formData.append('categorie', currentVideo.categorie); // 💡 Ajout de la catégorie
            formData.append('videoFile', currentEditFile);

            fetchOptions = {
                method: 'PUT',
                body: formData,
            };
        } else {
            // Mise à jour des métadonnées uniquement (JSON)
            fetchOptions = {
                method: 'PUT',
                body: JSON.stringify({ titre: currentVideo.titre, description: currentVideo.description, categorie: currentVideo.categorie }),
                headers: { 'Content-Type': 'application/json' },
            };
        }


        try {
            const response = await fetch(updateUrl, fetchOptions);

            const updatedVideo = await response.json();

            if (!response.ok) throw new Error(updatedVideo.message || "Échec de la mise à jour de la vidéo.");

            setVideos(prev => prev.map(v =>
                v._id === updatedVideo._id ? updatedVideo : v
            ));

            showNotification(`Vidéo "${updatedVideo.titre}" mise à jour avec succès.`, 'success');
            handleCloseEditModal();

        } catch (err) {
            console.error("Erreur de mise à jour:", err);
            showNotification(err.message || 'Échec de la mise à jour de la vidéo.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // -------------------- 4. Affichage (Render) --------------------
    return (
        <>
            <NavbarAdmin />

            {/* 💡 Composant de Notifications (Notification/Toast) */}
            {notification.message && (
                <div className={`notification ${notification.type}`}>
                    <p>{notification.message}</p>
                    <button onClick={() => setNotification({ message: '', type: '' })}>&times;</button>
                </div>
            )}

            <div className="product-management-container">
                <h2 className="client-title"> 🎥 Gestion des Vidéos</h2>

                {/* -------------------- A. Ajouter une Vidéo (Upload) -------------------- */}
                <div className="card add-product-section">
                    <h3>➕ Ajouter une Nouvelle Vidéo (Téléversement)</h3>
                    <form onSubmit={handleAddVideo} className="product-form">
                        <div className="form-group">
                            <label htmlFor="titre">Titre de la Vidéo</label>
                            <input type="text" id="titre" name="titre" value={newVideoData.titre} onChange={handleDataChange} required />
                        </div>

                        {/* 💡 Ajout du champ Catégorie - Utilisation de la liste déroulante */}
                        <div className="form-group">
                            <label htmlFor="categorie">Catégorie</label>
                            <select
                                id="categorie"
                                name="categorie"
                                value={newVideoData.categorie}
                                onChange={handleDataChange}
                                required
                            >
                                <option value="" disabled>Sélectionnez une catégorie</option>
                                {categoriesList.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="videoFile">Choisir Fichier Vidéo</label>
                            <input
                                type="file"
                                id="videoFile"
                                name="videoFile"
                                accept="video/*"
                                onChange={handleFileChange}
                                required
                            />
                        </div>

                        {/* <div className="form-group">
                            <label htmlFor="description">Description (Optionnelle)</label>
                            <textarea id="description" name="description" value={newVideoData.description} onChange={handleDataChange} rows="3"></textarea>
                        </div> */}

                        <button type="submit" className="submit-button" disabled={loading}>
                            {loading ? 'Téléversement...' : 'Enregistrer la Vidéo'}
                        </button>
                    </form>
                </div>

                <hr className="divider" />

                {/* -------------------- B. Liste des Vidéos (Affichage des fichiers téléchargés) -------------------- */}
                <div className="product-list-section">
                    <h3>🎬 Liste des Vidéos Actuelles ({videos.length})</h3>

                    {loading && <p>Chargement des vidéos...</p>}

                    {!loading && videos.length > 0 && (
                        <div className="videos-grid">
                            {videos.map((video) => (
                                <div key={video._id} className="video-card">
                                    <h4 className="video-title">{video.titre}</h4>
                                    <p className="video-category">Catégorie: **{video.categorie}**</p> {/* 💡 Affichage de la catégorie */}
                                    <div className="video-player-container">
                                        {/* 💡 Utilisation du chemin du fichier pour l'affichage */}
                                        <video
                                            controls
                                            // L'API /stream/:id est utilisée pour le streaming via l'ID de la base de données
                                            src={`${BASE_URL}/api/videos/stream/${video._id}`}
                                            className="uploaded-video-player"
                                            onContextMenu={(e) => e.preventDefault()}
                                            // ✅ Ajout de la propriété pour empêcher le bouton de téléchargement d'apparaître dans le menu de contrôle (trois points)
                                            controlsList="nodownload"
                                        >
                                            Votre navigateur ne supporte pas la balise vidéo.
                                        </video>
                                    </div>
                                    <p className="video-desc">{video.description.substring(0, 100)}...</p>
                                    <div className="video-actions">
                                        <button className="action-btn edit-btn" onClick={() => handleEditClick(video)}>
                                            Modifier
                                        </button>
                                        <button className="action-btn delete-btn" onClick={() => handleOpenConfirm(video._id)}>
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {!loading && videos.length === 0 && <p className="no-data-message">Aucune vidéo trouvée.</p>}
                </div>

            </div>


            {/* -------------------- C. Modal Mise à Jour (Update Modal) -------------------- */}
            {isEditModalOpen && currentVideo && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>⚙️ Modifier la Vidéo : {currentVideo.titre}</h3>

                        <form onSubmit={handleUpdateVideo}>
                            <div className="form-group"><label htmlFor="edit_titre">Titre</label>
                                <input type="text" id="edit_titre" name="titre" value={currentVideo.titre} onChange={handleEditDataChange} required />
                            </div>

                            {/* 💡 Champ de modification de la Catégorie */}
                            <div className="form-group">
                                <label htmlFor="edit_categorie">Catégorie</label>
                                <select
                                    id="edit_categorie"
                                    name="categorie"
                                    value={currentVideo.categorie}
                                    onChange={handleEditDataChange}
                                    required
                                >
                                    <option value="" disabled>Sélectionnez une catégorie</option>
                                    {categoriesList.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* 💡 Mise à jour du Fichier (Optionnel) */}
                            <div className="form-group">
                                <label htmlFor="edit_videoFile">Remplacer le fichier vidéo (Optionnel)</label>
                                <input
                                    type="file"
                                    id="edit_videoFile"
                                    name="videoFile"
                                    accept="video/*"
                                    onChange={handleEditFileChange}
                                />
                                {currentVideo.fileName && <small>Fichier actuel: **{currentVideo.fileName}**</small>}
                            </div>

                            <div className="form-group"><label htmlFor="edit_description">Description</label>
                                <textarea id="edit_description" name="description" value={currentVideo.description} onChange={handleEditDataChange} rows="3"></textarea>
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="submit-button" disabled={loading}>
                                    {loading ? 'Mise à jour...' : 'Enregistrer les modifications'}
                                </button>
                                <button type="button" className="cancel-button" onClick={handleCloseEditModal} disabled={loading}>
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* -------------------- D. Modal Confirmation de Suppression (Delete Confirmation) -------------------- */}
            {isConfirmModalOpen && videoToDelete && (
                <div className="modal-overlay">
                    <div className="modal-content confirmation-modal">
                        <h3>⚠️ Confirmation de Suppression</h3>

                        <p className="confirmation-message">
                            Êtes-vous **sûr** de vouloir supprimer définitivement la vidéo avec l'ID :
                            **{videoToDelete}** ?
                        </p>
                        <p className="warning-text">Cette action **ne peut pas être annulée** et supprimera le fichier du serveur.</p>

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="action-btn delete-btn"
                                onClick={handleDeleteVideo}
                                disabled={loading}
                            >
                                {loading ? 'Suppression...' : 'Oui, Supprimer'}
                            </button>
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={handleCloseConfirm}
                                disabled={loading}
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}