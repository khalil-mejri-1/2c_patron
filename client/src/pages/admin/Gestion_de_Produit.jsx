import React, { useState, useEffect } from 'react';
import NavbarAdmin from '../../comp/Navbar_admin';
import '../admin_css/GestionDeProduit.css';
import {FaSpinner} from 'react-icons/fa';
import AddHomeProductModal from './AddHomeProductModal'; // Importation du modal d'accueil

export default function Gestion_de_Produit() {

    // -------------------- 1. حالات المكون (States) --------------------
    const [products, setProducts] = useState([]);
    const [newProduct, setNewProduct] = useState({ nom: '', image: '', prix: '', categorie: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // États spécifiques à la gestion des produits d'accueil (DEMANDÉ)
    const [isHomeModalOpen, setIsHomeModalOpen] = useState(false);

    // حالات التحديث (Edit Modal)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);

    // حالات التأكيد (Confirmation Modal)
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    // حالة التنبيهات (Notification/Toast)
    const [notification, setNotification] = useState({ message: '', type: '' }); // type: 'success', 'error'


    // -------------------- 2. الدوال المساعدة (Helper Functions) --------------------

    // 💡 دالة إظهار التنبيه وإخفائه
    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification({ message: '', type: '' });
        }, 3000);
    };

    // NOUVEAU: Gère la notification après l'ajout d'un produit à l'accueil
    const handleHomeProductAdded = (newProduct) => {
        showNotification(`Produit "${newProduct.nom || 'Inconnu'}" ajouté à la page d'accueil avec succès.`, 'success');
    };

    // إضافة منتج جديد: معالجة تغيير حقول الإدخال
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct(prev => ({ ...prev, [name]: value }));
    };

    // التحديث: فتح نافذة التعديل
    const handleEditClick = (product) => {
        setCurrentProduct({
            ...product,
            prix: String(product.prix), // تحويل الرقم إلى نص
        });
        setIsEditModalOpen(true);
    };

    // التحديث: إغلاق نافذة التعديل
    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setCurrentProduct(null);
    };

    // التحديث: معالجة تغيير حقول التعديل
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setCurrentProduct(prev => ({ ...prev, [name]: value }));
    };

    // الحذف: فتح نافذة التأكيد
    const handleOpenConfirm = (productId) => {
        setProductToDelete(productId);
        setIsConfirmModalOpen(true);
    };

    // الحذف: إغلاق نافذة التأكيد
    const handleCloseConfirm = () => {
        setProductToDelete(null);
        setIsConfirmModalOpen(false);
    };

    // -------------------- 3. دوال الاتصال بالخادم (API Calls) --------------------

    // 💡 جلب المنتجات (GET)
    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('https://2c-patron.vercel.app/api/products');

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}. Vérifiez le serveur.`);
            }

            const data = await response.json();
            setProducts(data);

        } catch (err) {
            console.error("Erreur de récupération:", err);
            setError(err.message || 'Échec de la récupération des produits.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // 💡 إضافة منتج (POST)
    const handleAddProduct = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const productData = {
            nom: newProduct.nom,
            image: newProduct.image,
            categorie: newProduct.categorie,
            prix: parseFloat(newProduct.prix),
        };

        try {
            const response = await fetch('https://2c-patron.vercel.app/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Échec de l'ajout du produit.");
            }

            setProducts(prev => [data, ...prev]);
            setNewProduct({ nom: '', image: '', prix: '', categorie: '' });
            showNotification(`Produit "${data.nom}" ajouté avec succès.`, 'success');

        } catch (err) {
            console.error("Erreur d'ajout:", err);
            const errMsg = err.message || 'Échec de l\'ajout du produit.';
            setError(errMsg);
            showNotification(errMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    // 💡 حذف منتج (DELETE)
    const handleDeleteProduct = async () => {
        const productId = productToDelete;

        if (!productId) return;

        handleCloseConfirm(); // إغلاق نافذة التأكيد
        setLoading(true);
        setError(null);

        const deleteUrl = `https://2c-patron.vercel.app/api/products/${productId}`;

        try {
            const response = await fetch(deleteUrl, { method: 'DELETE' });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Échec de la suppression du produit ID ${productId}.`);
            }

            setProducts(prev => prev.filter(p => p._id !== productId));
            showNotification(`Produit ID ${productId} supprimé avec succès.`, 'success');

        } catch (err) {
            console.error("Erreur de suppression:", err);
            const errMsg = err.message || 'Échec de la suppression du produit.';
            setError(errMsg);
            showNotification(errMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    // 💡 تحديث منتج (PUT)
    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!currentProduct || !currentProduct._id) return;

        const productData = {
            nom: currentProduct.nom,
            image: currentProduct.image,
            categorie: currentProduct.categorie,
            prix: parseFloat(currentProduct.prix),
        };

        const updateUrl = `https://2c-patron.vercel.app/api/products/${currentProduct._id}`;

        try {
            const response = await fetch(updateUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData),
            });

            const updatedProduct = await response.json();

            if (!response.ok) {
                throw new Error(updatedProduct.message || "Échec de la mise à jour du produit.");
            }

            setProducts(prev => prev.map(p =>
                p._id === updatedProduct._id ? updatedProduct : p
            ));

            showNotification(`Produit "${updatedProduct.nom}" mis à jour avec succès.`, 'success');
            handleCloseEditModal();

        } catch (err) {
            console.error("Erreur de mise à jour:", err);
            const errMsg = err.message || 'Échec de la mise à jour du produit.';
            setError(errMsg);
            showNotification(errMsg, 'error');
        } finally {
            setLoading(false);
        }
    };


    // -------------------- 4. العرض (Render) --------------------
    return (
        <>
            <NavbarAdmin />

            {/* 💡 مكون التنبيهات (Notification/Toast) */}
            {notification.message && (
                <div className={`notification ${notification.type}`}>
                    <p>{notification.message}</p>
                    <button onClick={() => setNotification({ message: '', type: '' })}>&times;</button>
                </div>
            )}

            <div className="product-management-container">
                
                {/* NOUVEAU: Bouton d'ajout de produit à l'accueil */}
                <div className="admin-header-actions">
                    <h2 className="client-title">Gestion des Produits</h2>

                    <button 
                        className="product-home-add-btn"
                        onClick={() => setIsHomeModalOpen(true)}
                        disabled={loading}
                    >
                        + Ajouter Produit Accueil
                    </button>
                </div>
                
                {/* -------------------- A. إضافة منتج -------------------- */}
                <div className="card add-product-section">
                    <h3>➕ Ajouter un Nouveau Produit</h3>
                    <form onSubmit={handleAddProduct} className="product-form">
                        <div className="form-group"><label htmlFor="nom">Nom du Produit</label>
                            <input type="text" id="nom" name="nom" value={newProduct.nom} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group"><label htmlFor="image">URL Image</label>
                            <input type="text" id="image" name="image" value={newProduct.image} onChange={handleInputChange} required />
                        </div>
                        <div className="form-row">
                            <div className="form-group full-width"><label htmlFor="prix">Prix (DT)</label>
                                <input type="number" id="prix" name="prix" value={newProduct.prix} onChange={handleInputChange} step="0.01" min="0" required />
                            </div>
                        </div>
                        <div className="form-group"><label htmlFor="categorie">Catégorie</label>
                            <select id="categorie" name="categorie" value={newProduct.categorie} onChange={handleInputChange} required>
                                <option value="" disabled>Sélectionner une catégorie</option>
                                <option value="Homme" >Homme</option>
                                <option value="Famme" >Famme</option>
                                <option value="Enfant" >Enfant</option>
                            </select>
                        </div>
                        <button type="submit" className="submit-button" disabled={loading}>
                            {loading ? 'Chargement...' : 'Enregistrer le Produit'}
                        </button>
                    </form>
                </div>

                <hr className="divider" />

                {/* -------------------- B. قائمة المنتجات -------------------- */}
                <div className="product-list-section">
                    <h3>📦 Liste des Produits Actuels ({products.length})</h3>

                    {loading && <>
                        <div className="abonnement-container loading-state">
                            <FaSpinner className="spinner" />
                            <p>Chargement des Produits...</p>
                        </div>
                    </>}

                    {!loading && products.length > 0 && (
                        <div className="table-wrapper">
                            <table className="product-table">
                                <thead>
                                    <tr>
                                        <th>Image</th> <th>Nom</th><th>Prix</th><th>Catégorie</th><th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product._id}>
                                            <td>{product.image ? (<img src={product.image} alt={product.nom} className="product-image_admin" />) : (<div className="placeholder-image">Pas d'image</div>)}</td>
                                            <td>{product.nom}</td>
                                            <td className="price-col">{(typeof product.prix === 'number' ? product.prix.toFixed(2) : product.prix) || 0} DT</td>
                                            <td>{product.categorie}</td>
                                            <td className="actions-col">
                                                <button className="action-btn edit-btn" onClick={() => handleEditClick(product)}>
                                                    Modifier
                                                </button>
                                                <button className="action-btn delete-btn" onClick={() => handleOpenConfirm(product._id)}>
                                                    Supprimer
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {!loading && !error && products.length === 0 && <p className="no-data-message">Aucun produit trouvé dans la base de données.</p>}
                </div>

            </div>


            {/* -------------------- C. Modal Mise à Jour (Update Modal) -------------------- */}
            {isEditModalOpen && currentProduct && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>⚙️ Modifier le Produit : {currentProduct.nom}</h3>

                        <form onSubmit={handleUpdateProduct}>
                            <div className="form-group"><label htmlFor="edit_nom">Nom du Produit</label>
                                <input type="text" id="edit_nom" name="nom" value={currentProduct.nom} onChange={handleEditChange} required />
                            </div>
                            <div className="form-group"><label htmlFor="edit_image">URL Image</label>
                                <input type="text" id="edit_image" name="image" value={currentProduct.image} onChange={handleEditChange} required />
                            </div>
                            <div className="form-group"><label htmlFor="edit_prix">Prix (€)</label>
                                <input type="number" id="edit_prix" name="prix" value={currentProduct.prix} onChange={handleEditChange} step="0.01" min="0" required />
                            </div>

                            <div className="form-group"><label htmlFor="edit_categorie">Catégorie</label>
                                <select id="edit_categorie" name="categorie" value={currentProduct.categorie} onChange={handleEditChange} required>
                                    <option value="Homme">Homme</option>
                                    <option value="Famme">Famme</option>
                                    <option value="Enfant">Enfant</option>
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="submit-button" disabled={loading}>
                                    {loading ? 'Mise à jour...' : 'Enregistrer les modifications'}
                                </button>
                                <button type="button" className="submit-button cancel-button_admin" onClick={handleCloseEditModal} disabled={loading}>
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* -------------------- D. Modal Confirmation de Suppression (Delete Confirmation) -------------------- */}
            {isConfirmModalOpen && productToDelete && (
                <div className="modal-overlay">
                    <div className="modal-content confirmation-modal">
                        <h3>⚠️ Confirmation de Suppression</h3>

                        <p className="confirmation-message">
                            Êtes-vous sûr de vouloir supprimer définitivement le produit avec l'ID :
                            **{productToDelete}** ?
                        </p>
                        <p className="warning-text">Cette action est **irréversible**.</p>

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="action-btn delete-btn"
                                onClick={handleDeleteProduct}
                                disabled={loading}
                            >
                                {loading ? 'Suppression...' : 'Oui, Supprimer'}
                            </button>
                            <button
                                type="button"
                                className="annuler_but "
                                onClick={handleCloseConfirm}
                                disabled={loading}
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* NOUVEAU: Modal d'ajout de produit à l'accueil */}
            {isHomeModalOpen && (
                <AddHomeProductModal 
                    onClose={() => setIsHomeModalOpen(false)}
                    onProductAdded={handleHomeProductAdded} // Ajout de la fonction de notification
                />
            )}
        </>
    );
}