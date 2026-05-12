import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useLanguage } from '../context/LanguageContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaSearch, FaChevronDown, FaTimes, FaUser, FaMapMarkerAlt, FaPhoneAlt, FaMinusCircle, FaPlusCircle, FaSpinner, FaCheckCircle, FaCommentAlt, FaStar, FaRegStar, FaChevronLeft, FaChevronRight, FaEdit, FaSave, FaTrash, FaPlus, FaWhatsapp, FaFacebookMessenger, FaRobot, FaPaperPlane, FaCloudUploadAlt, FaLayerGroup, FaCheck, FaLongArrowAltRight, FaTags, FaHandPointer, FaEye, FaGift, FaClock, FaImage } from 'react-icons/fa';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import { useAlert } from '../context/AlertContext';
import './shop_redesign.css';
import BASE_URL from '../apiConfig';

const API_OFFERS_URL = `${BASE_URL}/api/offers`;
const API_COMMAND_URL = `${BASE_URL}/api/commands`;

const CountdownTimer = ({ expirationDate, appLanguage }) => {
    const [timeLeft, setTimeLeft] = useState({ h: '00', m: '00', s: '00' });

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = new Date(expirationDate).getTime() - now;

            if (distance < 0) {
                clearInterval(timer);
                return;
            }

            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft({
                h: h.toString().padStart(2, '0'),
                m: m.toString().padStart(2, '0'),
                s: s.toString().padStart(2, '0')
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [expirationDate]);

    return (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '15px' }}>
            <div className="timer-unit-glam"><span className="unit-val">{timeLeft.h}</span><span className="unit-lab">{appLanguage === 'ar' ? 'ساعة' : 'Hrs'}</span></div>
            <div className="timer-unit-glam"><span className="unit-val">{timeLeft.m}</span><span className="unit-lab">{appLanguage === 'ar' ? 'دقيقة' : 'Min'}</span></div>
            <div className="timer-unit-glam"><span className="unit-val">{timeLeft.s}</span><span className="unit-lab">{appLanguage === 'ar' ? 'ثانية' : 'Sec'}</span></div>
        </div>
    );
};

