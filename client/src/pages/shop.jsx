import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaSearch, FaChevronDown, FaTimes, FaUser, FaMapMarkerAlt, FaPhoneAlt, FaMinusCircle, FaPlusCircle, FaSpinner, FaCheckCircle, FaCommentAlt, FaStar, FaRegStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';

// 🚨 قائمة الفئات النهائية بناءً على طلبك
const categoriesFr = ['Tous', 'Homme', 'Famme', 'Enfant'];
const categoriesAr = ['الكل', 'رجال', 'نساء', 'أطفال'];
const categoriesEn = ['All', 'Men', 'Women', 'Children'];

// ⚠️ Assurez-وا أن هذه URL صحيحة
const API_URL = 'http://localhost:3000/api/products';
const API_COMMAND_URL = 'http://localhost:3000/api/commands';
const API_COMMENTAIRE_URL = 'http://localhost:3000/api/commentaires';

// 🌐 كائن الترجمة - تم تحديث مفاتيح الأخطاء
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
        navTitle: "الفئات  ",
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
        feedbackModalTitle: "رأيك يهمنا كثيرًا! 📝",
        feedbackModalSubtitle: "شارك تجربتك مع خدمتنا. ما رأيك في عملية الشراء؟",
        feedbackModalSmallText: (name) => `سيتم تسجيل اسمك كـ : **${name || 'غير محدد'}**`,
        feedbackPlaceholder: "اكتب تعليقك هنا...",
        feedbackErrorName: "تعذر العثور على اسم العميل. يرجى محاولة الطلب مرة أخرى.",
        // 🛑 رسالة الخطأ الجديدة التي ستظهر أسفل التعليق
        feedbackErrorLength: "يجب عليك إما **إضافة تقييم بالنجوم** أو كتابة تعليق لا يقل عن **5 أحرف**.",
        feedbackErrorSubmit: (err) => `خطأ في التسجيل : ${err}`,
        feedbackSubmit: "إرسال التعليق",
        feedbackSuccessTitle: "شكرًا لك على رأيك الثمين! 🌟",
        feedbackSuccessMsg: "تم تسجيل تعليقك. رضاك هو أعظم مكافأة لنا ويساعدنا على التحسن المستمر.",
        backToShop: "العودة إلى المتجر",
        networkError: "خطأ في الشبكة. الرجاء المحاولة مرة أخرى.",
        ratingLabel: "تقييمك للخدمة:",
        commentFormTitle: "إضافة تقييم/تعليق",
        commentSuccessMsg: "تم إرسال تعليقك بنجاح. شكراً لك!",
        commentErrorMsg: "حدث خطأ أثناء إرسال التعليق. الرجاء المحاولة مجدداً.",
        sendCommentBtn: "إرسال التعليق",
        skipCommentBtn: "تخطي",

    },
    fr: {
        categories: categoriesFr,
        categoryMapping: { 'Tous': 'Tous', 'Homme': 'Homme', 'Famme': 'Famme', 'Enfant': 'Enfant' },
        unitPrice: "/ unité",
        navTitle: "catégorie  ",
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
        feedbackModalTitle: "Votre Avis Compte Énormément ! 📝",
        feedbackModalSubtitle: "Partagez votre expérience avec notre service. Qu'avez-vous pensé de l'achat ?",
        feedbackModalSmallText: (name) => `Votre nom sera enregistré comme : **${name || 'Non spécifié'}**`,
        feedbackPlaceholder: "Écrivez votre commentaire ici...",
        feedbackErrorName: "Nom du client introuvable. Veuillez réessayer de commander.",
        // 🛑 رسالة الخطأ الجديدة التي ستظهر أسفل التعليق
        feedbackErrorLength: "Vous devez soit **ajouter une note en étoiles** ou écrire un commentaire d'au moins **5 caractères**.",
        feedbackErrorSubmit: (err) => `Erreur d'enregistrement : ${err}`,
        feedbackSubmit: "Soumettre le Commentaire",
        feedbackSuccessTitle: "Merci pour votre Avis Précieux ! 🌟",
        feedbackSuccessMsg: "Votre commentaire a été enregistré. Votre **satisfaction** est notre plus belle récompense et nous aide à nous améliorer continuellement.",
        backToShop: "Retour à la Boutique",
        networkError: "Erreur de réseau. Veuillez réessayer.",
        ratingLabel: "Votre note pour le service:",
        commentFormTitle: "Ajouter une note/un commentaire",
        commentSuccessMsg: "Votre commentaire a été soumis avec succès. Merci !",
        commentErrorMsg: "Une erreur est survenue lors de l'envoi du commentaire. Veuillez réessayer.",
        sendCommentBtn: "Soumettre le Commentaire",
        skipCommentBtn: "Ignorer",

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
        navTitle: "category  ",
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
        feedbackModalTitle: "Your Review Matters Hugely! 📝",
        feedbackModalSubtitle: "Share your experience with our service. What did you think of the purchase?",
        feedbackModalSmallText: (name) => `Your name will be registered as: **${name || 'Unspecified'}**`,
        feedbackPlaceholder: "Write your comment here...",
        feedbackErrorName: "Client name not found. Please try ordering again.",
        // 🛑 رسالة الخطأ الجديدة التي ستظهر أسفل التعليق
        feedbackErrorLength: "You must either **add a star rating** or write a comment of at least **5 characters**.",
        feedbackErrorSubmit: (err) => `Registration Error: ${err}`,
        feedbackSubmit: "Submit Review",
        feedbackSuccessTitle: "Thank You for Your Valuable Feedback! 🌟",
        feedbackSuccessMsg: "Your comment has been recorded. Your **satisfaction** is our greatest reward and helps us continually improve.",
        backToShop: "Return to Shop",
        networkError: "Network error. Please try again.",
        ratingLabel: "Your service rating:",
        commentFormTitle: "Add a Rating/Review",
        commentSuccessMsg: "Your comment has been submitted successfully. Thank you!",
        commentErrorMsg: "An error occurred while submitting the comment. Please try again.",
        sendCommentBtn: "Submit Review",
        skipCommentBtn: "Skip",
    }
};

