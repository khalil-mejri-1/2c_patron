import React, { useState, useEffect, useCallback } from 'react';
import { FaTrashAlt, FaPlus, FaMinus, FaTimes, FaEdit, FaClipboardList, FaWhatsapp, FaShoppingCart } from 'react-icons/fa'; // Ajout de FaTimes pour les modales
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import { Link } from 'react-router-dom';
import { useAlert } from '../context/AlertContext';
import { useLanguage } from '../context/LanguageContext';
import BASE_URL from '../apiConfig';
import { trackInitiateCheckout, trackPurchase, sanitizePrice, sanitizeQuantity } from '../services/metaPixel';
import './cart_premium.css';

// --------------------------------------------------------
// Default translations content
// --------------------------------------------------------
const defaultContent = {
    taxRate: 0.20,
    shippingCost: 5.00,
    fr: {
        title: "Mon",
        accent: "Panier",
        subtitle: "Vous avez {count} article(s) dans votre panier",
        summaryTitle: "Résumé de la commande",
        subtotalLabel: "Sous-total (Hors taxes) :",
        shippingLabel: "Frais de livraison :",
        taxLabel: "Taxes (TVA {rate}%) :",
        totalLabel: "Total à payer (TTC) :",
        checkoutBtn: "Procéder au Paiement",
        continueBtn: "Continuer mes achats",
        emptyTitle: "Votre Panier est vide ",
        emptyDesc: "Ajoutez des patrons ou des accès VIP pour commencer !",
        emptyBtn: "Continuer mes achats",
        clientInfoTitle: "COORDONNÉES DU CLIENT",
        clientNameLabel: "NOM COMPLET",
        clientPhoneLabel: "NUMÉRO DE TÉLÉPHONE",
        clientAddressLabel: "ADRESSE",
        freeDeliveryText: "Livraison gratuite sur tout le territoire de la République",
        confirmOrderBtn: "Confirmer la commande",
        whatsappOrderBtn: "Commander via WhatsApp"
    },
    ar: {
        title: "سلة",
        accent: "مشترياتي",
        subtitle: "لديك {count} منتج(ات) في سلتك",
        summaryTitle: "ملخص الطلب",
        subtotalLabel: "المجموع الفرعي (قبل الضريبة) :",
        shippingLabel: "مصاريف الشحن :",
        taxLabel: "الضرائب (القيمة المضافة {rate}%) :",
        totalLabel: "الإجمالي للدفع (شامل الضريبة) :",
        checkoutBtn: "الذهاب إلى الدفع",
        continueBtn: "مواصلة التسوق",
        emptyTitle: "سلة التسوق فارغة ",
        emptyDesc: "أضف بعض الباترونات أو الدروس للبدء!",
        emptyBtn: "مواصلة التسوق",
        clientInfoTitle: "بيانات العميل",
        clientNameLabel: "الاسم الكامل",
        clientPhoneLabel: "رقم الهاتف",
        clientAddressLabel: "العنوان",
        freeDeliveryText: "شحن مجاني لكامل تراب الجمهورية",
        confirmOrderBtn: "تأكيد الطلب",
        whatsappOrderBtn: "الطلب عبر الواتساب"
    },
    en: {
        title: "My",
        accent: "Cart",
        subtitle: "You have {count} item(s) in your cart",
        summaryTitle: "Order Summary",
        subtotalLabel: "Subtotal (Excl. tax):",
        shippingLabel: "Shipping Cost:",
        taxLabel: "Taxes (VAT {rate}%) :",
        totalLabel: "Total to pay (Incl. tax):",
        checkoutBtn: "Proceed to Payment",
        continueBtn: "Continue Shopping",
        emptyTitle: "Your Cart is empty ",
        emptyDesc: "Add patterns or VIP access to start!",
        emptyBtn: "Continue Shopping",
        clientInfoTitle: "CUSTOMER DETAILS",
        clientNameLabel: "FULL NAME",
        clientPhoneLabel: "PHONE NUMBER",
        clientAddressLabel: "ADDRESS",
        freeDeliveryText: "Free delivery all over the country",
        confirmOrderBtn: "Confirm Order",
        whatsappOrderBtn: "Order via WhatsApp"
    }
};