const ImageCarousel = ({ images, direction, height = '320px' }) => {
    if (!images || images.length === 0) return null;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const goToPrevious = (e) => {
        if (e) e.stopPropagation();
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = (e) => {
        if (e) e.stopPropagation();
        const isLastSlide = currentIndex === images.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    return (
        <div className="image-carousel-container" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} style={{ height }}>
            <div className="carousel-inner" style={{ transform: `translateX(-${currentIndex * 100}%)`, transition: 'all 0.5s ease' }}>
                {images.map((url, index) => (
                    <div key={index} className="carousel-item">
                        <img src={url} alt={`Slide ${index}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                ))}
            </div>
            {images.length > 1 && (
                <>
                    <button onClick={goToPrevious} className="carousel-control-btn prev"><FaChevronLeft /></button>
                    <button onClick={goToNext} className="carousel-control-btn next"><FaChevronRight /></button>
                </>
            )}
        </div>
    );
};

const OrderModalComponent = ({ selectedProduct, quantity, handleQuantityChange, closeOrderModal, isLoggedIn, currentUserEmail, onOrderSuccess, appLanguage, showAlert }) => {
    const [customerData, setCustomerData] = useState({ firstName: '', adresse: '', phone: '' });
    const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
    const t = {
        ar: { qty: "الكمية :", total: "الإجمالي :", contact: "بيانات الاتصال", name: "الاسم", addr: "العنوان", phone: "الهاتف", confirm: "تأكيد الطلب", cancel: "إلغاء", submitting: "جاري الإرسال..." },
        fr: { qty: "Quantité :", total: "Total :", contact: "Contact", name: "Nom", addr: "Adresse", phone: "Téléphone", confirm: "Confirmer", cancel: "Annuler", submitting: "Envoi..." },
        en: { qty: "Quantity :", total: "Total :", contact: "Contact", name: "Name", addr: "Address", phone: "Phone", confirm: "Confirm", cancel: "Cancel", submitting: "Submitting..." }
    }[appLanguage] || { qty: "Quantité :", total: "Total :", contact: "Contact", name: "Nom", addr: "Adresse", phone: "Téléphone", confirm: "Confirmer", cancel: "Annuler", submitting: "Envoi..." };

    const handleConfirmOrder = async (e) => {
        e.preventDefault();
        setIsSubmittingOrder(true);
        try {
            const orderData = {
                totalAmount: selectedProduct.price * quantity,
                items: [{ productId: selectedProduct.id, productName: selectedProduct.name, productImage: selectedProduct.url, quantity, price: selectedProduct.price }],
                clientName: customerData.firstName,
                clientPhone: customerData.phone,
                shippingAddress: customerData.adresse,
                ...(isLoggedIn && { clientEmail: currentUserEmail })
            };
            const res = await fetch(API_COMMAND_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData) });
            if (res.ok) {
                const result = await res.json();
                onOrderSuccess(result.commandId);
            } else {
                showAlert('error', 'Error', 'Failed to place order');
            }
        } catch (err) {
            showAlert('error', 'Error', 'Network error');
        } finally {
            setIsSubmittingOrder(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="order-modal-content" dir={appLanguage === 'ar' ? 'rtl' : 'ltr'}>
                <button className="modal-close-btn" onClick={closeOrderModal}><FaTimes /></button>
                <h2 className="modal-title">{selectedProduct.name}</h2>
                <ImageCarousel images={selectedProduct.offerImages || [selectedProduct.url]} height="300px" />
                <div className="quantity-control-group">
                    <label>{t.qty}</label>
                    <div className="quantity-controls">
                        <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}><FaMinusCircle /></button>
                        <span>{quantity}</span>
                        <button onClick={() => handleQuantityChange(1)}><FaPlusCircle /></button>
                    </div>
                    <p className="total-price-display">{t.total} <strong>{(selectedProduct.price * quantity).toFixed(2)} DT</strong></p>
                </div>
                <form onSubmit={handleConfirmOrder}>
                    <div className="customer-form-group">
                        <input type="text" placeholder={t.name} value={customerData.firstName} onChange={e => setCustomerData({ ...customerData, firstName: e.target.value })} required />
                        <input type="text" placeholder={t.addr} value={customerData.adresse} onChange={e => setCustomerData({ ...customerData, adresse: e.target.value })} required />
                        <input type="tel" placeholder={t.phone} value={customerData.phone} onChange={e => setCustomerData({ ...customerData, phone: e.target.value })} required />
                    </div>
                    <div className="modal-actions-order">
                        <button type="submit" className="confirm-order-btn" disabled={isSubmittingOrder}>
                            {isSubmittingOrder ? <FaSpinner className="spinner" /> : t.confirm}
                        </button>
                        <button type="button" className="cancel-order-btn" onClick={closeOrderModal}>{t.cancel}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function OffersPage() {
    const { appLanguage, languages } = useLanguage();
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [lastCommandRef, setLastCommandRef] = useState(null);

    const [isAdmin, setIsAdmin] = useState(false);
    const [isEditingField, setIsEditingField] = useState(null);
    const [offersContent, setOffersContent] = useState({});
    const [editOffersContent, setEditOffersContent] = useState({});

    // Check Admin
    useEffect(() => {
        const email = localStorage.getItem('currentUserEmail') || localStorage.getItem('loggedInUserEmail');

        const checkAdminStatus = async () => {
            if (!email) {
                setIsAdmin(false);
                return;
            }
            try {
                const response = await fetch(`${BASE_URL}/api/users/${email}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.statut === 'admin') {
                        setIsAdmin(true);
                        localStorage.setItem('userRole', 'admin');
                        localStorage.setItem('isAdmin', 'true');
                    } else {
                        setIsAdmin(false);
                        localStorage.setItem('isAdmin', 'false');
                    }
                } else {
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error("Error verifying admin status:", error);
                setIsAdmin(false);
            }
        };

        checkAdminStatus();
    }, []);

    // Load Customizable Content
    useEffect(() => {
        fetch(`${BASE_URL}/api/settings/offers-content`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) {
                    setOffersContent(data);
                    setEditOffersContent(data);
                }
            })
            .catch(() => { });
    }, []);

    const handleSaveOffersContent = async () => {
        setOffersContent(editOffersContent);
        setIsEditingField(null);
        try {
            await fetch(`${BASE_URL}/api/settings/offers-content`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: editOffersContent })
            });
            showAlert('success', 'Perfect', 'Content updated');
        } catch (err) {
            showAlert('error', 'Error', 'Failed to save');
        }
    };

    const getT = (key, defaultVal) => {
        return (offersContent[appLanguage] && offersContent[appLanguage][key]) || defaultVal;
    };

    const EditBtn = ({ field, style = {}, children }) => (
        isAdmin && (
            <button
                onClick={(e) => { e.stopPropagation(); setIsEditingField(field); }}
                className="edit-btn-minimal-lux"
                title="Modifier"
                style={style}
            >
                {children || <FaEdit size={14} />}
            </button>
        )
    );

    useEffect(() => {
        fetch(API_OFFERS_URL)
            .then(res => res.json())
            .then(data => { setOffers(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleOrderClick = (product) => {
        setSelectedProduct(product);
        setQuantity(1);
    };

    const onOrderSuccess = (ref) => {
        setLastCommandRef(ref);
        setSelectedProduct(null);
        setShowSuccessModal(true);
    };

    const direction = appLanguage === 'ar' ? 'rtl' : 'ltr';

    const HeroSection = () => (
        <header className="about-hero-premium" style={{
            backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.4)), url(${getT('heroImage', 'https://images.unsplash.com/photo-1556015048-4ded3446a160?q=80&w=2560&auto=format&fit=crop')})`
        }}>
            <div className="about-hero-overlay"></div>
            <div className="container about-container" style={{ position: 'relative', zIndex: 10 }}>
                <div className="about-badge-lux">
                    {getT('heroBadge', appLanguage === 'ar' ? 'عروض حصرية' : 'Offres Exclusives')}
                </div>
                <h1 className="about-main-title">
                    {appLanguage === 'en' ? getT('heroAccent', 'Special') : getT('heroTitle', appLanguage === 'ar' ? 'عروض' : 'Offres')}
                    <span className="about-accent"> {appLanguage === 'en' ? getT('heroTitle', 'Offers') : getT('heroAccent', appLanguage === 'ar' ? 'استثنائية' : 'Exceptionnelles')}</span>
                </h1>
                <p className="about-sub-text">
                    {getT('heroSub', appLanguage === 'ar' ? 'اكتشف أفضل الخصومات على مجموعتنا المختارة بعناية.' : 'Découvrez nos meilleures réductions sur une sélection unique.')}
                </p>
                {isAdmin && (
                    <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
                        <EditBtn field="hero">
                            <FaEdit /> {appLanguage === 'ar' ? 'تعديل النصوص' : 'Modifier les textes'}
                        </EditBtn>
                        <EditBtn field="heroImage">
                            <FaImage /> {appLanguage === 'ar' ? 'تغيير الخلفية' : 'Changer l\'image'}
                        </EditBtn>
                    </div>
                )}
            </div>
        </header>
    );

    if (loading) return (
        <div className="offers-page-wrapper" dir={direction}>
            <Navbar />
            <HeroSection />
            <main className="container luxury-grid-container">
                <div className="offers-grid">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="skeleton-card creative-card" style={{ height: '500px' }}>
                            <div className="skeleton-item" style={{ height: '30px', width: '30%', borderRadius: '50px', marginBottom: '20px' }}></div>
                            <div className="skeleton-item" style={{ height: '25px', width: '70%', borderRadius: '8px', margin: '0 auto 30px' }}></div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '40px' }}>
                                <div className="skeleton-item" style={{ width: '100px', height: '140px', borderRadius: '12px', transform: 'rotate(-5deg)' }}></div>
                                <div className="skeleton-item" style={{ width: '100px', height: '140px', borderRadius: '12px' }}></div>
                                <div className="skeleton-item" style={{ width: '100px', height: '140px', borderRadius: '12px', transform: 'rotate(5deg)' }}></div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '30px' }}>
                                <div className="skeleton-item" style={{ width: '60px', height: '50px', borderRadius: '12px' }}></div>
                                <div className="skeleton-item" style={{ width: '60px', height: '50px', borderRadius: '12px' }}></div>
                                <div className="skeleton-item" style={{ width: '60px', height: '50px', borderRadius: '12px' }}></div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                                <div>
                                    <div className="skeleton-item" style={{ height: '15px', width: '60px', marginBottom: '8px' }}></div>
                                    <div className="skeleton-item" style={{ height: '25px', width: '100px' }}></div>
                                </div>
                                <div className="skeleton-item" style={{ width: '120px', height: '45px', borderRadius: '14px' }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );

    return (
        <div className="offers-page-wrapper" dir={direction}>
            <Navbar />
            <HeroSection />

            <main className="container luxury-grid-container">
                <div className="offers-grid">
                    {offers.map(offer => (
                        <div 
                            key={offer._id} 
                            className="product-card premium-offer-card"
                            onClick={() => navigate(`/product/${offer._id}`, { state: { isOffer: true, offerData: offer } })}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="offer-badge-container">
                                <img src="https://cdn-icons-png.flaticon.com/512/726/726454.png" className="promo-badge-img" alt="Promo" />
                            </div>
                            <h4 className="offer-main-title">{offer.title[appLanguage] || offer.title.fr}</h4>

                            <div className="offer-image-bundle">
                                {offer.productIds.slice(0, 3).map((p, i) => (
                                    <div key={i} className={`bundle-img-wrapper item-${i}`}>
                                        <img src={p.mainImage || p.image} alt={p.nom[appLanguage]} />
                                    </div>
                                ))}
                                {offer.productIds.length > 3 && <div className="bundle-count">+{offer.productIds.length - 3}</div>}
                            </div>

                            <CountdownTimer expirationDate={offer.duration} appLanguage={appLanguage} />

                            <div className="offer-price-footer">
                                <div className="price-stack">
                                    <span className="old-price-total">{offer.productIds.reduce((acc, p) => acc + (p.prix || 0), 0).toFixed(2)} DT</span>
                                    <span className="new-price-highlight">{offer.newPrice.toFixed(2)} DT</span>
                                </div>
                                <button className="offer-cta-btn">
                                    {appLanguage === 'ar' ? 'التفاصيل' : 'Détails'} <FaLongArrowAltRight />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {offers.length === 0 && (
                    <div className="empty-offers-state">
                        <FaClock size={60} />
                        <h3>{appLanguage === 'ar' ? 'لا توجد عروض حالياً' : 'Aucune offre pour le moment'}</h3>
                        <p>{appLanguage === 'ar' ? 'ابقَ على اطلاع، عروضنا القادمة ستصل قريباً!' : 'Restez à l\'écoute, nos prochaines offres arrivent bientôt !'}</p>
                    </div>
                )}
            </main>

            {selectedProduct && (
                <OrderModalComponent
                    selectedProduct={selectedProduct}
                    quantity={quantity}
                    handleQuantityChange={(val) => setQuantity(prev => Math.max(1, prev + val))}
                    closeOrderModal={() => setSelectedProduct(null)}
                    isLoggedIn={localStorage.getItem('login') === 'true'}
                    currentUserEmail={localStorage.getItem('currentUserEmail')}
                    onOrderSuccess={onOrderSuccess}
                    appLanguage={appLanguage}
                    showAlert={showAlert}
                />
            )}

            {showSuccessModal && (
                <div className="modal-overlay">
                    <div className="success-modal-content">
                        <FaCheckCircle className="success-icon" />
                        <h2>{appLanguage === 'ar' ? 'تم الطلب بنجاح!' : 'Commande Réussie !'}</h2>
                        <p>{appLanguage === 'ar' ? 'شكراً لثقتكم بنا. سنتصل بكم لتأكيد الطلب.' : 'Merci pour votre confiance. Nous vous contacterons pour confirmer.'}</p>
                        <p><strong>Ref: {lastCommandRef}</strong></p>
                        <button onClick={() => setShowSuccessModal(false)} className="premium-btn-cta gold">{appLanguage === 'ar' ? 'إغلاق' : 'Fermer'}</button>
                    </div>
                </div>
            )}

            <Footer />
            {isEditingField && (
                <div className="premium-modal-backdrop" onClick={() => setIsEditingField(null)}>
                    <div className="premium-modal-content large" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <button className="premium-modal-close-icon" onClick={() => setIsEditingField(null)}><FaTimes /></button>
                        <h2 className="premium-modal-title">
                            {appLanguage === 'ar' ? 'تعديل المحتوى' : 'Modifier le contenu'}
                        </h2>
                        <div className="premium-form-grid">
                            {languages.filter(l => l.code === appLanguage).map(lang => (
                                <div key={lang.code} className="premium-lang-section" style={{ border: 'none', background: 'none' }}>
                                    {isEditingField === 'heroImage' && (
                                        <div className="premium-form-group">
                                            <label>URL Image de Fond (Hero)</label>
                                            <input
                                                type="text"
                                                value={editOffersContent[lang.code]?.heroImage || ''}
                                                onChange={e => setEditOffersContent({ ...editOffersContent, [lang.code]: { ...editOffersContent[lang.code], heroImage: e.target.value } })}
                                                placeholder="https://..."
                                            />
                                        </div>
                                    )}
                                    {isEditingField === 'hero' && (
                                        <>
                                            <div className="premium-form-group">
                                                <label>Badge (Haut)</label>
                                                <input
                                                    type="text"
                                                    value={editOffersContent[lang.code]?.heroBadge || ''}
                                                    onChange={e => setEditOffersContent({ ...editOffersContent, [lang.code]: { ...editOffersContent[lang.code], heroBadge: e.target.value } })}
                                                />
                                            </div>
                                            <div className="premium-form-group">
                                                <label>Titre Principal</label>
                                                <input
                                                    type="text"
                                                    value={editOffersContent[lang.code]?.heroTitle || ''}
                                                    onChange={e => setEditOffersContent({ ...editOffersContent, [lang.code]: { ...editOffersContent[lang.code], heroTitle: e.target.value } })}
                                                />
                                            </div>
                                            <div className="premium-form-group">
                                                <label>Texte Accent (Or)</label>
                                                <input
                                                    type="text"
                                                    value={editOffersContent[lang.code]?.heroAccent || ''}
                                                    onChange={e => setEditOffersContent({ ...editOffersContent, [lang.code]: { ...editOffersContent[lang.code], heroAccent: e.target.value } })}
                                                />
                                            </div>
                                            <div className="premium-form-group">
                                                <label>Sous-titre</label>
                                                <textarea
                                                    value={editOffersContent[lang.code]?.heroSub || ''}
                                                    onChange={e => setEditOffersContent({ ...editOffersContent, [lang.code]: { ...editOffersContent[lang.code], heroSub: e.target.value } })}
                                                    style={{ minHeight: '80px' }}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="premium-btn-group" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                            <button className="premium-btn-cta secondary" onClick={() => setIsEditingField(null)}>
                                {appLanguage === 'ar' ? 'إلغاء' : 'Annuler'}
                            </button>
                            <button className="premium-btn-cta gold" onClick={handleSaveOffersContent}>
                                <FaSave /> {appLanguage === 'ar' ? 'حفظ التغييرات' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}


            <style>{`
                .offers-page-wrapper {
                    background: #fcfcfd;
                    min-height: 100vh;
                }

                /* SKELETON ANIMATIONS */
                .skeleton-item {
                    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
                    background-size: 200% 100%;
                    animation: skeleton-loading 1.5s infinite linear;
                }
                @keyframes skeleton-loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }

                /* --- ✨ ARCHITECTURAL HERO (Matched with About) ✨ --- */
                .about-hero-premium {
                    height: 60vh;
                    min-height: 500px;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    background-attachment: fixed;
                    clip-path: polygon(0 0, 100% 0, 100% 90%, 0 100%);
                    color: #fff;
                    overflow: visible;
                    padding-top: 150px;
                }

                .about-hero-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.4));
                    backdrop-filter: none;
                    z-index: 1;
                    pointer-events: none;
                }

                .about-badge-lux {
                    display: inline-block;
                    padding: 8px 16px;
                    background: rgba(197, 160, 40, 0.2);
                    border: 1px solid rgba(197, 160, 40, 0.4);
                    border-radius: 100px;
                    color: #e6d98d;
                    font-size: 0.85rem;
                    font-weight: 800;
                    letter-spacing: 2px;
                    margin-bottom: 25px;
                    text-transform: uppercase;
                    backdrop-filter: none;
                    animation: fadeInDown 0.8s ease;
                }

                .about-main-title {
                    font-family: "Lora", serif;
                    font-size: 4rem;
                    line-height: 1.1;
                    margin-bottom: 20px;
                    animation: fadeInUp 1s ease;
                }

                .about-main-title .about-accent {
                    font-family: "Lora", serif;
                    font-style: italic;
                    font-weight: 400;
                    padding: 0 10px;
                    background: linear-gradient(135deg, #c5a028 0%, #e6d98d 50%, #c5a028 100%);
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .about-sub-text {
                    font-size: 1.2rem;
                    color: rgba(255, 255, 255, 0.8);
                    max-width: 700px;
                    margin: 0 auto;
                    line-height: 1.6;
                    animation: fadeInUp 1.2s ease;
                }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-40px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                /* --- END HERO STYLES --- */
                .luxury-grid-container {
                    padding-bottom: 100px;
                }
                .offers-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 30px;
                }
                .premium-offer-card {
                    padding: 50px 25px 25px 25px !important;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    border: 1.5px solid rgba(212, 175, 55, 0.25);
                    background: linear-gradient(135deg, #ffffff 0%, #fffbf2 100%) !important;
                    position: relative;
                    min-height: 520px;
                    border-radius: 24px;
                }
                .offer-badge-container {
                    position: absolute;
                    top: -10px;
                    left: -10px;
                    width: 60px;
                    height: 60px;
                    z-index: 5;
                }
                .promo-badge-img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
                }
                .offer-image-bundle {
                    height: 200px;
                    width: 100%;
                    position: relative;
                    margin: 20px 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .bundle-img-wrapper {
                    position: absolute;
                    width: 140px;
                    height: 140px;
                    border-radius: 18px;
                    overflow: hidden;
                    border: 4px solid #fff;
                    box-shadow: 0 15px 35px rgba(0,0,0,0.12);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    background: #fff;
                }
                .bundle-img-wrapper img { 
                    width: 100%; 
                    height: 100%; 
                    object-fit: cover;
                    filter: brightness(1.02) contrast(1.05);
                }
                .item-0 { z-index: 3; transform: translateX(-85px) rotate(-12deg) translateY(5px); }
                .item-1 { z-index: 4; transform: scale(1.15) rotate(0deg); }
                .item-2 { z-index: 2; transform: translateX(85px) rotate(12deg) translateY(5px); }
                
                .bundle-count {
                    position: absolute;
                    bottom: 0px;
                    right: 0px;
                    background: #D4AF37;
                    color: #fff;
                    padding: 5px 12px;
                    border-radius: 20px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    letter-spacing: 1px;
                    z-index: 10;
                }
                .offer-main-title {
                    font-size: 1.1rem;
                    color: #0f172a;
                    font-weight: 900;
                    margin-bottom: 5px;
                    text-align: center;
                    line-height: 1.3;
                    letter-spacing: -0.5px;
                }
                .timer-unit-glam {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    background: #fff;
                    padding: 5px 8px;
                    border-radius: 8px;
                    min-width: 45px;
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
                }
                .unit-val { font-size: 1rem; font-weight: 800; color: #ef4444; }
                .unit-lab { font-size: 0.5rem; color: #94a3b8; text-transform: uppercase; }
                
                .offer-price-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #fff;
                    padding: 10px;
                    border-radius: 12px;
                    border: 1px dashed #D4AF37;
                    margin-top: 20px;
                }
                .old-price-total {
                    font-size: 0.75rem;
                    color: #94a3b8;
                    text-decoration: line-through;
                    display: block;
                }
                .new-price-highlight {
                    font-size: 1.3rem;
                    color: #ef4444;
                    font-weight: 900;
                }
                .offer-cta-btn {
                    background: #D4AF37;
                    color: #fff;
                    border: none;
                    padding: 8px 15px;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    cursor: pointer;
                    background: #D4AF37;
                    transform: scale(1.05);
                }
                .empty-offers-state {
                    text-align: center;
                    padding: 100px 20px;
                    color: #64748b;
                }
                .empty-offers-state h3 {
                    font-size: 1.5rem;
                    margin: 20px 0 10px;
                    color: #1e293b;
                }
                .success-modal-content {
                    background: white;
                    padding: 40px;
                    border-radius: 30px;
                    text-align: center;
                    max-width: 400px;
                    width: 90%;
                }
                .success-icon {
                    font-size: 4rem;
                    color: #10b981;
                    margin-bottom: 20px;
                }

                @media (max-width: 768px) {
                    .about-main-title {
                        font-size: 2.2rem !important;
                    }
                    .about-hero-premium {
                        height: 60vh !important;
                        min-height: 450px !important;
                        padding-top: 100px;
                    }
                }

                @media (max-width: 425px) {
                    .about-main-title {
                        font-size: 2.2rem !important;
                    }
                    .about-hero-premium {
                        height: 55vh !important;
                        min-height: 400px !important;
                        padding-top: 80px;
                    }
                    .about-sub-text {
                        font-size: 0.95rem;
                        padding: 0 15px;
                    }
                           .offers-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 30px;
                }
                }
            `}</style>
        </div>
    );
}
