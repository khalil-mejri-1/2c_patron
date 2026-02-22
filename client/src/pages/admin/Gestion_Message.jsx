import React, { useState, useEffect } from 'react';
import NavbarAdmin from '../../comp/Navbar_admin';
import { FaTrash, FaSpinner, FaEnvelopeOpenText, FaTimes, FaToggleOn, FaToggleOff, FaCalendarAlt, FaUser, FaEnvelope, FaExclamationCircle } from 'react-icons/fa';
import BASE_URL from '../../apiConfig';
import { useAlert } from '../../context/AlertContext';

const API_MESSAGES_ENDPOINT = `${BASE_URL}/api/messages`;

export default function Gestion_Message() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { showAlert } = useAlert();

    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_MESSAGES_ENDPOINT);
            if (!response.ok) throw new Error('Échec du chargement.');
            const data = await response.json();
            setMessages(data);
            setError(null);
        } catch (err) {
            setError('Impossible de charger les messages.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleDelete = (message) => {
        showAlert('confirm', 'Supprimer Message', `Voulez-vous supprimer le message de ${message.nom} ?`, async () => {
            try {
                const response = await fetch(`${API_MESSAGES_ENDPOINT}/${message._id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Erreur de suppression.');
                setMessages(prev => prev.filter(msg => msg._id !== message._id));
                showAlert('success', 'Succès', 'Message supprimé.');
                if (isMessageModalOpen) setIsMessageModalOpen(false);
            } catch (err) {
                showAlert('error', 'Erreur', 'Féchec de suppression.');
            }
        });
    };

    const toggleTreatedStatus = async (id) => {
        try {
            const response = await fetch(`${API_MESSAGES_ENDPOINT}/${id}/status`, { method: 'PUT' });
            if (!response.ok) throw new Error("Erreur de statut.");
            const updated = await response.json();
            setMessages(prev => prev.map(msg => msg._id === id ? updated : msg));
            if (selectedMessage && selectedMessage._id === id) setSelectedMessage(updated);
        } catch (err) {
            showAlert('error', 'Erreur', 'Échec de mise à jour.');
        }
    };

    const handleOpenMessageModal = (message) => {
        setSelectedMessage(message);
        setIsMessageModalOpen(true);
        if (!message.estTraite) toggleTreatedStatus(message._id);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <NavbarAdmin />

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.2rem', color: '#1e293b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FaEnvelopeOpenText style={{ color: '#D4AF37' }} /> Messages Clients
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '10px' }}>Gérez les demandes et contacts de vos utilisateurs.</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px' }}>
                        <FaSpinner className="spinner" style={{ fontSize: '3rem', color: '#D4AF37' }} />
                    </div>
                ) : (
                    <div className="premium-list-container">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {messages.map((msg) => (
                                <div
                                    key={msg._id}
                                    className="premium-list-item"
                                    onClick={() => handleOpenMessageModal(msg)}
                                    style={{
                                        cursor: 'pointer',
                                        background: '#fff',
                                        borderLeft: msg.estTraite ? '5px solid #e2e8f0' : '5px solid #D4AF37',
                                        padding: '20px',
                                        display: 'grid',
                                        gridTemplateColumns: 'auto 1fr auto auto',
                                        alignItems: 'center',
                                        gap: '25px',
                                        opacity: msg.estTraite ? 0.8 : 1
                                    }}
                                >
                                    <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: msg.estTraite ? '#f1f5f9' : '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: msg.estTraite ? '#94a3b8' : '#D4AF37' }}>
                                        <FaUser />
                                    </div>

                                    <div>
                                        <div style={{ fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {msg.nom}
                                            {!msg.estTraite && <span style={{ background: '#D4AF37', color: '#fff', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase' }}>Nouveau</span>}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>{msg.sujet}</div>
                                    </div>

                                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FaCalendarAlt size={12} /> {formatDate(msg.dateCreation)}
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(msg); }}
                                            className="premium-btn-cta secondary"
                                            style={{ padding: '8px 12px', minWidth: 'auto', color: '#ef4444', borderColor: '#fecaca', background: '#fee2e2' }}
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {messages.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '20px', color: '#64748b', border: '2px dashed #e2e8f0' }}>
                                <FaEnvelope size={40} style={{ opacity: 0.2, marginBottom: '15px' }} />
                                <p>Aucun message reçu.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isMessageModalOpen && selectedMessage && (
                <div className="premium-modal-backdrop" onClick={() => setIsMessageModalOpen(false)}>
                    <div className="premium-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                        <div className="premium-modal-header">
                            <h3 className="premium-modal-title">Détail du Message</h3>
                            <button onClick={() => setIsMessageModalOpen(false)} className="premium-modal-close-icon"><FaTimes /></button>
                        </div>

                        <div style={{ marginTop: '30px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px', background: '#f8fafc', padding: '20px', borderRadius: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Expéditeur</label>
                                    <div style={{ color: '#1e293b', fontWeight: 'bold' }}>{selectedMessage.nom}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Email</label>
                                    <div style={{ color: '#1e293b' }}>{selectedMessage.email}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Sujet</label>
                                    <div style={{ color: '#1e293b' }}>{selectedMessage.sujet}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Date</label>
                                    <div style={{ color: '#1e293b' }}>{formatDate(selectedMessage.dateCreation)}</div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Message</label>
                                <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px', color: '#334155', lineHeight: '1.6', minHeight: '150px' }}>
                                    {selectedMessage.message}
                                </div>
                            </div>

                            <div className="premium-btn-group">
                                <button
                                    onClick={() => toggleTreatedStatus(selectedMessage._id)}
                                    className="premium-btn-cta secondary"
                                    style={{ flex: 1 }}
                                >
                                    {selectedMessage.estTraite ? <FaToggleOn /> : <FaToggleOff />}
                                    {selectedMessage.estTraite ? ' Marquer Non-Traité' : ' Marquer Traité'}
                                </button>
                                <button
                                    onClick={() => handleDelete(selectedMessage)}
                                    className="premium-btn-cta secondary"
                                    style={{ flex: 1, background: '#fee2e2', color: '#ef4444', borderColor: '#fecaca' }}
                                >
                                    <FaTrash /> Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}