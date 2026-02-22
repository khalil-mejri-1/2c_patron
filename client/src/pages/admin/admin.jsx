import React, { useState, useEffect } from 'react';
import NavbarAdmin from '../../comp/Navbar_admin';
import {
  FaUsers, FaBoxOpen, FaShoppingCart, FaEnvelope, FaComments,
  FaCrown, FaChartLine, FaArrowRight, FaPlus, FaCheckCircle,
  FaClock, FaSpinner
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import BASE_URL from '../../apiConfig';

export default function Admin() {
  const [stats, setStats] = useState({
    clients: 0,
    products: 0,
    commands: 0,
    messages: 0,
    comments: 0,
    vipRequests: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetching counts from existing endpoints
        const [users, products, commands, messages, comments, vips] = await Promise.all([
          fetch(`${BASE_URL}/api/users`).then(res => res.json()).catch(() => []),
          fetch(`${BASE_URL}/api/produit`).then(res => res.json()).catch(() => []),
          fetch(`${BASE_URL}/api/commands`).then(res => res.json()).catch(() => []),
          fetch(`${BASE_URL}/api/messages`).then(res => res.json()).catch(() => []),
          fetch(`${BASE_URL}/api/commentaires`).then(res => res.json()).catch(() => []),
          fetch(`${BASE_URL}/api/abonnement`).then(res => res.json()).catch(() => [])
        ]);

        setStats({
          clients: users.length,
          products: products.length,
          commands: commands.length,
          messages: messages.filter(m => !m.estTraite).length, // Only new messages
          comments: comments.filter(c => c.statut === 'en attente').length, // Pending comments
          vipRequests: vips.filter(v => v.statut_abonnement === 'en_attente').length // Pending VIP
        });
      } catch (err) {
        console.error("Error fetching stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ icon: Icon, title, count, link, color, label }) => (
    <Link to={link} className="premium-card" style={{
      padding: '25px',
      textDecoration: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid #e2e8f0',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        borderRadius: '12px',
        background: `${color}15`,
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem'
      }}>
        <Icon />
      </div>
      <div>
        <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</h3>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '5px' }}>
          <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>{count}</span>
          {label && <span style={{ fontSize: '0.8rem', color: color, fontWeight: 'bold' }}>{label}</span>}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: '20px', right: '20px', color: '#cbd5e1' }}>
        <FaArrowRight />
      </div>
    </Link>
  );

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <NavbarAdmin />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', color: '#1e293b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <FaChartLine style={{ color: '#D4AF37' }} /> Tableau de Bord
            </h1>
            <p style={{ color: '#64748b', marginTop: '10px', fontSize: '1.1rem' }}>Bienvenue dans votre espace d'administration premium.</p>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <Link to="/admin_products" className="premium-btn-cta gold" style={{ padding: '12px 25px', textDecoration: 'none' }}>
              <FaPlus /> Nouveau Produit
            </Link>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px' }}>
            <FaSpinner className="spinner" style={{ fontSize: '3rem', color: '#D4AF37' }} />
            <p style={{ marginTop: '20px', fontWeight: 'bold', color: '#1e293b' }}>Chargement des données en temps réel...</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px', marginBottom: '50px' }}>
              <StatCard
                icon={FaUsers}
                title="Total Clients"
                count={stats.clients}
                link="/admin_clients"
                color="#3b82f6"
              />
              <StatCard
                icon={FaBoxOpen}
                title="Catalogue Produits"
                count={stats.products}
                link="/admin_products"
                color="#8b5cf6"
              />
              <StatCard
                icon={FaShoppingCart}
                title="Commandes"
                count={stats.commands}
                link="/admin_command"
                color="#D4AF37"
              />
              <StatCard
                icon={FaEnvelope}
                title="Messages"
                count={stats.messages}
                link="/admin_message"
                color="#ef4444"
                label={stats.messages > 0 ? "Non lus" : ""}
              />
              <StatCard
                icon={FaComments}
                title="Commentaires"
                count={stats.comments}
                link="/admin_commentaire"
                color="#10b981"
                label={stats.comments > 0 ? "En attente" : ""}
              />
              <StatCard
                icon={FaCrown}
                title="Demandes VIP"
                count={stats.vipRequests}
                link="/admin_abonnement"
                color="#f59e0b"
                label={stats.vipRequests > 0 ? "À traiter" : ""}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
              <div className="premium-card" style={{ padding: '30px' }}>
                <h3 style={{ marginBottom: '25px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FaClock style={{ color: '#D4AF37' }} /> Actions Rapides
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  {[
                    { title: 'Gérer Boutique', desc: 'Produits & Patrons', link: '/admin_products', icon: <FaBoxOpen /> },
                    { title: 'Commandes Client', desc: 'Gestion & Expédition', link: '/admin_command', icon: <FaShoppingCart /> },
                    { title: 'Espace VIP', desc: 'Contenu & Formations', link: '/admin_espace_vip', icon: <FaCrown /> },
                    { title: 'Commentaires', desc: 'Modération Avis', link: '/admin_commentaire', icon: <FaComments /> }
                  ].map((action, idx) => (
                    <Link key={idx} to={action.link} style={{
                      padding: '20px',
                      background: '#f8fafc',
                      borderRadius: '15px',
                      textDecoration: 'none',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.2s'
                    }} onMouseOver={e => e.currentTarget.style.borderColor = '#D4AF37'}>
                      <div style={{ color: '#D4AF37', fontSize: '1.5rem', marginBottom: '10px' }}>{action.icon}</div>
                      <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{action.title}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{action.desc}</div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="premium-card" style={{ padding: '30px' }}>
                <h3 style={{ marginBottom: '25px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FaCheckCircle style={{ color: '#10b981' }} /> État Système
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8fafc', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.9rem', color: '#1e293b' }}>Connexion API</div>
                    <span style={{ padding: '4px 10px', background: '#ecfdf5', color: '#059669', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold' }}>SÉCURISÉ</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8fafc', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.9rem', color: '#1e293b' }}>Certificat VIP</div>
                    <span style={{ padding: '4px 10px', background: '#ecfdf5', color: '#059669', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold' }}>VALIDE</span>
                  </div>
                  <div style={{ padding: '20px', background: '#fef3c7', borderRadius: '15px', border: '1px solid #fde68a', marginTop: '10px' }}>
                    <div style={{ color: '#92400e', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '5px' }}>Besoin d'aide ?</div>
                    <div style={{ color: '#b45309', fontSize: '0.8rem' }}>Consultez la documentation technique pour la gestion des patrons et des vidéos VIP.</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
