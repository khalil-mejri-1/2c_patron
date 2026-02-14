import React, { useState, useEffect } from 'react';
import NavbarAdmin from '../../comp/Navbar_admin';
// 💡 استيراد ملف CSS الجديد
import '../admin_css/GestionDeAbonnement.css';
import {
    FaUserCheck,
    FaUserTimes,
    FaSpinner,
    FaFileImage,
    FaExternalLinkAlt,
    FaTimesCircle,
    FaCheckCircle,
    FaTrashAlt
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import BASE_URL from '../../apiConfig';

const MySwal = withReactContent(Swal);

// 🛠️ constant API Base URL
const API_BASE_URL = `${BASE_URL}/api/abonnement`;

export default function Gestion_abonnement() {
    const [abonnements, setAbonnements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 🌐 Fonction pour récupérer les données d'abonnement du serveur
    const fetchAbonnements = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_BASE_URL);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Échec du chargement des abonnements.');
            }
            setAbonnements(data);
        } catch (err) {
            console.error("Erreur de récupération des données:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 🚀 Fonction de mise à jour du statut (Approuver/Refuser)
    const handleUpdateStatut = async (abonnementId, newStatut, email) => {
        const actionText = newStatut === 'approuvé' ? 'Approuver' : 'Refuser';
        const confirmTitle = `Confirmer l'action : ${actionText}`;

        const result = await MySwal.fire({
            title: confirmTitle,
            text: `Êtes-vous sûr de vouloir ${actionText.toLowerCase()} l'abonnement ID ${abonnementId} ?`,
            icon: newStatut === 'approuvé' ? 'question' : 'warning',
            showCancelButton: true,
            confirmButtonColor: newStatut === 'approuvé' ? '#28a745' : '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Oui, ${actionText}!`,
            cancelButtonText: 'Annuler',
        });

        if (!result.isConfirmed) return;

        try {
            // Mise à jour du statut dans la table Abonnement
            const response = await fetch(`${API_BASE_URL}/${abonnementId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ statut_abonnement: newStatut }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Échec de la mise à jour du statut.`);
            }

            // Mise à jour de la liste localement
            setAbonnements(prev =>
                prev.map(abo =>
                    abo._id === abonnementId
                        ? { ...abo, statut_abonnement: newStatut }
                        : abo
                )
            );

            // ✅ Si Approuvé, mettre à jour le statut utilisateur
            if (newStatut === 'approuvé') {
                try {
                    const userResponse = await fetch(`${BASE_URL}/api/user/abonne`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email }),
                    });

                    if (!userResponse.ok) {
                        const errorData = await userResponse.json();
                        throw new Error(errorData.error || 'Erreur lors de la mise à jour de l\'abonnement utilisateur.');
                    }

                    const userData = await userResponse.json();
                    console.log(userData.message);
                } catch (err) {
                    console.error("Erreur mise à jour utilisateur:", err);
                    MySwal.fire('Erreur!', `Erreur mise à jour utilisateur: ${err.message}`, 'error');
                }
            }

            MySwal.fire(
                'Succès!',
                `Abonnement ID **${abonnementId}** a été **${newStatut.toUpperCase()}** avec succès.`,
                'success'
            );

        } catch (err) {
            console.error("Erreur de mise à jour:", err);
            MySwal.fire('Erreur!', `Erreur: ${err.message}`, 'error');
        }
    };

    // 🗑️ Fonction de suppression définitive
    const handleDeleteAbonnement = async (abonnementId) => {
        const result = await MySwal.fire({
            title: 'Confirmer la Suppression',
            text: `Êtes-vous sûr de vouloir supprimer l'abonnement ID ${abonnementId} définitivement ? Cette opération ne peut pas être annulée.`,
            icon: 'error',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Oui, Supprimer!',
            cancelButtonText: 'Annuler',
        });

        if (!result.isConfirmed) return;

        try {
            const response = await fetch(`${API_BASE_URL}/${abonnementId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Échec de la suppression de l'abonnement.`);
            }

            // ✅ Mise à jour locale
            setAbonnements(prev => prev.filter(abo => abo._id !== abonnementId));

            MySwal.fire(
                'Supprimé!',
                `Abonnement ID **${abonnementId}** a été supprimé avec succès.`,
                'success'
            );

        } catch (err) {
            console.error("Erreur de suppression:", err);
            MySwal.fire(
                'Erreur!',
                `Erreur de suppression: ${err.message}`,
                'error'
            );
        }
    };

    // 🖼️ Fonction d'affichage de l'image de preuve (SweetAlert2)
    const handleViewProof = (event, imageUrl) => {
        // Empêcher l'ouverture du lien par défaut
        event.preventDefault();

        // 💡 CORRECTION : Utilisation directe de l'URL ImgBB (imageUrl)
        MySwal.fire({
            title: 'Preuve de Paiement',
            imageUrl: imageUrl,
            imageAlt: 'Image de preuve de paiement',
            showCloseButton: true,
            showConfirmButton: false,
            customClass: {
                image: 'swal2-proof-image',
            },
            width: '80vw',
            padding: '1em',
            // Rendre le lien vers l'image cliquable en bas de la pop-up
            footer: `<a href="${imageUrl}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: none; font-size: 0.9em;">
                         Ouvrir l'image dans un nouvel onglet <FaExternalLinkAlt style="margin-left: 5px; font-size: 0.8em;"/>
                     </a>`
        });
    };

    // 🔗 Récupération des données au montage du composant
    useEffect(() => {
        fetchAbonnements();
    }, []);

    // 🛑 États de chargement et d'erreur
    if (loading) return (
        <>
            <NavbarAdmin />
            <div className="abonnement-container loading-state">
                <FaSpinner className="spinner" />
                <p>Chargement des demandes d'abonnement VIP...</p>
            </div>
        </>
    );

    if (error) return (
        <>
            <NavbarAdmin />
            <div className="abonnement-container error-state">
                <FaTimesCircle className="error-icon" />
                <p className="error-message">Erreur: {error}</p>
                <button className="retry-button" onClick={fetchAbonnements}>Réessayer</button>
            </div>
        </>
    );


    return (
        <>
            <NavbarAdmin />
            <div className="abonnement-container">
                <h2 className="client-title">Gérer les Abonnements VIP ({abonnements.length})</h2>

                {abonnements.length === 0 ? (
                    <div className="no-data-message">
                        <FaCheckCircle />
                        <p>Aucun abonnement trouvé.</p>
                    </div>
                ) : (
                    <div className="abonnement-list-wrapper">
                        {abonnements.map((abo) => (
                            <div className="abonnement-card" key={abo._id}>
                                <div className="card-header">
                                    <h3 className="card-title">{abo.nom}</h3>
                                    {/* Affichage du statut */}
                                    <span className={`status-badge ${abo.statut_abonnement}`}>
                                        {abo.statut_abonnement.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>
                                <div className="card-body">
                                    <p className="card-detail">ID Demande: {abo._id}</p>
                                    <p className="card-detail">Email: {abo.mail}</p>
                                    <p className="card-detail">Date de Demande: {new Date(abo.date_demande).toLocaleDateString()}</p>
                                </div>

                                <div className="card-proof-section">
                                    <FaFileImage className="proof-icon" />
                                    <p>Preuve de Paiement</p>
                                    <a
                                        // 💡 CORRECTION : Utilisation directe de l'URL ImgBB stockée
                                        href={abo.preuve_paiement_url}
                                        onClick={(e) => handleViewProof(e, abo.preuve_paiement_url)}
                                        target="_blank" // Ajouté pour s'assurer que ça ouvre dans un nouvel onglet si on clique
                                        rel="noopener noreferrer"
                                        className="view-proof-button"
                                    >
                                        <FaExternalLinkAlt /> Voir l'Image
                                    </a>
                                </div>

                                {/* Section Actions */}
                                <div className="card-actions_abonemment">
                                    {/* Boutons d'action */}
                                    <button
                                        onClick={() => handleUpdateStatut(abo._id, 'approuvé', abo.mail)}
                                        className="action-button_abonemment approve-button"
                                    >
                                        <FaUserCheck /> Approuver
                                    </button>

                                    <button
                                        onClick={() => handleUpdateStatut(abo._id, 'refusé')}
                                        className="action-button_abonemment reject-button"
                                    >
                                        <FaUserTimes /> Refuser
                                    </button>
                                    {/* Bouton de Suppression */}
                                    <button
                                        onClick={() => handleDeleteAbonnement(abo._id)}
                                        className="action-button_abonemment delete-button"
                                    >
                                        <FaTrashAlt /> Supprimer
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}