// --------------------------------------------------------
// Fonction utilitaire pour lire le panier depuis localStorage
// --------------------------------------------------------
const getCartFromLocalStorage = () => {
    try {
        const storedCart = localStorage.getItem('cartItems');
        const parsedCart = storedCart ? JSON.parse(storedCart) : [];
        return parsedCart.map(item => ({
            ...item,
            // Assurez-vous que l'article a une URL et une quantité valide
            url: item.url || item.image,
            quantity: item.quantity > 0 ? item.quantity : 1
        }));
    } catch (error) {
        console.error("Erreur de lecture du panier localStorage:", error);
        return [];
    }
};

// --------------------------------------------------------

function CheckoutModal({
    isOpen,
    onClose,
    total,
    cartItems,
    appLanguage,
    t,
    isAdmin,
    onEditClick,
    whatsappNumber,
    onSubmitOrder
}) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('+216');
    const [address, setAddress] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sync input with logged-in user details if available
    useEffect(() => {
        if (isOpen) {
            const email = localStorage.getItem('currentUserEmail') || localStorage.getItem('loggedInUserEmail') || '';
            const fetchUserProfile = async () => {
                if (email) {
                    try {
                        const res = await fetch(`${BASE_URL}/api/users/${email}`);
                        if (res.ok) {
                            const data = await res.json();
                            if (data) {
                                if (data.name) setName(data.name);
                                if (data.phone) setPhone(data.phone);
                                if (data.address) setAddress(data.address);
                            }
                        }
                    } catch (err) {
                        console.error("Failed to pre-fill user profile info:", err);
                    }
                }
            };
            fetchUserProfile();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = async (e) => {
        e.preventDefault();
        if (!name.trim() || !phone.trim() || !address.trim()) {
            return;
        }
        setIsSubmitting(true);
        await onSubmitOrder({ name, phone, address });
        setIsSubmitting(false);
    };

    const totalQty = cartItems.reduce((acc, item) => acc + sanitizeQuantity(item.quantity), 0);
    const itemsTotal = cartItems.reduce((sum, item) => sum + (sanitizePrice(item.price) * sanitizeQuantity(item.quantity)), 0);

    const generateWhatsappLink = () => {
        let text = appLanguage === 'ar' ? 'مرحبا، أود طلب المشتريات التالية:\n' : 'Bonjour, je souhaite commander les articles suivants :\n';
        cartItems.forEach(item => {
            const cleanPrice = sanitizePrice(item.price);
            const cleanQty = sanitizeQuantity(item.quantity);
            const itemName = typeof item.name === 'object' ? (item.name[appLanguage] || item.name.fr || item.name.ar || '') : (item.name || '');
            text += `- ${cleanQty}x ${itemName} (${cleanPrice.toFixed(2)} DT)\n`;
        });
        text += `\nTotal: ${itemsTotal.toFixed(2)} DT\n\n`;
        text += appLanguage === 'ar' ? 'بياناتي:\n' : 'Mes coordonnées :\n';
        text += `${appLanguage === 'ar' ? 'الاسم' : 'Nom'}: ${name || '...'}\n`;
        text += `${appLanguage === 'ar' ? 'الهاتف' : 'Téléphone'}: ${phone || '...'}\n`;
        text += `${appLanguage === 'ar' ? 'العنوان' : 'Adresse'}: ${address || '...'}`;

        return `https://wa.me/${whatsappNumber.replace(/\s+/g, '')}?text=${encodeURIComponent(text)}`;
    };

    return (
        <div className="premium-modal-backdrop" onClick={onClose}>
            <div className="premium-checkout-modal" onClick={e => e.stopPropagation()}>
                <button className="premium-modal-close-icon" onClick={onClose}><FaTimes /></button>

                <h3 className="checkout-modal-title">
                    <span className="clipboard-icon-wrapper"><FaClipboardList /></span>
                    {t.clientInfoTitle}
                    {isAdmin && (
                        <button
                            className="edit-section-btn minimal"
                            onClick={() => onEditClick('checkout')}
                            title="Modifier"
                            style={{ marginLeft: '10px' }}
                        >
                            <FaEdit />
                        </button>
                    )}
                </h3>

                <form onSubmit={handleConfirm} className="checkout-modal-form">
                    <div className="checkout-form-row">
                        <div className="checkout-form-group">
                            <label>{t.clientNameLabel}</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="..."
                                required
                            />
                        </div>
                        <div className="checkout-form-group">
                            <label>{t.clientPhoneLabel}</label>
                            <input
                                type="text"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="+216..."
                                required
                            />
                        </div>
                    </div>

                    <div className="checkout-form-group full-width">
                        <label>{t.clientAddressLabel}</label>
                        <input
                            type="text"
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            placeholder="..."
                            required
                        />
                    </div>

                    {/* mini listing of cart items */}
                    <div className="checkout-items-list">
                        {cartItems.map(item => {
                            const cleanItemPrice = sanitizePrice(item.price);
                            const cleanItemQty = sanitizeQuantity(item.quantity);
                            const itemName = typeof item.name === 'object' ? (item.name[appLanguage] || item.name.fr || item.name.ar || '') : (item.name || '');
                            return (
                                <div key={item.id} className="checkout-item-mini">
                                    <img
                                        src={item.url || item.image}
                                        alt={itemName}
                                        className="checkout-item-mini-img"
                                    />
                                    <div className="checkout-item-mini-details">
                                        <span className="checkout-item-mini-name">{itemName}</span>
                                        <span className="checkout-item-mini-meta">{cleanItemQty}x {cleanItemPrice.toFixed(2)} DT</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="checkout-summary-row">
                        <div className="checkout-qty-selector">
                            <span className="qty-control">-</span>
                            <span className="qty-val">{totalQty}</span>
                            <span className="qty-control">+</span>
                        </div>
                        <div className="checkout-total-display">
                            <span className="total-display-label">{appLanguage === 'ar' ? 'الإجمالي للدفع' : 'TOTAL À PAYER'}</span>
                            <span className="total-display-value">{itemsTotal.toFixed(2)} DT</span>
                        </div>
                    </div>

                    <p className="checkout-free-delivery">
                        {t.freeDeliveryText}
                        {isAdmin && (
                            <button
                                className="edit-section-btn minimal"
                                onClick={() => onEditClick('checkout')}
                                title="Modifier"
                                style={{ marginLeft: '5px', padding: '2px 6px', fontSize: '0.75rem' }}
                            >
                                <FaEdit />
                            </button>
                        )}
                    </p>

                    <div className="checkout-actions-container" style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                        <button type="submit" className="checkout-confirm-btn" style={{ flex: 1 }} disabled={isSubmitting}>
                            <FaShoppingCart /> {t.confirmOrderBtn}
                        </button>
                    </div>

                    <div className="checkout-whatsapp-link-wrapper" style={{ marginTop: '10px' }}>
                        <a
                            href={generateWhatsappLink()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="checkout-whatsapp-link"
                        >
                            <FaWhatsapp /> {t.whatsappOrderBtn}
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --------------------------------------------------------

function CartContentEditModal({
    activeEditSection,
    appLanguage,
    editContent,
    handleFieldChange,
    handleSaveContent,
    setActiveEditSection,
    setEditContent,
    pageContent,
    handleTopLevelFieldChange
}) {
    return (
        <div className="premium-modal-backdrop" onClick={() => setActiveEditSection(null)}>
            <div className="premium-modal-content large" onClick={(e) => e.stopPropagation()}>
                <button className="premium-modal-close-icon" onClick={() => setActiveEditSection(null)}><FaTimes /></button>
                <h2 className="premium-modal-title">
                    {appLanguage === 'ar' ? 'تعديل المحتوى' : 'Modifier le contenu'} ({appLanguage.toUpperCase()})
                </h2>

                <div className="premium-form-grid" style={{ gridTemplateColumns: '1fr', gap: '15px' }}>
                    {activeEditSection === 'header' && (
                        <>
                            <div className="premium-form-group">
                                <label>Titre principal</label>
                                <input
                                    type="text"
                                    value={editContent[appLanguage]?.title || ''}
                                    onChange={e => handleFieldChange('title', e.target.value)}
                                />
                            </div>
                            <div className="premium-form-group">
                                <label>Accent (Or)</label>
                                <input
                                    type="text"
                                    value={editContent[appLanguage]?.accent || ''}
                                    onChange={e => handleFieldChange('accent', e.target.value)}
                                />
                            </div>
                            <div className="premium-form-group">
                                <label>Sous-titre (utiliser {`{count}`} pour le nombre d'articles)</label>
                                <input
                                    type="text"
                                    value={editContent[appLanguage]?.subtitle || ''}
                                    onChange={e => handleFieldChange('subtitle', e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    {activeEditSection === 'summary' && (
                        <>
                            <div className="premium-form-group">
                                <label>Titre du résumé</label>
                                <input
                                    type="text"
                                    value={editContent[appLanguage]?.summaryTitle || ''}
                                    onChange={e => handleFieldChange('summaryTitle', e.target.value)}
                                />
                            </div>
                            <div className="premium-form-group">
                                <label>Libellé sous-total</label>
                                <input
                                    type="text"
                                    value={editContent[appLanguage]?.subtotalLabel || ''}
                                    onChange={e => handleFieldChange('subtotalLabel', e.target.value)}
                                />
                            </div>
                            <div className="premium-form-group">
                                <label>Libellé frais de livraison</label>
                                <input
                                    type="text"
                                    value={editContent[appLanguage]?.shippingLabel || ''}
                                    onChange={e => handleFieldChange('shippingLabel', e.target.value)}
                                />
                            </div>
                            <div className="premium-form-group">
                                <label>Libellé taxes</label>
                                <input
                                    type="text"
                                    value={editContent[appLanguage]?.taxLabel || ''}
                                    onChange={e => handleFieldChange('taxLabel', e.target.value)}
                                />
                            </div>
                            <div className="premium-form-group">
                                <label>Libellé total</label>
                                <input
                                    type="text"
                                    value={editContent[appLanguage]?.totalLabel || ''}
                                    onChange={e => handleFieldChange('totalLabel', e.target.value)}
                                />
                            </div>
                            <div className="premium-form-group">
                                <label>Texte bouton paiement</label>
                                <input
                                    type="text"
                                    value={editContent[appLanguage]?.checkoutBtn || ''}
                                    onChange={e => handleFieldChange('checkoutBtn', e.target.value)}
                                />
                            </div>
                            <div className="premium-form-group">
                                <label>Texte bouton continuer</label>
                                <input
                                    type="text"
                                    value={editContent[appLanguage]?.continueBtn || ''}
                                    onChange={e => handleFieldChange('continueBtn', e.target.value)}
                                />
                            </div>
                            <div className="premium-form-group">
                                <label>Taux de TVA (en %, ex: 20 pour 20%)</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={editContent.taxRate !== undefined && !isNaN(editContent.taxRate) ? editContent.taxRate * 100 : ''}
                                    onChange={e => {
                                        const val = e.target.value === '' ? 0 : parseFloat(e.target.value) / 100;
                                        handleTopLevelFieldChange('taxRate', val);
                                    }}
                                />
                            </div>
                            <div className="premium-form-group">
                                <label>Frais de livraison (DT)</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={editContent.shippingCost !== undefined && !isNaN(editContent.shippingCost) ? editContent.shippingCost : ''}
                                    onChange={e => {
                                        const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                        handleTopLevelFieldChange('shippingCost', val);
                                    }}
                                />
                            </div>
                        </>
                    )}

                    {activeEditSection === 'empty' && (
                        <>
                            <div className="premium-form-group">
                                <label>Titre panier vide</label>
                                <input
                                    type="text"
                                    value={editContent[appLanguage]?.emptyTitle || ''}
                                    onChange={e => handleFieldChange('emptyTitle', e.target.value)}
                                />
                            </div>
                            <div className="premium-form-group">
                                <label>Description panier vide</label>
                                <input
                                    type="text"
                                    value={editContent[appLanguage]?.emptyDesc || ''}
                                    onChange={e => handleFieldChange('emptyDesc', e.target.value)}
                                />
                            </div>
                            <div className="premium-form-group">
                                <label>Texte bouton continuer</label>
                                <input
                                    type="text"
                                    value={editContent[appLanguage]?.emptyBtn || ''}
                                    onChange={e => handleFieldChange('emptyBtn', e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    {activeEditSection === 'checkout' && (
                        <>
                            <div className="premium-form-group">
                                <label>Titre section client</label>
                                <input
                                    type="text"
                                    value={editContent[appLanguage]?.clientInfoTitle || ''}
                                    onChange={e => handleFieldChange('clientInfoTitle', e.target.value)}
                                />
                            </div>
                            <div className="premium-form-group">
                                <label>Label Nom complet</label>
                                <input
                                    type="text"
                                    value={editContent[appLanguage]?.clientNameLabel || ''}
                                    onChange={e => handleFieldChange('clientNameLabel', e.target.value)}
                                />
                            </div>
                            <div className="premium-form-group">
                                <label>Label Numéro de téléphone</label>
                                <input
                                    type="text"
                                    value={editContent[appLanguage]?.clientPhoneLabel || ''}
                                    onChange={e => handleFieldChange('clientPhoneLabel', e.target.value)}
                                />
                            </div>
                            <div className="premium-form-group">
                                <label>Label Adresse</label>
                                <input
                                    type="text"
                                    value={editContent[appLanguage]?.clientAddressLabel || ''}
                                    onChange={e => handleFieldChange('clientAddressLabel', e.target.value)}
                                />
                            </div>
                            <div className="premium-form-group">
                                <label>Texte Livraison gratuite</label>
                                <input
                                    type="text"
                                    value={editContent[appLanguage]?.freeDeliveryText || ''}
                                    onChange={e => handleFieldChange('freeDeliveryText', e.target.value)}
                                />
                            </div>
                            <div className="premium-form-group">
                                <label>Texte bouton Confirmer la commande</label>
                                <input
                                    type="text"
                                    value={editContent[appLanguage]?.confirmOrderBtn || ''}
                                    onChange={e => handleFieldChange('confirmOrderBtn', e.target.value)}
                                />
                            </div>
                            <div className="premium-form-group">
                                <label>Texte bouton Commander via WhatsApp</label>
                                <input
                                    type="text"
                                    value={editContent[appLanguage]?.whatsappOrderBtn || ''}
                                    onChange={e => handleFieldChange('whatsappOrderBtn', e.target.value)}
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="premium-btn-group" style={{ marginTop: '25px' }}>
                    <button className="premium-btn-cta secondary" onClick={() => { setEditContent(pageContent); setActiveEditSection(null); }}>
                        Annuler
                    </button>
                    <button className="premium-btn-cta gold" onClick={handleSaveContent}>
                        Enregistrer
                    </button>
                </div>
            </div>
        </div>
    );
}

// --------------------------------------------------------

export default function CartPage() {
    const { showAlert } = useAlert();
    const { appLanguage, languages } = useLanguage();
    const [cartItems, setCartItems] = useState(getCartFromLocalStorage);

    // Dynamic translations settings state
    const [pageContent, setPageContent] = useState(defaultContent);
    const [editContent, setEditContent] = useState(defaultContent);

    const shippingCost = pageContent.shippingCost !== undefined ? Number(pageContent.shippingCost) : 5.00;
    const taxRate = pageContent.taxRate !== undefined ? Number(pageContent.taxRate) : 0.20;
    const [activeEditSection, setActiveEditSection] = useState(null); // 'header', 'summary', 'empty', 'checkout'
    const [isAdmin, setIsAdmin] = useState(false);

    // 🌟 Nouveaux états pour la gestion du paiement et de la connexion
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [whatsappNumber, setWhatsappNumber] = useState('22340578');

    const t = pageContent[appLanguage] || pageContent.fr || defaultContent.fr;

    // Direct synchronous calculations of subtotal & total
    const subtotal = cartItems.reduce(
        (sum, item) => sum + (sanitizePrice(item.price) * sanitizeQuantity(item.quantity)),
        0
    );
    const taxAmount = subtotal * taxRate;
    const total = subtotal; // Store prices are inclusive (TTC)

    // Load content and verify admin status
    useEffect(() => {
        const authStatus = localStorage.getItem('login') === 'true';
        setIsLoggedIn(authStatus);

        const fetchPageContent = async () => {
            try {
                const res = await fetch(`${BASE_URL}/api/settings/cart-content`);
                if (res.ok) {
                    const data = await res.json();
                    const merged = { ...defaultContent };
                    if (data) {
                        if (data.taxRate !== undefined) merged.taxRate = Number(data.taxRate);
                        if (data.shippingCost !== undefined) merged.shippingCost = Number(data.shippingCost);
                        ['fr', 'ar', 'en'].forEach(lang => {
                            if (data[lang]) {
                                merged[lang] = {
                                    ...defaultContent[lang],
                                    ...data[lang]
                                };
                            }
                        });
                    }
                    setPageContent(merged);
                    setEditContent(merged);
                }
            } catch (err) {
                console.error("Error loading page content:", err);
            }
        };

        const fetchGeneralSettings = async () => {
            try {
                const res = await fetch(`${BASE_URL}/api/settings/general`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.whatsapp) {
                        setWhatsappNumber(data.whatsapp);
                    }
                }
            } catch (err) {
                console.error("Error loading general settings:", err);
            }
        };

        const checkAdminStatus = async () => {
            const email = localStorage.getItem('currentUserEmail') || localStorage.getItem('loggedInUserEmail');
            if (email) {
                try {
                    const res = await fetch(`${BASE_URL}/api/users/${email}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.statut === 'admin') {
                            setIsAdmin(true);
                        }
                    }
                } catch (e) {
                    console.error("Admin check error:", e);
                }
            }
        };

        fetchPageContent();
        fetchGeneralSettings();
        checkAdminStatus();
    }, []);

    // --------------------------------------------------------
    // Logique de paiement
    // --------------------------------------------------------
    const handleCheckout = () => {
        // 📊 Meta Pixel: Track InitiateCheckout with exact real items and price
        const itemIds = cartItems.map(item => String(item.productId || item.id));
        const itemNames = cartItems.map(item => typeof item.name === 'object' ? (item.name[appLanguage] || item.name.fr || item.name.ar || '') : (item.name || '')).join(', ');
        const contentsArray = cartItems.map(item => ({
            id: String(item.productId || item.id),
            quantity: sanitizeQuantity(item.quantity),
            item_price: sanitizePrice(item.price)
        }));
        const totalQty = cartItems.reduce((acc, item) => acc + sanitizeQuantity(item.quantity), 0);

        trackInitiateCheckout({
            name: itemNames,
            category: 'Cart',
            ids: itemIds,
            numItems: totalQty,
            value: subtotal,
            currency: 'TND',
            contents: contentsArray
        });

        setShowCheckoutModal(true);
    };

    const handleSubmitOrder = async (details) => {
        try {
            const cleanItems = cartItems.map(item => ({
                productId: item.productId || item.id,
                productName: typeof item.name === 'object' ? (item.name.fr || item.name.ar || item.name) : item.name,
                productImage: item.url || item.image,
                quantity: sanitizeQuantity(item.quantity),
                price: sanitizePrice(item.price)
            }));

            const orderData = {
                totalAmount: subtotal,
                items: cleanItems,
                clientName: details.name,
                clientPhone: details.phone,
                clientEmail: localStorage.getItem('loggedInUserEmail') || localStorage.getItem('currentUserEmail') || '',
                shippingAddress: details.address,
                note: ''
            };

            const res = await fetch(`${BASE_URL}/api/commands`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                const data = await res.json();
                const commandId = data.commandId || data._id || data.id || '---';

                // 📊 Meta Pixel: Track Purchase (Achat) with real prices and contents
                const itemIds = cartItems.map(item => String(item.productId || item.id));
                const itemNames = cartItems.map(item => typeof item.name === 'object' ? (item.name[appLanguage] || item.name.fr || item.name.ar || '') : (item.name || '')).join(', ');
                const contentsArray = cartItems.map(item => ({
                    id: String(item.productId || item.id),
                    quantity: sanitizeQuantity(item.quantity),
                    item_price: sanitizePrice(item.price)
                }));
                const totalQty = cartItems.reduce((acc, item) => acc + sanitizeQuantity(item.quantity), 0);

                trackPurchase({
                    value: subtotal,
                    ids: itemIds,
                    name: itemNames,
                    numItems: totalQty,
                    currency: 'TND',
                    contents: contentsArray,
                    userData: {
                        em: orderData.clientEmail,
                        ph: orderData.clientPhone,
                        fn: orderData.clientName
                    }
                });

                // Sync purchases page local storage
                try {
                    const currentPanier = JSON.parse(localStorage.getItem('panier_items') || '[]');
                    const orderDate = new Date().toISOString();
                    const newPurchasedItems = cartItems.map(item => ({
                        id: item.productId || item.id,
                        commandId: commandId,
                        name: typeof item.name === 'object' ? item.name : { fr: item.name, ar: item.name },
                        image: item.url || item.image,
                        price: sanitizePrice(item.price),
                        quantity: sanitizeQuantity(item.quantity),
                        orderDate: orderDate,
                        totalAmount: sanitizePrice(item.price) * sanitizeQuantity(item.quantity),
                        status: 'pending'
                    }));
                    localStorage.setItem('panier_items', JSON.stringify([...newPurchasedItems, ...currentPanier]));
                    window.dispatchEvent(new Event('panierUpdated'));
                } catch (e) {
                    console.error("Could not sync purchases list:", e);
                }

                saveCartToLocalStorage([]);
                setShowCheckoutModal(false);
                showAlert('success', appLanguage === 'ar' ? 'تم تأكيد الطلب' : 'Commande confirmée', appLanguage === 'ar' ? 'شكراً لثقتكم بنا، تم تسجيل طلبكم بنجاح.' : 'Votre commande a été enregistrée avec succès.');
            } else {
                showAlert('error', 'Erreur', 'Failed to submit order');
            }
        } catch (err) {
            console.error("Order submission failed:", err);
            showAlert('error', 'Erreur', 'Server connection error');
        }
    };

    // Fonctions de synchronisation et de gestion du panier (inchangées)
    const saveCartToLocalStorage = useCallback((newItems) => {
        setCartItems(newItems);
        localStorage.setItem('cartItems', JSON.stringify(newItems));
        window.dispatchEvent(new Event('cartUpdated'));
    }, []);

    const handleQuantityChange = (id, delta) => {
        const newItems = cartItems.map(item =>
            item.id === id
                ? { ...item, quantity: Math.max(1, sanitizeQuantity(item.quantity) + delta) }
                : item
        );
        saveCartToLocalStorage(newItems);
    };

    const handleRemoveItem = (id) => {
        const newItems = cartItems.filter(item => item.id !== id);
        saveCartToLocalStorage(newItems);
    };

    // Empêcher le défilement du corps lorsque les modales sont ouvertes
    useEffect(() => {
        if (showCheckoutModal) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
        return () => document.body.classList.remove('no-scroll');
    }, [showCheckoutModal]);

    // Helper to update translation field
    const handleFieldChange = (key, value) => {
        setEditContent(prev => ({
            ...prev,
            [appLanguage]: {
                ...prev[appLanguage],
                [key]: value
            }
        }));
    };

    const handleTopLevelFieldChange = (key, value) => {
        setEditContent(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Save content to Backend settings API
    const handleSaveContent = async () => {
        setPageContent(editContent);
        setActiveEditSection(null);
        try {
            await fetch(`${BASE_URL}/api/settings/cart-content`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: editContent })
            });
            showAlert('success', 'Enregistré', appLanguage === 'ar' ? 'تم حفظ التعديلات بنجاح' : 'Contenu mis à jour avec succès');
        } catch (err) {
            console.error("Failed to save content:", err);
            showAlert('error', 'Erreur', 'Failed to save');
        }
    };

    // CartContentEditModal rendering is now handled by the external component declared above

    // --------------------------------------------------------
    // Rendu du Panier Vide
    // --------------------------------------------------------

    if (cartItems.length === 0) {
        return (
            <>
                <Navbar />
                <div className="cart-page-premium-wrapper">
                    <div className="empty-cart-container" style={{ position: 'relative' }}>
                        {isAdmin && (
                            <button
                                className="edit-section-btn"
                                onClick={() => setActiveEditSection('empty')}
                                title="Modifier"
                                style={{ position: 'absolute', top: '20px', right: '20px' }}
                            >
                                <FaEdit />
                            </button>
                        )}
                        <div className="empty-cart-icon">
                            <FaTrashAlt />
                        </div>
                        <h2 className="empty-cart-title">{t.emptyTitle}</h2>
                        <p className="empty-cart-desc">{t.emptyDesc}</p>
                        <Link to="/magasin" className="checkout-btn-premium" style={{ textDecoration: 'none' }}>
                            {t.emptyBtn}
                        </Link>
                    </div>
                </div>
                <Footer />
                {activeEditSection && (
                    <CartContentEditModal
                        activeEditSection={activeEditSection}
                        appLanguage={appLanguage}
                        editContent={editContent}
                        handleFieldChange={handleFieldChange}
                        handleSaveContent={handleSaveContent}
                        setActiveEditSection={setActiveEditSection}
                        setEditContent={setEditContent}
                        pageContent={pageContent}
                        handleTopLevelFieldChange={handleTopLevelFieldChange}
                    />
                )}
            </>
        );
    }

    // --------------------------------------------------------
    // Rendu principal (avec les Modales)
    // --------------------------------------------------------

    return (
        <>
            <Navbar />
            <div className="cart-page-premium-wrapper">
                <div className="cart-premium-container">
                    <div className="cart-header-section">
                        <h1 className="cart-title-premium">
                            {t.title} <span>{t.accent}</span>
                            {isAdmin && (
                                <button
                                    className="edit-section-btn"
                                    onClick={() => setActiveEditSection('header')}
                                    title="Modifier"
                                    style={{ marginLeft: '15px' }}
                                >
                                    <FaEdit />
                                </button>
                            )}
                        </h1>
                        <p className="cart-subtitle-premium">
                            {t.subtitle.replace('{count}', cartItems.length)}
                        </p>
                    </div>

                    <div className="cart-premium-layout">
                        {/* 1. Liste des articles */}
                        <div className="cart-items-card-premium">
                            {cartItems.map(item => (
                                <div key={item.id} className="cart-item-premium-row">
                                    <div className="cart-item-img-container">
                                        <img
                                            src={item.url}
                                            alt={item.name}
                                        />
                                    </div>

                                    <div className="cart-item-info-premium">
                                        <h3 className="cart-item-name-premium">{item.name}</h3>
                                        <p className="cart-item-price-premium">{sanitizePrice(item.price).toFixed(2)} DT</p>
                                    </div>

                                    <div className="cart-item-controls-premium">
                                        <div className="cart-qty-pill-premium">
                                            <button
                                                onClick={() => handleQuantityChange(item.id, -1)}
                                                disabled={item.quantity <= 1}
                                                className="qty-btn-premium"
                                                aria-label="Diminuer la quantité"
                                            >
                                                <FaMinus />
                                            </button>
                                            <span className="qty-number-premium">{item.quantity}</span>
                                            <button
                                                onClick={() => handleQuantityChange(item.id, 1)}
                                                className="qty-btn-premium"
                                                aria-label="Augmenter la quantité"
                                            >
                                                <FaPlus />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="remove-btn-premium"
                                            aria-label={`Supprimer ${item.name} du panier`}
                                        >
                                            <FaTrashAlt />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 2. Résumé de la commande */}
                        <div className="cart-summary-card-premium">
                            <h3 className="summary-title-premium">
                                {t.summaryTitle}
                                {isAdmin && (
                                    <button
                                        className="edit-section-btn"
                                        onClick={() => setActiveEditSection('summary')}
                                        title="Modifier"
                                        style={{ position: 'absolute', top: '25px', right: '25px', background: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}
                                    >
                                        <FaEdit />
                                    </button>
                                )}
                            </h3>
                            <div className="summary-row-premium">
                                <span>{t.subtotalLabel}</span>
                                <span>{(subtotal - taxAmount).toFixed(2)} DT</span>
                            </div>
                            <div className="summary-row-premium">
                                <span>{t.shippingLabel}</span>
                                <span>{shippingCost.toFixed(2)} DT</span>
                            </div>
                            <div className="summary-row-premium tax-row">
                                <span>{t.taxLabel.replace('{rate}', (taxRate * 100).toFixed(0))}</span>
                                <span>{taxAmount.toFixed(2)} DT</span>
                            </div>

                            <div className="total-row-premium">
                                <span className="total-label-premium">{t.totalLabel}</span>
                                <span className="total-price-premium">{subtotal.toFixed(2)} DT</span>
                            </div>

                            <button
                                className="checkout-btn-premium"
                                onClick={handleCheckout}
                            >
                                {t.checkoutBtn}
                            </button>

                            <Link to="/magasin" className="continue-btn-premium">
                                {t.continueBtn}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />

            {/* ======================================= */}
            {/* 🌟 MODALE DE FINALISATION DE COMMANDE 🌟 */}
            {/* ======================================= */}
            <CheckoutModal
                isOpen={showCheckoutModal}
                onClose={() => setShowCheckoutModal(false)}
                total={total}
                cartItems={cartItems}
                appLanguage={appLanguage}
                t={t}
                isAdmin={isAdmin}
                onEditClick={setActiveEditSection}
                whatsappNumber={whatsappNumber}
                onSubmitOrder={handleSubmitOrder}
            />

            {/* Render edit content modal */}
            {activeEditSection && (
                <CartContentEditModal
                    activeEditSection={activeEditSection}
                    appLanguage={appLanguage}
                    editContent={editContent}
                    handleFieldChange={handleFieldChange}
                    handleSaveContent={handleSaveContent}
                    setActiveEditSection={setActiveEditSection}
                    setEditContent={setEditContent}
                    pageContent={pageContent}
                    handleTopLevelFieldChange={handleTopLevelFieldChange}
                />
            )}
        </>
    );
}