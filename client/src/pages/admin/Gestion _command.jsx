import React, { useState, useEffect } from 'react';
import NavbarAdmin from '../../comp/Navbar_admin';
import { FaSearch, FaFilter, FaImage, FaSpinner, FaShoppingBag, FaTimes, FaTrash, FaEdit, FaCheckCircle, FaBus, FaClock, FaBan, FaCalendarAlt, FaUser, FaPhoneAlt, FaMapMarkerAlt, FaSave } from 'react-icons/fa';
import BASE_URL from '../../apiConfig';
import { useAlert } from '../../context/AlertContext';
import { useLanguage } from '../../context/LanguageContext';

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
    const { appLanguage } = useLanguage();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [currentCommand, setCurrentCommand] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [showResetSuccess, setShowResetSuccess] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('Tous');

    useEffect(() => {
        fetchCommands();
    }, []);

    const fetchCommands = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) throw new Error("Échec du chargement.");
            const data = await response.json();
            
            // Sort by orderDate descending (newest first)
            const sortedCommands = data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
            setCommands(sortedCommands);
        } catch (err) {
            showAlert('error', 'Erreur', err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredCommands = commands.filter(cmd => {
        const matchesStatus = filterStatus === 'Tous' || 
                              cmd.status === filterStatus ||
                              (cmd.subOrders && cmd.subOrders.some(sub => sub.status === filterStatus));
        const matchesSearch = 
            cmd.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
            cmd.clientPhone.includes(searchTerm) ||
            cmd.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (cmd.subOrders && cmd.subOrders.some(sub => 
                sub.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()))
            ));
        return matchesStatus && matchesSearch;
    });

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

    const handleDeleteAll = () => {
        showAlert('confirm', 'Supprimer Tout', 'Voulez-vous supprimer TOUTES les commandes ? Cette action est irréversible.', async () => {
            try {
                const response = await fetch(API_BASE_URL, { method: 'DELETE' });
                if (!response.ok) throw new Error('Erreur de suppression.');
                setCommands([]);
                showAlert('success', 'Succès', 'Toutes les commandes ont été supprimées.');
            } catch (err) {
                showAlert('error', 'Erreur', err.message);
            }
        });
    };

    const handleResetGrouping = async () => {
        const title = appLanguage === 'ar' ? 'بدء جلسة جديدة' : 'Nouvelle Session';
        const msg = appLanguage === 'ar' 
            ? 'هل تريد بدء جلسة طلبات جديدة؟ الطلبات القادمة من نفس الأشخاص ستكون منفصلة عن الطلبات الحالية.' 
            : 'Voulez-vous commencer une nouvelle session de commandes ? Les nouveaux articles ne seront plus ajoutés aux commandes en attente actuelles.';
        
        showAlert('confirm', title, msg, async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/commands/reset-grouping`, { method: 'POST' });
                if (!response.ok) throw new Error('Erreur lors du reset.');
                
                setShowResetSuccess(true);
                setTimeout(() => setShowResetSuccess(false), 3000);
                
                showAlert('success', 'Succès', appLanguage === 'ar' ? 'تم بدء جلسة جديدة بنجاح' : 'Une nouvelle session de commandes a commencé.');
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

    const handleDeleteSubOrder = (commandId, subId) => {
        showAlert('confirm', 'Supprimer Sous-Commande', 'Voulez-vous supprimer ce groupe d\'articles spécifique ?', async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/${commandId}/sub-order/${subId}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Erreur de suppression.');
                const updated = await response.json();

                if (updated.subOrders.length === 0) {
                    setCommands(prev => prev.filter(cmd => cmd._id !== commandId));
                    setIsDetailsModalOpen(false);
                } else {
                    setCommands(prev => prev.map(cmd => cmd._id === updated._id ? updated : cmd));
                    // Update current command in modal
                    setCurrentCommand(updated);
                }

                showAlert('success', 'Succès', 'Sous-commande supprimée.');
            } catch (err) {
                showAlert('error', 'Erreur', err.message);
            }
        });
    };

    const handleUpdateSubOrderStatus = async (commandId, subId, status) => {
        try {
            const response = await fetch(`${BASE_URL}/api/commands/${commandId}/sub-order/${subId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (!response.ok) throw new Error('Erreur de mise à jour.');
            const updated = await response.json();
            setCommands(prev => prev.map(cmd => cmd._id === updated._id ? updated : cmd));
            setCurrentCommand(updated);
            showAlert('success', 'Succès', 'Statut du groupe mis à jour.');
        } catch (err) {
            showAlert('error', 'Erreur', err.message);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <NavbarAdmin />

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '100px 20px' }}>
                <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <h1 style={{ fontSize: '2.2rem', color: '#1e293b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <FaShoppingBag style={{ color: '#D4AF37' }} /> Gestion des Commandes
                        </h1>
                        <p style={{ color: '#64748b', marginTop: '10px' }}>Suivez et gérez les commandes de vos clients.</p>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <button
                            onClick={handleResetGrouping}
                            className={`premium-btn-cta ${showResetSuccess ? 'success' : 'gold'}`}
                            style={{ 
                                padding: '12px 25px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px',
                                background: showResetSuccess ? '#22c55e' : 'linear-gradient(135deg, #D4AF37, #B48A1B)',
                                borderColor: showResetSuccess ? '#22c55e' : 'transparent',
                                color: '#fff',
                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                            }}
                        >
                            {showResetSuccess ? (
                                <>
                                    <FaCheckCircle style={{ animation: 'scaleIn 0.3s forwards' }} /> 
                                    {appLanguage === 'ar' ? 'تم البدء!' : 'Session lancée !'}
                                </>
                            ) : (
                                <>
                                    <FaClock /> 
                                    {appLanguage === 'ar' ? 'بدء جلسة طلبات جديدة' : 'Nouvelle Session'}
                                </>
                            )}
                        </button>

                        {commands.length > 0 && (
                            <button
                                onClick={handleDeleteAll}
                                className="premium-btn-cta secondary"
                                style={{ padding: '12px 25px', color: '#ef4444', borderColor: '#fecaca', background: '#fff' }}
                            >
                                <FaTrash /> Supprimer Tout
                            </button>
                        )}
                    </div>
                </div>

                {/* 🔍 Section Filtrage */}
                <div style={{ 
                    background: '#fff', 
                    padding: '25px', 
                    borderRadius: '25px', 
                    boxShadow: '0 10px 25px rgba(0,0,0,0.05)', 
                    marginBottom: '30px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '20px',
                    alignItems: 'center',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ flex: '1', minWidth: '250px', position: 'relative' }}>
                        <FaSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input 
                            type="text" 
                            placeholder={appLanguage === 'ar' ? 'بحث باسم العميل، رقم الهاتف، أو اسم المنتج...' : 'Rechercher par client, téléphone ou produit...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ 
                                width: '100%', 
                                padding: '12px 15px 12px 45px', 
                                borderRadius: '15px', 
                                border: '1px solid #e2e8f0',
                                outline: 'none',
                                fontSize: '0.95rem'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', minWidth: '200px' }}>
                        <FaFilter style={{ color: '#D4AF37' }} />
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{ 
                                flex: '1',
                                padding: '12px', 
                                borderRadius: '15px', 
                                border: '1px solid #e2e8f0',
                                outline: 'none',
                                background: '#f8fafc',
                                fontWeight: '600',
                                color: '#1e293b'
                            }}
                        >
                            <option value="Tous">{appLanguage === 'ar' ? 'الكل' : 'Tous les statuts'}</option>
                            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '800' }}>
                        {filteredCommands.length} {appLanguage === 'ar' ? 'طلبات وجدت' : 'commandes trouvées'}
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px' }}>
                        <FaSpinner className="spinner" style={{ fontSize: '3rem', color: '#D4AF37' }} />
                        <p style={{ marginTop: '20px', fontWeight: 'bold' }}>Chargement...</p>
                    </div>
                ) : (
                    <div className="premium-list-container">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {filteredCommands.map(cmd => {
                                const st = getStatusStyles(cmd.status);
                                return (
                                    <div
                                        key={cmd._id}
                                        className="premium-card"
                                        style={{
                                            position: 'relative',
                                            background: '#fff',
                                            borderRadius: '20px',
                                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                                            border: cmd.combinedCount > 1 ? '2px solid #D4AF37' : '1px solid #e2e8f0',
                                            overflow: 'hidden',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            marginBottom: '20px'
                                        }}
                                    >
                                        {/* Minimal Compact Header */}
                                        <div style={{
                                            padding: '15px 25px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            borderBottom: '1px solid #f1f5f9',
                                            background: '#fff'
                                        }}>
                                            {cmd.combinedCount > 1 && (
                                                <div style={{
                                                    position: 'absolute', top: '0', left: '0',
                                                    background: 'linear-gradient(135deg, #D4AF37, #B48A1B)',
                                                    color: '#fff', padding: '5px 15px', 
                                                    borderBottomRightRadius: '15px',
                                                    fontSize: '0.7rem', fontWeight: '900', boxShadow: '2px 2px 10px rgba(212, 175, 55, 0.2)',
                                                    zIndex: 2
                                                }}>
                                                    {cmd.combinedCount} <FaShoppingBag style={{ display: 'inline', marginLeft: '4px' }} />
                                                </div>
                                            )}

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: cmd.combinedCount > 1 ? '15px' : '0' }}>
                                                {/* Compact Client Info */}
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <FaUser size={12} color="#94a3b8" /> {cmd.clientName}
                                                        <span style={{ color: '#e2e8f0' }}>|</span>
                                                        <FaPhoneAlt size={10} color="#94a3b8" /> {cmd.clientPhone}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <FaMapMarkerAlt size={10} color="#cbd5e1" /> {cmd.shippingAddress}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                {/* Compact Total & Date */}
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#D4AF37' }}>{cmd.totalAmount.toFixed(2)} DT</div>
                                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end', marginTop: '2px' }}>
                                                        <FaCalendarAlt size={10} /> {formatDate(cmd.orderDate)}
                                                    </div>
                                                </div>
                                                
                                                {/* Elegant Delete Button */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteCommand(cmd._id); }}
                                                    style={{ 
                                                        background: '#fff0f2', color: '#ef4444', border: '1px solid #ffe4e6', 
                                                        width: '38px', height: '38px', borderRadius: '50%', 
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        cursor: 'pointer', transition: 'all 0.3s ease'
                                                    }}
                                                    title="Supprimer la commande"
                                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#ffe4e6'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = '#fff0f2'; e.currentTarget.style.transform = 'scale(1)'; }}
                                                >
                                                    <FaTrash size={12} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Row 2: Inline Products View */}
                                        <div style={{ background: '#f8fafc', padding: '20px 25px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <FaShoppingBag /> {appLanguage === 'ar' ? 'المنتجات في هذا الطلب' : 'Produits dans cette commande'}
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                                                {(cmd.subOrders && cmd.subOrders.length > 0 ? cmd.subOrders : [{ items: cmd.items, totalAmount: cmd.totalAmount, submissionDate: cmd.orderDate, _id: 'legacy' }])
                                                .filter(sub => filterStatus === 'Tous' || (sub.status || cmd.status) === filterStatus)
                                                .map((sub, idx) => (
                                                    <div key={sub._id || idx} style={{ background: '#fff', borderRadius: '15px', padding: '15px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontWeight: 'bold', borderBottom: '1px dashed #e2e8f0', paddingBottom: '10px' }}>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8' }}><FaClock /> {formatDate(sub.submissionDate)}</span>
                                                            <select
                                                                value={sub.status || cmd.status}
                                                                onChange={async (e) => {
                                                                    const newStat = e.target.value;
                                                                    try {
                                                                        if (sub._id === 'legacy') {
                                                                            // Update global status for legacy orders
                                                                            const res = await fetch(`${API_BASE_URL}/${cmd._id}/status`, {
                                                                                method: 'PUT',
                                                                                headers: { 'Content-Type': 'application/json' },
                                                                                body: JSON.stringify({ status: newStat }),
                                                                            });
                                                                            if (res.ok) {
                                                                                const updated = await res.json();
                                                                                setCommands(prev => prev.map(c => c._id === updated._id ? updated : c));
                                                                            }
                                                                        } else {
                                                                            // Update explicit sub-order status
                                                                            const res = await fetch(`${API_BASE_URL}/${cmd._id}/sub-order/${sub._id}/status`, {
                                                                                method: 'PUT',
                                                                                headers: { 'Content-Type': 'application/json' },
                                                                                body: JSON.stringify({ status: newStat }),
                                                                            });
                                                                            if (res.ok) {
                                                                                const updated = await res.json();
                                                                                setCommands(prev => prev.map(c => c._id === updated._id ? updated : c));
                                                                            }
                                                                        }
                                                                    } catch (err) {
                                                                        console.error(err);
                                                                    }
                                                                }}
                                                                style={{ 
                                                                    color: getStatusStyles(sub.status || cmd.status).color, 
                                                                    background: getStatusStyles(sub.status || cmd.status).bg, 
                                                                    padding: '4px 15px', 
                                                                    borderRadius: '20px',
                                                                    border: '1px solid transparent',
                                                                    outline: 'none',
                                                                    cursor: 'pointer',
                                                                    fontWeight: 'bold',
                                                                    fontSize: '0.75rem',
                                                                    textAlign: 'center',
                                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                                                    transition: 'all 0.3s ease'
                                                                }}
                                                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                            >
                                                                {statusOptions.map(opt => (
                                                                    <option key={opt} value={opt} style={{ color: '#334155', background: '#fff', fontWeight: 'bold' }}>
                                                                        {opt}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        {sub.items.map((item, i) => (
                                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                <div style={{ width: '45px', height: '45px', borderRadius: '10px', overflow: 'hidden', background: '#f1f5f9', flexShrink: 0 }}>
                                                                    {item.productImage ? <img src={item.productImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FaImage color="#cbd5e1" style={{ margin: '15px' }} />}
                                                                </div>
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#334155', lineHeight: '1.2', marginBottom: '4px' }}>{item.productName}</div>
                                                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                                                                        <span>x{item.quantity}</span>
                                                                        <span style={{ color: '#D4AF37' }}>{(item.price * item.quantity).toFixed(2)} DT</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {filteredCommands.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '20px', color: '#64748b', border: '1px dashed #e2e8f0' }}>
                                <FaSearch size={40} style={{ marginBottom: '15px', opacity: 0.3 }} />
                                <p>{appLanguage === 'ar' ? 'لم يتم العثور على طلبات تطابق بحثك.' : 'Aucune commande ne correspond à votre recherche.'}</p>
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
            {isDetailsModalOpen && currentCommand && (
                <div className="premium-modal-backdrop" onClick={() => setIsDetailsModalOpen(false)}>
                    <div className="premium-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '95%', padding: '40px', borderRadius: '35px' }}>
                        <div className="premium-modal-header" style={{ marginBottom: '30px' }}>
                            <h3 className="premium-modal-title" style={{ fontSize: '1.8rem', color: '#D4AF37', fontFamily: "'Playfair Display', serif" }}>Détails de la Commande</h3>
                            <button onClick={() => setIsDetailsModalOpen(false)} className="premium-modal-close-icon" style={{ background: '#f1f5f9' }}><FaTimes /></button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '40px', padding: '30px', background: '#f8fafc', borderRadius: '25px', border: '1px solid #e2e8f0' }}>
                            <div>
                                <label style={{ fontSize: '0.7rem', fontWeight: '900', color: '#94a3b8', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>CLIENT</label>
                                <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '1.1rem' }}>{currentCommand.clientName}</div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.7rem', fontWeight: '900', color: '#94a3b8', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>TÉLÉPHONE</label>
                                <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '1.1rem' }}>{currentCommand.clientPhone}</div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.7rem', fontWeight: '900', color: '#94a3b8', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>ADRESSE</label>
                                <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '1.1rem' }}>{currentCommand.shippingAddress}</div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.7rem', fontWeight: '900', color: '#D4AF37', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>TOTAL GLOBAL</label>
                                <div style={{ fontWeight: '900', color: '#D4AF37', fontSize: '1.5rem' }}>{currentCommand.totalAmount.toFixed(2)} DT</div>
                            </div>
                        </div>

                        <h4 style={{ marginBottom: '20px', color: '#1e293b', fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaShoppingBag size={16} /> Groupes de Commandes ({currentCommand.subOrders?.length || 1})
                        </h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '50vh', overflowY: 'auto', paddingRight: '10px' }} className="custom-scrollbar">
                            {(currentCommand.subOrders && currentCommand.subOrders.length > 0 ? currentCommand.subOrders : [{ items: currentCommand.items, totalAmount: currentCommand.totalAmount, submissionDate: currentCommand.orderDate, _id: 'legacy' }]).map((sub, idx) => (
                                <div key={sub._id || idx} style={{ border: '1px solid #e2e8f0', borderRadius: '20px', padding: '20px', background: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {sub._id !== 'legacy' && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b' }}>Statut:</label>
                                                    <select 
                                                        value={sub.status || 'En attente'} 
                                                        onChange={(e) => handleUpdateSubOrderStatus(currentCommand._id, sub._id, e.target.value)}
                                                        style={{
                                                            padding: '5px 12px',
                                                            borderRadius: '10px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 'bold',
                                                            border: '1px solid #e2e8f0',
                                                            background: getStatusStyles(sub.status || 'En attente').bg,
                                                            color: getStatusStyles(sub.status || 'En attente').color,
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </div>
                                            )}
                                        </div>

                                        {sub._id !== 'legacy' && (
                                            <button
                                                onClick={() => handleDeleteSubOrder(currentCommand._id, sub._id)}
                                                style={{ background: '#fff1f2', border: 'none', color: '#e11d48', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '800', padding: '6px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                                                onMouseOver={(e) => e.target.style.background = '#ffe4e6'}
                                                onMouseOut={(e) => e.target.style.background = '#fff1f2'}
                                            >
                                                <FaTrash size={10} /> {appLanguage === 'ar' ? 'حذف هذا الطلب' : 'Supprimer'}
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {sub.items.map((item, iidx) => (
                                            <div key={iidx} style={{ padding: '15px', background: '#f8fafc', borderRadius: '15px', border: '1px solid #f1f5f9' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.75rem', fontWeight: '800' }}>
                                                        <FaClock size={12} /> {formatDate(sub.submissionDate)}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <div style={{ width: '50px', height: '50px', background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                                        {item.productImage ? <img src={item.productImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FaImage size={20} color="#cbd5e1" style={{ margin: '15px' }} />}
                                                    </div>
                                                    <div style={{ flex: 1, fontSize: '0.95rem', fontWeight: '800', color: '#334155' }}>{item.productName}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '800' }}>x{item.quantity}</div>
                                                    <div style={{ fontWeight: '900', color: '#1e293b', minWidth: '90px', textAlign: 'right' }}>{(item.price * item.quantity).toFixed(2)} DT</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            <style>
                {`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes scaleIn {
                    from { transform: scale(0); opacity: 0; }
                    to { transform: scale(1.1); opacity: 1; }
                }
                .spinner { animation: spin 1s linear infinite; }
                `}
            </style>
        </div>
    );
}