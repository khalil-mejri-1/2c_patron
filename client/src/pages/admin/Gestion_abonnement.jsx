import React, { useState, useEffect } from 'react';
import NavbarAdmin from '../../comp/Navbar_admin';
import { FaUserCheck, FaUserTimes, FaSpinner, FaPhoneAlt, FaTrashAlt, FaCrown, FaCalendarAlt, FaEnvelope, FaIdCard, FaTimes, FaKey, FaCopy, FaCheck } from 'react-icons/fa';
import BASE_URL from '../../apiConfig';
import { useAlert } from '../../context/AlertContext';

const API_BASE_URL = `${BASE_URL}/api/abonnement`;

export default function Gestion_abonnement() {
    const [abonnements, setAbonnements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showAlert } = useAlert();
    const [generatedCreds, setGeneratedCreds] = useState(null);
    const [copied, setCopied] = useState(false);

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

    const handleGenerateAccount = async (id) => {
        showAlert('confirm', 'Générer compte', `Voulez-vous générer un compte VIP pour ce client ?`, async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/abonnement/generate-account/${id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Erreur de génération.');

                setAbonnements(prev => prev.map(abo => abo._id === id ? { 
                    ...abo, 
                    statut_abonnement: 'approuvé',
                    generated_mail: data.email,
                    generated_password: data.password
                } : abo));
                setGeneratedCreds({
                    email: data.email,
                    password: data.password
                });
            } catch (err) {
                showAlert('error', 'Erreur', err.message);
            }
        });
    };

    const handleUpdateStatut = async (id, newStatut) => {
        showAlert('confirm', 'Confirmation', `Voulez-vous refuser cet abonnement ?`, async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ statut_abonnement: newStatut }),
                });
                if (!response.ok) throw new Error('Erreur de mise à jour.');

                setAbonnements(prev => prev.map(abo => abo._id === id ? { ...abo, statut_abonnement: newStatut } : abo));
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

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <NavbarAdmin />

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 20px' }}>
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.2rem', color: '#1e293b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FaCrown style={{ color: '#D4AF37' }} /> Demandes VIP & Génération de Comptes
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '10px' }}>Gérez les demandes et générez les accès VIP (Email & Mot de passe).</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px' }}>
                        <FaSpinner className="spinner" style={{ fontSize: '3rem', color: '#D4AF37' }} />
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {abonnements.map((abo) => (
                            <div key={abo._id} className="premium-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', border: '1px solid #e2e8f0', fontWeight: 'bold', fontSize: '0.8rem' }}>
                                            {abo.nom.charAt(0)}
                                        </div>
                                        <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '0.9rem' }}>{abo.nom}</div>
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
                                        {abo.statut_abonnement === 'approuvé' ? 'Activé' : abo.statut_abonnement}
                                    </span>
                                </div>

                                <div style={{ padding: '20px', fontSize: '0.9rem', color: '#64748b', flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FaCalendarAlt size={12} /> {new Date(abo.date_demande).toLocaleDateString('fr-FR')}</div>
                                </div>

                                <div style={{ padding: '12px 15px', background: '#fef3c7' }}>
                                    <div style={{ background: '#fff', padding: '10px', borderRadius: '10px', border: '1px solid #d4af37', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: (abo.statut_abonnement === 'approuvé' && (abo.generated_mail || abo.generated_password)) ? '10px' : '0' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', fontSize: '0.8rem' }}>
                                            <FaPhoneAlt />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Téléphone</div>
                                            <div style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: 'bold' }}>{abo.telephone || 'Non fourni'}</div>
                                        </div>
                                    </div>

                                    {abo.statut_abonnement === 'approuvé' && (abo.generated_mail || abo.generated_password) && (
                                        <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '10px', borderRadius: '10px', border: '1px dashed #10b981' }}>
                                            <div style={{ fontSize: '0.65rem', color: '#059669', marginBottom: '8px', fontWeight: 'bold', textTransform: 'uppercase' }}>Identifiants</div>
                                            {abo.generated_mail && (
                                                <div style={{ marginBottom: '5px', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: '#64748b' }}>Email:</span>
                                                    <span style={{ color: '#1e293b', fontWeight: 'bold' }}>{abo.generated_mail}</span>
                                                </div>
                                            )}
                                            {abo.generated_password && (
                                                <div style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: '#64748b' }}>Pass:</span>
                                                    <span style={{ color: '#1e293b', fontWeight: 'bold' }}>{abo.generated_password}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div style={{ padding: '12px 15px', display: 'flex', gap: '8px' }}>
                                    {abo.statut_abonnement === 'en_attente' && (
                                        <>
                                            <button onClick={() => handleGenerateAccount(abo._id)} className="premium-btn-cta gold" style={{ flex: 1, padding: '6px', fontSize: '0.75rem' }}><FaKey size={10} /> Générer</button>
                                            <button onClick={() => handleUpdateStatut(abo._id, 'refusé')} className="premium-btn-cta secondary" style={{ flex: 1, padding: '6px', fontSize: '0.75rem', color: '#dc2626', borderColor: '#fecaca' }}><FaUserTimes /> Refuser</button>
                                        </>
                                    )}
                                    <button onClick={() => handleDeleteAbonnement(abo._id)} className="premium-btn-cta secondary" style={{ padding: '6px', minWidth: 'auto', background: '#fee2e2', color: '#ef4444', borderColor: '#fecaca' }}><FaTrashAlt size={12} /></button>
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

            {generatedCreds && (
                <div className="premium-modal-backdrop" onClick={() => setGeneratedCreds(null)}>
                    <div className="premium-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', padding: '40px' }}>
                        <button onClick={() => setGeneratedCreds(null)} className="premium-modal-close-icon"><FaTimes /></button>
                        
                        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <div style={{ width: '80px', height: '80px', background: '#ecfdf5', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 20px' }}>
                                <FaCheck />
                            </div>
                            <h2 style={{ color: '#064e3b', marginBottom: '10px' }}>Compte VIP Prêt !</h2>
                            <p style={{ color: '#64748b' }}>Veuillez copier et envoyer ces identifiants au client.</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '5px' }}>Email</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{generatedCreds.email}</span>
                                    <button onClick={() => copyToClipboard(generatedCreds.email)} style={{ background: 'none', border: 'none', color: '#D4AF37', cursor: 'pointer' }}>
                                        {copied ? <FaCheck /> : <FaCopy />}
                                    </button>
                                </div>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '5px' }}>Mot de passe</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 'bold', color: '#1e293b', letterSpacing: '1px' }}>{generatedCreds.password}</span>
                                    <button onClick={() => copyToClipboard(generatedCreds.password)} style={{ background: 'none', border: 'none', color: '#D4AF37', cursor: 'pointer' }}>
                                        {copied ? <FaCheck /> : <FaCopy />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button onClick={() => setGeneratedCreds(null)} className="premium-btn-cta gold" style={{ width: '100%', marginTop: '30px' }}>
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}