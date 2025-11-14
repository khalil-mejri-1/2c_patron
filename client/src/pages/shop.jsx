import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaSearch, FaChevronDown, FaTimes, FaUser, FaMapMarkerAlt, FaPhoneAlt, FaMinusCircle, FaPlusCircle, FaSpinner, FaCheckCircle, FaCommentAlt } from 'react-icons/fa';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';

// 🚨 قائمة الفئات النهائية بناءً على طلبك
const categoriesFr = ['Tous', 'Homme', 'Famme', 'Enfant'];
const categoriesAr = ['الكل', 'رجال', 'نساء', 'أطفال'];
const categoriesEn = ['All', 'Men', 'Women', 'Children'];

// ⚠️ Assurez-vous que cette URL est correctة
const API_URL = 'https://2c-patron.vercel.app/api/products';
const API_COMMAND_URL = 'https://2c-patron.vercel.app/api/commands';
const API_COMMENTAIRE_URL = 'https://2c-patron.vercel.app/api/commentaires';

// 🌐 كائن الترجمة
const translations = {
    ar: {
        categories: categoriesAr,
        categoryMapping: { 'Tous': 'الكل', 'Homme': 'رجال', 'Famme': 'نساء', 'Enfant': 'أطفال' },
        unitPrice: "/ وحدة",
        modalTitleGuest: "إرسال طلبك (زائر)",
        modalTitleUser: "تأكيد طلبك (متصل)",
        qtyLabel: "الكمية :",
        total: "الإجمالي :",
        contactInfo: "بيانات الاتصال الخاصة بك",
        namePlaceholder: "الاسم واللقب (إلزامي)",
        addressPlaceholder: "العنوان (إلزامي)",
        phonePlaceholder: "رقم الهاتف (إلزامي)",
        validationError: "يرجى ملء جميع معلومات الاتصال (الاسم، العنوان، الهاتف).",
        submitBtn: "تأكيد الطلب",
        submitBtnGuest: "إرسال الطلب",
        submitting: "جاري الإرسال...",
        cancelBtn: "إلغاء",
        loading: "جاري تحميل المنتجات...",
        loadingTitle: "تحميل",
        error: (err) => `❌ **خطأ :** ${err}`,
        collectionTitle: "مجموعة",
        collectionAccent: "حصرية",
        collectionSubtitle: "اكتشف أحدث منتجاتنا والأدوات الأساسية للخياطة الراقية.",
        toggleFiltersClose: "إغلاق الفلاتر",
        toggleFiltersShow: (cat) => `عرض الفلاتر (${cat})`,
        sidebarTitle: "تصفية",
        navTitle:"الفئات  ",
        searchPlaceholder: "البحث عن منتج...",
        filterCategory: (cat) => `${cat}`,
        resetFilters: "إعادة تعيين",
        infoBar: (filtered, total) => `عرض ${filtered} منتج(ات) من أصل ${total}`,
        addToCart: "شراء",
        noResultsTitle: "😞 **لم يتم العثور على أي منتج**",
        noResultsMsg: "للفلاتر المحددة.",
        successTitle: "تم إرسال الطلب بنجاح!",
        successMessage: (ref) => `تم تسجيل طلبك بنجاح. سيتصل بك مسؤول في أقرب وقت لتأكيد عملية الشراء.
        <br/><br/>
        **مرجع الطلب :** **${ref || 'N/A'}**`,
        feedbackBtn: "ترك تعليق على الخدمة",
        closeBtn: "إغلاق",
        feedbackModalTitle: "رأيك يهمنا كثيرًا!",
        feedbackModalSubtitle: "شارك تجربتك مع خدمتنا. ما رأيك في عملية الشراء؟",
        feedbackModalSmallText: (name) => `سيتم تسجيل اسمك كـ : **${name || 'غير محدد'}**`,
        feedbackPlaceholder: "اكتب تعليقك هنا...",
        feedbackErrorName: "تعذر العثور على اسم العميل. يرجى محاولة الطلب مرة أخرى.",
        feedbackErrorLength: "يجب أن يحتوي التعليق على 5 أحرف على الأقل.",
        feedbackErrorSubmit: (err) => `خطأ في التسجيل : ${err}`,
        feedbackSubmit: "إرسال التعليق",
        feedbackSuccessTitle: "شكرًا لك على رأيك الثمين! 🌟",
        feedbackSuccessMsg: "تم تسجيل تعليقك. رضاك هو أعظم مكافأة لنا ويساعدنا على التحسن المستمر.",
        backToShop: "العودة إلى المتجر",
        networkError: "خطأ في الشبكة. الرجاء المحاولة مرة أخرى.",
        
    },
    fr: {
        categories: categoriesFr,
        categoryMapping: { 'Tous': 'Tous', 'Homme': 'Homme', 'Famme': 'Famme', 'Enfant': 'Enfant' },
        unitPrice: "/ unité",
        navTitle:"catégorie  ",
        modalTitleGuest: "Passer votre commande (Visiteur)",
        modalTitleUser: "Confirmer votre commande (Connecté)",
        qtyLabel: "Quantité :",
        total: "Total :",
        contactInfo: "Vos informations de contact",
        namePlaceholder: "Nom et Prénom (Obligatoire)",
        addressPlaceholder: "Adresse (Obligatoire)",
        phonePlaceholder: "Numéro de Téléphone (Obligatoire)",
        validationError: "Veuillez remplir toutes les informations de contact (Nom, Adresse, Téléphone).",
        submitBtn: "Confirmer la Commande",
        submitBtnGuest: "Soumettre la Demande",
        submitting: "Envoi...",
        cancelBtn: "Annuler",
        loading: "Chargement des produits...",
        loadingTitle: "Chargement",
        error: (err) => `❌ **Erreur :** ${err}`,
        collectionTitle: "Collection",
        collectionAccent: "Exclusive",
        collectionSubtitle: "Découvrez nos nouveautés et les outils essentiels pour la haute couture.",
        toggleFiltersClose: "Fermer les filtres",
        toggleFiltersShow: (cat) => `Afficher les filtres (${cat})`,
        sidebarTitle: "Filtrer",
        searchPlaceholder: "Rechercher un produit...",
        filterCategory: (cat) => `${cat} `,
        resetFilters: "Réinitialiser",
        infoBar: (filtered, total) => `Affichage de ${filtered} produit(s) sur ${total}`,
        addToCart: "Achat",
        noResultsTitle: "😞 **Aucun produit trouvé**",
        noResultsMsg: "pour les filtres sélectionnés.",
        successTitle: "Commande Envoyée avec Succès !",
        successMessage: (ref) => `Votre commande a été enregistrée avec succès. Un responsable vous contactera dans les plus brefs délais pour confirmer votre achat.
        <br/><br/>
        **Référence de la commande :** **${ref || 'N/A'}**`,
        feedbackBtn: "Laissez un Commentaire sur la Service",
        closeBtn: "Fermer",
        feedbackModalTitle: "Votre Avis Compte Énormément !",
        feedbackModalSubtitle: "Partagez votre expérience avec notre service. Qu'avez-vous pensé de l'achat ?",
        feedbackModalSmallText: (name) => `Votre nom sera enregistré comme : **${name || 'Non spécifié'}**`,
        feedbackPlaceholder: "Écrivez votre commentaire ici...",
        feedbackErrorName: "Nom du client introuvable. Veuillez réessayer de commander.",
        feedbackErrorLength: "Le commentaire doit contenir au moins 5 caractères.",
        feedbackErrorSubmit: (err) => `Erreur d'enregistrement : ${err}`,
        feedbackSubmit: "Soumettre le Commentaire",
        feedbackSuccessTitle: "Merci pour votre Avis Précieux ! 🌟",
        feedbackSuccessMsg: "Votre commentaire a été enregistré. Votre **satisfaction** est notre plus belle récompense et nous aide à nous améliorer continuellement.",
        backToShop: "Retour à la Boutique",
        networkError: "Erreur de réseau. Veuillez réessayer.",
    },
    en: {
        categories: categoriesEn,
        categoryMapping: { 'Tous': 'All', 'Homme': 'Men', 'Famme': 'Women', 'Enfant': 'Children' },
        unitPrice: "/ unit",
        modalTitleGuest: "Place Your Order (Guest)",
        modalTitleUser: "Confirm Your Order (Logged In)",
        qtyLabel: "Quantity :",
        total: "Total :",
        contactInfo: "Your Contact Information",
        namePlaceholder: "First and Last Name (Required)",
        addressPlaceholder: "Address (Required)",
        phonePlaceholder: "Phone Number (Required)",
        validationError: "Please fill in all contact information (Name, Address, Phone).",
        submitBtn: "Confirm Order",
        submitBtnGuest: "Submit Request",
        submitting: "Submitting...",
        navTitle:"category  ",
        cancelBtn: "Cancel",
        loading: "Loading products...",
        loadingTitle: "Loading",
        error: (err) => `❌ **Error:** ${err}`,
        collectionTitle: "Exclusive",
        collectionAccent: "Collection",
        collectionSubtitle: "Discover our new arrivals and essential tools for haute couture.",
        toggleFiltersClose: "Close filters",
        toggleFiltersShow: (cat) => `Show filters (${cat})`,
        sidebarTitle: "Filter",
        searchPlaceholder: "Search for a product...",
        filterCategory: (cat) => `${cat} `,
        resetFilters: "Reset",
        infoBar: (filtered, total) => `Displaying ${filtered} product(s) out of ${total}`,
        addToCart: "Purchase",
        noResultsTitle: "😞 **No products found**",
        noResultsMsg: "for the selected filters.",
        successTitle: "Order Submitted Successfully!",
        successMessage: (ref) => `Your order has been successfully recorded. A representative will contact you shortly to confirm your purchase.
        <br/><br/>
        **Order Reference:** **${ref || 'N/A'}**`,
        feedbackBtn: "Leave a Service Review",
        closeBtn: "Close",
        feedbackModalTitle: "Your Review Matters Hugely!",
        feedbackModalSubtitle: "Share your experience with our service. What did you think of the purchase?",
        feedbackModalSmallText: (name) => `Your name will be registered as: **${name || 'Unspecified'}**`,
        feedbackPlaceholder: "Write your comment here...",
        feedbackErrorName: "Client name not found. Please try ordering again.",
        feedbackErrorLength: "The comment must contain at least 5 characters.",
        feedbackErrorSubmit: (err) => `Registration Error: ${err}`,
        feedbackSubmit: "Submit Review",
        feedbackSuccessTitle: "Thank You for Your Valuable Feedback! 🌟",
        feedbackSuccessMsg: "Your comment has been recorded. Your **satisfaction** is our greatest reward and helps us continually improve.",
        backToShop: "Return to Shop",
        networkError: "Network error. Please try again.",
    }
};

