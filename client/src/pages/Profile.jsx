import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaEnvelope, FaTag, FaSignOutAlt, FaMapMarkerAlt, FaKey, FaShoppingBag, FaHistory } from 'react-icons/fa';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import BASE_URL from '../apiConfig';
import { useLanguage } from '../context/LanguageContext';

const translations = {
    ar: {
        loadingProfile: "جاري تحميل الملف الشخصي...",
        greeting: "مرحباً،",
        status: "مساحة عضوية حصرية",
        navTitle: "التنقل",
        myProfile: "ملفي الشخصي",
        history: "سجل الطلبات",
        logout: "تسجيل الخروج",
        personalInfo: "المعلومات الشخصية",
        notDefined: "غير محدد",
        notSpecified: "غير محدد",
        recentOrders: "الطلبات الأخيرة",
        loadingOrders: "جاري تحميل الطلبات...",
        date: "التاريخ:",
        noOrders: "لم تقم بأي طلب بعد.",
        nameLabel: "الاسم:",
        emailLabel: "البريد الإلكتروني:",
        addressLabel: "العنوان:",
        productNotFound: "منتج غير موجود"
    },
    fr: {
        loadingProfile: "Chargement du profil...",
        greeting: "Bonjour,",
        status: "Espace Membre Exclusif",
        navTitle: "Navigation",
        myProfile: "Mon Profil",
        history: "Historique",
        logout: "Déconnexion",
        personalInfo: "Informations Personnelles",
        notDefined: "Non défini",
        notSpecified: "Non spécifié",
        recentOrders: "Commandes Récentes",
        loadingOrders: "Chargement des commandes...",
        date: "Date:",
        noOrders: "Vous n'avez pas encore passé de commande.",
        nameLabel: "Nom:",
        emailLabel: "Email:",
        addressLabel: "Adresse:",
        productNotFound: "Produit Non Trouvé"
    },
    en: {
        loadingProfile: "Loading profile...",
        greeting: "Hello,",
        status: "Exclusive Member Space",
        navTitle: "Navigation",
        myProfile: "My Profile",
        history: "History",
        logout: "Logout",
        personalInfo: "Personal Information",
        notDefined: "Not defined",
        notSpecified: "Not specified",
        recentOrders: "Recent Orders",
        loadingOrders: "Loading orders...",
        date: "Date:",
        noOrders: "You haven't placed any orders yet.",
        nameLabel: "Name:",
        emailLabel: "Email:",
        addressLabel: "Address:",
        productNotFound: "Product Not Found"
    }
};

export default function Profile() {
    const { appLanguage } = useLanguage();
    const t = translations[appLanguage] || translations.fr;

    const [userData, setUserData] = useState({ name: 'Visiteur', email: '' });
    const [orders, setOrders] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loadingOrders, setLoadingOrders] = useState(true);

    useEffect(() => {
        const loggedIn = localStorage.getItem('login') === 'true';
        const userEmail = localStorage.getItem('currentUserEmail');
        setIsLoggedIn(loggedIn);

        if (loggedIn && userEmail) {
            const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const currentUser = storedUsers.find(u => u.email === userEmail);
            if (currentUser) {
                setUserData({ name: currentUser.name, email: currentUser.email });
            } else {
                setUserData({ name: 'Membre', email: userEmail });
            }

            // 🔹 جلب الطلبات من قاعدة البيانات
            fetch(`${BASE_URL}/api/commands_user?email=${userEmail}`)
                .then(res => res.json())
                .then(data => {
                    setOrders(data);
                    setLoadingOrders(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoadingOrders(false);
                });
        } else {
            window.location.href = '/login';
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('login');
        localStorage.removeItem('currentUserEmail');
        localStorage.removeItem('loggedInUserEmail');
        localStorage.removeItem('userRole');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('role');
        window.location.href = '/';
    };

    if (!isLoggedIn) {
        return <div className="profile-loading">{t.loadingProfile}</div>;
    }

    const direction = appLanguage === 'ar' ? 'rtl' : 'ltr';

    return (
        <>
            <Navbar />
            <section className="profile-section" dir={direction}>
                <div className="profile-header-container">
                    <FaUserCircle className="profile-avatar-icon" />
                    <h1 className="profile-main-title">
                        {t.greeting} <span className="profile-accent">{userData.name || userData.email}</span>
                    </h1>
                    <p className="profile-status">{t.status}</p>
                </div>

                <div className="profile-content-wrapper">
                    <aside className="profile-sidebar">
                        <nav className="profile-nav">
                            <h3 className="nav-title">{t.navTitle}</h3>
                            <ul>
                                <li className="nav-item active"><FaUserCircle /> {t.myProfile}</li>
                                <li className="nav-item"><FaShoppingBag /> {t.history}</li>
                            </ul>
                        </nav>
                        <button onClick={handleLogout} className="profile-logout-btn">
                            <FaSignOutAlt /> {t.logout}
                        </button>
                    </aside>

                    <main className="profile-main-content">
                        <div className="info-block">
                            <h2 className="block-title">{t.personalInfo}</h2>
                            <div className="info-grid">
                                <div className="info-detail"><FaUserCircle className="detail-icon" /> <h4>{t.nameLabel}</h4> <p>{userData.name || t.notDefined}</p></div>
                                <div className="info-detail"><FaEnvelope className="detail-icon" /> <h4>{t.emailLabel}</h4> <p>{userData.email}</p></div>
                                <div className="info-detail"><FaMapMarkerAlt className="detail-icon" /> <h4>{t.addressLabel}</h4> <p>{t.notSpecified}</p></div>
                            </div>
                        </div>

                        <div className="info-block orders-block">
                            <h2 className="block-title">{t.recentOrders}</h2>
                            {loadingOrders ? (
                                <p>{t.loadingOrders}</p>
                            ) : orders.length > 0 ? (
                                <ul className="orders-list">
                                    {orders.map(order => (
                                        <li key={order._id} className="order-item">
                                            <span>
                                                <img
                                                    src={order.items[0].productImage}
                                                    alt={`Image du produit ${order.items[0].productName}`}
                                                    className="order-product-img"
                                                />
                                            </span>
                                            <span className="order-name">
                                                {order.items && order.items.length > 0 ? order.items[0].productName : t.productNotFound}
                                            </span>
                                            <span>{t.date} {new Date(order.orderDate).toLocaleDateString(appLanguage === 'ar' ? 'ar-TN' : 'fr-FR')}</span>
                                            <span className="order-total">{order.totalAmount} DT</span>
                                            <span className={`order-status status-${order.status.toLowerCase().replace(/\s/g, '')}`}>{order.status}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="no-orders-msg">{t.noOrders}</p>
                            )}
                        </div>
                    </main>
                </div>
            </section>
            <Footer />
        </>
    );
}

