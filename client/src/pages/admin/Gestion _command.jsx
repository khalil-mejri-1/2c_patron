import React, { useState, useEffect } from 'react';
import NavbarAdmin from '../../comp/Navbar_admin';
import { FaImage, FaSpinner, FaShoppingBag, FaTimes, FaTrash, FaEdit, FaCheckCircle, FaBus, FaClock, FaBan, FaCalendarAlt, FaUser, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';
import BASE_URL from '../../apiConfig';
import { useAlert } from '../../context/AlertContext';

const API_BASE_URL = `${BASE_URL}/api/commands`;

const statusOptions = [
    'En attente',
    'En cours de traitement',
    'Expédiée',
    'Livrée',
    'Annulée'
];

const getStatusStyles = (status) => {
    switch (status) {
        case 'Livrée': return { bg: '#ecfdf5', color: '#059669', icon: <FaCheckCircle /> };
        case 'Expédiée': return { bg: '#eff6ff', color: '#2563eb', icon: <FaBus /> };
        case 'En cours de traitement': return { bg: '#fef3c7', color: '#d97706', icon: <FaClock /> };
        case 'Annulée': return { bg: '#fee2e2', color: '#dc2626', icon: <FaBan /> };
        default: return { bg: '#f1f5f9', color: '#475569', icon: <FaClock /> };
    }
};

export default function Gestion_de_Command() {
    const [commands, setCommands] = useState([]);
    const [loading, setLoading] = useState(false);
    const { showAlert } = useAlert();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentCommand, setCurrentCommand] = useState(null);
    const [newStatus, setNewStatus] = useState('');

    useEffect(() => {
        fetchCommands();
    }, []);

    const fetchCommands = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) throw new Error("Échec du chargement.");
            const data = await response.json();
            setCommands(data);
        } catch (err) {
            showAlert('error', 'Erreur', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCommand = (id) => {
        showAlert('confirm', 'Supprimer Commande', 'Voulez-vous supprimer cette commande ?', async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Erreur de suppression.');
                setCommands(prev => prev.filter(cmd => cmd._id !== id));
                showAlert('success', 'Succès', 'Commande supprimée.');
            } catch (err) {
                showAlert('error', 'Erreur', err.message);
            }
        });
    };

    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/${currentCommand._id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            const updated = await response.json();
            if (!response.ok) throw new Error('Erreur de mise à jour.');
            setCommands(prev => prev.map(cmd => cmd._id === updated._id ? updated : cmd));
            showAlert('success', 'Succès', 'Statut mis à jour.');
            setIsEditModalOpen(false);
        } catch (err) {
            showAlert('error', 'Erreur', err.message);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <NavbarAdmin />

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.2rem', color: '#1e293b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FaShoppingBag style={{ color: '#D4AF37' }} /> Gestion des Commandes
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '10px' }}>Suivez et gérez les commandes de vos clients.</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px' }}>
                        <FaSpinner className="spinner" style={{ fontSize: '3rem', color: '#D4AF37' }} />
                        <p style={{ marginTop: '20px', fontWeight: 'bold' }}>Chargement...</p>
                    </div>
                ) : (
                    <div className="premium-list-container">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {commands.map(cmd => {
                                const st = getStatusStyles(cmd.status);
                                return (
                                    <div key={cmd._id} className="premium-card" style={{ padding: '25px', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '30px', alignItems: 'center' }}>
                                        <div style={{ width: '100px', height: '100px', background: '#f1f5f9', borderRadius: '15px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {cmd.items[0]?.productImage ? (
                                                <img src={cmd.items[0].productImage} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <FaImage size={30} color="#cbd5e1" />
                                            )}
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem', marginBottom: '5px' }}>
                                                    <FaUser size={12} /> {cmd.clientName}
                                                </div>
                                                <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>{cmd.items[0]?.productName || 'Commande multiple'}</h4>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', fontSize: '0.85rem', color: '#64748b' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaPhoneAlt size={10} /> {cmd.clientPhone}</span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaMapMarkerAlt size={10} /> {cmd.shippingAddress}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem', marginBottom: '8px' }}>
                                                    <FaCalendarAlt size={12} /> {formatDate(cmd.orderDate)}
                                                </div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#D4AF37' }}>{cmd.totalAmount.toFixed(2)} DT</div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <span style={{
                                                    display: 'flex', alignItems: 'center', gap: '8px',
                                                    padding: '8px 15px', borderRadius: '25px',
                                                    fontSize: '0.85rem', fontWeight: 'bold',
                                                    background: st.bg, color: st.color
                                                }}>
                                                    {st.icon} {cmd.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <button
                                                onClick={() => { setCurrentCommand(cmd); setNewStatus(cmd.status); setIsEditModalOpen(true); }}
                                                className="premium-btn-cta secondary"
                                                style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                                            >
                                                <FaEdit /> Statut
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCommand(cmd._id)}
                                                className="premium-btn-cta secondary"
                                                style={{ padding: '10px 20px', fontSize: '0.85rem', color: '#ef4444', borderColor: '#fecaca' }}
                                            >
                                                <FaTrash /> Supprimer
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {commands.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '20px', color: '#64748b' }}>
                                Aucune commande trouvée.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isEditModalOpen && currentCommand && (
                <div className="premium-modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
                    <div className="premium-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                        <div className="premium-modal-header">
                            <h3 className="premium-modal-title">Modifier Statut</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="premium-modal-close-icon"><FaTimes /></button>
                        </div>
                        <form onSubmit={handleUpdateStatus} className="premium-form-grid" style={{ marginTop: '20px' }}>
                            <div className="premium-form-group" style={{ gridColumn: 'span 4' }}>
                                <label>Nouveau Statut</label>
                                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="premium-btn-group" style={{ gridColumn: 'span 4', marginTop: '20px' }}>
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="premium-btn-cta secondary">Annuler</button>
                                <button type="submit" className="premium-btn-cta gold"><FaSave /> Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}