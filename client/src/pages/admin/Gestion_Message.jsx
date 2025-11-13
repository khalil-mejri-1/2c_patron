import React, { useState, useEffect } from 'react';
import NavbarAdmin from '../../comp/Navbar_admin';
import { FaTrash, FaSpinner, FaEnvelopeOpenText, FaTimes, FaToggleOn, FaToggleOff, FaExclamationTriangle } from 'react-icons/fa';
import '../admin_css/Gestion_Message.css'; 
const API_MESSAGES_ENDPOINT = 'http://localhost:3000/api/messages'; 

export default function Gestion_Message() {
    // États principaux
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // États de la modale de lecture
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);

    // NOUVEAUX ÉTATS POUR LA MODALE DE CONFIRMATION DE SUPPRESSION
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState(null); // Contient l'objet du message à supprimer

    // -------------------- ⚙️ Récupération et Gestion des Données --------------------
    
    // Récupération des messages depuis le serveur
    const fetchMessages = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_MESSAGES_ENDPOINT);
            if (!response.ok) throw new Error('Échec du chargement des messages depuis le serveur. Vérifiez l\'API.');
            const data = await response.json();
            setMessages(data);
            setError(null);
        } catch (err) {
            console.error('Erreur lors de la récupération des messages:', err);
            setError('Impossible de charger les messages. Le serveur est-il en cours d\'exécution ?');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);
    
    // 💡 FONCTION POUR OUVRIR LA MODALE DE CONFIRMATION
    const handleOpenConfirmModal = (message) => {
        setMessageToDelete(message);
        setIsConfirmModalOpen(true);
        // Fermer la modale de lecture si elle est ouverte
        if (isMessageModalOpen) {
            handleCloseMessageModal();
        }
    };

    // 💡 FONCTION POUR FERMER LA MODALE DE CONFIRMATION
    const handleCloseConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setMessageToDelete(null);
    };

    // 🗑️ Supprimer un message (Exécuté APRÈS la confirmation)
    const handleDelete = async () => {
        const id = messageToDelete._id;
        const nom = messageToDelete.nom;
        
        handleCloseConfirmModal(); // Fermer la modale après avoir lancé la suppression
        setLoading(true); // Optionnel, mais recommandé pour l'UX

        try {
            const response = await fetch(`${API_MESSAGES_ENDPOINT}/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Échec de la suppression du message.');
            
            // Si la suppression réussit
            setMessages(prev => prev.filter(msg => msg._id !== id));
            // Ne pas utiliser 'alert' mais un système de notification (Toast) pour une meilleure UX
            // alert(`Message de ${nom} supprimé avec succès.`); 
        } catch (err) {
            console.error(err);
            // alert("Une erreur est survenue lors de la suppression du message."); 
        } finally {
            setLoading(false);
        }
    };

    // 🔄 Changer le statut d'un message (Traité / Non traité)
    const toggleTreatedStatus = async (id) => {
        try {
            const response = await fetch(`${API_MESSAGES_ENDPOINT}/${id}/status`, {
                method: 'PUT', 
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error("Échec de la mise à jour du statut du message.");

            const updatedMessage = await response.json();

            setMessages(prev =>
                prev.map(msg => msg._id === id ? { ...msg, estTraite: updatedMessage.estTraite } : msg)
            );
            // Mettre à jour la modale de lecture si elle est ouverte
            if (selectedMessage && selectedMessage._id === id) {
                setSelectedMessage(updatedMessage);
            }
        } catch (err) {
            console.error(err);
            alert("Une erreur est survenue lors de la mise à jour du statut.");
        }
    };

    // -------------------- 💡 Fonctions Modale de Lecture --------------------

    const handleOpenMessageModal = (message) => {
        setSelectedMessage(message);
        setIsMessageModalOpen(true);
        // Basculer automatiquement sur "Traité" si le message était "Non traité"
        if (!message.estTraite) {
            toggleTreatedStatus(message._id); 
        }
    };

    const handleCloseMessageModal = () => {
        setIsMessageModalOpen(false);
        setSelectedMessage(null);
    };


    // 📝 Formater la date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleDateString('fr-FR', options);
    };

    // -------------------- 🎨 Rendu --------------------
 if (loading) return (
        <>
            <NavbarAdmin />
            <div className="abonnement-container loading-state">
                <FaSpinner className="spinner" />
                <p>Chargement des  messages...</p>
            </div>
        </>
    );

    return (
        <>
            <NavbarAdmin/>
            <div className="admin-page-container">
                <h2 className="client-title">📧 Gestion des messages clients</h2>

               
                {error && (
                    <div className="alert-danger text-center">{error}</div>
                )}

                {/* --- Tableau des Messages --- */}
                {!loading && !error && messages.length > 0 && (
                    <div className="card message-list-card">
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead className="table-head">
                                    <tr>
                                        <th>Date</th>
                                        <th>Nom</th>
                                        <th>Email</th>
                                        <th>Sujet</th>
                                        <th className="text-center">Statut</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {messages.map((message) => (
                                        <tr 
                                            key={message._id} 
                                            className={message.estTraite ? 'message-treated' : 'message-untreated'}
                                            onClick={() => handleOpenMessageModal(message)} // 💡 Ouvre la modale de lecture
                                        >
                                            <td data-label="Date">{formatDate(message.dateCreation)}</td>
                                            <td data-label="Nom">{message.nom}</td>
                                            <td data-label="Email">{message.email}</td>
                                            <td data-label="Sujet">{message.sujet}</td>
                                            <td data-label="Statut" className="text-center">
                                                <span 
                                                    className={`status-badge ${message.estTraite ? 'badge-success' : 'badge-warning'}`}
                                                    onClick={(e) => { e.stopPropagation(); toggleTreatedStatus(message._id); }} // 💡 Empêche l'ouverture de la modale
                                                >
                                                    {message.estTraite ? 'Traité' : 'Nouveau'}
                                                </span>
                                            </td>
                                            <td data-label="Actions" className="text-center">
                                                <button 
                                                    className="action-btn btn-delete" 
                                                    title="Supprimer le message"
                                                    onClick={(e) => { e.stopPropagation(); handleOpenConfirmModal(message); }} // 💡 Ouvre la modale de confirmation
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {!loading && !error && messages.length === 0 && (
                    <div className="alert-info text-center">
                        Aucun message client pour le moment.
                    </div>
                )}
            </div>

            {/* -------------------- Modale d'Affichage de Message Complet -------------------- */}
            {isMessageModalOpen && selectedMessage && (
                <div className="modal-overlay" onClick={handleCloseMessageModal}>
                    <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={handleCloseMessageModal}>
                            <FaTimes />
                        </button>
                        
                        <h3 className="modal-title">
                            <FaEnvelopeOpenText /> Message de **{selectedMessage.nom}**
                        </h3>

                        <div className="modal-header-info">
                            <p><strong>Date:</strong> {formatDate(selectedMessage.dateCreation)}</p>
                            <p><strong>Email:</strong> {selectedMessage.email}</p>
                            <p><strong>Sujet:</strong> {selectedMessage.sujet}</p>
                        </div>
                        
                        <div className="modal-body-content">
                            <h4>Contenu du Message :</h4>
                            <p className="message-text-content">{selectedMessage.message}</p>
                        </div>

                        <div className="modal-footer-actions">
                            <button
                                className={`action-btn btn-status-${selectedMessage.estTraite ? 'treated' : 'untreated'}`}
                                onClick={() => toggleTreatedStatus(selectedMessage._id)}
                            >
                                {selectedMessage.estTraite ? <FaToggleOn /> : <FaToggleOff />}
                                {selectedMessage.estTraite ? ' Marquer comme Non traité' : ' Marquer comme Traité'}
                            </button>
                             <button 
                                className="action-btn btn-delete-modal" 
                                // Utiliser handleOpenConfirmModal depuis la modale de lecture
                                onClick={() => handleOpenConfirmModal(selectedMessage)}
                            >
                                <FaTrash /> Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* -------------------- 💡 NOUVELLE MODALE DE CONFIRMATION DE SUPPRESSION -------------------- */}
            {isConfirmModalOpen && messageToDelete && (
                <div className="modal-overlay" onClick={handleCloseConfirmModal}>
                    <div className="modal-content-custom confirmation-modal" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title-confirm">
                            <FaExclamationTriangle className="icon-warning" /> Confirmation de Suppression
                        </h3>

                        <div className="modal-body-content confirmation-body">
                            <p>Êtes-vous certain de vouloir supprimer définitivement le message de :</p>
                            <p className="confirm-name">**{messageToDelete.nom}**</p>
                            <p className="warning-text">
                                **Cette action est irréversible.** Le message sera perdu définitivement.
                            </p>
                        </div>

                        <div className="modal-footer-actions">
                            <button 
                                className="action-btn btn-cancel" 
                                onClick={handleCloseConfirmModal}
                                disabled={loading}
                            >
                                Annuler
                            </button>
                            <button 
                                className="action-btn btn-confirm-delete" 
                                onClick={handleDelete}
                                disabled={loading}
                            >
                                {loading ? <FaSpinner className="fa-spin-light" /> : <FaTrash />}
                                {loading ? ' Suppression...' : ' Oui, Supprimer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}