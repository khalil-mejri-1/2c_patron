import React, { useState, useEffect } from 'react';
import NavbarAdmin from '../../comp/Navbar_admin';
import { FaUserCheck, FaUserTimes, FaSpinner, FaPhoneAlt, FaTrashAlt, FaCrown, FaCalendarAlt, FaEnvelope, FaIdCard, FaTimes } from 'react-icons/fa';
import BASE_URL from '../../apiConfig';
import { useAlert } from '../../context/AlertContext';

const API_BASE_URL = `${BASE_URL}/api/abonnement`;

export default function Gestion_abonnement() {
    const [abonnements, setAbonnements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showAlert } = useAlert();

    const fetchAbonnements = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_BASE_URL);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Échec du chargement.');
            setAbonnements(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAbonnements();
    }, []);

    const handleUpdateStatut = async (id, newStatut, email) => {
        showAlert('confirm', 'Confirmation', `Voulez-vous ${newStatut === 'approuvé' ? 'approuver' : 'refuser'} cet abonnement ?`, async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ statut_abonnement: newStatut }),
                });
                if (!response.ok) throw new Error('Erreur de mise à jour.');

                setAbonnements(prev => prev.map(abo => abo._id === id ? { ...abo, statut_abonnement: newStatut } : abo));

                if (newStatut === 'approuvé') {
                    await fetch(`${BASE_URL}/api/user/abonne`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email }),
                    });
                }
                showAlert('success', 'Succès', `Abonnement ${newStatut} !`);
            } catch (err) {
                showAlert('error', 'Erreur', err.message);
            }
        });
    };

    const handleDeleteAbonnement = async (id) => {
        showAlert('confirm', 'Supprimer', 'Voulez-vous supprimer cet abonnement définitivement ?', async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Erreur de suppression.');
                setAbonnements(prev => prev.filter(abo => abo._id !== id));
                showAlert('success', 'Succès', 'Abonnement supprimé.');
            } catch (err) {
                showAlert('error', 'Erreur', err.message);
            }
        });
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <NavbarAdmin />

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 20px' }}>
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.2rem', color: '#1e293b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FaCrown style={{ color: '#D4AF37' }} /> Demandes Abonnements VIP
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '10px' }}>Approuvez ou refusez les accès VIP des utilisateurs.</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px' }}>
                        <FaSpinner className="spinner" style={{ fontSize: '3rem', color: '#D4AF37' }} />
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
                        {abonnements.map((abo) => (
                            <div key={abo._id} className="premium-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>
                                            {abo.nom.charAt(0)}
                                        </div>
                                        <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{abo.nom}</div>
                                    </div>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '15px',
                                        fontSize: '0.7rem',
                                        fontWeight: 'bold',
                                        background: abo.statut_abonnement === 'approuvé' ? '#ecfdf5' : abo.statut_abonnement === 'refusé' ? '#fee2e2' : '#fef3c7',
                                        color: abo.statut_abonnement === 'approuvé' ? '#059669' : abo.statut_abonnement === 'refusé' ? '#dc2626' : '#d97706',
                                        textTransform: 'uppercase'
                                    }}>
                                        {abo.statut_abonnement}
                                    </span>
                                </div>

                                <div style={{ padding: '20px', fontSize: '0.9rem', color: '#64748b', flex: 1 }}>
                                    <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}><FaIdCard size={12} /> ID: <span style={{ color: '#1e293b' }}>{abo._id.slice(-8)}</span></div>
                                    <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}><FaEnvelope size={12} /> {abo.mail}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FaCalendarAlt size={12} /> {new Date(abo.date_demande).toLocaleDateString('fr-FR')}</div>
                                </div>

                                <div style={{ padding: '20px', background: '#fef3c7', borderRadius: '0 0 0 0' }}>
                                    <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #d4af37', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}>
                                            <FaPhoneAlt />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Téléphone</div>
                                            <div style={{ fontSize: '1.1rem', color: '#1e293b', fontWeight: 'bold' }}>{abo.telephone || 'Non fourni'}</div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: '15px 20px', display: 'flex', gap: '10px' }}>
                                    {abo.statut_abonnement === 'en_attente' && (
                                        <>
                                            <button onClick={() => handleUpdateStatut(abo._id, 'approuvé', abo.mail)} className="premium-btn-cta gold" style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}><FaUserCheck /> Approuver</button>
                                            <button onClick={() => handleUpdateStatut(abo._id, 'refusé')} className="premium-btn-cta secondary" style={{ flex: 1, padding: '8px', fontSize: '0.8rem', color: '#dc2626', borderColor: '#fecaca' }}><FaUserTimes /> Refuser</button>
                                        </>
                                    )}
                                    <button onClick={() => handleDeleteAbonnement(abo._id)} className="premium-btn-cta secondary" style={{ padding: '8px', minWidth: 'auto', background: '#fee2e2', color: '#ef4444', borderColor: '#fecaca' }}><FaTrashAlt /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {abonnements.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '80px', background: '#fff', borderRadius: '20px', color: '#64748b' }}>
                        Aucune demande trouvée.
                    </div>
                )}
            </div>


        </div>
    );
}