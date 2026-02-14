import React, { useState, useEffect } from "react";
import { FaTimes, FaTrash, FaEdit, FaLink } from "react-icons/fa";

// --- Composant N°2: ConfirmationModal (Inclus ici pour être dans un seul fichier) ---
function ConfirmationModal({ message, details, onConfirm, onCancel }) {
    if (!onCancel) return null;

    return (
        <div className="confirmation-modal-overlay">
            <div className="confirmation-modal-content">

                <div className="confirmation-modal-header">
                    <FaTrash className="header-icon" />
                    <h4>Confirmer l'Action</h4>
                    <button className="close-btn" onClick={onCancel}>
                        <FaTimes />
                    </button>
                </div>

                <div className="confirmation-modal-body">
                    <p className="main-message">
                        **{message}**
                    </p>
                    {details && <p className="details-text">{details}</p>}

                    <p className="warning-text">
                        Cette action est **irréversible**.
                    </p>
                </div>

                <div className="confirmation-modal-actions">
                    <button
                        className="cancel-action-btn"
                        onClick={onCancel}
                    >
                        Annuler
                    </button>
                    <button
                        className="confirm-action-btn"
                        onClick={onConfirm}
                    >
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
        const buttonText = isEditing ? "Modifier le Produit" : "Ajouter à l'Accueil";

        return (
            <>
                <div className="home-product-modal-section-header">
                    <h4>{isEditing ? `✏️ Modification du Produit: ${homeProduct.nom}` : "➕ Ajouter un nouveau produit"}</h4>
                    <p className="home-product-modal-subheader">Saisissez les détails du produit à afficher sur la page d'accueil.</p>
                </div>

                {submissionError && <p className="home-product-error-message">❌ {submissionError}</p>}

                <form onSubmit={handleSubmit} className="home-product-form">

                    <div className="home-product-form-group">
                        <label htmlFor="nom">Titre</label>
                        <input
                            type="text"
                            id="nom"
                            name="nom"
                            value={homeProduct.nom}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="home-product-form-group">
                        <label htmlFor="image"><FaLink /> URL Image</label>
                        <input
                            type="url"
                            id="image"
                            name="image"
                            value={homeProduct.image}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="home-product-form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={homeProduct.description}
                            onChange={handleChange}
                            required
                            rows="3"
                        />
                    </div>

                    <div className="home-product-form-group">
                        <label htmlFor="categorie">Catégorie</label>
                        <select
                            id="categorie"
                            name="categorie"
                            value={homeProduct.categorie}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Choisir une catégorie --</option>
                            <option value="Homme">Homme</option>
                            <option value="Famme">Famme</option>
                            <option value="Enfant">Enfant</option>
                        </select>
                    </div>

                    <div className="home-product-form-group half-width">
                        <label htmlFor="prix">Prix (DT)</label>
                        <input
                            type="number"
                            id="prix"
                            name="prix"
                            value={homeProduct.prix}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            required
                        />
                    </div>

                    <div className="home-product-modal-actions">
                        <button type="submit" className="home-product-submit-btn" disabled={loading}>
                            {loading ? (isEditing ? "Modification en cours..." : "Ajout en cours...") : buttonText}
                        </button>

                        {isEditing && (
                            <button
                                type="button"
                                className="home-product-cancel-btn"
                                onClick={handleCancelEdit}
                                disabled={loading}
                            >
                                Annuler Modification
                            </button>
                        )}
                    </div>
                </form>
            </>
        );
    };

    const renderList = () => {
        if (listLoading) {
            return <p className="home-product-loading">⏳ Chargement des produits en ligne...</p>;
        }

        if (listError) {
            return <p className="home-product-error-message error-list">❌ {listError}</p>;
        }

        return (
            <div className="home-product-list-container">
                <div className="home-product-list-header">
                    <h4>Vidéos en ligne ({productsList.length})</h4>
                </div>

                <div className="home-product-list">
                    {productsList.length === 0 ? (
                        <p className="home-product-no-items">Aucun produit n'est actuellement affiché. Ajoutez-en un ci-dessus.</p>
                    ) : (
                        productsList.map((product) => (
                            <div key={product._id} className={`home-product-list-item ${productToEditId === product._id ? 'editing' : ''}`}>

                                <div className="home-product-media-placeholder">
                                    [Image du produit]
                                </div>

                                <div className="home-product-list-details">
                                    <h5>{product.nom}</h5>
                                    <p className="category-tag">Catégorie: {product.categorie}</p>
                                    <p className="price-tag">Prix: **{product.prix} DT**</p>
                                </div>

                                <div className="home-product-list-actions">
                                    <button
                                        className="home-product-action-btn edit"
                                        onClick={() => handleEdit(product)}
                                        disabled={listLoading || isEditing}
                                        title="Modifier ce produit"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className="home-product-action-btn delete"
                                        onClick={() => requestDeleteConfirmation(product)}
                                        disabled={listLoading || loading}
                                        title="Supprimer ce produit"
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
        <div className="home-product-modal-overlay">
            <div className="home-product-modal-content">

                <div className="home-product-modal-header">
                    <h3>Gestion des Produits Spécialisés</h3>
                    <button className="home-product-close-btn" onClick={onClose} disabled={loading || listLoading}>
                        <FaTimes />
                    </button>
                </div>

                {renderForm()}

                <hr className="home-product-separator" />

                {renderList()}

            </div>

            {/* --- Rendu du Modal de Confirmation avec variable locale pour éviter null --- */}
            {productToDelete && (
                <ConfirmationModal
                    message={`Êtes-vous sûr de vouloir supprimer le produit :`}
                    details={productToDelete.nom} // ⚡ فقط للعرض، هذا لا يتغير
                    onConfirm={async () => {
                        const localProductId = productToDelete._id; // ⚡ نسخ المعرف محليًا
                        const localProductName = productToDelete.nom; // ⚡ نسخ الاسم محليًا
                        setListLoading(true);

                        try {
                            await _handleDelete(localProductId);
                            console.log(`Produit supprimé: ${localProductName}`);
                        } catch (error) {
                        } finally {
                            setProductToDelete(null); // تحديث state بعد استخدام النسخ المحلية
                            setListLoading(false);
                        }
                    }}
                    onCancel={() => setProductToDelete(null)}
                />
            )}


        </div>
    );
}
