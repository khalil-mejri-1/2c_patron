import React, { useState, useEffect } from 'react';
import NavbarAdmin from '../../comp/Navbar_admin';
import { FaSpinner, FaPlusCircle, FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaLayerGroup, FaImage, FaBoxOpen } from 'react-icons/fa';
import AddHomeProductModal from './AddHomeProductModal';
import BASE_URL from '../../apiConfig';
import { useAlert } from '../../context/AlertContext';

export default function Gestion_de_Produit() {
    const [products, setProducts] = useState([]);
    const [newProduct, setNewProduct] = useState({ nom: '', mainImage: '', secondaryImages: [''], prix: '', categorie: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isHomeModalOpen, setIsHomeModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);

    const { showAlert } = useAlert();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/products`);
            if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
            const data = await response.json();
            setProducts(data);
        } catch (err) {
            setError(err.message || 'Échec de récupération.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct(prev => ({ ...prev, [name]: value }));
    };

    const handleNewSecondaryImageChange = (index, value) => {
        setNewProduct(prev => {
            const newImages = [...prev.secondaryImages];
            newImages[index] = value;
            return { ...prev, secondaryImages: newImages };
        });
    };

    const handleAddNewSecondaryImage = () => {
        if (newProduct.secondaryImages.slice(-1)[0].trim() === '') return;
        setNewProduct(prev => ({ ...prev, secondaryImages: [...prev.secondaryImages, ''] }));
    };

    const handleRemoveNewSecondaryImage = (index) => {
        if (newProduct.secondaryImages.length === 1) {
            setNewProduct(prev => ({ ...prev, secondaryImages: [''] }));
            return;
        }
        setNewProduct(prev => ({ ...prev, secondaryImages: prev.secondaryImages.filter((_, i) => i !== index) }));
    };

    const handleEditSecondaryImageChange = (index, value) => {
        setCurrentProduct(prev => {
            const newImages = [...prev.secondaryImages];
            newImages[index] = value;
            return { ...prev, secondaryImages: newImages };
        });
    };

    const handleAddEditSecondaryImage = () => {
        if (currentProduct.secondaryImages.slice(-1)[0].trim() === '') return;
        setCurrentProduct(prev => ({ ...prev, secondaryImages: [...prev.secondaryImages, ''] }));
    };

    const handleRemoveEditSecondaryImage = (index) => {
        if (currentProduct.secondaryImages.length === 1) {
            setCurrentProduct(prev => ({ ...prev, secondaryImages: [''] }));
            return;
        }
        setCurrentProduct(prev => ({ ...prev, secondaryImages: prev.secondaryImages.filter((_, i) => i !== index) }));
    };

    const handleEditClick = (product) => {
        setCurrentProduct({
            ...product,
            prix: String(product.prix),
            mainImage: product.mainImage || product.image || '',
            secondaryImages: (product.secondaryImages && product.secondaryImages.length > 0) ? product.secondaryImages : [''],
        });
        setIsEditModalOpen(true);
    };

    const handleOpenConfirm = (productId) => {
        showAlert('confirm', 'Confirmation', 'Voulez-vous supprimer ce produit ?', () => handleDeleteProduct(productId));
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        setLoading(true);
        const secondaryImagesArray = newProduct.secondaryImages.filter(url => url.trim() !== '');
        if (newProduct.mainImage.trim() === '') {
            showAlert('error', 'Erreur', 'Image principale requise.');
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(`${BASE_URL}/api/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newProduct, secondaryImages: secondaryImagesArray, prix: parseFloat(newProduct.prix) }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Erreur d'ajout.");
            setProducts(prev => [data, ...prev]);
            setNewProduct({ nom: '', mainImage: '', secondaryImages: [''], prix: '', categorie: '' });
            showAlert('success', 'Succès', 'Produit ajouté !');
        } catch (err) {
            showAlert('error', 'Erreur', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/products/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Erreur de suppression.');
            setProducts(prev => prev.filter(p => p._id !== id));
            showAlert('success', 'Succès', 'Supprimé !');
        } catch (err) {
            showAlert('error', 'Erreur', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        setLoading(true);
        const secondaryImagesArray = currentProduct.secondaryImages.filter(url => url.trim() !== '');
        try {
            const response = await fetch(`${BASE_URL}/api/products/${currentProduct._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...currentProduct, secondaryImages: secondaryImagesArray, prix: parseFloat(currentProduct.prix) }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Erreur de mise à jour.");
            setProducts(prev => prev.map(p => p._id === data._id ? data : p));
            showAlert('success', 'Succès', 'Mis à jour !');
            setIsEditModalOpen(false);
        } catch (err) {
            showAlert('error', 'Erreur', err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <NavbarAdmin />

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2rem', color: '#1e293b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FaBoxOpen style={{ color: '#D4AF37' }} /> Gestion des Produits
                    </h1>
                    <button onClick={() => setIsHomeModalOpen(true)} className="premium-btn-cta gold" style={{ padding: '12px 25px' }}>
                        <FaPlus /> Produit Accueil
                    </button>
                </div>

                <div className="premium-card" style={{ padding: '40px', marginBottom: '40px' }}>
                    <h3 style={{ marginBottom: '30px', color: '#1e293b', borderLeft: '4px solid #D4AF37', paddingLeft: '15px' }}>Ajouter un Produit</h3>
                    <form onSubmit={handleAddProduct} className="premium-form-grid">
                        <div className="premium-form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Nom du Produit</label>
                            <input type="text" name="nom" value={newProduct.nom} onChange={handleInputChange} required />
                        </div>
                        <div className="premium-form-group" style={{ gridColumn: 'span 2' }}>
                            <label>URL Image Principale</label>
                            <input type="url" name="mainImage" value={newProduct.mainImage} onChange={handleInputChange} required />
                        </div>

                        <div className="premium-form-group" style={{ gridColumn: 'span 4' }}>
                            <label>Images Secondaires</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {newProduct.secondaryImages.map((url, index) => (
                                    <div key={index} style={{ display: 'flex', gap: '10px' }}>
                                        <input type="url" value={url} onChange={(e) => handleNewSecondaryImageChange(index, e.target.value)} placeholder="URL Image" style={{ flex: 1, padding: '10px' }} />
                                        <button type="button" onClick={() => handleRemoveNewSecondaryImage(index)} style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca', padding: '10px', borderRadius: '8px' }}><FaTrash size={12} /></button>
                                        {index === newProduct.secondaryImages.length - 1 && (
                                            <button type="button" onClick={handleAddNewSecondaryImage} style={{ background: '#ecfdf5', color: '#10b981', border: '1px solid #d1fae5', padding: '10px', borderRadius: '8px' }}><FaPlus size={12} /></button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="premium-form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Prix (DT)</label>
                            <input type="number" name="prix" value={newProduct.prix} onChange={handleInputChange} step="0.01" required />
                        </div>
                        <div className="premium-form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Catégorie</label>
                            <select name="categorie" value={newProduct.categorie} onChange={handleInputChange} required>
                                <option value="">-- Catégorie --</option>
                                <option value="Homme">Homme</option>
                                <option value="Famme">Famme</option>
                                <option value="Enfant">Enfant</option>
                            </select>
                        </div>

                        <div style={{ gridColumn: 'span 4', marginTop: '10px' }}>
                            <button type="submit" disabled={loading} className="premium-btn-cta gold" style={{ width: '100%', padding: '15px' }}>
                                {loading ? <FaSpinner className="spinner" /> : <FaPlusCircle />} Enregistrer le Produit
                            </button>
                        </div>
                    </form>
                </div>

                <div className="premium-list-container">
                    <h3 style={{ marginBottom: '30px', color: '#1e293b', borderLeft: '4px solid #D4AF37', paddingLeft: '15px' }}>
                        Liste des Produits ({products.length})
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
                        {products.map(product => (
                            <div key={product._id} className="premium-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ height: '200px', position: 'relative' }}>
                                    <img src={product.mainImage || product.image} alt={product.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.9)', padding: '5px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', color: '#D4AF37', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                        {product.prix.toFixed(2)} DT
                                    </div>
                                    {product.secondaryImages?.length > 0 && (
                                        <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 10px', borderRadius: '15px', fontSize: '0.7rem' }}>
                                            <FaImage style={{ marginRight: '5px' }} /> +{product.secondaryImages.length} images
                                        </div>
                                    )}
                                </div>
                                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>{product.nom}</h4>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{product.categorie}</span>
                                    </div>
                                    <div className="premium-btn-group" style={{ marginTop: '20px', gap: '10px' }}>
                                        <button onClick={() => handleEditClick(product)} className="premium-btn-cta secondary" style={{ flex: 1, padding: '8px' }}><FaEdit /> Editer</button>
                                        <button onClick={() => handleOpenConfirm(product._id)} className="premium-btn-cta secondary" style={{ flex: 1, padding: '8px', color: '#ef4444', borderColor: '#fecaca' }}><FaTrash /> Supprimer</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {isEditModalOpen && currentProduct && (
                <div className="premium-modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
                    <div className="premium-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                        <div className="premium-modal-header">
                            <h2 className="premium-modal-title"><FaEdit style={{ color: '#D4AF37' }} /> Modifier Produit</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="premium-modal-close-icon"><FaTimes /></button>
                        </div>
                        <form onSubmit={handleUpdateProduct} className="premium-form-grid" style={{ marginTop: '20px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>
                            <div className="premium-form-group" style={{ gridColumn: 'span 2' }}>
                                <label>Nom</label>
                                <input type="text" name="nom" value={currentProduct.nom} onChange={(e) => setCurrentProduct({ ...currentProduct, nom: e.target.value })} required />
                            </div>
                            <div className="premium-form-group" style={{ gridColumn: 'span 2' }}>
                                <label>Image Principale</label>
                                <input type="url" name="mainImage" value={currentProduct.mainImage} onChange={(e) => setCurrentProduct({ ...currentProduct, mainImage: e.target.value })} required />
                            </div>
                            <div className="premium-form-group" style={{ gridColumn: 'span 4' }}>
                                <label>Images Secondaires</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {currentProduct.secondaryImages.map((url, index) => (
                                        <div key={index} style={{ display: 'flex', gap: '10px' }}>
                                            <input type="url" value={url} onChange={(e) => handleEditSecondaryImageChange(index, e.target.value)} style={{ flex: 1 }} />
                                            <button type="button" onClick={() => handleRemoveEditSecondaryImage(index)} style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca', padding: '10px', borderRadius: '8px' }}><FaTrash size={12} /></button>
                                            {index === currentProduct.secondaryImages.length - 1 && (
                                                <button type="button" onClick={handleAddEditSecondaryImage} style={{ background: '#ecfdf5', color: '#10b981', border: '1px solid #d1fae5', padding: '10px', borderRadius: '8px' }}><FaPlus size={12} /></button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="premium-form-group" style={{ gridColumn: 'span 2' }}>
                                <label>Prix (DT)</label>
                                <input type="number" name="prix" value={currentProduct.prix} onChange={(e) => setCurrentProduct({ ...currentProduct, prix: e.target.value })} step="0.01" required />
                            </div>
                            <div className="premium-form-group" style={{ gridColumn: 'span 2' }}>
                                <label>Catégorie</label>
                                <select name="categorie" value={currentProduct.categorie} onChange={(e) => setCurrentProduct({ ...currentProduct, categorie: e.target.value })} required>
                                    <option value="Homme">Homme</option>
                                    <option value="Famme">Famme</option>
                                    <option value="Enfant">Enfant</option>
                                </select>
                            </div>
                            <div className="premium-btn-group" style={{ gridColumn: 'span 4', marginTop: '20px' }}>
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="premium-btn-cta secondary">Annuler</button>
                                <button type="submit" disabled={loading} className="premium-btn-cta gold">
                                    {loading ? <FaSpinner className="spinner" /> : <FaSave />} Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isHomeModalOpen && (
                <AddHomeProductModal
                    onClose={() => setIsHomeModalOpen(false)}
                    onProductAdded={(p) => showAlert('success', 'Succès', `Produit "${p.nom}" ajouté à l'accueil.`)}
                />
            )}
        </div>
    );
}