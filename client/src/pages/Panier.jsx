import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaShoppingBag, FaArrowLeft, FaCheckCircle, FaClock, FaBoxOpen } from 'react-icons/fa';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import BASE_URL from '../apiConfig';
import './shop_redesign.css';

export default function Panier() {
    const { appLanguage, getTranslated } = useLanguage();
    const navigate = useNavigate();
    const [panierItems, setPanierItems] = useState([]);

    useEffect(() => {
        const loadPanier = async () => {
            try {
                const userEmail = localStorage.getItem('loggedInUserEmail') || localStorage.getItem('currentUserEmail');
                
                if (userEmail) {
                    try {
                        const res = await fetch(`${BASE_URL}/api/commands/user/${userEmail}`);
                        if (res.ok) {
                            const commands = await res.json();
                            let dbItems = [];
                            
                            commands.forEach(cmd => {
                                if (cmd.items && cmd.items.length > 0) {
                                    cmd.items.forEach(cItem => {
                                        let currentStatus = cmd.status;
                                        let itemDate = cmd.orderDate;
                                        
                                        if (cmd.subOrders && cmd.subOrders.length > 0) {
                                            const sub = cmd.subOrders.find(s => s.items.some(si => String(si.productId) === String(cItem.productId)));
                                            if (sub) {
                                                if (sub.status) currentStatus = sub.status;
                                                if (sub.submissionDate) itemDate = sub.submissionDate;
                                            }
                                        }
                                        
                                        dbItems.push({
                                            id: cItem.productId || cItem._id,
                                            commandId: cmd._id,
                                            name: cItem.productName,
                                            image: cItem.productImage,
                                            price: cItem.price,
                                            quantity: cItem.quantity,
                                            orderDate: itemDate,
                                            totalAmount: cItem.price * cItem.quantity,
                                            status: currentStatus || 'En attente',
                                            isDbItem: true
                                        });
                                    });
                                }
                            });
                            
                            setPanierItems(dbItems);
                            return; // Stop here, we got everything from DB!
                        }
                    } catch (e) {
                         console.error("DB Fetch Error", e);
                    }
                }

                // Fallback to local storage
                let items = JSON.parse(localStorage.getItem('panier_items') || '[]');

                let modified = false;
                await Promise.all(items.map(async (item) => {
                    if (item.commandId) {
                        try {
                            const res = await fetch(`${BASE_URL}/api/commands/${item.commandId}`);
                            if (res.ok) {
                                const cmd = await res.json();

                                // Check if this specific item still exists in the global items list
                                const itemExists = cmd.items && cmd.items.some(i => String(i.productId) === String(item.id));

                                if (!itemExists) {
                                    item.isDeleted = true;
                                    modified = true;
                                } else {
                                    let currentStatus = cmd.status;

                                    if (cmd.subOrders && cmd.subOrders.length > 0) {
                                        const sub = cmd.subOrders.find(s => s.items.some(i => String(i.productId) === String(item.id)));
                                        if (sub && sub.status) {
                                            currentStatus = sub.status;
                                        }
                                    }

                                    if (currentStatus && item.status !== currentStatus) {
                                        item.status = currentStatus;
                                        modified = true;
                                    }
                                }
                            } else if (res.status === 404) {
                                // The entire order was deleted by admin
                                item.isDeleted = true;
                                modified = true;
                            }
                        } catch (e) {
                            console.error("Erreur sync statut", e);
                        }
                    }
                }));

                if (modified) {
                    items = items.filter(item => !item.isDeleted);
                    localStorage.setItem('panier_items', JSON.stringify(items));
                }

                setPanierItems(items);
            } catch (e) {
                console.error("Could not load panier", e);
            }
        };

        loadPanier();
        window.scrollTo(0, 0);

        window.addEventListener('panierUpdated', loadPanier);
        return () => window.removeEventListener('panierUpdated', loadPanier);
    }, []);

    const t = {
        ar: {
            title: "مشترياتي",
            subtitle: "المنتجات التي قمت بطلبها مؤخراً",
            emptyTitle: "سلة مشترياتك فارغة",
            emptySub: "لم تقم بأي طلب بعد، تصفح المتجر واكتشف منتجاتنا المميزة!",
            backToShop: "العودة للمتجر",
            orderDate: "تاريخ الطلب",
            statusPending: "قيد المراجعة",
            clearAll: "مسح السجل",
            totalValue: "إجمالي قيمة طلباتك",
            quantity: "الكمية"
        },
        fr: {
            title: "Mes Achats",
            subtitle: "Les produits que vous avez récemment commandés",
            emptyTitle: "Votre panier est vide",
            emptySub: "Vous n'avez encore rien commandé, découvrez vite nos produits !",
            backToShop: "Retour au Magasin",
            orderDate: "Date de commande",
            statusPending: "En attente",
            clearAll: "Vider l'historique",
            totalValue: "Valeur totale de vos achats",
            quantity: "Quantité"
        }
    }[appLanguage] || {
        title: "My Purchases",
        subtitle: "Items you recently ordered",
        emptyTitle: "Your cart is empty",
        emptySub: "You haven't ordered anything yet, discover our products!",
        backToShop: "Back to Shop",
        orderDate: "Order Date",
        statusPending: "Pending",
        clearAll: "Clear History",
        totalValue: "Total Value of Purchases",
        quantity: "Quantity"
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'En attente': return { bg: '#fffbeb', color: '#d97706', icon: <FaClock /> };
            case 'En cours': return { bg: '#eff6ff', color: '#3b82f6', icon: <FaBoxOpen /> };
            case 'Livrée': return { bg: '#f0fdf4', color: '#16a34a', icon: <FaCheckCircle /> };
            case 'Annulée': return { bg: '#fef2f2', color: '#ef4444', icon: <FaTrash /> };
            default: return { bg: '#fffbeb', color: '#d97706', icon: <FaClock /> };
        }
    };

    const totalSpent = panierItems.reduce((acc, item) => acc + (item.totalAmount || item.price * item.quantity), 0);

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }} dir="ltr">
            <Navbar />

            <div className="panier-container" dir={appLanguage === 'ar' ? 'rtl' : 'ltr'} style={{
                flex: 1,
                padding: '160px 5% 80px',
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%'
            }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <h1 className="panier-title" style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <FaShoppingBag style={{ color: '#D4AF37' }} />
                            {t.title}
                        </h1>
                        <p style={{ color: '#64748b', margin: 0, fontSize: '1.1rem' }}>{t.subtitle}</p>
                    </div>
                </div>

                {panierItems.length === 0 ? (
                    <div style={{
                        background: '#fff',
                        borderRadius: '30px',
                        padding: '80px 20px',
                        textAlign: 'center',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.03)',
                        border: '1px solid #f1f5f9',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: '#f8fafc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '20px',
                            color: '#cbd5e1',
                            fontSize: '3rem'
                        }}>
                            <FaBoxOpen />
                        </div>
                        <h2 style={{ color: '#1e293b', fontSize: '1.8rem', fontWeight: '800', marginBottom: '10px' }}>{t.emptyTitle}</h2>
                        <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '30px', maxWidth: '400px', lineHeight: '1.6' }}>{t.emptySub}</p>

                        <button
                            onClick={() => navigate('/magasin')}
                            style={{
                                background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                                color: '#fff',
                                padding: '16px 32px',
                                borderRadius: '16px',
                                border: 'none',
                                fontWeight: '800',
                                fontSize: '1.1rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                boxShadow: '0 10px 20px rgba(15, 23, 42, 0.2)',
                                transition: 'transform 0.2s'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <FaArrowLeft style={{ transform: appLanguage === 'ar' ? 'rotate(180deg)' : 'none' }} /> {t.backToShop}
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                        {panierItems.map((item, index) => {
                            const d = new Date(item.orderDate);
                            const formattedDate = d.toLocaleDateString(appLanguage === 'ar' ? 'ar-TN' : 'fr-FR', {
                                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            });

                            return (
                                <div key={index} className="panier-item-card" style={{
                                    background: '#fff',
                                    borderRadius: '24px',
                                    padding: '20px',
                                    display: 'flex',
                                    gap: '20px',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                                    border: '1px solid #f1f5f9',
                                    position: 'relative',
                                    alignItems: 'center',
                                    flexWrap: 'wrap'
                                }}>
                                    <div style={{
                                        width: '120px',
                                        height: '120px',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        background: '#f8fafc',
                                        flexShrink: 0,
                                        border: '1px solid #e2e8f0',
                                        cursor: 'pointer'
                                    }} onClick={() => navigate(`/product/${item.id}`)}>
                                        <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px' }} />
                                    </div>

                                    <div className="panier-item-details" style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <h3 className="panier-item-title" onClick={() => navigate(`/product/${item.id}`)} style={{
                                                margin: 0,
                                                fontSize: '1.3rem',
                                                fontWeight: '800',
                                                color: '#0f172a',
                                                cursor: 'pointer',
                                                transition: 'color 0.2s'
                                            }}
                                                onMouseOver={(e) => { e.currentTarget.style.color = '#D4AF37'; }}
                                                onMouseOut={(e) => { e.currentTarget.style.color = '#0f172a'; }}
                                            >
                                                {typeof item.name === 'object' ? (item.name[appLanguage] || item.name.fr) : item.name}
                                            </h3>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#64748b', fontSize: '0.9rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaClock /> {formattedDate}</span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px' }}>
                                            <span style={{
                                                background: getStatusStyle(item.status).bg,
                                                color: getStatusStyle(item.status).color,
                                                padding: '6px 12px',
                                                borderRadius: '30px',
                                                fontSize: '0.8rem',
                                                fontWeight: '700',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}>
                                                {getStatusStyle(item.status).icon}
                                                {item.status === 'pending' ? t.statusPending : item.status}
                                            </span>
                                            <span style={{
                                                background: '#f8fafc',
                                                color: '#64748b',
                                                padding: '6px 12px',
                                                borderRadius: '30px',
                                                fontSize: '0.8rem',
                                                fontWeight: '800',
                                            }}>
                                                {t.quantity}: {item.quantity}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-end',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        gap: '15px'
                                    }}>
                                        <div className="panier-item-price" style={{ fontSize: '1.6rem', fontWeight: '900', color: '#D4AF37' }}>
                                            {item.totalAmount?.toFixed(2) || (item.price * item.quantity).toFixed(2)} DT
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Order Summary */}
                        <div style={{
                            marginTop: '20px',
                            background: '#0f172a',
                            borderRadius: '24px',
                            padding: '30px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '20px',
                            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)'
                        }}>
                            <div>
                                <h3 style={{ color: '#94a3b8', margin: '0 0 10px 0', fontSize: '1.1rem', fontWeight: '600' }}>{t.totalValue}</h3>
                                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff' }}>
                                    {totalSpent.toFixed(2)} <span style={{ color: '#D4AF37' }}>DT</span>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/magasin')}
                                style={{
                                    background: 'linear-gradient(135deg, #D4AF37, #B48A1B)',
                                    color: '#fff',
                                    padding: '16px 32px',
                                    borderRadius: '16px',
                                    border: 'none',
                                    fontWeight: '800',
                                    fontSize: '1.1rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    boxShadow: '0 10px 20px rgba(212, 175, 55, 0.3)',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                <FaShoppingBag /> {t.backToShop}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .panier-container {
                        padding-top: 120px !important;
                    }
                    .panier-title {
                        font-size: 1.6rem !important;
                    }
                    .panier-item-card {
                        flex-direction: column !important;
                        align-items: center !important;
                        text-align: center !important;
                        padding: 15px !important;
                        gap: 15px !important;
                        border-radius: 16px !important;
                    }
                    /* Image container */
                    .panier-item-card > div:first-child {
                        width: 90px !important;
                        height: 90px !important;
                        border-radius: 12px !important;
                    }
                    .panier-item-details {
                        flex: none !important;
                        width: 100% !important;
                        align-items: center !important;
                    }
                    .panier-item-details > div {
                        justify-content: center !important;
                    }
                    .panier-item-title {
                        font-size: 1.1rem !important;
                    }
                    .panier-item-price {
                        font-size: 1.25rem !important;
                    }
                    .panier-item-card > div:nth-child(3) {
                        width: 100% !important;
                        align-items: center !important;
                        flex-direction: row-reverse !important;
                        justify-content: center !important;
                    }
                }
            `}</style>

            <Footer />
        </div>
    );
}
