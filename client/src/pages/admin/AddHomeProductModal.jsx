import React, { useState, useEffect } from "react";
import { FaTimes, FaTrash, FaEdit, FaLink } from "react-icons/fa";

// --- Composant N°2: ConfirmationModal (Inclus ici pour être dans un seul fichier) ---
function ConfirmationModal({ message, details, onConfirm, onCancel }) {
    if (!onCancel) return null;

    return (
        <div className="premium-modal-backdrop" onClick={onCancel}>
            <div className="premium-modal-content" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
                <button className="premium-modal-close-icon" onClick={onCancel}>
                    <FaTimes />
                </button>

                <div className="premium-modal-header">
                    <div className="vip-cert-icon-wrapper" style={{ margin: '0 auto 15px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                        <FaTrash />
                    </div>
                    <h2 className="premium-modal-title">Confirmer l'Action</h2>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <p style={{ fontSize: '1.1rem', color: '#1f2937', fontWeight: '600', marginBottom: '10px' }}>
                        {message}
                    </p>
                    {details && <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>"{details}"</p>}

                    <div style={{ marginTop: '20px', background: '#fef2f2', color: '#b91c1c', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        ⚠️ Cette action est irréversible.
                    </div>
                </div>

                <div className="premium-btn-group">
                    <button className="premium-btn-cta secondary" onClick={onCancel}>
                        Annuler
                    </button>
                    <button className="premium-btn-cta gold" style={{ background: '#ef4444', borderColor: '#dc2626' }} onClick={onConfirm}>
                        Oui, Supprimer
                    </button>
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------------------

import BASE_URL from '../../apiConfig';

// --- Composant N°1: AddHomeProductModal (Composant Principal) ---
export default function AddHomeProductModal({ onClose, onProductAdded }) {

    const API_URL = `${BASE_URL}/api/home-products`;

    const [homeProduct, setHomeProduct] = useState({
        nom: "",
        image: "",
        description: "",
        prix: "",
        categorie: ""
    });

    const [isEditing, setIsEditing] = useState(false);
    const [productToEditId, setProductToEditId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submissionError, setSubmissionError] = useState(null);

    const [productsList, setProductsList] = useState([]);
    const [listLoading, setListLoading] = useState(false);
    const [listError, setListError] = useState(null);

    const [productToDelete, setProductToDelete] = useState(null);

    const fetchProducts = async () => {
        setListLoading(true);
        setListError(null);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error("Erreur lors du chargement des produits.");
            const data = await response.json();
            setProductsList(data);
        } catch (error) {
            console.error("Erreur de chargement:", error.message);
            setListError("Impossible de charger la liste des produits.");
        } finally {
            setListLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setHomeProduct((prev) => ({ ...prev, [name]: value }));
        setSubmissionError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSubmissionError(null);

        const productData = {
            ...homeProduct,
            prix: parseFloat(homeProduct.prix)
        };

        if (isNaN(productData.prix)) {
            setSubmissionError("Le prix doit être un nombre valide.");
            setLoading(false);
            return;
        }

        const url = isEditing ? `${API_URL}/${productToEditId}` : API_URL;
        const method = isEditing ? "PUT" : "POST";
        const successMessage = isEditing ? "modifié" : "ajouté";
        const errorMessage = isEditing ? "Erreur de modification" : "Erreur d'ajout";

        try {
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || `${errorMessage} du produit.`);

            setHomeProduct({ nom: "", image: "", description: "", prix: "", categorie: "" });
            setIsEditing(false);
            setProductToEditId(null);

            await fetchProducts();
            if (onProductAdded) onProductAdded(data, successMessage);

        } catch (error) {
            console.error(`${errorMessage}:`, error.message);
            setSubmissionError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        setHomeProduct({
            nom: product.nom,
            image: product.image,
            description: product.description,
            prix: product.prix.toString(),
            categorie: product.categorie
        });
        setProductToEditId(product._id);
        setIsEditing(true);
        setSubmissionError(null);
    };

    const handleCancelEdit = () => {
        setHomeProduct({ nom: "", image: "", description: "", prix: "", categorie: "" });
        setIsEditing(false);
        setProductToEditId(null);
        setSubmissionError(null);
    };

    const requestDeleteConfirmation = (product) => {
        setProductToDelete({
            _id: product._id,
            nom: product.nom
        });
    };


    const _handleDelete = async (productId) => {
        const url = `${API_URL}/${productId}`;

        try {
            const response = await fetch(url, { method: "DELETE" });
            if (!response.ok) {
                const data = await response.json().catch(() => ({ message: "Erreur serveur inconnue" }));
                throw new Error(data.message || "Erreur de suppression du produit.");
            }

            setProductsList((prev) => prev.filter(p => p._id !== productId));

            if (productId === productToEditId) handleCancelEdit();

            if (onProductAdded) onProductAdded(null, "supprimé");

            return true;
        } catch (error) {
            console.error("Erreur de suppression:", error.message);
            throw error;
        }
    };

    const renderForm = () => {
        const buttonText = isEditing ? "Enregistrer les modifications" : "Ajouter à l'Accueil";

        return (
            <div className="premium-card" style={{ background: '#f8fafc', padding: '25px', borderRadius: '15px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ margin: 0, color: '#1e293b', fontSize: '1.2rem' }}>
                        {isEditing ? `✏️ Modification: ${homeProduct.nom}` : "➕ Nouveau Produit Spécialisé"}
                    </h4>
                    <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Ces produits seront mis en avant sur la page d'accueil.</p>
                </div>

                {submissionError && <div className="premium-error-alert" style={{ marginBottom: '20px', background: '#fef2f2', color: '#b91c1c', padding: '12px', borderRadius: '10px', fontSize: '0.9rem' }}>❌ {submissionError}</div>}

                <form onSubmit={handleSubmit} className="premium-form-grid">
                    <div className="premium-form-group">
                        <label>Titre du Produit</label>
                        <input
                            type="text"
                            name="nom"
                            value={homeProduct.nom}
                            onChange={handleChange}
                            required
                            placeholder="Ex: Patron Robe de Soirée"
                        />
                    </div>

                    <div className="premium-form-group">
                        <label><FaLink /> URL de l'Image</label>
                        <input
                            type="url"
                            name="image"
                            value={homeProduct.image}
                            onChange={handleChange}
                            required
                            placeholder="https://..."
                        />
                    </div>

                    <div className="premium-form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Description Courte</label>
                        <textarea
                            name="description"
                            value={homeProduct.description}
                            onChange={handleChange}
                            required
                            rows="2"
                            placeholder="Décrivez brièvement le produit..."
                        />
                    </div>

                    <div className="premium-form-group">
                        <label>Catégorie</label>
                        <select
                            name="categorie"
                            value={homeProduct.categorie}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Choisir --</option>
                            <option value="Homme">Homme</option>
                            <option value="Famme">Famme</option>
                            <option value="Enfant">Enfant</option>
                        </select>
                    </div>

                    <div className="premium-form-group">
                        <label>Prix (DT)</label>
                        <input
                            type="number"
                            name="prix"
                            value={homeProduct.prix}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            required
                        />
                    </div>

                    <div className="premium-btn-group" style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                        {isEditing && (
                            <button
                                type="button"
                                className="premium-btn-cta secondary"
                                onClick={handleCancelEdit}
                                disabled={loading}
                            >
                                Annuler
                            </button>
                        )}
                        <button type="submit" className="premium-btn-cta gold" disabled={loading} style={{ flex: 2 }}>
                            {loading ? "Traitement..." : buttonText}
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    const renderList = () => {
        if (listLoading) {
            return (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    <p>⏳ Chargement des produits...</p>
                </div>
            );
        }

        if (listError) {
            return <div className="premium-error-alert">❌ {listError}</div>;
        }

        return (
            <div className="premium-list-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h4 style={{ margin: 0, color: '#1e293b' }}>Produits en Ligne ({productsList.length})</h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {productsList.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
                            Aucun produit n'est actuellement affiché.
                        </p>
                    ) : (
                        productsList.map((product) => (
                            <div key={product._id} className="premium-list-item" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '20px',
                                padding: '15px',
                                background: '#fff',
                                borderRadius: '12px',
                                border: productToEditId === product._id ? '2px solid #D4AF37' : '1px solid #e2e8f0',
                                transition: 'all 0.3s ease'
                            }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '10px', overflow: 'hidden', background: '#f1f5f9', flexShrink: 0 }}>
                                    <img src={product.image} alt={product.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.src = 'https://via.placeholder.com/80?text=No+Img'} />
                                </div>

                                <div style={{ flex: 1 }}>
                                    <h5 style={{ margin: '0 0 5px', color: '#1e293b', fontSize: '1rem' }}>{product.nom}</h5>
                                    <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem' }}>
                                        <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>{product.prix} DT</span>
                                        <span style={{ color: '#64748b' }}>• {product.categorie}</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        className="premium-btn-cta secondary"
                                        style={{ padding: '10px', minWidth: '40px', borderRadius: '10px' }}
                                        onClick={() => handleEdit(product)}
                                        disabled={listLoading || isEditing}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className="premium-btn-cta gold"
                                        style={{ padding: '10px', minWidth: '40px', borderRadius: '10px', background: '#fee2e2', color: '#ef4444', borderColor: '#fecaca' }}
                                        onClick={() => requestDeleteConfirmation(product)}
                                        disabled={listLoading || loading}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="premium-modal-backdrop" onClick={onClose}>
            <div className="premium-modal-content large" onClick={(e) => e.stopPropagation()}>

                <div className="premium-modal-header" style={{ marginBottom: '30px' }}>
                    <h2 className="premium-modal-title">Gestion des Produits Spécialisés</h2>
                    <button className="premium-modal-close-icon" onClick={onClose} disabled={loading || listLoading}>
                        <FaTimes />
                    </button>
                </div>

                <div style={{ maxHeight: 'calc(85vh - 100px)', overflowY: 'auto', paddingRight: '10px' }}>
                    {renderForm()}
                    <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '30px 0' }} />
                    {renderList()}
                </div>

                {/* --- Rendu du Modal de Confirmation --- */}
                {productToDelete && (
                    <ConfirmationModal
                        message={`Voulez-vous supprimer ce produit ?`}
                        details={productToDelete.nom}
                        onConfirm={async () => {
                            const localProductId = productToDelete._id;
                            const localProductName = productToDelete.nom;
                            setListLoading(true);

                            try {
                                await _handleDelete(localProductId);
                                console.log(`Produit supprimé: ${localProductName}`);
                            } catch (error) {
                            } finally {
                                setProductToDelete(null);
                                setListLoading(false);
                            }
                        }}
                        onCancel={() => setProductToDelete(null)}
                    />
                )}
            </div>
        </div>
    );
}
