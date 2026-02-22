import React, { useState, useEffect } from 'react';
import NavbarAdmin from '../../comp/Navbar_admin';
import { FaCog, FaWhatsapp, FaSave, FaSpinner, FaTools, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import BASE_URL from '../../apiConfig';
import { useAlert } from '../../context/AlertContext';

export default function Gestion_Settings() {
    const [settings, setSettings] = useState({
        whatsapp: '',
        siteName: 'Atelier Sfax',
        contactEmail: '',
        maintenanceMode: false
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { showAlert } = useAlert();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            // First try to get existing settings
            const response = await fetch(`${BASE_URL}/api/settings/general`);
            if (response.ok) {
                const data = await response.json();
                if (data && data.value) {
                    setSettings(prev => ({ ...prev, ...data.value }));
                }
            }
        } catch (err) {
            console.error("Error fetching settings:", err);
            showAlert('error', 'Erreur', 'Impossible de charger les paramètres.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await fetch(`${BASE_URL}/api/settings/general`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: settings })
            });

            if (!response.ok) throw new Error("Échec de la sauvegarde");

            showAlert('success', 'Succès', 'Paramètres mis à jour avec succès !');
        } catch (err) {
            showAlert('error', 'Erreur', err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <NavbarAdmin />
            <div style={{ textAlign: 'center', padding: '100px' }}>
                <FaSpinner className="spinner" style={{ fontSize: '3rem', color: '#D4AF37' }} />
                <p style={{ marginTop: '20px', fontWeight: 'bold' }}>Chargement des réglages...</p>
            </div>
        </div>
    );

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <NavbarAdmin />

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.2rem', color: '#1e293b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FaCog style={{ color: '#D4AF37' }} /> Paramètres Généraux
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '10px' }}>Configurez les informations essentielles de votre plateforme.</p>
                </div>

                <div className="premium-card" style={{ padding: '40px' }}>
                    <form onSubmit={handleSave}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

                            <div className="premium-form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FaWhatsapp style={{ color: '#25D366' }} /> Numéro WhatsApp (Service Client)
                                </label>
                                <input
                                    type="text"
                                    value={settings.whatsapp}
                                    onChange={e => setSettings({ ...settings, whatsapp: e.target.value })}
                                    placeholder="Ex: +216 26 000 000"
                                />
                                <small style={{ color: '#64748b', marginTop: '8px' }}>Ce numéro sera utilisé pour les contacts directs et les confirmations VIP.</small>
                            </div>

                            <div className="premium-form-group">
                                <label>Email de Contact</label>
                                <input
                                    type="email"
                                    value={settings.contactEmail}
                                    onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
                                    placeholder="contact@ateliersfax.com"
                                />
                            </div>

                            <div className="premium-form-group">
                                <label>Nom du Site</label>
                                <input
                                    type="text"
                                    value={settings.siteName}
                                    onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                                />
                            </div>

                            <div style={{
                                padding: '20px',
                                background: settings.maintenanceMode ? '#fff1f2' : '#f0fdf4',
                                borderRadius: '15px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                border: `1px solid ${settings.maintenanceMode ? '#fecaca' : '#dcfce7'}`,
                                transition: 'all 0.3s'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    {settings.maintenanceMode ? <FaTools color="#ef4444" /> : <FaCheckCircle color="#10b981" />}
                                    <div>
                                        <div style={{ fontWeight: 'bold', color: '#1e293b' }}>Mode Maintenance</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Désactive l'accès public au site si activé.</div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                                    style={{
                                        width: '50px',
                                        height: '26px',
                                        borderRadius: '13px',
                                        background: settings.maintenanceMode ? '#ef4444' : '#cbd5e1',
                                        border: 'none',
                                        position: 'relative',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        background: '#fff',
                                        position: 'absolute',
                                        top: '3px',
                                        left: settings.maintenanceMode ? '27px' : '3px',
                                        transition: 'all 0.3s'
                                    }} />
                                </button>
                            </div>

                            <div style={{ marginTop: '20px' }}>
                                <button type="submit" disabled={saving} className="premium-btn-cta gold" style={{ width: '100%', padding: '18px' }}>
                                    {saving ? <FaSpinner className="spinner" /> : <FaSave />} Enregistrer les Modifications
                                </button>
                            </div>

                        </div>
                    </form>
                </div>

                <div style={{ marginTop: '40px', padding: '25px', background: 'rgba(212, 175, 55, 0.05)', borderRadius: '20px', border: '1px solid rgba(212, 175, 55, 0.1)', display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <FaExclamationCircle style={{ color: '#D4AF37', fontSize: '1.5rem', flexShrink: 0 }} />
                    <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
                        <strong>Note :</strong> Ces paramètres affectent l'ensemble de l'application. Assurez-vous que les informations saisies sont correctes avant d'enregistrer.
                    </p>
                </div>
            </div>
        </div>
    );
}
