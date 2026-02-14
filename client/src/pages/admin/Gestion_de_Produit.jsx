import React, { useState, useEffect } from 'react';
import NavbarAdmin from '../../comp/Navbar_admin';
import '../admin_css/GestionDeProduit.css';
import { FaSpinner, FaPlusCircle, FaMinusCircle, FaTimes } from 'react-icons/fa'; // إضافة أيقونات جديدة
import AddHomeProductModal from './AddHomeProductModal';
import BASE_URL from '../../apiConfig';

export default function Gestion_de_Produit() {

    // -------------------- 1. حالات المكون (States) --------------------
    const [products, setProducts] = useState([]);
    // 💡 التعديل: imagesSecondary الآن مصفوفة فارغة
    const [newProduct, setNewProduct] = useState({ nom: '', mainImage: '', secondaryImages: [''], prix: '', categorie: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // États spécifiques à la gestion des produits d'accueil (DEMANDÉ)
    const [isHomeModalOpen, setIsHomeModalOpen] = useState(false);

    // حالات التحديث (Edit Modal)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    // 💡 التعديل: currentProduct سيتضمن الآن secondaryImages كمصفوفة
    const [currentProduct, setCurrentProduct] = useState(null);

    // حالات التأكيد (Confirmation Modal)
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    // حالة التنبيهات (Notification/Toast)
    const [notification, setNotification] = useState({ message: '', type: '' });


    // -------------------- 2. الدوال المساعدة (Helper Functions) --------------------

    // 💡 دالة إظهار التنبيه وإخفائه
    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification({ message: '', type: '' });
        }, 3000);
    };

    const handleHomeProductAdded = (product) => {
        showNotification(`Produit "${product.nom || 'Inconnu'}" ajouté à la page d'accueil avec succès.`, 'success');
    };

    // إضافة منتج جديد: معالجة تغيير حقول الإدخال (للحقول العادية)
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct(prev => ({ ...prev, [name]: value }));
    };

    // 💡 دوال إدارة حقول الصور الثانوية (للإضافة)
    const handleNewSecondaryImageChange = (index, value) => {
        setNewProduct(prev => {
            const newImages = [...prev.secondaryImages];
            newImages[index] = value;
            return { ...prev, secondaryImages: newImages };
        });
    };

    // ✅ دالة الإضافة المصححة
    const handleAddNewSecondaryImage = () => {
        // إذا كان الحقل الأخير فارغًا، لا تفعل شيئًا (لمنع إضافة حقول فارغة متتالية)
        if (newProduct.secondaryImages.slice(-1)[0].trim() === '') {
            return;
        }
        // إذا كان الحقل الأخير مملوءًا، أضف حقلاً فارغًا جديداً
        setNewProduct(prev => ({ ...prev, secondaryImages: [...prev.secondaryImages, ''] }));
    };

    const handleRemoveNewSecondaryImage = (index) => {
        // لا تسمح بالحذف إذا كان هناك حقل واحد فقط وفارغ
        if (newProduct.secondaryImages.length === 1 && newProduct.secondaryImages[0] === '') return;

        // إذا كان آخر حقل ويحتوي على قيمة، قم بحذفه
        if (newProduct.secondaryImages.length === 1 && index === 0) {
            setNewProduct(prev => ({ ...prev, secondaryImages: [''] }));
            return;
        }

        setNewProduct(prev => ({
            ...prev,
            secondaryImages: prev.secondaryImages.filter((_, i) => i !== index)
        }));
    };

    // 💡 دوال إدارة حقول الصور الثانوية (للتعديل)
    const handleEditSecondaryImageChange = (index, value) => {
        setCurrentProduct(prev => {
            const newImages = [...prev.secondaryImages];
            newImages[index] = value;
            return { ...prev, secondaryImages: newImages };
        });
    };

    // ✅ دالة الإضافة المصححة
    const handleAddEditSecondaryImage = () => {
        // إذا كان الحقل الأخير فارغًا، لا تفعل شيئًا
        if (currentProduct.secondaryImages.slice(-1)[0].trim() === '') {
            return;
        }
        // إذا كان الحقل الأخير مملوءًا، أضف حقلاً فارغًا جديداً
        setCurrentProduct(prev => ({ ...prev, secondaryImages: [...prev.secondaryImages, ''] }));
    };

    const handleRemoveEditSecondaryImage = (index) => {
        // لا تسمح بالحذف إذا كان هناك حقل واحد فقط وفارغ
        if (currentProduct.secondaryImages.length === 1 && currentProduct.secondaryImages[0] === '') return;

        // إذا كان آخر حقل ويحتوي على قيمة، قم بحذفه
        if (currentProduct.secondaryImages.length === 1 && index === 0) {
            setCurrentProduct(prev => ({ ...prev, secondaryImages: [''] }));
            return;
        }

        setCurrentProduct(prev => ({
            ...prev,
            secondaryImages: prev.secondaryImages.filter((_, i) => i !== index)
        }));
    };


    // التحديث: فتح نافذة التعديل
    const handleEditClick = (product) => {
        // 💡 التعديل: تهيئة الحقول. الصور الثانوية الآن تُخزن كمصفوفة في الـ state
        setCurrentProduct({
            ...product,
            prix: String(product.prix),
            // التوافق مع الهيكل القديم والجديد
            mainImage: product.mainImage || product.image || '',
            // التأكد من أن المصفوفة ليست فارغة وإلا أضف عنصرًا فارغًا لفتح أول حقل إدخال
            secondaryImages: (product.secondaryImages && product.secondaryImages.length > 0) ? product.secondaryImages : [''],
        });
        setIsEditModalOpen(true);
    };

    // التحديث: إغلاق نافذة التعديل
    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setCurrentProduct(null);
    };

    // التحديث: معالجة تغيير حقول التعديل (للحقول العادية)
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
            const response = await fetch(`${BASE_URL}/api/products`);

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

        // 💡 تنظيف مصفوفة الصور الثانوية قبل الإرسال
        const secondaryImagesArray = newProduct.secondaryImages.filter(url => url.trim() !== '');

        if (newProduct.mainImage.trim() === '') {
            showNotification('الصورة الرئيسية مطلوبة.', 'error');
            setLoading(false);
            return;
        }

        const productData = {
            nom: newProduct.nom,
            mainImage: newProduct.mainImage,
            secondaryImages: secondaryImagesArray, // إرسال المصفوفة المنظفة
            categorie: newProduct.categorie,
            prix: parseFloat(newProduct.prix),
        };

        try {
            const response = await fetch(`${BASE_URL}/api/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.details || data.error || data.message || "Échec de l'ajout du produit.";
                throw new Error(errorMessage);
            }

            setProducts(prev => [data, ...prev]);
            // إعادة ضبط حالة الحقول
            setNewProduct({ nom: '', mainImage: '', secondaryImages: [''], prix: '', categorie: '' });
            showNotification(`Produit "${data.nom}" ajouté avec نجاح.`, 'success');

        } catch (err) {
            console.error("Erreur d'ajout:", err);
            const errMsg = err.message || 'Échec ل\'ajout du produit.';
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

        handleCloseConfirm();
        setLoading(true);
        setError(null);

        const deleteUrl = `${BASE_URL}/api/products/${productId}`;

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

        // 💡 تنظيف مصفوفة الصور الثانوية قبل الإرسال
        const secondaryImagesArray = currentProduct.secondaryImages.filter(url => url.trim() !== '');

        if (currentProduct.mainImage.trim() === '') {
            showNotification('الصورة الرئيسية مطلوبة للتحديث.', 'error');
            setLoading(false);
            return;
        }

        const productData = {
            nom: currentProduct.nom,
            mainImage: currentProduct.mainImage,
            secondaryImages: secondaryImagesArray, // إرسال المصفوفة المنظفة
            categorie: currentProduct.categorie,
            prix: parseFloat(currentProduct.prix),
        };

        const updateUrl = `${BASE_URL}/api/products/${currentProduct._id}`;

        try {
            const response = await fetch(updateUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData),
            });

            const updatedProduct = await response.json();

            if (!response.ok) {
                const errorMessage = updatedProduct.details || updatedProduct.error || updatedProduct.message || "Échec de la mise à jour du produit.";
                throw new Error(errorMessage);
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

    // -------------------- مُكوِّن حقول الصور الثانوية الديناميكية (Common UI) --------------------
    // تم تعديل منطق عرض/إخفاء أزرار + و -
    const DynamicImageFields = ({ images, handleImageChange, handleAddImage, handleRemoveImage, isSubmitting }) => {
        return (
            <div className="dynamic-images-group">
                <label className="secondary-images-label">URLs Images Secondaires </label>
                {images.map((url, index) => (
                    <div key={index} className="image-input-row">
                        <input
                            type="url"
                            placeholder={` URL Image ${index + 1}`}
                            value={url}
                            onChange={(e) => handleImageChange(index, e.target.value)}
                            disabled={isSubmitting}
                        />
                        {/* زر الحذف: يظهر إذا كان هناك أكثر من حقل واحد يحتوي على قيمة */}
                        {(images.length > 1 || (images.length === 1 && url.trim() !== '')) && (
                            <button
                                type="button"
                                className="remove-image-btn"
                                onClick={() => handleRemoveImage(index)}
                                disabled={isSubmitting}
                            >
                                <FaTimes />
                            </button>
                        )}
                        {/* زر الإضافة: يظهر فقط في الحقل الأخير وغير الفارغ */}
                        {index === images.length - 1 && url.trim() !== '' && (
                            <button
                                type="button"
                                className="add-image-btn"
                                onClick={handleAddImage}
                                disabled={isSubmitting}
                            >
                                <FaPlusCircle />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        );
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

                        {/* 💡 الحقل الجديد للصورة الرئيسية */}
                        <div className="form-group"><label htmlFor="mainImage">URL Image Principale (Oblig obligatoire)</label>
                            <input type="url" id="mainImage" name="mainImage" value={newProduct.mainImage} onChange={handleInputChange} required />
                        </div>

                        {/* 💡 حقول الصور الثانوية الديناميكية للإضافة */}
                        <DynamicImageFields
                            images={newProduct.secondaryImages}
                            handleImageChange={handleNewSecondaryImageChange}
                            handleAddImage={handleAddNewSecondaryImage}
                            handleRemoveImage={handleRemoveNewSecondaryImage}
                            isSubmitting={loading}
                        />
                        {/* -------------------- */}

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
                                        <th>Image Principale</th>
                                        <th>Nom</th>
                                        <th>Prix</th>
                                        <th>Catégorie</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product._id}>
                                            {/* 💡 التعديل: استخدام mainImage أو image القديم */}
                                            <td>
                                                {/* التوافق مع الهيكل القديم */}
                                                {product.mainImage || product.image ? (
                                                    <img src={product.mainImage || product.image} alt={product.nom} className="product-image_admin" />
                                                ) : (
                                                    <div className="placeholder-image">Pas d'image principale</div>
                                                )}
                                                {/* عرض عدد الصور الثانوية */}
                                                {product.secondaryImages && product.secondaryImages.length > 0 && (
                                                    <span className="images-count">+ {product.secondaryImages.length} images secondaires</span>
                                                )}
                                            </td>
                                            {/* -------------------- */}
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

                            {/* 💡 التعديل: حقل الصورة الرئيسية في التعديل */}
                            <div className="form-group"><label htmlFor="edit_mainImage">URL Image Principale</label>
                                <input type="url" id="edit_mainImage" name="mainImage" value={currentProduct.mainImage} onChange={handleEditChange} required />
                            </div>

                            {/* 💡 حقول الصور الثانوية الديناميكية للتعديل */}
                            <DynamicImageFields
                                images={currentProduct.secondaryImages}
                                handleImageChange={handleEditSecondaryImageChange}
                                handleAddImage={handleAddEditSecondaryImage}
                                handleRemoveImage={handleRemoveEditSecondaryImage}
                                isSubmitting={loading}
                            />
                            {/* -------------------- */}

                            <div className="form-group"><label htmlFor="edit_prix">Prix (DT)</label>
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