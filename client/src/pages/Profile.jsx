import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaEnvelope, FaTag, FaSignOutAlt, FaMapMarkerAlt, FaKey, FaShoppingBag } from 'react-icons/fa';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import BASE_URL from '../apiConfig';

export default function Profile() {
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
                    setOrders(data); // data يجب أن يكون مصفوفة الطلبات
                    setLoadingOrders(false);
                    console.log(userEmail)
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
        window.location.href = '/';
    };

    if (!isLoggedIn) {
        return <div className="profile-loading">Chargement du profil...</div>;
    }

    return (
        <>
            <Navbar />
            <section className="profile-section">
                <div className="profile-header-container">
                    <FaUserCircle className="profile-avatar-icon" />
                    <h1 className="profile-main-title">
                        Bonjour, <span className="profile-accent">{userData.name || userData.email}</span>
                    </h1>
                    <p className="profile-status">Espace Membre Exclusif</p>
                </div>

                <div className="profile-content-wrapper">
                    <aside className="profile-sidebar">
                        <nav className="profile-nav">
                            <h3 className="nav-title">Navigation</h3>
                            <ul>
                                <li className="nav-item active"><FaUserCircle /> Mon Profil</li>
                            </ul>
                        </nav>
                        <button onClick={handleLogout} className="profile-logout-btn">
                            <FaSignOutAlt /> Déconnexion
                        </button>
                    </aside>

                    <main className="profile-main-content">
                        <div className="info-block">
                            <h2 className="block-title">Informations Personnelles</h2>
                            <div className="info-grid">
                                <div className="info-detail"><FaUserCircle className="detail-icon" /> <h4>Nom:</h4> <p>{userData.name || 'Non défini'}</p></div>
                                <div className="info-detail"><FaEnvelope className="detail-icon" /> <h4>Email:</h4> <p>{userData.email}</p></div>
                                <div className="info-detail"><FaMapMarkerAlt className="detail-icon" /> <h4>Adresse:</h4> <p>Non spécifié</p></div>
                            </div>
                            {/* <button className="edit-btn">Modifier</button> */}
                        </div>

                        <div className="info-block orders-block">
                            <h2 className="block-title">Commandes Récentes</h2>
                            {loadingOrders ? (
                                <p>Chargement des commandes...</p>
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
                                                {order.items && order.items.length > 0 ? order.items[0].productName : 'Produit Non Trouvé'}
                                            </span>
                                            <span>Date: {new Date(order.orderDate).toLocaleDateString()}</span>
                                            <span className="order-total">{order.totalAmount} DT</span>
                                            <span className={`order-status status-${order.status.toLowerCase().replace(/\s/g, '')}`}>{order.status}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="no-orders-msg">Vous n'avez pas encore passé de commande.</p>
                            )}
                        </div>
                    </main>
                </div>
            </section>
            <Footer />
        </>
    );
}
