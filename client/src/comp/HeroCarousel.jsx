import React, { useState, useEffect } from 'react';
import {
    FaArrowRight, FaShoppingCart, FaTimes, FaPlusCircle, FaMinusCircle,
    FaUser, FaMapMarkerAlt, FaPhoneAlt, FaSpinner, FaCheckCircle,
    FaStar, FaRegStar, FaCommentAlt
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

// 🌟 Translation Data Object 🌟
const translations = {
    fr: {
        mainTitle1: "L'ATELIER",
        mainTitle2: "COUTURE",
        subline: "MAÎTRISER L'ART DU PATRONAGE",
        introText: "Accédez aux secrets du patronage et du moulage avec des cours vidéo exclusifs. Devenez l'artisan d'art que vous avez toujours rêvé d'être.",
        ctaButton: "Découvrir le Master Atelier",
        cartButton: "Achat",
        products: [
            { id: 1, name: 'Patron Robe d\'Élégance', alt: 'Robe élégante' },
            { id: 2, name: 'Gabarit Jupe Crayon', alt: 'Jupe Crayon' },
            { id: 3, name: 'Masterclass Tissus Fluides', alt: 'Masterclass Tissus' },
        ],
        modalTitleUser: "Confirmation de votre commande",
        modalTitleGuest: "Finaliser votre commande",
        qtyLabel: "Quantité:",
        unitPrice: "/unité",
        total: "Total:",
        contactInfo: "Vos informations de livraison",
        namePlaceholder: "Nom complet",
        addressPlaceholder: "Adresse de livraison",
        phonePlaceholder: "Numéro de téléphone",
        validationError: "Veuillez remplir tous les champs obligatoires (Nom, Adresse, Téléphone).",
        networkError: "Erreur réseau. Veuillez réessayer plus tard.",
        submitting: "Envoi...",
        submitBtn: "Confirmer la commande",
        submitBtnGuest: "Passer la commande",
        cancelBtn: "Annuler",
        // Nouveaux textes pour les Modals
        successTitle: "Commande Réussie !",
        successMessage: (id) => `Votre commande N° <strong>${id}</strong> a été enregistrée. Un email de confirmation vous sera envoyé sous peu.`,
        feedbackBtn: "Laisser un commentaire",
        closeBtn: "Fermer",
        commentPrompt: "Votre avis nous est précieux !",
        ratingLabel: "Votre note:",
        commentPlaceholder: "Tapez votre commentaire ici...",
        sendCommentBtn: "Envoyer le commentaire",
        skipCommentBtn: "Annuler",
        commentSuccessMsg: "🎉 Merci ! Votre commentaire a été envoyé avec succès.",
        commentErrorMsg: "❌ Désolé, une erreur s'est produite lors de l'envoi du commentaire.",
        commentFormTitle: "Votre avis nous importe beaucoup !",
    },
    ar: {
        mainTitle1: "الورشة",
        mainTitle2: "للخياطة",
        subline: "إتقان فن الباتروناج",
        introText: "اكتشف أسرار الباتروناج والقولبة من خلال دورات فيديو حصرية. كن الحرفي المبدع الذي طالما حلمت به.",
        ctaButton: "اكتشفوا الأتيليه الرئيسي",
        cartButton: "شراء",
        products: [
            { id: 1, name: 'باترون فستان الأناقة', alt: 'فستان أنيق' },
            { id: 2, name: 'نموذج تنورة القلم', alt: 'تنورة القلم' },
            { id: 3, name: 'دورة إتقان الأقمشة المنسدلة', alt: 'دورة الأقمشة' },
        ],
        modalTitleUser: "تأكيد طلبك",
        modalTitleGuest: "إتمام عملية الشراء",
        qtyLabel: "الكمية:",
        unitPrice: "/للوحدة",
        total: "المجموع:",
        contactInfo: "بيانات التوصيل الخاصة بك",
        namePlaceholder: "الاسم الكامل",
        addressPlaceholder: "عنوان التوصيل",
        phonePlaceholder: "رقم الهاتف",
        validationError: "الرجاء تعبئة جميع الحقول المطلوبة (الاسم، العنوان، الهاتف).",
        networkError: "خطأ في الشبكة. الرجاء المحاولة لاحقًا.",
        submitting: "إرسال...",
        submitBtn: "تأكيد الطلب",
        submitBtnGuest: "إرسال الطلب",
        cancelBtn: "إلغاء",
        successTitle: "تمت عملية الطلب بنجاح!",
        successMessage: (id) => `تم تسجيل طلبك رقم <strong>${id}</strong>. سيتم إرسال رسالة تأكيد عبر البريد الإلكتروني قريباً.`,
        feedbackBtn: "ترك تعليق على الخدمة",
        closeBtn: "إغلاق",
        commentPrompt: "رأيك يهمنا كثيرًا!",
        ratingLabel: "تقييمك:",
        commentPlaceholder: "اكتب تعليقك هنا...",
        sendCommentBtn: "إرسال التعليق",
        skipCommentBtn: "إلغاء",
        commentSuccessMsg: "🎉 شكراً لك! تم إرسال تعليقك بنجاح.",
        commentErrorMsg: "❌ عذراً، حدث خطأ أثناء إرسال التعليق.",
        commentFormTitle: "رأيك يهمنا كثيرًا!",
    },
    en: {
        mainTitle1: "THE SEWING",
        mainTitle2: "WORKSHOP",
        subline: "MASTERING THE ART OF PATTERN MAKING",
        introText: "Access the secrets of pattern making and draping with exclusive video courses. Become the master craftsman you've always dreamed of being.",
        ctaButton: "Discover the Master Workshop",
        cartButton: "Purchase",
        products: [
            { id: 1, name: 'Elegant Dress Pattern', alt: 'Elegant Dress' },
            { id: 2, name: 'Pencil Skirt Template', alt: 'Pencil Skirt' },
            { id: 3, name: 'Fluid Fabrics Masterclass', alt: 'Fabrics Masterclass' },
        ],
        modalTitleUser: "Confirm Your Order",
        modalTitleGuest: "Finalize Your Purchase",
        qtyLabel: "Quantity:",
        unitPrice: "/unit",
        total: "Total:",
        contactInfo: "Your Delivery Information",
        namePlaceholder: "Full Name",
        addressPlaceholder: "Shipping Address",
        phonePlaceholder: "Phone Number",
        validationError: "Please fill in all required fields (Name, Address, Phone).",
        networkError: "Network error. Please try again later.",
        submitting: "Submitting...",
        submitBtn: "Confirm Order",
        submitBtnGuest: "Place Order",
        cancelBtn: "Cancel",
        successTitle: "Order Placed Successfully!",
        successMessage: (id) => `Your order N° <strong>${id}</strong> has been registered. A confirmation email will be sent shortly.`,
        feedbackBtn: "Leave Feedback",
        closeBtn: "Close",
        commentPrompt: "Your opinion matters a lot to us!",
        ratingLabel: "Your Rating:",
        commentPlaceholder: "Type your comment here...",
        sendCommentBtn: "Submit Comment",
        skipCommentBtn: "Cancel",
        commentSuccessMsg: "🎉 Thank you! Your comment has been submitted successfully.",
        commentErrorMsg: "❌ Sorry, an error occurred while submitting the comment.",
        commentFormTitle: "Your opinion matters a lot to us!",
    },
};

const API_COMMAND_URL = 'https://2c-patron.vercel.app/api/commands';
const API_COMMENTAIRE_URL = 'http://localhost:3000/api/commentaires';


// **********************************************
// ********* 1. مكون نافذة التعليق *****************
// **********************************************

// **********************************************
// ********* 1. مكون نافذة التعليق *****************
// **********************************************

const CommentModalComponent = ({
    selectedProduct,
    closeCommentModal,
    appLanguage,
    customerData
}) => {
    const t = translations[appLanguage] || translations.fr;
    const [rating, setRating] = useState(0);
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const direction = appLanguage === 'ar' ? 'rtl' : 'ltr';

    const handleRatingClick = (newRating) => {
        setRating(newRating);
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();

        if (rating === 0 && commentText.trim() === '') {
            alert(appLanguage === 'ar' ? "الرجاء إدخال تقييم أو تعليق قبل الإرسال." : "Please enter a rating or a comment before submitting.");
            return;
        }

        setIsSubmitting(true);

        const commentData = {
            nom: customerData.firstName || selectedProduct.name,
            commentaire: commentText.trim(), 
            rating: rating,
            productId: selectedProduct.id,
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
                // ✅ الإغلاق التلقائي بعد 2 ثانية فقط عند النجاح
                setTimeout(closeCommentModal, 2000); 
            } else {
                setSubmitStatus('error');
            }

        } catch (error) {
            console.error("Erreur de réseau lors de lإرسال التعليق:", error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
            // ❌ تم إزالة شرط setTimeout من هنا، لأنه تسبب في مشكلة عدم الإغلاق اليدوي
            // سيتم الإغلاق الآن إما تلقائيًا بعد النجاح (في try block) أو يدويًا.
        }
    };

    return (
        <div className="modal-overlay">
            <div className="comment-modal-content" dir={direction}>
                {/* ✅ التعديل هنا: زر الإغلاق يجب أن يكون غير معطل فقط عندما 
                  لا تكون عملية الإرسال نشطة، أو إذا كانت قد نجحت (لأن الإغلاق التلقائي سيعمل).
                  نستخدم هنا: !isSubmitting.
                  إذا كانت الحالة 'success'، سيتم إغلاقها تلقائيا.
                */}
                <button 
                    className="modal-close-btn" 
                    onClick={closeCommentModal} 
                    disabled={isSubmitting} // منع الإغلاق أثناء الإرسال فقط
                >
                    <FaTimes />
                </button>

                <h4 className="form-subtitle">{t.commentFormTitle}</h4>

                {submitStatus === 'success' ? (
                    <div className="comment-status-message success">
                        {t.commentSuccessMsg}
                    </div>
                ) : submitStatus === 'error' ? (
                    <div className="comment-status-message error">
                        {t.commentErrorMsg}
                    </div>
                ) : (
                    <form onSubmit={handleSubmitComment}>
                        {/* ... باقي حقول النموذج ... */}
                        <div className="rating-control-group">
                            <p>{t.ratingLabel}</p>
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
                                placeholder={t.commentPlaceholder}
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                disabled={isSubmitting}
                                rows="4"
                                dir={direction}
                            />
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
                                onClick={closeCommentModal}
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


// **********************************************
// ********* 2. المكون الجديد لتأكيد النجاح *******
// **********************************************
const SuccessModalComponent = ({ lastCommandRef, closeSuccessModal, handleFeedbackClick, appLanguage }) => {
    const t = translations[appLanguage] || translations.fr;
    const direction = appLanguage === 'ar' ? 'rtl' : 'ltr';

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

                {/* استخدام dangerouslySetInnerHTML لعرض الـ strong */}
                <p className="success-message-text" dangerouslySetInnerHTML={{ __html: t.successMessage(lastCommandRef) }}></p>

                <div className="modal-action-buttons-success">
                    <button
                        type="button"
                        onClick={handleFeedbackClick} // ينتقل لـ CommentModal
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


// **********************************************
// ********* 3. مكون نافذة الطلب (OrderModal) ****
// **********************************************
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

        // تم التصحيح هنا (مشكلة clientAddress)
        if (!clientName || clientName.trim() === '' || !shippingAddress || shippingAddress.trim() === '' || !clientPhone || clientPhone.trim() === '') {
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
                // عند النجاح، نستدعي الدالة لإغلاق نافذة الطلب وفتح نافذة التأكيد
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

    const currency = selectedProduct.currency || 'DT';
    const totalPrice = (selectedProduct.price * quantity).toFixed(2);
    const direction = appLanguage === 'ar' ? 'rtl' : 'ltr';

    return (
        <div className="modal-overlay">
            <div className="order-modal-content" dir={direction}>
                <button className="modal-close-btn" onClick={closeOrderModal} disabled={isSubmittingOrder}>
                    <FaTimes />
                </button>

                <h2 className="modal-title">
                    {isLoggedIn ? t.modalTitleUser : t.modalTitleGuest}
                </h2>

                <div className="product-summary">
                    <img src={selectedProduct.url} alt={selectedProduct.alt} className="summary-image" />
                    <div className="summary-details">
                        <p className="summary-name">{selectedProduct.name}</p>
                        <p className="summary-price">{selectedProduct.price.toFixed(2)} {currency} {t.unitPrice}</p>
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
                        {t.total} <strong>{totalPrice} {currency}</strong>
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


// **********************************************
// ********* 4. مكون HeroSection الرئيسي ************
// **********************************************
export default function HeroSection({ languageProp = 'fr', isLoggedIn = false, currentUserEmail = '' }) {

    // 🌐 لوجيك تحديد اللغة 🌐
    const langCode = localStorage.getItem('appLanguage') || languageProp;
    let effectiveLanguage = 'fr';
    if (langCode === 'ar') {
        effectiveLanguage = 'ar';
    } else if (langCode === 'eg' || langCode === 'en') {
        effectiveLanguage = 'en';
    }

    const currentLanguage = effectiveLanguage;
    const texts = translations[currentLanguage];

    // 🆕 حالات جديدة لإدارة النوافذ المنبثقة والبيانات 🆕
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

    // حالة لنافذة التأكيد
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [lastOrderId, setLastOrderId] = useState(null);
    const [customerData, setCustomerData] = useState({});

    // 📦 useEffect لجلب المنتجات 📦
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/home-products');
                if (!response.ok) {
                    throw new Error("Failed to fetch products.");
                }
                const data = await response.json();

                const mappedProducts = data.map((item) => ({
                    id: item._id,
                    price: item.prix,
                    name: item.nom,
                    url: item.image,
                    alt: `${texts.products[0].alt} - ${item.nom}`,
                    currency: 'DT'
                }));

                setProducts(mappedProducts);

            } catch (err) {
                console.error("Fetch Error:", err);
                setError(texts.introText);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [currentLanguage]);

    // ⚙️ لوجيك التمرير التلقائي ⚙️
    const [currentSlide, setCurrentSlide] = useState(0);
    const totalSlides = products.length;

    useEffect(() => {
        if (totalSlides > 0) {
            const interval = setInterval(() => {
                setCurrentSlide((prevSlide) => (prevSlide + 1) % totalSlides);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [totalSlides]);


    // **********************************************
    // ********* وظائف معالجة النوافذ (مُحدثة لمعالجة المشكلة) ********
    // **********************************************

    const openOrderModal = (product) => {
        setSelectedProduct(product);
        setQuantity(1);
        setIsOrderModalOpen(true);
    };

    const closeOrderModal = () => {
        setIsOrderModalOpen(false);
        // لا نحذف selectedProduct هنا
    };

    const handleQuantityChange = (change) => {
        setQuantity(prevQty => Math.max(1, prevQty + change));
    };

    // 💡 عند نجاح الطلب، نفتح نافذة التأكيد 💡
    const handleOrderSuccess = (commandId) => {
        setLastOrderId(commandId);
        closeOrderModal(); // إغلاق نافذة الطلب
        setIsSuccessModalOpen(true); // فتح نافذة التأكيد
    };

    // 💡 وظيفة لإغلاق نافذة التأكيد 💡
    const closeSuccessModal = () => {
        setIsSuccessModalOpen(false);
        // لا نمسح selectedProduct هنا بعد، لأننا قد نفتح نافذة التعليق لاحقًا
    };

    // 💡 وظيفة للانتقال من التأكيد إلى التعليق 💡
    const handleFeedbackClick = () => {
        // نغلق نافذة التأكيد ونفتح التعليق
        setIsSuccessModalOpen(false);
        setIsCommentModalOpen(true);
        // لا نمسح selectedProduct هنا.
    };

    // 💡 وظيفة لإغلاق نافذة التعليق (نقطة نهاية المسح) 💡
    const closeCommentModal = () => {
        setIsCommentModalOpen(false);
        // ✅ هنا نمسح كل البيانات بعد انتهاء دورة الطلب والتعليق
        setSelectedProduct(null);
        setLastOrderId(null);
    };

    const handleCustomerDataUpdate = (newData) => {
        setCustomerData(newData);
    };
    // ----------------------------------------------

    const sectionDirection = currentLanguage === 'ar' ? 'rtl' : 'ltr';

    if (isLoading) {
        return <section className="loading-hero-section" style={{ textAlign: 'center', padding: '100px' }}>⏳ {currentLanguage === 'ar' ? 'جاري تحميل المنتجات...' : 'Loading products...'} ⏳</section>;
    }

    if (error || products.length === 0) {
        return (
            <section className="error-hero-section" dir={sectionDirection} style={{ padding: '50px 20px' }}>
                <div className="hero-content-block" style={{ textAlign: sectionDirection === 'rtl' ? 'right' : 'left' }}>
                    <h1 className="hero-main-title">
                        <span style={{ color: "#333333" }}>{texts.mainTitle1}</span>
                        <span className="accent-text">{texts.mainTitle2}</span>
                        <span className="hero-subline">{texts.subline}</span>
                    </h1>
                    <p className="hero-intro-text">
                        {texts.introText}
                    </p>
                    <div style={{ color: 'red', marginTop: '20px' }}>
                        {currentLanguage === 'ar' ? '❌ عذراً، لا يمكن عرض المنتجات حالياً. ' : '❌ Sorry, products cannot be displayed currently.'}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <>
            <section className="modern-hero-section" dir={sectionDirection}>

                {/* 1. Bloc de Contenu */}
                <div className="hero-content-block">
                    <h1 className="hero-main-title">
                        <span style={{ color: "#333333" }}>{texts.mainTitle1}</span>
                        <span className="accent-text">{texts.mainTitle2}</span>
                        <span className="hero-subline">{texts.subline}</span>
                    </h1>
                    <p className="hero-intro-text">
                        {texts.introText}
                    </p>
                    <Link to="/magasin" className="hero-cta-button">
                        {texts.ctaButton} {currentLanguage !== 'ar' ? <FaArrowRight /> : null}
                        {currentLanguage === 'ar' ? <FaArrowRight style={{ transform: 'rotate(180deg)', marginRight: '8px' }} /> : null}
                    </Link>
                </div>

                {/* 2. Bloc Visuel: شريط المنتجات المتحرك */}
                <div className="hero-visual-block">
                    <div
                        className="product-carousel-container"
                        style={{
                            width: `${totalSlides * 100}%`,
                            transform: currentLanguage === 'ar'
                                ? `translateX(${currentSlide * (100 / totalSlides)}%)`
                                : `translateX(-${currentSlide * (100 / totalSlides)}%)`
                        }}
                    >
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="product-slide"
                                style={{
                                    width: `calc(100% / ${totalSlides})`
                                }}
                            >
                                <img
                                    className='product-image'
                                    src={product.url}
                                    alt={product.alt}
                                />
                                <div className="image-gradient-overlay"></div>

                                <div className="product-details">
                                    <h3 className="product-name">{product.name}</h3>
                                    <div className="product-info-row">
                                        <span className="product-price">{product.price} {product.currency || 'DT'}</span>
                                        <button
                                            className="add-to-cart-button"
                                            onClick={() => openOrderModal(product)}
                                        >
                                            <FaShoppingCart /> {texts.cartButton}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. عرض نافذة تأكيد الطلب */}
            {isOrderModalOpen && selectedProduct && (
                <OrderModalComponent
                    selectedProduct={selectedProduct}
                    quantity={quantity}
                    handleQuantityChange={handleQuantityChange}
                    closeOrderModal={closeOrderModal}
                    isLoggedIn={isLoggedIn}
                    currentUserEmail={currentUserEmail}
                    onOrderSuccess={handleOrderSuccess}
                    onCustomerDataUpdate={handleCustomerDataUpdate}
                    appLanguage={currentLanguage}
                />
            )}

            {/* 4. عرض نافذة التأكيد بعد الإرسال */}
            {isSuccessModalOpen && lastOrderId && (
                <SuccessModalComponent
                    lastCommandRef={lastOrderId}
                    closeSuccessModal={closeSuccessModal}
                    handleFeedbackClick={handleFeedbackClick} // ينتقل لـ CommentModal
                    appLanguage={currentLanguage}
                />
            )}

            {/* 5. عرض نافذة التعليق */}
            {isCommentModalOpen && selectedProduct && (
                <CommentModalComponent
                    selectedProduct={selectedProduct}
                    closeCommentModal={closeCommentModal}
                    appLanguage={currentLanguage}
                    customerData={customerData} // تمرير بيانات العميل
                />
            )}
        </>
    );
}