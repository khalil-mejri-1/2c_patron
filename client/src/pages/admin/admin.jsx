import React, { useState, useEffect } from 'react';
import NavbarAdmin from '../../comp/Navbar_admin';
import {
  FaUsers, FaBoxOpen, FaShoppingCart, FaEnvelope, FaComments,
  FaCrown, FaChartLine, FaArrowRight, FaPlus, FaCheckCircle,
  FaClock, FaSpinner, FaHome, FaVideo
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
          fetch(`${BASE_URL}/api/users/clients`).then(res => res.json()).catch(() => []),
          fetch(`${BASE_URL}/api/products`).then(res => res.json()).catch(() => []),
          fetch(`${BASE_URL}/api/commands`).then(res => res.json()).catch(() => []),
          fetch(`${BASE_URL}/api/messages`).then(res => res.json()).catch(() => []),
          fetch(`${BASE_URL}/api/commentaires`).then(res => res.json()).catch(() => []),
          fetch(`${BASE_URL}/api/abonnement`).then(res => res.json()).catch(() => [])
        ]);

        setStats({
          clients: users.length,
          products: products.length,
          commands: commands.length,
          pendingCommands: commands.filter(c => c.status === 'En attente').length,
          messages: messages.filter(m => !m.estTraite).length,
          totalMessages: messages.length,
          comments: comments.filter(c => c.statut === 'En attente').length,
          totalComments: comments.length,
          vipRequests: vips.filter(v => v.statut_abonnement === 'en_attente').length
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

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '100px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', color: '#1e293b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <FaChartLine style={{ color: '#D4AF37' }} /> Tableau de Bord
            </h1>
            <p style={{ color: '#64748b', marginTop: '10px', fontSize: '1.1rem' }}>Bienvenue dans votre espace d'administration premium.</p>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <Link to="/" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 20px',
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              transition: 'all 0.2s'
            }} onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
            }} onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
            }}>
              <FaHome style={{ color: '#D4AF37' }} /> Retour au Site
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
                icon={FaShoppingCart}
                title="Commandes"
                count={stats.commands}
                link="/admin_command"
                color="#D4AF37"
                label={stats.pendingCommands > 0 ? `${stats.pendingCommands} En attente` : ""}
              />
              <StatCard
                icon={FaEnvelope}
                title="Messages"
                count={stats.totalMessages}
                link="/admin_message"
                color="#ef4444"
                label={stats.messages > 0 ? `${stats.messages} Non lus` : "Tout traité"}
              />
              <StatCard
                icon={FaComments}
                title="Commentaires"
                count={stats.totalComments}
                link="/admin_commentaire"
                color="#10b981"
                label={stats.comments > 0 ? `${stats.comments} En attente` : "Tous les avis"}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
              <div className="premium-card" style={{ padding: '30px' }}>
                <h3 style={{ marginBottom: '25px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FaClock style={{ color: '#D4AF37' }} /> Actions Rapides
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  {[
                    {
                      title: 'Commandes Client',
                      desc: 'Gestion & Expédition',
                      link: '/admin_command',
                      icon: <FaShoppingCart />,
                      badge: stats.pendingCommands > 0 ? { count: stats.pendingCommands, color: '#D4AF37' } : null
                    },
                    {
                      title: 'Commentaires',
                      desc: 'Modération Avis',
                      link: '/admin_commentaire',
                      icon: <FaComments />,
                      badge: stats.comments > 0 ? { count: stats.comments, color: '#10b981' } : null
                    },
                    {
                      title: 'Répertoire Vidéos',
                      desc: 'Catalogue Spécialisé',
                      link: '/admin_all_videos',
                      icon: <FaVideo />,
                    }
                  ].map((action, idx) => (
                    <Link key={idx} to={action.link} style={{
                      padding: '20px',
                      background: '#f8fafc',
                      borderRadius: '15px',
                      textDecoration: 'none',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.2s',
                      position: 'relative'
                    }} onMouseOver={e => e.currentTarget.style.borderColor = '#D4AF37'}>
                      {action.badge && (
                        <div style={{
                          position: 'absolute',
                          top: '15px',
                          right: '15px',
                          background: action.badge.color,
                          color: '#fff',
                          padding: '4px 10px',
                          borderRadius: '10px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                        }}>
                          {action.badge.count} En attente
                        </div>
                      )}
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
