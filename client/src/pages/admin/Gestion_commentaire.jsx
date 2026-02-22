import React, { useState, useEffect } from 'react';
import NavbarAdmin from '../../comp/Navbar_admin';
import axios from 'axios';
import { FaTrash, FaCheck, FaTimes, FaSpinner, FaComments, FaCalendarAlt, FaUser, FaQuoteLeft } from 'react-icons/fa';
import { useAlert } from '../../context/AlertContext';
import BASE_URL from '../../apiConfig';

export default function Gestion_commentaire() {
    const [commentaires, setCommentaires] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showAlert } = useAlert();

    useEffect(() => {
        fetchCommentaires();
    }, []);

    const fetchCommentaires = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${BASE_URL}/api/commentaires`);
            const sortedComments = res.data.sort((a, b) => {
                const statusOrder = { 'en attente': 0, 'Approuvé': 1, 'Rejeté': 2 };
                const aOrder = statusOrder[a.statut] ?? 3;
                const bOrder = statusOrder[b.statut] ?? 3;
                if (aOrder !== bOrder) return aOrder - bOrder;
                return new Date(b.dateCreation) - new Date(a.dateCreation);
            });
            setCommentaires(sortedComments);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const deleteCommentaire = (id) => {
        showAlert('confirm', 'Supprimer Commentaire', 'Voulez-vous supprimer ce commentaire définitivement ?', async () => {
            try {
                await axios.delete(`${BASE_URL}/api/commentaires/${id}`);
                fetchCommentaires();
                showAlert('success', 'Succès', 'Commentaire supprimé.');
            } catch (err) {
                showAlert('error', 'Erreur', 'Échec de suppression.');
            }
        });
    };

    const updateStatut = async (id, statut) => {
        const correctedStatut = statut.charAt(0).toUpperCase() + statut.slice(1).toLowerCase();
        try {
            await axios.put(`${BASE_URL}/api/commentaires/statut/${id}`, { statut: correctedStatut });
            fetchCommentaires();
            showAlert('success', 'Succès', `Statut mis à jour : ${statut}`);
        } catch (err) {
            showAlert('error', 'Erreur', 'Échec de mise à jour.');
        }
    };

    const getStatutStyles = (statut) => {
        const s = statut?.toLowerCase();
        if (s === 'approuvé') return { bg: '#ecfdf5', color: '#059669' };
        if (s === 'rejeté' || s === 'refusé') return { bg: '#fee2e2', color: '#dc2626' };
        return { bg: '#fef3c7', color: '#d97706' };
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <NavbarAdmin />

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.2rem', color: '#1e293b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FaComments style={{ color: '#D4AF37' }} /> Modération des Commentaires
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '10px' }}>Approuvez ou refusez les avis laissés par les clients.</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px' }}>
                        <FaSpinner className="spinner" style={{ fontSize: '3rem', color: '#D4AF37' }} />
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
                        {commentaires.map(c => {
                            const st = getStatutStyles(c.statut);
                            return (
                                <div key={c._id} className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                                <FaUser size={14} />
                                            </div>
                                            <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{c.nom || 'Anonyme'}</div>
                                        </div>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '15px', fontSize: '0.65rem', fontWeight: 'bold',
                                            background: st.bg, color: st.color, textTransform: 'uppercase'
                                        }}>
                                            {c.statut}
                                        </span>
                                    </div>

                                    <div style={{ flex: 1, position: 'relative', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <FaQuoteLeft style={{ position: 'absolute', top: '10px', left: '10px', opacity: 0.05, fontSize: '2rem' }} />
                                        <p style={{ margin: '0', color: '#334155', lineHeight: '1.6', fontSize: '0.95rem', fontStyle: 'italic' }}>
                                            "{c.commentaire}"
                                        </p>
                                    </div>

                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <FaCalendarAlt size={10} /> {new Date(c.dateCreation).toLocaleString('fr-FR')}
                                    </div>

                                    <div className="premium-btn-group" style={{ marginTop: '10px' }}>
                                        <button
                                            onClick={() => updateStatut(c._id, 'Approuvé')}
                                            disabled={c.statut?.toLowerCase() === 'approuvé'}
                                            className="premium-btn-cta secondary"
                                            style={{ flex: 1, padding: '8px', fontSize: '0.8rem', opacity: c.statut?.toLowerCase() === 'approuvé' ? 0.5 : 1 }}
                                        >
                                            <FaCheck /> Approuver
                                        </button>
                                        <button
                                            onClick={() => updateStatut(c._id, 'Rejeté')}
                                            disabled={c.statut?.toLowerCase() === 'rejeté'}
                                            className="premium-btn-cta secondary"
                                            style={{ flex: 1, padding: '8px', fontSize: '0.8rem', opacity: c.statut?.toLowerCase() === 'rejeté' ? 0.5 : 1 }}
                                        >
                                            <FaTimes /> Refuser
                                        </button>
                                        <button
                                            onClick={() => deleteCommentaire(c._id)}
                                            className="premium-btn-cta secondary"
                                            style={{ padding: '8px', minWidth: 'auto', background: '#fee2e2', color: '#ef4444', borderColor: '#fecaca' }}
                                        >
                                            <FaTrash size={12} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {commentaires.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '80px', background: '#fff', borderRadius: '20px', color: '#64748b', border: '2px dashed #e2e8f0' }}>
                        Aucun commentaire à modérer.
                    </div>
                )}
            </div>
        </div>
    );
}