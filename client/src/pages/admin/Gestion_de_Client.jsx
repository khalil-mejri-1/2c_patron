import React, { useState, useEffect } from 'react';
import NavbarAdmin from '../../comp/Navbar_admin';
import BASE_URL from '../../apiConfig';
import { FaUser, FaSpinner, FaTrash, FaUserShield, FaUserEdit, FaEnvelope, FaShieldAlt } from 'react-icons/fa';
import { useAlert } from '../../context/AlertContext';

export default function Gestion_de_Client() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showAlert } = useAlert();

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${BASE_URL}/api/users/clients`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Échec du chargement.');
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleStatutChange = async (userId, newStatut) => {
        showAlert('confirm', 'Changement de Rôle', `Voulez-vous changer le rôle de l'utilisateur en ${newStatut.toUpperCase()} ?`, async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/users/${userId}/statut`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ statut: newStatut }),
                });
                if (!response.ok) throw new Error('Erreur de mise à jour.');
                setUsers(prev => prev.map(u => u._id === userId ? { ...u, statut: newStatut } : u));
                showAlert('success', 'Succès', 'Rôle mis à jour !');
            } catch (err) {
                showAlert('error', 'Erreur', err.message);
            }
        });
    };

    const handleAbonneChange = async (userId, currentAbonne) => {
        const newAbonne = currentAbonne === 'oui' ? 'non' : 'oui';
        showAlert('confirm', 'Newsletter', `Voulez-vous ${newAbonne === 'oui' ? 'abonner' : 'désabonner'} cet utilisateur ?`, async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/users/${userId}/abonne`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ abonne: newAbonne }),
                });
                if (!response.ok) throw new Error('Erreur de mise à jour.');
                setUsers(prev => prev.map(u => u._id === userId ? { ...u, abonne: newAbonne } : u));
                showAlert('success', 'Succès', 'Abonnement mis à jour !');
            } catch (err) {
                showAlert('error', 'Erreur', err.message);
            }
        });
    };

    const handleDeleteUser = async (userId) => {
        showAlert('confirm', 'Supprimer Utilisateur', 'Êtes-vous sûr ? Cette action est irréversible.', async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/users/${userId}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Erreur de suppression.');
                setUsers(prev => prev.filter(u => u._id !== userId));
                showAlert('success', 'Succès', 'Utilisateur supprimé !');
            } catch (err) {
                showAlert('error', 'Erreur', err.message);
            }
        });
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <NavbarAdmin />

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2rem', color: '#1e293b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FaUserShield style={{ color: '#D4AF37' }} /> Gestion des Clients
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '10px' }}>Gérez les rôles et les accès de vos utilisateurs.</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px' }}>
                        <FaSpinner className="spinner" style={{ fontSize: '3rem', color: '#D4AF37' }} />
                        <p style={{ marginTop: '20px', color: '#1e293b', fontWeight: 'bold' }}>Chargement des clients...</p>
                    </div>
                ) : (
                    <div className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div className="premium-list-container" style={{ margin: '0' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                                    <tr>
                                        <th style={{ padding: '20px', color: '#1e293b', fontWeight: 'bold' }}>Client</th>
                                        <th style={{ padding: '20px', color: '#1e293b', fontWeight: 'bold' }}>Rôle</th>
                                        <th style={{ padding: '20px', color: '#1e293b', fontWeight: 'bold' }}>Abonnement</th>
                                        <th style={{ padding: '20px', color: '#1e293b', fontWeight: 'bold', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ padding: '20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', fontSize: '1.2rem' }}>
                                                        <FaUser />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{user.nom}</div>
                                                        <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                            <FaEnvelope size={10} /> {user.mail}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px' }}>
                                                <span style={{
                                                    padding: '5px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold',
                                                    background: user.statut === 'admin' ? '#fef3c7' : '#f1f5f9',
                                                    color: user.statut === 'admin' ? '#d97706' : '#475569',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '5px'
                                                }}>
                                                    {user.statut === 'admin' && <FaShieldAlt size={10} />}
                                                    {user.statut.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ padding: '20px' }}>
                                                <span style={{
                                                    padding: '5px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold',
                                                    background: user.abonne === 'oui' ? '#ecfdf5' : '#fee2e2',
                                                    color: user.abonne === 'oui' ? '#059669' : '#dc2626'
                                                }}>
                                                    Newsletter: {user.abonne?.toUpperCase() || 'NON'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '20px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                    <button
                                                        onClick={() => handleStatutChange(user._id, user.statut === 'admin' ? 'client' : 'admin')}
                                                        className="premium-btn-cta secondary"
                                                        style={{ padding: '8px 15px', fontSize: '0.8rem', minWidth: 'auto' }}
                                                        title={user.statut === 'admin' ? 'Rétrograder en Client' : 'Promouvoir en Admin'}
                                                    >
                                                        <FaUserEdit /> Rôle
                                                    </button>
                                                    <button
                                                        onClick={() => handleAbonneChange(user._id, user.abonne)}
                                                        className="premium-btn-cta secondary"
                                                        style={{ padding: '8px 15px', fontSize: '0.8rem', minWidth: 'auto' }}
                                                        title="Changer statut newsletter"
                                                    >
                                                        Newsletter
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user._id)}
                                                        className="premium-btn-cta secondary"
                                                        style={{ padding: '8px 15px', fontSize: '0.8rem', minWidth: 'auto', background: '#fee2e2', color: '#ef4444', borderColor: '#fecaca' }}
                                                        title="Supprimer l'utilisateur"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {users.length === 0 && (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                    Aucun client trouvé.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}