// ====================================================================
// مُكوِّن شريحة الصور (Image Carousel Component)
// ====================================================================

const ImageCarousel = ({ images, direction }) => {
    // يجب التحقق من أن images هي مصفوفة وتحتوي على عناصر
    if (!images || images.length === 0) return null;

    const [currentIndex, setCurrentIndex] = useState(0);

    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = () => {
        const isLastSlide = currentIndex === images.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    // تأثير للانتقال التلقائي كل 5 ثوانٍ
    useEffect(() => {
        const interval = setInterval(() => {
            goToNext();
        }, 5000); // 5 ثوانٍ
        return () => clearInterval(interval);
    }, [currentIndex]);

    return (
        <div className="image-carousel-container" style={{ position: 'relative', width: '100%', overflow: 'hidden', margin: '15px 0', borderRadius: '8px' }}>
            <div
                className="carousel-inner"
                style={{
                    display: 'flex',
                    transition: 'transform 0.5s ease-in-out',
                    transform: `translateX(-${currentIndex * 100}%)`,
                }}
            >
                {images.map((url, index) => (
                    <div key={index} className="carousel-item" style={{ minWidth: '100%', flexShrink: 0 }}>
                        <img
                            src={url}
                            alt={`Slide ${index + 1}`}
                            style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                        />
                    </div>
                ))}
            </div>

            {/* أزرار التحكم في الكاروسيل */}
            {images.length > 1 && (
                <>
                    <button onClick={goToPrevious} className="carousel-control prev" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: direction === 'rtl' ? '5px' : '5px', right: direction === 'rtl' ? 'auto' : 'auto', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', padding: '10px', cursor: 'pointer', zIndex: 10, borderRadius: '50%' }}>
                        {direction === 'rtl' ? <FaChevronRight /> : <FaChevronLeft />}
                    </button>
                    <button onClick={goToNext} className="carousel-control next" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: direction === 'rtl' ? '5px' : '5px', left: direction === 'rtl' ? 'auto' : 'auto', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', padding: '10px', cursor: 'pointer', zIndex: 10, borderRadius: '50%' }}>
                        {direction === 'rtl' ? <FaChevronLeft /> : <FaChevronRight />}
                    </button>
                </>
            )}

            <div className="carousel-indicators" style={{ position: 'absolute', bottom: '10px', width: '100%', textAlign: 'center' }}>
                {images.map((_, index) => (
                    <span
                        key={index}
                        style={{
                            display: 'inline-block',
                            width: '8px',
                            height: '8px',
                            margin: '0 4px',
                            borderRadius: '50%',
                            backgroundColor: index === currentIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                            cursor: 'pointer',
                        }}
                        onClick={() => setCurrentIndex(index)}
                    ></span>
                ))}
            </div>
        </div>
    );
};


// ====================================================================
// OrderModalComponent (المعدل)
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
                // 💡 يستخدم selectedProduct.url الذي يحمل mainImage أو image القديم
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

                {/* 🆕 المكان الجديد للكاروسيل المتحرك */}
                {/* 💡 تم التعديل هنا: استخدام selectedProduct.secondaryImages */}
                {selectedProduct.secondaryImages && selectedProduct.secondaryImages.length > 0 && (
                    <ImageCarousel images={selectedProduct.secondaryImages} direction={direction} />
                )}
                {/* 🔚 نهاية الكاروسيل */}

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
                            disabled={!customerData.firstName || !customerData.adresse || !customerData.phone || isSubmittingOrder}
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
// المكون الرئيسي: ProductGrid (المصحح)
// ====================================================================

export default function ProductGrid() {
    const [appLanguage, setAppLanguage] = useState('fr');

    useEffect(() => {
        const lang = localStorage.getItem('appLanguage') || 'fr';
        setAppLanguage(lang);
    }, []);

    const t = translations[appLanguage] || translations.fr;
    const currentCategories = t.categories;

    const [fetchedProducts, setFetchedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedCategory, setSelectedCategory] = useState(currentCategories[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [priceRange, setPriceRange] = useState(1000);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUserEmail, setCurrentUserEmail] = useState('');

    const [showOrderModal, setShowOrderModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [lastCommandRef, setLastCommandRef] = useState(null);

    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    const [finalCustomerData, setFinalCustomerData] = useState({ firstName: '', adresse: '', phone: '' });


    useEffect(() => {
        // Logique d'authentification والبيانات الأساسية
        const status = localStorage.getItem('login') === 'true';
        const userEmail = localStorage.getItem('currentUserEmail') || '';

        setIsLoggedIn(status);
        setCurrentUserEmail(userEmail);

        // 🌟 LOGIQUE DE RÉCUPÉRATION DES PRODUجTS DEPUIS L'API
    // ProductGrid.js

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
            // ✅ التصحيح الأساسي: يختار mainImage (الجديد) أو image (القديم) كصورة رئيسية.
            url: p.mainImage || p.image, 
            secondaryImages: p.secondaryImages || [],
            alt: p.nom,
            category: p.categorie
        }));

        setFetchedProducts(mappedProducts);

    } catch (err) {
        console.error("Échec de la récupération des produits :", err);
        setError("Impossible de charger les produits. Veuillez vérifier الـ API.");
    } finally {
        setLoading(false);
    }
};

// ... (بقية الكود)

        fetchProducts();

    }, []);

    useEffect(() => {
        setSelectedCategory(currentCategories[0]);
    }, [appLanguage]);


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


    const handleOrderClick = (product) => {
        setSelectedProduct(product);
        setQuantity(1);
        setShowOrderModal(true);
    };

    const closeOrderModal = () => {
        setShowOrderModal(false);
    };

    const closeSuccessModal = () => {
        setShowSuccessModal(false);
    };

    const closeFeedbackModal = () => {
        setShowFeedbackModal(false);
        // ✅ Clear data after the cycle
        setSelectedProduct(null);
        setLastCommandRef(null);
        setFinalCustomerData({ firstName: '', adresse: '', phone: '' });
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


    const productsToFilter = fetchedProducts;
    const lowerSearchTerm = searchTerm.toLowerCase();
    const selectedCategoryKey = categoriesFr[currentCategories.indexOf(selectedCategory)] || 'Tous';

    const filteredProducts = productsToFilter
        .filter(product => {
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

    // 5. NOUVEAU Composant du Modal de Succès 
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

    // 🆕 6. NOUVEAU Composant du Modal de Commentaire (Feedback Modal) (معدل)
    const FeedbackModal = () => {
        const [reviewText, setReviewText] = useState('');
        const [rating, setRating] = useState(5);
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [submitStatus, setSubmitStatus] = useState(null); // 'loading', 'success', 'error'
        // 🚨 حالة جديدة لخطأ التحقق في النموذج
        const [validationError, setValidationError] = useState(null);
        const direction = appLanguage === 'ar' ? 'rtl' : 'ltr';

        const customerName = finalCustomerData.firstName || 'Guest';
        const productRefId = selectedProduct?.id;

        const handleRatingClick = (newRating) => {
            setRating(newRating);
            // 💡 مسح خطأ التحقق عند اختيار نجمة
            setValidationError(null);
        };

        const handleTextChange = (e) => {
            setReviewText(e.target.value);
            // 💡 مسح خطأ التحقق عند بدء الكتابة
            setValidationError(null);
        };

        const handleSubmitComment = async (e) => {
            e.preventDefault();
            setValidationError(null); // مسح الأخطاء السابقة
            setSubmitStatus(null); // مسح حالة الإرسال السابقة

            if (!productRefId) {
                setValidationError(t.feedbackErrorName);
                return;
            }

            // 🛑 شرط التحقق الجديد: يجب أن يكون هناك إما تقييم (rating > 0) أو تعليق لا يقل عن 5 أحرف
            if (reviewText.trim().length < 5 && rating === 0) {
                setValidationError(t.feedbackErrorLength); // عرض رسالة الخطأ المترجمة
                // 🛑 تم إزالة setSubmitStatus('error');
                return; // إيقاف العملية هنا
            }

            setIsSubmitting(true);
            setSubmitStatus('loading');

            const commentData = {
                nom: customerName,
                commentaire: reviewText.trim(),
                rating: rating,
                productId: productRefId,
            };

            try {
                const response = await fetch(API_COMMENTAIRE_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(commentData),
                });

                if (response.ok) {
                    setSubmitStatus('success');
                    setTimeout(closeFeedbackModal, 2000);
                } else {
                    const result = await response.json();
                    setSubmitStatus(null); // لا تعرض رسالة النجاح/الخطأ العامة في حالة فشل الخادم
                    console.error("Échec de l'enregistrement du commentaire:", result);
                    setValidationError(t.feedbackErrorSubmit(result.message || 'Server error')); // عرض الخطأ أسفل النموذج
                }

            } catch (error) {
                console.error("Erreur de réseau lors de l'envoi du commentaire:", error);
                setSubmitStatus(null); // لا تعرض رسالة النجاح/الخطأ العامة في حالة فشل الشبكة
                setValidationError(t.networkError); // عرض الخطأ أسفل النموذج
            } finally {
                setIsSubmitting(false);
            }
        };

        if (!showFeedbackModal) return null;

        return (
            <div className="modal-overlay">
                <div className="comment-modal-content" dir={direction}>
                    <button
                        className="modal-close-btn"
                        onClick={closeFeedbackModal}
                        disabled={isSubmitting}
                    >
                        <FaTimes />
                    </button>

                    <h2 className="feedback-modal-title">{t.feedbackModalTitle}</h2>
                    <br />

                    {/* تم حذف شرط submitStatus === 'error' هنا لعدم عرض رسالة الخطأ العامة */}
                    {submitStatus === 'success' ? (
                        <div className="comment-status-message success">
                            <FaCheckCircle className="check-icon-small" /> {t.feedbackSuccessMsg}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmitComment}>
                            <div className="rating-control-group">
                                <p>{t.ratingLabel}</p>
                                <br /><br />
                                <div className="rating-stars">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                            key={star}
                                            className="star"
                                            onClick={() => handleRatingClick(star)}
                                            style={{ color: star <= rating ? '#ffc107' : '#e4e5e9', cursor: 'pointer', fontSize: '24px' }}
                                        >
                                            {star <= rating ? <FaStar /> : <FaRegStar />}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="comment-input-group">
                                <textarea
                                    name="comment"
                                    placeholder={t.feedbackPlaceholder}
                                    value={reviewText}
                                    onChange={handleTextChange}
                                    disabled={isSubmitting}
                                    rows="4"
                                    dir={direction}
                                />
                                {/* 🚨 عرض رسالة خطأ التحقق أسفل حقل التعليق (تظهر لأخطاء التحقق الأولية وأخطاء الخادم/الشبكة) */}
                                {validationError && (
                                    <p className="validation-error-text"
                                        style={{ color: '#d9534f', marginTop: '5px', fontSize: '14px', fontWeight: 'bold' }}
                                        dangerouslySetInnerHTML={{ __html: validationError }}
                                    ></p>
                                )}
                            </div>

                            <div className="modal-actions-comment">
                                <button
                                    type="submit"
                                    className="send-comment-btn"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <> <FaSpinner className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> {t.submitting}</>
                                    ) : (
                                        t.sendCommentBtn
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeFeedbackModal}
                                    className="skip-comment-btn"
                                    disabled={isSubmitting}
                                >
                                    {t.skipCommentBtn}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        );
    };

    // 7. Rendu Principal 
    const direction = appLanguage === 'ar' ? 'rtl' : 'ltr';

    if (loading) {
        return (
            <>
                <Navbar />
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
                            {t.collectionTitle}
                        </span>
                        <span className="vip-accent-text" style={{ color: "#D4AF37" }}>
                            {t.collectionAccent}
                        </span>
                    </h2>
                    <p className="grid-sub-text">
                        {t.collectionSubtitle}
                    </p>
                </div>

                <div className="shop-content-wrapper">

                    {/* 1. Bouton bascule Filtres */}
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


                    {/* 2. Barre latérale des filtres */}
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

                    {/* 3. Grille des منتجات */}
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

            {/* 4. Rendu du modal de commande */}
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