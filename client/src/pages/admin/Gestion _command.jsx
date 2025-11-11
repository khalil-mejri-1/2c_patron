import React, { useState, useEffect } from 'react';
import NavbarAdmin from '../../comp/Navbar_admin';
// نفترض أن لديك ملف أنماط CSS:
import '../admin_css/GestionDeCommand.css'; 
import { FaImage } from 'react-icons/fa'; // Import pour l'icône de placeholder

const API_BASE_URL = 'http://localhost:3000/api/commands';

// قائمة بحالات الطلب المتاحة
const statusOptions = [
    'En attente', 
    'En cours de traitement', 
    'Expédiée', 
    'Livrée', 
    'Annulée'
];

// 🖼️ Composant utilitaire pour afficher l'image du produit
const ProductImageCell = ({ imageUrl, productName }) => {
    if (imageUrl) {
        return (
            <img 
                src={imageUrl} 
                alt={productName || "Produit"} 
                className="product-thumbnail" 
            />
        );
    }
    // Afficher un placeholder si l'URL est manquante
    return (
        <div className="product-thumbnail-placeholder">
            <FaImage size={20} color="#ccc" />
        </div>
    );
};


export default function Gestion_de_Command() {
    
    // -------------------- 1. Détat du Composant --------------------
    const [commands, setCommands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });
    
    // Détat لإدارة مودال التحديث
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentCommand, setCurrentCommand] = useState(null);
    const [newStatus, setNewStatus] = useState('');

    // Détat لإدارة مودال الحذف
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [commandToDeleteId, setCommandToDeleteId] = useState(null);

    // -------------------- 2. Fonctions Utilitaires --------------------

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    };

    // -------------------- 3. Fonctions API --------------------

    // 💡 AFFICHER (GET) - جلب جميع الطلبات
    const fetchCommands = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) throw new Error("Échec du chargement des commandes.");
            
            const data = await response.json();
            setCommands(data);
        } catch (err) {
            console.error("Erreur de récupération:", err);
            showNotification(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    // جلب الطلبات عند تحميل المكون
    useEffect(() => {
        fetchCommands();
    }, []);

    // 💡 DELETE - حذف طلب
    const handleDeleteCommand = async () => {
        if (!commandToDeleteId) return;

        setIsConfirmModalOpen(false);
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/${commandToDeleteId}`, {
                method: 'DELETE',
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Échec de la suppression de la commande ${commandToDeleteId}.`);
            }

            // تحديث القائمة بعد الحذف
            setCommands(prev => prev.filter(cmd => cmd._id !== commandToDeleteId));
            showNotification(`Commande ${commandToDeleteId} supprimée avec succès.`, 'success');

        } catch (err) {
            console.error("Erreur de suppression:", err);
            showNotification(err.message || 'Échec de la suppression.', 'error');
        } finally {
            setLoading(false);
            setCommandToDeleteId(null);
        }
    };
    
    // 💡 UPDATE STATUT (PUT) - تحديث حالة الطلب
    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        if (!currentCommand || !newStatus) return;

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/${currentCommand._id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            const updatedCommand = await response.json();

            if (!response.ok) {
                throw new Error(updatedCommand.message || `Échec de la mise à jour du statut pour la commande ${currentCommand._id}.`);
            }
            
            // تحديث الطلب في قائمة الطلبات المحلية
            setCommands(prev => prev.map(cmd => 
                cmd._id === updatedCommand._id ? updatedCommand : cmd
            ));

            showNotification(`Statut de la commande ${updatedCommand._id} mis à jour à "${updatedCommand.status}".`, 'success');
            setIsEditModalOpen(false);
            setCurrentCommand(null);

        } catch (err) {
            console.error("Erreur de mise à jour:", err);
            showNotification(err.message || 'Échec de la mise à jour du statut.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // دوال فتح وإغلاق المودال
    const openEditModal = (command) => {
        setCurrentCommand(command);
        setNewStatus(command.status); // تعيين الحالة الحالية كقيمة افتراضية
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setCurrentCommand(null);
        setNewStatus('');
    };

    const openConfirmModal = (commandId) => {
        setCommandToDeleteId(commandId);
        setIsConfirmModalOpen(true);
    };

    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setCommandToDeleteId(null);
    };


        const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleDateString('fr-FR', options);
    };

    // -------------------- 4. Rendu du Composant --------------------
    return (
        <>
            <NavbarAdmin />
            
            {/* Notification/Toast */}
            {notification.message && (
                <div className={`notification ${notification.type}`}>
                    <p>{notification.message}</p>
                    <button onClick={() => setNotification({ message: '', type: '' })}>&times;</button>
                </div>
            )}

            <div className="command-management-container">
                <h2 className="client-title">🛒 Gestion des Commandes</h2>
                <hr />

                {loading ? (
                    <p>Chargement des commandes...</p>
                ) : commands.length === 0 ? (
                    <p className="no-data-message">Aucune commande trouvée.</p>
                ) : (
                    <table className="commands-table">
                        <thead>
                            <tr>
                                {/* <th>ID Commande</th>  */}
                                <th>Image</th> 
                                <th>Client</th>
                                <th>Nom du Produit</th> {/* 💡 تم تغيير الاسم ليتناسب مع الفرنسية */}
                                <th>Date</th>
                                <th>Total</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {commands.map(command => (
                                <tr key={command._id}>
                                    {/* <td>{command._id.substring(0, 8)}...</td>  */}
                                    {/* 🖼️ خلية عرض الصورة (لأول منتج) */}
                                    <td>
                                        <ProductImageCell 
                                            imageUrl={command.items[0]?.productImage}
                                            productName={command.items[0]?.productName}
                                        />
                                    </td>
                                    {/* معلومات العميل */}
                                    <td>{command.clientName || 'N/A'}</td>
                                    
                                    {/* 🎯 التصحيح: اسم المنتج موجود في items[0] */}
                                    <td>{command.items[0]?.productName || 'N/A'}</td> 
                                    
                                    <td>{formatDate(command.orderDate)}</td>
                                    <td>{command.totalAmount.toFixed(2)} DT</td>
                                    <td className={`status-${command.status.replace(/\s/g, '').toLowerCase()}`}>{command.status}</td>
                                    <td>
                                        <button 
                                            className="action-btn edit-btn" 
                                            onClick={() => openEditModal(command)}
                                        >
                                            Modifier Statut
                                        </button>
                                        <button 
                                            className="action-btn delete-btn" 
                                            onClick={() => openConfirmModal(command._id)}
                                        >
                                            Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

            </div>

            {/* -------------------- Modal Mise à Jour Statut -------------------- */}
            {isEditModalOpen && currentCommand && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>⚙️ Modifier le Statut de la Commande {currentCommand._id.substring(0, 8)}...</h3>
                        
                        <form onSubmit={handleUpdateStatus}>
                            <div className="form-group">
                                <label htmlFor="newStatus">Nouveau Statut</label>
                                <select 
                                    id="newStatus" 
                                    name="newStatus" 
                                    value={newStatus} 
                                    onChange={(e) => setNewStatus(e.target.value)} 
                                    required
                                >
                                    {statusOptions.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="modal-actions">
                                <button type="submit" className="submit-button" disabled={loading}>
                                    {loading ? 'Mise à jour...' : 'Enregistrer'}
                                </button>
                                <button type="button" className="cancel-button" onClick={closeEditModal} disabled={loading}>
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* -------------------- Modal Confirmation Suppression -------------------- */}
            {isConfirmModalOpen && commandToDeleteId && (
                <div className="modal-overlay">
                    <div className="modal-content confirmation-modal">
                        <h3>⚠️ Confirmer la Suppression</h3>
                        <p className="confirmation-message">
                            Êtes-vous sûr de vouloir supprimer la commande **{commandToDeleteId.substring(0, 8)}...** ?
                        </p>
                        <div className="modal-actions">
                            <button 
                                type="button" 
                                className="action-btn delete-btn"
                                onClick={handleDeleteCommand} 
                                disabled={loading}
                            >
                                {loading ? 'Suppression...' : 'Oui, Supprimer'}
                            </button>
                            <button 
                                type="button" 
                                className="cancel-button" 
                                onClick={closeConfirmModal}
                                disabled={loading}
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}