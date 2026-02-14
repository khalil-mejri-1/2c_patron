import React, { useState, useEffect } from 'react';
import NavbarAdmin from '../../comp/Navbar_admin';
import axios from 'axios';
import { FaTrash, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import { } from "../admin_css/Gestion_commentaire.css";
import BASE_URL from '../../apiConfig';

export default function Gestion_commentaire() {
    const [commentaires, setCommentaires] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCommentaires();
    }, []);

    const fetchCommentaires = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${BASE_URL}/api/commentaires`);
            const sortedComments = res.data.sort((a, b) => {
                if (a.statut === 'en attente' && b.statut !== 'en attente') return -1;
                if (a.statut !== 'en attente' && b.statut === 'en attente') return 1;
                return new Date(b.dateCreation) - new Date(a.dateCreation);
            });
            setCommentaires(sortedComments);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const deleteCommentaire = async (id) => {
        try {
            await axios.delete(`${BASE_URL}/api/commentaires/${id}`);
            fetchCommentaires();
        } catch (err) {
            console.error('Erreur lors de la suppression', err);
        }
    };

    const updateStatut = async (id, statut) => {
        // Capitalize first letter
        const correctedStatut = statut.charAt(0).toUpperCase() + statut.slice(1).toLowerCase();

        try {
            await axios.put(`${BASE_URL}/api/commentaires/statut/${id}`, { statut: correctedStatut });
            fetchCommentaires();
        } catch (err) {
            console.error('Erreur lors de la mise à jour du statut', err);
        }
    };



    // Fonction utilitaire pour le style de statut
    const getStatutClass = (statut) => {
        switch (statut) {
            case 'approuvé':
                return 'statut-approuve';
            case 'refusé':
                return 'statut-refuse';
            default:
                return 'statut-attente';
        }
    };

    return (
        <>
            <NavbarAdmin />
            <div className="gestion-container">

                <header className="gestion-header">
                    <h1 className="client-title">
                        Administration des Commentaires
                    </h1>
                    <p className="gestion-subtitle">Gérez l'approbation, le refus et la suppression des commentaires.</p>
                </header>

                {loading ? (
                    <div className="loading-state">
                        <FaSpinner className="spinner" />
                        <p>Chargement des commentaires...</p>
                    </div>
                ) : (
                    commentaires.length === 0 ? (
                        <div className="no-comments">
                            <p>Aucun commentaire à gérer pour le moment. 🎉</p>
                            <button
                                onClick={fetchCommentaires}
                                className="reload-button"
                            >
                                Recharger
                            </button>
                        </div>
                    ) : (
                        <div className="commentaires-grid">
                            {commentaires.map(c => (
                                <div
                                    key={c._id}
                                    className="commentaire-card"
                                >
                                    <div>
                                        {/* Statut Badge */}
                                        <div className={`statut-badge ${getStatutClass(c.statut)}`}>
                                            {c.statut}
                                        </div>

                                        <p className="card-nom">
                                            {c.nom || 'Anonyme'}
                                        </p>

                                        {/* Contenu du Commentaire */}
                                        <blockquote className="card-blockquote">
                                            {c.commentaire}
                                        </blockquote>

                                        <p className="card-date">
                                            Publié le: {new Date(c.dateCreation).toLocaleString()}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="card-actions">
                                        <button
                                            onClick={() => updateStatut(c._id, 'Approuvé')}
                                            title="Approuver"
                                            disabled={c.statut === 'Approuvé'} // حرف أول كبير
                                            className="action-button approve"
                                        >
                                            <FaCheck /> Approuver
                                        </button>

                                        <button
                                            onClick={() => updateStatut(c._id, 'Rejeté')} // حرف أول كبير
                                            title="Refuser"
                                            disabled={c.statut === 'Rejeté'} // حرف أول كبير
                                            className="action-button reject"
                                        >
                                            <FaTimes /> Refuser
                                        </button>

                                        <button
                                            onClick={() => deleteCommentaire(c._id)}
                                            title="Supprimer Définitivement"
                                            className="action-button delete"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>

                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </>
    );
}