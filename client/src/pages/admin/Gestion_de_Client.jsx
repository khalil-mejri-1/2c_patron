import React, { useState, useEffect } from 'react';
import NavbarAdmin from '../../comp/Navbar_admin';
// 💡 استيراد ملف CSS
import '../admin_css/GestionDeClient.css';
import BASE_URL from '../../apiConfig';
import { FaShoppingCart, FaSearch, FaChevronDown, FaTimes, FaUser, FaEnvelope, FaMapMarkerAlt, FaPhoneAlt, FaMinusCircle, FaPlusCircle, FaSpinner, FaTrash } from 'react-icons/fa'; // 🗑️ Ajout de FaTrash

// 🚀 استيراد SweetAlert2
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function Gestion_de_Client() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ... (دالة fetchUsers كما هي)
    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${BASE_URL}/api/users/clients`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Échec du chargement des clients.');
            }

            setUsers(data);
        } catch (err) {
            console.error("Erreur de récupération des données:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // 🌟 دالة لتحديث حالة المستخدم (Role) باستخدام SweetAlert2 (inchangée)
    const handleStatutChange = async (userId, newStatut) => {
        // ... (Logique handleStatutChange inchangée)
        const result = await MySwal.fire({
            title: 'Confirmer le changement de rôle',
            html: `Êtes-vous sûr de vouloir changer le rôle de l'utilisateur ID **${userId}** à **${newStatut.toUpperCase()}** ?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Oui, changer le rôle!',
            cancelButtonText: 'Annuler',
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/api/users/${userId}/statut`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ statut: newStatut }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Échec de la mise à jour du statut.');
            }

            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user._id === userId ? { ...user, statut: newStatut } : user
                )
            );

            MySwal.fire(
                'Rôle mis à jour!',
                `Le statut de l'utilisateur ID **${userId}** a été mis à jour avec succès à **${newStatut.toUpperCase()}**.`,
                'success'
            );

        } catch (err) {
            console.error("Erreur de mise à jour:", err);
            MySwal.fire(
                'Erreur!',
                `Erreur: ${err.message}`,
                'error'
            );
        }
    };

    // 🌟 دالة تحديث حالة abonné (الاشتراك) باستخدام SweetAlert2 (inchangée)
    const handleAbonneChange = async (userId, currentAbonne) => {
        // ... (Logique handleAbonneChange inchangée)
        const newAbonne = currentAbonne === 'oui' ? 'non' : 'oui';
        const actionText = newAbonne === 'oui' ? 'abonner' : 'désabonner';

        const result = await MySwal.fire({
            title: `Confirmer ${actionText} l'utilisateur`,
            html: `Êtes-vous sûr de vouloir **${actionText}** l'utilisateur ID **${userId}**? (Nouvel état: **${newAbonne.toUpperCase()}**)`,
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: newAbonne === 'oui' ? '#28a745' : '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Oui, ${actionText}!`,
            cancelButtonText: 'Annuler',
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/api/users/${userId}/abonne`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ abonne: newAbonne }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Échec de la mise à jour de l'abonnement.`);
            }

            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user._id === userId ? { ...user, abonne: newAbonne } : user
                )
            );

            MySwal.fire(
                'Abonnement mis à jour!',
                `L'utilisateur ID **${userId}** est maintenant **${newAbonne.toUpperCase()}** aux newsletters.`,
                'success'
            );

        } catch (err) {
            console.error("Erreur de mise à jour de l'abonnement:", err);
            MySwal.fire(
                'Erreur!',
                `Erreur: ${err.message}`,
                'error'
            );
        }
    };

    // 🗑️ NOUVELLE FONCTION: Gérer la suppression d'un utilisateur
    const handleDeleteUser = async (userId) => {
        const result = await MySwal.fire({
            title: 'Confirmer la suppression',
            html: `Êtes-vous sûr de vouloir **SUPPRIMER** l'utilisateur ID **${userId}** définitivement ? Cette action est **irréversible**!`,
            icon: 'error',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Oui, Supprimer!',
            cancelButtonText: 'Annuler',
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            // 🚨 Endpoint de suppression (assurez-vous que votre backend le prend en charge)
            const response = await fetch(`${BASE_URL}/api/users/${userId}`, {
                method: 'DELETE', // Utilisation de la méthode DELETE
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Échec de la suppression de l\'utilisateur.');
            }

            // 🗑️ Mise à jour de l'état local pour retirer l'utilisateur supprimé
            setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));

            // 💡 Fenêtre de succès
            MySwal.fire(
                'Supprimé!',
                `L'utilisateur ID **${userId}** a été supprimé avec succès.`,
                'success'
            );

        } catch (err) {
            console.error("Erreur de suppression:", err);
            // 💡 Fenêtre d'erreur
            MySwal.fire(
                'Erreur de Suppression!',
                `Erreur: ${err.message}`,
                'error'
            );
        }
    };
    // ... (Logique de chargement et d'erreur inchangée)
    if (loading) return (
        <>
            <NavbarAdmin />
            <div className="loading-state">
                <FaSpinner className="spinner" />
                <p>Chargement des Clients...</p>
            </div>
        </>
    );

    if (error) return (
        <>
            <NavbarAdmin />
            <div className="client-container">
                {
                    MySwal.fire({
                        title: 'Erreur Critique',
                        text: `Erreur: ${error}. Veuillez réessayer ou contacter le support.`,
                        icon: 'error',
                        confirmButtonText: 'OK'
                    })
                }
                <p className="error-message">Une erreur s'est produite lors du chargement des données. Veuillez recharger la page.</p>
            </div>
        </>
    );

    return (
        <>
            <NavbarAdmin />
            <div className="client-container">
                <h2 className="client-title">Gestion des Clients</h2>

                <div className="table-wrapper">
                    <table className="client-table">
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Email</th>
                                <th>Statut Actuel</th>
                                <th>Actions (Rôles)</th>
                                <th>Abonné</th>
                                <th>Actions (Abonnement)</th>
                                <th>Supprimer</th> {/* 🗑️ NOUVELLE COLONNE */}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td>{user.nom}</td>
                                    <td>{user.mail}</td>
                                    <td>
                                        <span className={`status-badge ${user.statut}`}>
                                            {user.statut}
                                        </span>
                                    </td>
                                    <td>
                                        {/* Boutons de rôle */}
                                        {user.statut !== 'admin' && (
                                            <button
                                                onClick={() => handleStatutChange(user._id, 'admin')}
                                                className="action-button promouvoir-admin"
                                            >
                                                Promouvoir Admin
                                            </button>
                                        )}
                                        {user.statut === 'admin' && (
                                            <button
                                                onClick={() => handleStatutChange(user._id, 'client')}
                                                className="action-button retrograder-client"
                                            >
                                                Rétrograder Client
                                            </button>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`abonne-text abonne-${user.abonne || 'non'}`}>
                                            {user.abonne || 'non'}
                                        </span>
                                    </td>
                                    <td>
                                        {/* Boutons d'abonnement */}
                                        <button
                                            onClick={() => handleAbonneChange(user._id, user.abonne)}
                                            className={`action-button ${user.abonne === 'oui' ? 'retrograder-non' : 'promouvoir-oui'}`}
                                        >
                                            {user.abonne === 'oui' ? 'Rétrograder Non' : 'Promouvoir OUI'}
                                        </button>
                                    </td>
                                    <td>
                                        {/* 🗑️ NOUVEAU BOUTON DE SUPPRESSION */}
                                        <button
                                            onClick={() => handleDeleteUser(user._id)}
                                            className="action-button delete-user"
                                        >
                                            <FaTrash /> Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {users.length === 0 && !loading && <p className="no-clients-message">Aucun client trouvé.</p>}
            </div>
        </>
    );
}