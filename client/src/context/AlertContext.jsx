import React, { createContext, useContext, useState } from 'react';
import CreativeAlert from '../comp/CreativeAlert';
import { useLanguage } from './LanguageContext';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
    const { appLanguage } = useLanguage();
    const [alertConfig, setAlertConfig] = useState({
        show: false,
        type: 'info',
        title: '',
        message: '',
        onConfirm: null,
        onCancel: null,
        confirmLabel: '',
        cancelLabel: ''
    });

    const labels = {
        ar: { confirm: 'تأكيد', cancel: 'إلغاء', ok: 'موافق' },
        fr: { confirm: 'Confirmer', cancel: 'Annuler', ok: 'OK' },
        en: { confirm: 'Confirm', cancel: 'Cancel', ok: 'OK' }
    };

    const currentLabels = labels[appLanguage] || labels.fr;

    const showAlert = (type, title, message, onConfirm = null, onCancel = null, confirmLabel = '', cancelLabel = '') => {
        setAlertConfig({
            show: true,
            type,
            title,
            message,
            onConfirm: () => {
                if (onConfirm) onConfirm();
                hideAlert();
            },
            onCancel: () => {
                if (onCancel) onCancel();
                hideAlert();
            },
            confirmLabel: confirmLabel || (type === 'confirm' ? currentLabels.confirm : currentLabels.ok),
            cancelLabel: cancelLabel || currentLabels.cancel
        });
    };

    const hideAlert = () => {
        setAlertConfig(prev => ({ ...prev, show: false }));
    };

    return (
        <AlertContext.Provider value={{ showAlert, hideAlert }}>
            {children}
            <CreativeAlert {...alertConfig} />
        </AlertContext.Provider>
    );
};

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};