// ====================================================================
// 🚨 المكون المنفصل للنافذة المنبثقة (MODAL)
// ====================================================================

const OrderModalComponent = ({ selectedProduct, quantity, handleQuantityChange, closeOrderModal, isLoggedIn, currentUserEmail, onOrderSuccess, onCustomerDataUpdate, appLanguage }) => {
    const t = translations[appLanguage] || translations.fr;
    
    const [customerData, setCustomerData] = useState({
        firstName: '',
        adresse: '',
        phone: ''
    });
    const [isSubmittingOrder, setIsSubmittingOrder] = useState(false); 

    const handleCustomerDataChange = (e) => {
        const { name, value } = e.target;
        const newData = { ...customerData, [name]: value };
        setCustomerData(newData);
        onCustomerDataUpdate(newData); 
    };


    const handleConfirmOrder = async (e) => {
        e.preventDefault();

        if (!selectedProduct) return;

        const calculatedTotal = selectedProduct.price * quantity;

        const clientName = customerData.firstName;
        const clientPhone = customerData.phone;
        const shippingAddress = customerData.adresse;

        if (!clientName || clientName.trim() === '' || !shippingAddress || !clientPhone) {
            alert(t.validationError);
            return;
        }

        setIsSubmittingOrder(true);

        const orderData = {
            totalAmount: calculatedTotal,
            items: [{
                productId: selectedProduct.id,
                productName: selectedProduct.name,
                productImage: selectedProduct.url,
                quantity: quantity,
                price: selectedProduct.price,
            }],
            clientName: clientName,
            clientPhone: clientPhone,
            shippingAddress: shippingAddress,
            ...(isLoggedIn && { clientEmail: currentUserEmail }),
        };

        try {
            const response = await fetch(API_COMMAND_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            const result = await response.json();

            if (response.ok) {
                onOrderSuccess(result.commandId);
            } else {
                console.error("Échec de l'enregistrement de la commande:", result);
                alert(`❌ ${t.networkError} : ${result.message || 'Problème de connexion au serveur.'}`);
            }

        } catch (error) {
            console.error("Erreur de réseau lors de la soumission:", error);
            alert(`❌ ${t.networkError}`);
        } finally {
            setIsSubmittingOrder(false); 
        }
    };


    const totalPrice = (selectedProduct.price * quantity).toFixed(2);
    const direction = appLanguage === 'ar' ? 'rtl' : 'ltr';

    return (
        <div className="modal-overlay">
            <div className="order-modal-content" dir={direction}>
                <button className="modal-close-btn" onClick={closeOrderModal} disabled={isSubmittingOrder}><FaTimes /></button> 

                <h2 className="modal-title">
                    {isLoggedIn ? t.modalTitleUser : t.modalTitleGuest}
                </h2>

                <div className="product-summary">
                    <img src={selectedProduct.url} alt={selectedProduct.alt} className="summary-image" />
                    <div className="summary-details">
                        <p className="summary-name">{selectedProduct.name}</p>
                        <p className="summary-price">{selectedProduct.price.toFixed(2)} {selectedProduct.currency} {t.unitPrice}</p>
                    </div>
                </div>

                <div className="quantity-control-group">
                    <label>{t.qtyLabel}</label>
                    <div className="quantity-controls">
                        <button type="button" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1 || isSubmittingOrder}>
                            <FaMinusCircle />
                        </button>
                        <span className="current-qty">{quantity}</span>
                        <button type="button" onClick={() => handleQuantityChange(1)} disabled={isSubmittingOrder}>
                            <FaPlusCircle />
                        </button>
                    </div>
                    <p className="total-price-display">
                        {t.total} <strong>{totalPrice} {selectedProduct.currency}</strong>
                    </p>
                </div>

                <form onSubmit={handleConfirmOrder}>
                    <div className="customer-form-group">
                        <h4 className="form-subtitle">{t.contactInfo}</h4>

                        <div className="input-row">
                            <div className="input-group">
                                <FaUser className="input-icon" />
                                <input
                                    type="text"
                                    name="firstName"
                                    placeholder={t.namePlaceholder}
                                    value={customerData.firstName}
                                    onChange={handleCustomerDataChange}
                                    required
                                    disabled={isSubmittingOrder}
                                    dir={appLanguage === 'ar' ? 'rtl' : 'ltr'}
                                />
                            </div>

                            <div className="input-group">
                                <FaMapMarkerAlt className="input-icon" />
                                <input
                                    type="text"
                                    name="adresse"
                                    placeholder={t.addressPlaceholder}
                                    value={customerData.adresse}
                                    onChange={handleCustomerDataChange}
                                    required
                                    disabled={isSubmittingOrder}
                                    dir={appLanguage === 'ar' ? 'rtl' : 'ltr'}
                                />
                            </div>

                            <div className="input-group">
                                <FaPhoneAlt className="input-icon" />
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder={t.phonePlaceholder}
                                    value={customerData.phone}
                                    onChange={handleCustomerDataChange}
                                    required
                                    disabled={isSubmittingOrder}
                                    dir={appLanguage === 'ar' ? 'rtl' : 'ltr'}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="modal-actions-order">
                        <button 
                            type="submit" 
                            className="confirm-order-btn"
                            disabled={isSubmittingOrder} 
                        >
                            {isSubmittingOrder ? (
                                <> <FaSpinner className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> {t.submitting}</>
                            ) : (
                                isLoggedIn ? t.submitBtn : t.submitBtnGuest
                            )}
                        </button>
                        <button type="button" onClick={closeOrderModal} className="cancel-order-btn" disabled={isSubmittingOrder}>
                            {t.cancelBtn}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// ====================================================================
// المكون الرئيسي: ProductGrid
// ====================================================================

export default function ProductGrid() {
    const [appLanguage, setAppLanguage] = useState('fr'); // حالة اللغة الافتراضية
    
    // 1. ⚙️ جلب اللغة من LocalStorage
    useEffect(() => {
        const lang = localStorage.getItem('appLanguage') || 'fr';
        setAppLanguage(lang);
    }, []);

    const t = translations[appLanguage] || translations.fr;
    const currentCategories = t.categories;

    const [fetchedProducts, setFetchedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // États de filtrage
    const [selectedCategory, setSelectedCategory] = useState(currentCategories[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [priceRange, setPriceRange] = useState(1000);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // États مُعدّلة للأصالة وبيانات المستخدم
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
    const [showFeedbackModal, setShowFeedbackModal] = useState(false); 

    // 📝 بيانات العميل 
    const [finalCustomerData, setFinalCustomerData] = useState({ firstName: '', adresse: '', phone: '' });


    // ====================================================================
    // 1A. Logique d'authentification et Récupération des produits (محدثة)
    // ====================================================================
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
                    // نستخدم مفاتيح فرنسية للتصنيف لتسهيل الفلترة (لأنها ثابتة في قاعدة البيانات)
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

    }, []); 
    
    // 💡 تحديث الفلتر الافتراضي عند تغيير اللغة 
    useEffect(() => {
        setSelectedCategory(currentCategories[0]);
    }, [appLanguage]);


    // ====================================================================
    // 1B. Logique de gestion du Scroll (محدثة)
    // ====================================================================
    useEffect(() => {
        const body = document.body;
        if (showOrderModal || showSuccessModal || showFeedbackModal) {
            body.classList.add('no-scroll');
        } else {
            body.classList.remove('no-scroll');
        }

        return () => {
            body.classList.remove('no-scroll');
        };
    }, [showOrderModal, showSuccessModal, showFeedbackModal]);


    // 2. Fonctions de gestion du modal والطلب (محدثة)
    const handleOrderClick = (product) => {
        setSelectedProduct(product);
        setQuantity(1);
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
    
    const closeFeedbackModal = () => {
        setShowFeedbackModal(false);
    };


    const handleQuantityChange = (change) => {
        setQuantity(prev => {
            const newQty = prev + change;
            return Math.max(1, newQty);
        });
    };

    const handleOrderSuccessCallback = (commandId) => {
        setLastCommandRef(commandId);
        closeOrderModal();
        setShowSuccessModal(true);
    };

    const handleCustomerDataUpdate = (data) => {
        setFinalCustomerData(data);
    };


    // 3. Logique de filtrage (محدثة باستخدام المفاتيح الفرنسية للعمل على البيانات الثابتة)
    const productsToFilter = fetchedProducts;
    const lowerSearchTerm = searchTerm.toLowerCase();

    // نستخدم هنا المفاتيح الفرنسية الثابتة في قاعدة البيانات
    const selectedCategoryKey = categoriesFr[currentCategories.indexOf(selectedCategory)] || 'Tous'; 
    
    const filteredProducts = productsToFilter
        .filter(product => {
            // 💡 ملاحظة: 'category' المنتج مأخوذ من قاعدة البيانات الفرنسية الثابتة. 
            // نقارن بينه وبين المفتاح الفرنسي للفئة المحددة
            const isCategoryMatch = selectedCategoryKey === 'Tous' || product.category === selectedCategoryKey;
            
            if (!lowerSearchTerm) {
                return isCategoryMatch;
            } else {
                const isNameMatch = product.name.toLowerCase().includes(lowerSearchTerm);
                const isSearchCategoryMatch = product.category.toLowerCase().includes(lowerSearchTerm);

                if (selectedCategoryKey !== 'Tous') {
                    return isCategoryMatch && (isNameMatch || isSearchCategoryMatch);
                } else {
                    return isNameMatch || isSearchCategoryMatch;
                }
            }
        })
        .filter(product =>
            product.price <= priceRange
        );

    const resetFilters = () => {
        setSelectedCategory(currentCategories[0]);
        setSearchTerm('');
        setPriceRange(1000);
        setIsFilterOpen(false);
    };

    // 5. NOUVEAU Composant du Modal de Succès (محدث باللغات)
    const OrderSuccessModal = () => {
        if (!showSuccessModal) return null;
        const direction = appLanguage === 'ar' ? 'rtl' : 'ltr';

        const handleFeedbackClick = () => {
            closeSuccessModal();
            setShowFeedbackModal(true); 
        };

        return (
            <div className="custom-modal-backdrop-success">
                <div className="modern-modal-content-success" dir={direction}>
                    <button className="close-btn-success" onClick={closeSuccessModal}><FaTimes /></button>
                    
                    <div className="success-icon-section">
                        <FaCheckCircle className="check-icon-large" />
                    </div>

                    <h2 className="success-modal-title">
                        {t.successTitle}
                    </h2>
                    
                    <p className="success-message-text" dangerouslySetInnerHTML={{ __html: t.successMessage(lastCommandRef) }}></p>

                    <div className="modal-action-buttons-success">
                        <button 
                            type="button" 
                            onClick={handleFeedbackClick} 
                            className="feedback-button-success"
                        >
                            <FaCommentAlt /> {t.feedbackBtn}
                        </button>
                        
                        <button 
                            type="button" 
                            onClick={closeSuccessModal} 
                            className="return-button-success"
                        >
                            {t.closeBtn}
                        </button>
                    </div>

                </div>
            </div>
        );
    };

    // 🆕 6. NOUVEAU Composant du Modal de Commentaire (Feedback Modal) (محدث باللغات)
    const FeedbackModal = () => {
        const [reviewText, setReviewText] = useState('');
        const [isSubmitted, setIsSubmitted] = useState(false);
        const [submitStatus, setSubmitStatus] = useState({ loading: false, error: null, success: false });
        const direction = appLanguage === 'ar' ? 'rtl' : 'ltr';

        const handleReviewSubmit = async (e) => {
            e.preventDefault();
            
            // 🚨 1. تعيين حالة التحميل
            setSubmitStatus({ loading: true, error: null, success: false });
            
            const clientName = finalCustomerData.firstName; 
            const commentContent = reviewText.trim();
            
            if (!clientName || clientName.trim() === '') {
                setSubmitStatus({ loading: false, error: t.feedbackErrorName, success: false });
                return;
            }
            if (commentContent.length < 5) {
                setSubmitStatus({ loading: false, error: t.feedbackErrorLength, success: false });
                return;
            }

            // 🚨 2. كائن البيانات المرسل
            const commentData = {
                nom: clientName, 
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
                
                // 🚨 محاولة قراءة النتيجة كـ JSON حتى لو كان هناك خطأ
                let result;
                try {
                    result = await response.json();
                } catch (jsonError) {
                    if (!response.ok) {
                        throw new Error(`Server responded with status ${response.status} but no valid JSON body.`);
                    }
                    result = {}; // استجابة فارغة لكن ناجحة
                }

                if (response.ok) {
                    setSubmitStatus({ loading: false, error: null, success: true });
                    setIsSubmitted(true);
                    setReviewText('');

                    setTimeout(() => {
                        closeFeedbackModal();
                    }, 3000);
                } else {
                    // 🚨 تحسين معالجة أخطاء الاستجابة غير الناجحة (4xx, 5xx)
                    const errorMessage = Array.isArray(result.error) 
                        ? result.error.join(', ') 
                        : result.message || result.error || t.networkError;
                    
                    setSubmitStatus({ loading: false, error: t.feedbackErrorSubmit(errorMessage), success: false });
                }
            } catch (error) {
                console.error("Erreur de réseau ou du serveur lors de la soumission du commentaire:", error);
                setSubmitStatus({ loading: false, error: t.networkError, success: false });
            }
        };

        return (
            <div className="custom-modal-backdrop-success">
                <div className="modern-modal-content-success" dir={direction}>
                    {/* 🚨 تعطيل زر الإغلاق أثناء الإرسال */}
                    <button className="close-btn-success" onClick={closeFeedbackModal} disabled={submitStatus.loading}><FaTimes /></button>

                    {isSubmitted ? (
                        <>
                            <div className="success-icon-section">
                                <FaCheckCircle className="check-icon-large" style={{ color: '#ffc107' }} />
                            </div>
                            <h2 className="success-modal-title" style={{ color: '#007bff' }}>
                                {t.feedbackSuccessTitle}
                            </h2>
                            <p className="success-message-text" dangerouslySetInnerHTML={{ __html: t.feedbackSuccessMsg.replace('هي', 'is').replace('satisfaction', `**${t.backToShop.includes('satisfaction') ? 'satisfaction' : 'satisfaction'}**`) }}></p>
                            <button type="button" onClick={closeFeedbackModal} className="return-button-success" disabled={submitStatus.loading}>
                                {t.backToShop}
                            </button>
                        </>
                    ) : (
                        <form onSubmit={handleReviewSubmit}>
                            <div className="success-icon-section">
                                <FaCommentAlt className="check-icon-large" style={{ color: '#d7b33f' }} />
                            </div>
                            <h2 className="success-modal-title">
                                {t.feedbackModalTitle}
                            </h2>
                            <p className="success-message-text">
                                {t.feedbackModalSubtitle}
                                <br/>
                                <small dir={appLanguage === 'ar' ? 'rtl' : 'ltr'}>{t.feedbackModalSmallText(finalCustomerData.firstName)}</small>
                            </p>
                            
                            <textarea
                                className="feedback-textarea"
                                placeholder={t.feedbackPlaceholder}
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                rows="5"
                                required
                                disabled={submitStatus.loading}
                                dir={appLanguage === 'ar' ? 'rtl' : 'ltr'}
                            />
                            
                            {/* Affichage des messages d'état/erreur */}
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
                                    {submitStatus.loading ? (
                                        <> <FaSpinner className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> {t.submitting}</>
                                    ) : (
                                        t.feedbackSubmit
                                    )}
                                </button>
                                
                            </div>
                        </form>
                    )}
                </div>
            </div>
        );
    };


    // 7. Rendu Principal - Ajout du nouveau modal de feedback (محدث باللغات)
    const direction = appLanguage === 'ar' ? 'rtl' : 'ltr';

    if (loading) {
        return (
            <>
                <Navbar/>
                <div className="loading-state" style={{ textAlign: 'center', padding: '100px', fontSize: '24px' }} dir={direction}>
                    <FaSpinner className="spinner" style={{ animation: 'spin 1s linear infinite', marginRight: '10px' }} />
                    {t.loading}
                </div>
            </>

        );
    }

    if (error) {
        return (
            <div className="error-state" style={{ textAlign: 'center', padding: '100px', color: 'red', fontSize: '18px' }} dir={direction}>
                <p>{t.error(error)}</p>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <br /><br /><br /><br /><br /><br />
            <section className="product-grid-section" dir={direction}>

                <div className="grid-header">
                    <h2 className="grid-main-title">
                        <span style={{ color: "#333333", marginRight: "-00px" }}> 
                            {appLanguage === 'en' ? t.collectionTitle : t.collectionTitle} 
                        </span> 
                        <span className="vip-accent-text" style={{ color: "#D4AF37" }}>
                            {appLanguage === 'en' ? t.collectionAccent : t.collectionAccent}
                        </span>
                    </h2>
                    <p className="grid-sub-text">
                        {t.collectionSubtitle}
                    </p>
                </div>

                <div className="shop-content-wrapper">

                    {/* 1. Bouton bascule Filtres (محدث باللغات) */}
                    <button
                        className={`toggle-filters-button ${appLanguage === 'ar' ? 'rtl-align-text' : ''}`}
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                    >
                        {isFilterOpen ? (
                            <> <FaTimes /> {t.toggleFiltersClose}</>
                        ) : (
                            <> <FaSearch /> {t.toggleFiltersShow(selectedCategory)}</>
                        )}
                    </button>


                    {/* 2. Barre latérale des filtres (محدث باللغات) */}
                    <aside className={`filter-sidebar ${isFilterOpen ? 'is-open' : ''} ${appLanguage === 'ar' ? 'rtl-sidebar' : ''}`}>
                        <h3 className="sidebar-title">{t.sidebarTitle}</h3>

                        <div className="filter-group search-filter">
                            <input
                                type="text"
                                placeholder={t.searchPlaceholder}
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                dir={appLanguage === 'ar' ? 'rtl' : 'ltr'}
                            />
                            <FaSearch className="search-icon" />
                        </div>

                        <div className="filter-group">
                            <h4 className="filter-group-title">{t.filterCategory(t.navTitle)} <FaChevronDown className="dropdown-icon" /></h4>
                            <ul className="category-list">
                                {currentCategories.map((cat, index) => {
                                    // نستخدم المفتاح الفرنسي لعملية الفلترة
                                    const categoryKey = categoriesFr[index]; 
                                    const count = productsToFilter.filter(p => categoryKey === 'Tous' || p.category === categoryKey).length;
                                    
                                    return (
                                        <li
                                            key={index}
                                            className={`category-item ${cat === selectedCategory ? 'active' : ''}`}
                                            onClick={() => {
                                                setSelectedCategory(cat);
                                                if (window.innerWidth <= 992) setIsFilterOpen(false);
                                            }}
                                        >
                                            {cat} ({count})
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        <button
                            className="reset-filters-button"
                            onClick={resetFilters}
                        >
                            {t.resetFilters}
                        </button>

                    </aside>

                    {/* 3. Grille des produits (محدث باللغات) */}
                    <main className="product-grid-main">
                        <div className="grid-info-bar">
                            <p className="info-text">{t.infoBar(filteredProducts.length, productsToFilter.length)}</p>
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
                                            {/* هنا نستخدم الترجمة للعرض، لكن الفلترة مازالت تستخدم القيمة الثابتة */}
                                            <div className="category-badge">{t.categoryMapping[product.category] || product.category}</div> 
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
                                                    <FaShoppingCart /> {t.addToCart}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-results">
                                    <p>{t.noResultsTitle} {t.noResultsMsg}</p>
                                    <button className="reset-filters-button" onClick={resetFilters}>
                                        {t.resetFilters}
                                    </button>
                                </div>
                            )}
                        </div>
                    </main>

                </div>

            </section>

            {/* 4. Rendu du modal de commande المُحدَّث */}
            {showOrderModal && selectedProduct && (
                <OrderModalComponent 
                    selectedProduct={selectedProduct}
                    quantity={quantity}
                    handleQuantityChange={handleQuantityChange}
                    closeOrderModal={closeOrderModal}
                    isLoggedIn={isLoggedIn}
                    currentUserEmail={currentUserEmail}
                    onOrderSuccess={handleOrderSuccessCallback} 
                    onCustomerDataUpdate={handleCustomerDataUpdate}
                    appLanguage={appLanguage}
                />
            )}
            
            {/* 5. Rendu du modal de succès */}
            {showSuccessModal && <OrderSuccessModal />}

            {/* 6. Rendu du modal de commentaire */}
            {showFeedbackModal && <FeedbackModal />}

            <Footer />
        </>
    );
}