import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaSearch, FaChevronDown, FaTimes, FaUser, FaEnvelope, FaMapMarkerAlt, FaPhoneAlt, FaMinusCircle, FaPlusCircle, FaSpinner, FaCheckCircle, FaCommentAlt } from 'react-icons/fa';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';

// 🚨 Les catégories sont maintenant générées dynamiquement ou définies comme un ensemble de base
const categories = ['Tous', 'Robes', 'Tissus', 'Matériels', 'Accessoires'];

// ⚠️ Assurez-vous que cette URL est correcte pour votre environnement backend (par exemple, http://localhost:5000)
const API_URL = '/api/products';
const API_COMMAND_URL = '/api/commands';
// 🆕 NOUVELLE URL POUR LES COMMENTAIRES
const API_COMMENTAIRE_URL = '/api/commentaires';

export default function ProductGrid() {
    // 🌟 NOUVEAUX ÉTATS لحالة المستخدم
    const [fetchedProducts, setFetchedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // États de filtrage
    const [selectedCategory, setSelectedCategory] = useState('Tous');
    const [searchTerm, setSearchTerm] = useState('');
    const [priceRange, setPriceRange] = useState(1000);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // 🔑 États مُعدّلة للأصالة وبيانات المستخدم
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUserEmail, setCurrentUserEmail] = useState('');

    // États المودال والكمية
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);

    // 🏆 NOUVEL ÉTAT POUR LE MODAL DE SUCCÈس
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [lastCommandRef, setLastCommandRef] = useState(null);
    
    // 🆕 NOUVEL ÉTAT POUR LE MODAL DE COMMENTAIRE
    const [showFeedbackModal, setShowFeedbackModal] = useState(false); // <--- NOUVEL ÉTAT

    // 📝 بيانات العميل (firstName الآن مطلوب دائمًا)
    const [customerData, setCustomerData] = useState({
        firstName: '', // يستخدم الآن دائماً
        adresse: '',
        phone: ''
    });

    // 1. Logique d'authentification ET RÉCUPÉRATION DE DONNÉES
    useEffect(() => {
        // Logique d'authentification والبيانات الأساسية
        const status = localStorage.getItem('login') === 'true';
        const userEmail = localStorage.getItem('currentUserEmail') || '';
        
        setIsLoggedIn(status);
        setCurrentUserEmail(userEmail);

        // 🌟 LOGIQUE DE RÉCUPÉRATION DES PRODUITS DEPUIS L'API
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(API_URL);
                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`);
                }
                const data = await response.json();

                const mappedProducts = data.map(p => ({
                    id: p._id,
                    name: p.nom,
                    price: p.prix,
                    currency: 'DT',
                    url: p.image,
                    alt: p.nom,
                    category: p.categorie
                }));

                setFetchedProducts(mappedProducts);

            } catch (err) {
                console.error("Échec de la récupération des produits :", err);
                setError("Impossible de charger les produits. Veuillez vérifier l'API.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();

        // Gérer le scroll du body - MIS À JOUR
        if (showOrderModal || showSuccessModal || showFeedbackModal) { // <--- AJOUT DE showFeedbackModal
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }

        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, [showOrderModal, showSuccessModal, showFeedbackModal]); // <--- AJOUT DE showFeedbackModal

    // 2. Fonctions de gestion du modal والطلب (مُعدّلة)
    const handleOrderClick = (product) => {
        setSelectedProduct(product);
        setQuantity(1);
        // إعادة تعيين بيانات العميل عند فتح المودال
        setCustomerData({
            firstName: '',
            adresse: '',
            phone: ''
        });
        setShowOrderModal(true);
    };

    const closeOrderModal = () => {
        setShowOrderModal(false);
        setSelectedProduct(null);
    };

    const closeSuccessModal = () => {
        setShowSuccessModal(false);
        setLastCommandRef(null);
    };
    
    // 🆕 Fonction pour fermer le modal de commentaire
    const closeFeedbackModal = () => {
        setShowFeedbackModal(false);
    };


    const handleQuantityChange = (change) => {
        setQuantity(prev => {
            const newQty = prev + change;
            return Math.max(1, newQty);
        });
    };

    const handleCustomerDataChange = (e) => {
        const { name, value } = e.target;
        setCustomerData(prev => ({ ...prev, [name]: value }));
    };

    const handleConfirmOrder = async (e) => {
        e.preventDefault();

        if (!selectedProduct) return;

        const calculatedTotal = selectedProduct.price * quantity;

        // ✅ الآن نستخدم دائماً القيمة المُدخلة كاسم العميل
        const clientName = customerData.firstName;
        const clientPhone = customerData.phone;
        const shippingAddress = customerData.adresse;

        // ❌ تحقق من صحة الحقول الإجبارية (الاسم الآن مطلوب دائماً)
        if (!clientName || clientName.trim() === '') {
            alert("Veuillez remplir votre Nom et Prénom (Obligatoire).");
            return;
        }
        if (!shippingAddress || !clientPhone) {
            alert("Veuillez remplir l'Adresse et le Numéro de Téléphone (Obligatoire).");
            return;
        }

        // 1. إعداد بيانات الطلب مع تضمين البريد للمسجلين فقط
        const orderData = {
            totalAmount: calculatedTotal,
            items: [{
                productId: selectedProduct.id,
                productName: selectedProduct.name,
                productImage: selectedProduct.url, // 🖼️ الإضافة الجديدة: إرسال صورة المنتج
                quantity: quantity,
                price: selectedProduct.price,
            }],
            clientName: clientName, // الاسم المُدخل يدوياً
            clientPhone: clientPhone,
            shippingAddress: shippingAddress,
            // 🔑 إضافة البريد الإلكتروني إذا كان المستخدم مسجلاً
            ...(isLoggedIn && { clientEmail: currentUserEmail }),
        };

        try {
            // 2. إرسال الطلب إلى API
            const response = await fetch(API_COMMAND_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            const result = await response.json();

            if (response.ok) {
                // 3. نجاح التسجيل: إغلاق مودال الطلب وعرض مودال النجاح
                console.log("Commande Confirmée et enregistres:", result);
                
                // حفظ رقم الطلب
                setLastCommandRef(result.commandId); 
                
                closeOrderModal(); // إغلاق مودال الطلب
                setShowSuccessModal(true); // فتح مودال النجاح
                
            } else {
                // 4. خطأ من API
                console.error("Échec de l'enregistrement de la commande:", result);
                alert(`❌ Erreur lors de la soumission de la commande : ${result.message || 'Problème de connexion au serveur.'}`);
                return;
            }

        } catch (error) {
            console.error("Erreur de réseau lors de la soumission:", error);
            alert("❌ Erreur de réseau. Veuillez réessayer.");
            return;
        }
    };


    // 3. Logique de filtrage (unchanged)
    const productsToFilter = fetchedProducts;

    const filteredProducts = productsToFilter
        .filter(product =>
            selectedCategory === 'Tous' || product.category === selectedCategory
        )
        .filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .filter(product =>
            product.price <= priceRange
        );

    const resetFilters = () => {
        setSelectedCategory('Tous');
        setSearchTerm('');
        setPriceRange(1000);
        setIsFilterOpen(false);
    };

    // 4. Composant du Modal de Commande (unchanged)
    const OrderModal = () => {
        if (!selectedProduct) return null;

        const totalPrice = (selectedProduct.price * quantity).toFixed(2);

        return (
            <div className="modal-overlay">
                <div className="order-modal-content">
                    <button className="modal-close-btn" onClick={closeOrderModal}><FaTimes /></button>

                    <h2 className="modal-title">
                        {isLoggedIn ? `Confirmer votre commande (Connecté)` : "Passer votre commande (Visiteur)"}
                    </h2>

                    {/* ... تفاصيل المنتج والكمية (unchanged) ... */}
                    <div className="product-summary">
                        <img src={selectedProduct.url} alt={selectedProduct.alt} className="summary-image" />
                        <div className="summary-details">
                            <p className="summary-name">{selectedProduct.name}</p>
                            <p className="summary-price">{selectedProduct.price.toFixed(2)} {selectedProduct.currency} / unité</p>
                        </div>
                    </div>

                    <div className="quantity-control-group">
                        <label>Quantité :</label>
                        <div className="quantity-controls">
                            <button type="button" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                                <FaMinusCircle />
                            </button>
                            <span className="current-qty">{quantity}</span>
                            <button type="button" onClick={() => handleQuantityChange(1)}>
                                <FaPlusCircle />
                            </button>
                        </div>
                        <p className="total-price-display">
                            Total : <strong>{totalPrice} {selectedProduct.currency}</strong>
                        </p>
                    </div>
                    {/* ... نهاية تفاصيل المنتج والكمية ... */}

                    <form onSubmit={handleConfirmOrder}>
                        <div className="customer-form-group">
                            <h4 className="form-subtitle">Vos informations de contact</h4>

                            <div className="input-row">
                                {/* 👤 حقل الاسم: يُعرض دائماً الآن */}
                                <div className="input-group">
                                    <FaUser className="input-icon" />
                                    <input
                                        type="text"
                                        name="firstName"
                                        placeholder="Nom et Prénom (Obligatoire)"
                                        value={customerData.firstName}
                                        onChange={handleCustomerDataChange}
                                        required
                                    />
                                </div>

                                {/* 🏠 حقل العنوان: يُعرض دائماً */}
                                <div className="input-group">
                                    <FaMapMarkerAlt className="input-icon" />
                                    <input
                                        type="text"
                                        name="adresse"
                                        placeholder="Adresse (Obligatoire)"
                                        value={customerData.adresse}
                                        onChange={handleCustomerDataChange}
                                        required
                                    />
                                </div>

                                {/* 📞 حقل الهاتف: يُعرض دائماً */}
                                <div className="input-group">
                                    <FaPhoneAlt className="input-icon" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="Numéro de Téléphone (Obligatoire)"
                                        value={customerData.phone}
                                        onChange={handleCustomerDataChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="modal-actions-order">
                            <button type="submit" className="confirm-order-btn">
                                {isLoggedIn ? "Confirmer la Commande" : "Soumettre la Demande"}
                            </button>
                            <button type="button" onClick={closeOrderModal} className="cancel-order-btn">
                                Annuler
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };
    
    // 5. NOUVEAU Composant du Modal de Succès (avec design moderne)
    const OrderSuccessModal = () => {
        if (!showSuccessModal) return null;

        // MODIFIÉ : Met à jour la visibilité du modal de feedback
        const handleFeedbackClick = () => {
            closeSuccessModal(); // Fermer le modal de succès
            setShowFeedbackModal(true); // Ouvrir le modal de commentaire
        };

        return (
            <div className="custom-modal-backdrop-success">
                <div className="modern-modal-content-success">
                    <button className="close-btn-success" onClick={closeSuccessModal}><FaTimes /></button>
                    
                    <div className="success-icon-section">
                        <FaCheckCircle className="check-icon-large" />
                    </div>

                    <h2 className="success-modal-title">
                        Commande Envoyée avec Succès !
                    </h2>
                    
                    <p className="success-message-text">
                        Votre commande a été enregistrée avec succès. 
                        Un responsable vous contactera dans les plus brefs délais pour confirmer votre achat.
                        <br/><br/>
                        **Référence de la commande :** **{lastCommandRef || 'N/A'}**
                    </p>

                    <div className="modal-action-buttons-success">
                        <button 
                            type="button" 
                            onClick={handleFeedbackClick} 
                            className="feedback-button-success"
                        >
                            <FaCommentAlt /> Laissez un Commentaire sur la Service
                        </button>
                        
                        <button 
                            type="button" 
                            onClick={closeSuccessModal} 
                            className="return-button-success"
                        >
                            Fermer
                        </button>
                    </div>

                </div>
            </div>
        );
    };

    // 🆕 6. NOUVEAU Composant du Modal de Commentaire (Feedback Modal)
    const FeedbackModal = () => {
        const [reviewText, setReviewText] = useState('');
        const [isSubmitted, setIsSubmitted] = useState(false);
        const [submitStatus, setSubmitStatus] = useState({ loading: false, error: null, success: false });

        const handleReviewSubmit = async (e) => {
            e.preventDefault();
            setSubmitStatus({ loading: true, error: null, success: false });
            
            // 🚨 الحصول على اسم العميل من customerData (وهو اسم المستخدم الذي أدخله في نموذج الطلب)
            const clientName = customerData.firstName;
            const commentContent = reviewText.trim();
            
            if (!clientName || clientName === '') {
                setSubmitStatus({ loading: false, error: 'Nom du client introuvable. Veuillez réessayer de commander.', success: false });
                return;
            }
            if (commentContent.length < 5) {
                setSubmitStatus({ loading: false, error: 'Le commentaire doit contenir au moins 5 caractères.', success: false });
                return;
            }

            const commentData = {
                nom: clientName, // 🎯 هذا هو المطلوب: إرسال اسم المستخدم
                commentaire: commentContent,
            };

            try {
                const response = await fetch(API_COMMENTAIRE_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(commentData),
                });

                const result = await response.json();

                if (response.ok) {
                    setSubmitStatus({ loading: false, error: null, success: true });
                    setIsSubmitted(true);
                    setReviewText(''); // تفريغ حقل التعليق

                    // إغلاق تلقائي بعد النجاح
                    setTimeout(() => {
                        closeFeedbackModal();
                    }, 3000);
                } else {
                    // Mongoose Validation Error (Code 400) ou autre erreur serveur (Code 500)
                    const errorMessage = Array.isArray(result.error) ? result.error.join(', ') : result.error || 'Erreur inconnue lors de la soumission.';
                    setSubmitStatus({ loading: false, error: `Erreur d'enregistrement : ${errorMessage}`, success: false });
                }
            } catch (error) {
                console.error("Erreur de réseau lors de la soumission du commentaire:", error);
                setSubmitStatus({ loading: false, error: "Erreur de réseau. Veuillez réessayer.", success: false });
            }
        };

        return (
            <div className="custom-modal-backdrop-success"> {/* Réutiliser le style d'arrière-plan */}
                <div className="modern-modal-content-success"> {/* Réutiliser le style de contenu */}
                    <button className="close-btn-success" onClick={closeFeedbackModal}><FaTimes /></button>

                    {isSubmitted ? (
                        <>
                            <div className="success-icon-section">
                                <FaCheckCircle className="check-icon-large" style={{ color: '#ffc107' }} /> {/* Couleur Jaune/Or pour le feedback */}
                            </div>
                            <h2 className="success-modal-title" style={{ color: '#007bff' }}>
                                Merci pour votre Avis Précieux ! 🌟
                            </h2>
                            <p className="success-message-text">
                                Votre commentaire a été enregistré. Votre **satisfaction** هي notre plus belle récompense et nous aide à nous améliorer continuellement.
                            </p>
                            <button type="button" onClick={closeFeedbackModal} className="return-button-success">
                                Retour à la Boutique
                            </button>
                        </>
                    ) : (
                        <form onSubmit={handleReviewSubmit}>
                            <div className="success-icon-section">
                                <FaCommentAlt className="check-icon-large" style={{ color: '#d7b33f' }} />
                            </div>
                            <h2 className="success-modal-title">
                                Votre Avis Compte Énormément ! 
                            </h2>
                            <p className="success-message-text">
                                Partagez votre expérience avec notre service. Qu'avez-vous pensé de l'achat ?
                                <br/>
                                <small>Votre nom sera enregistré comme : **{customerData.firstName || 'Non spécifié'}**</small>
                            </p>
                            
                            <textarea
                                className="feedback-textarea" // Nouvelle classe CSS à ajouter
                                placeholder="Écrivez votre commentaire ici..."
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                rows="5"
                                required
                            />
                            
                            {/* Affichage des messages d'état/erreur */}
                            {submitStatus.loading && (
                                <p className="status-message" style={{ color: '#007bff' }}>
                                    <FaSpinner className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> Envoi en cours...
                                </p>
                            )}
                            {submitStatus.error && (
                                <p className="status-message" style={{ color: 'red' }}>
                                    ❌ {submitStatus.error}
                                </p>
                            )}

                            <div className="modal-action-buttons-success">
                                <button 
                                    type="submit" 
                                    className="feedback-button-success" 
                                    disabled={reviewText.trim().length < 5 || submitStatus.loading}
                                >
                                    Soumettre le Commentaire
                                </button>
                                
                            </div>
                        </form>
                    )}
                </div>
            </div>
        );
    };


    // 7. Rendu Principal - Ajout du nouveau modal de feedback
    if (loading) {
        return (
            <>
                <Navbar/>
                <div className="loading-state" style={{ textAlign: 'center', padding: '100px', fontSize: '24px' }}>
                    <FaSpinner className="spinner" style={{ animation: 'spin 1s linear infinite', marginRight: '10px' }} />
                    Chargement des produits...
                </div>
            </>

        );
    }

    if (error) {
        return (
            <div className="error-state" style={{ textAlign: 'center', padding: '100px', color: 'red', fontSize: '18px' }}>
                ❌ **Erreur :** {error}
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <br /><br /><br /><br /><br /><br />
            <section className="product-grid-section">

                <div className="grid-header">
                    <h2 className="grid-main-title"><span style={{ color: "#333333", marginRight: "-00px" }}> Collection </span> Exclusive</h2>
                    <p className="grid-sub-text">
                        Découvrez nos nouveautés et les outils essentiels pour la haute couture.
                    </p>
                </div>

                <div className="shop-content-wrapper">

                    {/* 1. Bouton bascule Filtres (unchanged) */}
                    <button
                        className="toggle-filters-button"
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                    >
                        {isFilterOpen ? (
                            <> <FaTimes /> Fermer les filtres</>
                        ) : (
                            <> <FaSearch /> Afficher les filtres ({selectedCategory === 'Tous' ? 'Tous' : selectedCategory})</>
                        )}
                    </button>


                    {/* 2. Barre latérale des filtres (unchanged) */}
                    <aside className={`filter-sidebar ${isFilterOpen ? 'is-open' : ''}`}>
                        <h3 className="sidebar-title">Filtrer</h3>

                        <div className="filter-group search-filter">
                            <input
                                type="text"
                                placeholder="Rechercher un produit..."
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <FaSearch className="search-icon" />
                        </div>

                        <div className="filter-group">
                            <h4 className="filter-group-title">Catégories <FaChevronDown className="dropdown-icon" /></h4>
                            <ul className="category-list">
                                {categories.map((cat, index) => (
                                    <li
                                        key={index}
                                        className={`category-item ${cat === selectedCategory ? 'active' : ''}`}
                                        onClick={() => {
                                            setSelectedCategory(cat);
                                            if (window.innerWidth <= 992) setIsFilterOpen(false);
                                        }}
                                    >
                                        {cat} ({productsToFilter.filter(p => cat === 'Tous' || p.category === cat).length})
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            className="reset-filters-button"
                            onClick={resetFilters}
                        >
                            Réinitialiser
                        </button>

                    </aside>

                    {/* 3. Grille des produits */}
                    <main className="product-grid-main">
                        <div className="grid-info-bar">
                            <p className="info-text">Affichage de {filteredProducts.length} produit(s) sur {productsToFilter.length}</p>
                            <select className="sort-select">
                                <option>Trier par popularité</option>
                                <option>Trier par prix croissant</option>
                                <option>Trier par prix décroissant</option>
                            </select>
                        </div>

                        <div className="product-grid-container">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <div key={product.id} className="product-card">
                                        <div className="product-image-wrapper">
                                            <img
                                                className='product-grid-image'
                                                src={product.url}
                                                alt={product.alt}
                                            />
                                            <div className="category-badge">{product.category}</div>
                                        </div>

                                        <div className="product-details-grid">
                                            <h3 className="product-name-grid">{product.name}</h3>
                                            <div className="product-info-row-grid">
                                                <span className="product-price-grid">
                                                    {product.price.toFixed(2)} {product.currency}
                                                </span>
                                                <button
                                                    className="add-to-cart-button-grid"
                                                    onClick={() => handleOrderClick(product)}
                                                >
                                                    <FaShoppingCart /> Achat
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-results">
                                    <p>😞 **Aucun produit trouvé** pour les filtres sélectionnés.</p>
                                    <button className="reset-filters-button" onClick={resetFilters}>
                                        Réinitialiser les filtres
                                    </button>
                                </div>
                            )}
                        </div>
                    </main>

                </div>

            </section>

            {/* 4. Rendu du modal de commande */}
            {showOrderModal && <OrderModal />}
            
            {/* 5. Rendu du NOUVEAU modal de succès */}
            {showSuccessModal && <OrderSuccessModal />}

            {/* 🆕 6. Rendu du NOUVEAU modal de commentaire */}
            {showFeedbackModal && <FeedbackModal />}

            <Footer />
        </>
    );
}