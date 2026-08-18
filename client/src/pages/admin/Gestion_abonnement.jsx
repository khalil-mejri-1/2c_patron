import React, { useState, useEffect } from 'react';
import NavbarAdmin from '../../comp/Navbar_admin';
import { FaUserCheck, FaUserTimes, FaSpinner, FaPhoneAlt, FaTrashAlt, FaCrown, FaCalendarAlt, FaEnvelope, FaIdCard, FaTimes, FaKey, FaCopy, FaCheck, FaClock, FaExclamationTriangle, FaPlusCircle } from 'react-icons/fa';
import BASE_URL from '../../apiConfig';
import { useAlert } from '../../context/AlertContext';

const API_BASE_URL = `${BASE_URL}/api/abonnement`;

// Live Countdown Component for Abonnement Cards
function LiveCountdown({ expiresAt, isExpired }) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

    useEffect(() => {
        if (!expiresAt) return;
        
        const calculateTimeLeft = () => {
            const diff = new Date(expiresAt).getTime() - Date.now();
            if (diff <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
            } else {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((diff / (1000 * 60)) % 60);
                const seconds = Math.floor((diff / 1000) % 60);
                setTimeLeft({ days, hours, minutes, seconds, isPast: false });
            }
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(interval);
    }, [expiresAt]);

    if (!expiresAt) return null;

    if (timeLeft.isPast || isExpired) {
        return (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '6px 10px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaExclamationTriangle size={12} />
                <span>Expiré (Accès VIP Bloqué)</span>
            </div>
        );
    }

    return (
        <div style={{ background: 'rgba(212, 175, 55, 0.12)', border: '1px solid #d4af37', color: '#856404', padding: '6px 10px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaClock size={12} style={{ color: '#d4af37' }} />
            <span>
                {timeLeft.days > 0 ? `${timeLeft.days}j ` : ''}
                {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
            </span>
        </div>
    );
}

export default function Gestion_abonnement() {
    const [abonnements, setAbonnements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showAlert } = useAlert();
    const [generatedCreds, setGeneratedCreds] = useState(null);
    const [copied, setCopied] = useState(false);

    // Extension Modal States
    const [extendModalAbo, setExtendModalAbo] = useState(null);
    const [extendAmount, setExtendAmount] = useState(1);
    const [extendUnit, setExtendUnit] = useState('days');
    const [isSubmittingExtend, setIsSubmittingExtend] = useState(false);

    const fetchAbonnements = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_BASE_URL);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Échec du chargement.');
            
            // Sort by _id descending to show newest requests first
            const sortedData = data.sort((a, b) => b._id.localeCompare(a._id));
            setAbonnements(sortedData);
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
                    generated_password: data.password,
                    vipExpiresAt: data.vipExpiresAt
                } : abo));
                setGeneratedCreds({
                    email: data.email,
                    password: data.password,
                    vipExpiresAt: data.vipExpiresAt
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

    const handleExtendDuration = async () => {
        if (!extendModalAbo) return;
        setIsSubmittingExtend(true);
        try {
            const response = await fetch(`${API_BASE_URL}/${extendModalAbo._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    extendTime: {
                        amount: Number(extendAmount),
                        unit: extendUnit
                    }
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Erreur lors de la prolongation.');

            setAbonnements(prev => prev.map(abo => abo._id === extendModalAbo._id ? data.abonnement : abo));
            showAlert('success', 'Succès', 'Abonnement prolongé avec succès ! VIP débloqué.');
            setExtendModalAbo(null);
        } catch (err) {
            showAlert('error', 'Erreur', err.message);
        } finally {
            setIsSubmittingExtend(false);
        }
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

    const expiredCount = abonnements.filter(abo => abo.statut_abonnement === 'approuvé' && abo.vipExpiresAt && new Date(abo.vipExpiresAt).getTime() < Date.now()).length;

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <NavbarAdmin />

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 20px' }}>
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '2.2rem', color: '#1e293b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FaCrown style={{ color: '#D4AF37' }} /> Demandes VIP & Génération de Comptes
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '10px' }}>Gérez les demandes, suivez les décomptes VIP et prolongez les durées d'accès.</p>
                </div>

                {/* 🔔 Notification Banner for Expired Accounts */}
                {expiredCount > 0 && (
                    <div style={{ background: '#fee2e2', border: '1.5px solid #ef4444', borderRadius: '14px', padding: '16px 20px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.12)' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ef4444', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                            <FaExclamationTriangle />
                        </div>
                        <div>
                            <h4 style={{ color: '#991b1b', margin: 0, fontWeight: 'bold', fontSize: '1rem' }}>
                                Alertes d'expiration : {expiredCount} abonnement(s) VIP expiré(s) !
                            </h4>
                            <p style={{ color: '#b91c1c', margin: '4px 0 0 0', fontSize: '0.88rem' }}>
                                L'accès VIP pour ces comptes a été automatiquement bloqué. Prolongez la durée pour réactiver leur accès.
                            </p>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px' }}>
                        <FaSpinner className="spinner" style={{ fontSize: '3rem', color: '#D4AF37' }} />
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {abonnements.map((abo) => {
                            const isExpired = abo.statut_abonnement === 'approuvé' && abo.vipExpiresAt && new Date(abo.vipExpiresAt).getTime() < Date.now();
                            const isApproved = abo.statut_abonnement === 'approuvé';
                            const isActiveValid = isApproved && !isExpired;

                            return (
                                <div
                                    key={abo._id}
                                    className="premium-card"
                                    style={{
                                        padding: '0',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        border: isExpired 
                                            ? '2px solid #ef4444' 
                                            : (isActiveValid ? '2px solid #10b981' : '1px solid #e2e8f0'),
                                        boxShadow: isExpired 
                                            ? '0 0 15px rgba(239, 68, 68, 0.25)' 
                                            : (isActiveValid ? '0 0 15px rgba(16, 185, 129, 0.2)' : 'none'),
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <div style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isExpired ? '#fef2f2' : '#f8fafc' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isExpired ? '#ef4444' : '#D4AF37', border: `1px solid ${isExpired ? '#fca5a5' : '#e2e8f0'}`, fontWeight: 'bold', fontSize: '0.8rem' }}>
                                                {abo.nom.charAt(0)}
                                            </div>
                                            <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '0.9rem' }}>{abo.nom}</div>
                                        </div>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '15px',
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold',
                                            background: isExpired ? '#fee2e2' : (abo.statut_abonnement === 'approuvé' ? '#ecfdf5' : (abo.statut_abonnement === 'refusé' ? '#fee2e2' : '#fef3c7')),
                                            color: isExpired ? '#dc2626' : (abo.statut_abonnement === 'approuvé' ? '#059669' : (abo.statut_abonnement === 'refusé' ? '#dc2626' : '#d97706')),
                                            textTransform: 'uppercase'
                                        }}>
                                            {isExpired ? 'Expiré' : (abo.statut_abonnement === 'approuvé' ? 'Activé' : abo.statut_abonnement)}
                                        </span>
                                    </div>

                                    <div style={{ padding: '16px', fontSize: '0.9rem', color: '#64748b', flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                            <FaCalendarAlt size={12} /> {new Date(abo.date_demande).toLocaleDateString('fr-FR')}
                                        </div>

                                        {(abo.offre_nom || abo.duree || abo.prix) && (
                                            <div style={{ background: isExpired ? '#fef2f2' : '#f8fafc', border: `1px solid ${isExpired ? '#fecaca' : '#e2e8f0'}`, borderRadius: '10px', padding: '10px 12px', marginBottom: '12px' }}>
                                                {abo.offre_nom && (
                                                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '6px' }}>
                                                        {abo.offre_nom}
                                                    </div>
                                                )}
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.82rem', flexWrap: 'wrap' }}>
                                                    {abo.duree && (
                                                        <span style={{ background: 'rgba(212, 175, 55, 0.15)', color: '#b39224', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                                                            ⏱️ {abo.duree}
                                                        </span>
                                                    )}
                                                    {abo.prix && (
                                                        <span style={{ background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                                                            💰 {abo.prix}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Live Countdown Display */}
                                        {abo.statut_abonnement === 'approuvé' && (
                                            <div style={{ marginTop: '10px' }}>
                                                <LiveCountdown expiresAt={abo.vipExpiresAt} isExpired={isExpired} />
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ padding: '12px 15px', background: isExpired ? '#fef2f2' : '#fef3c7' }}>
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
                                            <div style={{ background: isExpired ? '#fee2e2' : 'rgba(16, 185, 129, 0.05)', padding: '10px', borderRadius: '10px', border: `1px dashed ${isExpired ? '#ef4444' : '#10b981'}` }}>
                                                <div style={{ fontSize: '0.65rem', color: isExpired ? '#dc2626' : '#059669', marginBottom: '8px', fontWeight: 'bold', textTransform: 'uppercase' }}>Identifiants VIP</div>
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

                                    <div style={{ padding: '12px 15px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {abo.statut_abonnement === 'en_attente' && (
                                            <>
                                                <button onClick={() => handleGenerateAccount(abo._id)} className="premium-btn-cta gold" style={{ flex: 1, padding: '6px', fontSize: '0.75rem' }}><FaKey size={10} /> Générer</button>
                                                <button onClick={() => handleUpdateStatut(abo._id, 'refusé')} className="premium-btn-cta secondary" style={{ flex: 1, padding: '6px', fontSize: '0.75rem', color: '#dc2626', borderColor: '#fecaca' }}><FaUserTimes /> Refuser</button>
                                            </>
                                        )}
                                        {abo.statut_abonnement === 'approuvé' && (
                                            <button
                                                onClick={() => setExtendModalAbo(abo)}
                                                className="premium-btn-cta gold"
                                                style={{ flex: 1, padding: '6px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                                            >
                                                <FaPlusCircle size={12} /> Prolonger / Rétablir
                                            </button>
                                        )}
                                        <button onClick={() => handleDeleteAbonnement(abo._id)} className="premium-btn-cta secondary" style={{ padding: '6px 10px', minWidth: 'auto', background: '#fee2e2', color: '#ef4444', borderColor: '#fecaca' }}><FaTrashAlt size={12} /></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {abonnements.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '80px', background: '#fff', borderRadius: '20px', color: '#64748b' }}>
                        Aucune demande trouvée.
                    </div>
                )}
            </div>

            {/* Modal: Credentials Generated */}
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

            {/* Modal: Extension / Prolongation */}
            {extendModalAbo && (
                <div className="premium-modal-backdrop" onClick={() => setExtendModalAbo(null)}>
                    <div className="premium-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', padding: '30px' }}>
                        <button onClick={() => setExtendModalAbo(null)} className="premium-modal-close-icon"><FaTimes /></button>

                        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                            <div style={{ width: '60px', height: '60px', background: 'rgba(212, 175, 55, 0.15)', color: '#D4AF37', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 15px' }}>
                                <FaPlusCircle />
                            </div>
                            <h3 style={{ color: '#1e293b', margin: '0 0 6px 0' }}>Prolonger l'accès VIP</h3>
                            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Client : <strong>{extendModalAbo.nom}</strong> ({extendModalAbo.generated_mail || extendModalAbo.mail})</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '6px' }}>Nombre / Valeur :</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={extendAmount}
                                    onChange={e => setExtendAmount(e.target.value)}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '6px' }}>Unité de temps :</label>
                                <select
                                    value={extendUnit}
                                    onChange={e => setExtendUnit(e.target.value)}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1rem', background: '#fff' }}
                                >
                                    <option value="minutes">Minute(s) [Pour test fast]</option>
                                    <option value="hours">Heure(s)</option>
                                    <option value="days">Jour(s)</option>
                                    <option value="months">Mois</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                            <button
                                onClick={handleExtendDuration}
                                disabled={isSubmittingExtend}
                                className="premium-btn-cta gold"
                                style={{ flex: 1, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                {isSubmittingExtend ? <FaSpinner className="spinner" /> : <><FaCheck /> Valider la prolongation</>}
                            </button>
                            <button
                                onClick={() => setExtendModalAbo(null)}
                                className="premium-btn-cta secondary"
                                style={{ padding: '10px 20px' }}
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}