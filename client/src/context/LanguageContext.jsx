import React, { createContext, useState, useContext, useEffect } from 'react';
import ar from "../img/ar.png";
import fr from "../img/fr.png";
import en from "../img/eg.png"; // Note: Using existing asset for English

import BASE_URL from '../apiConfig';

const LanguageContext = createContext();

const DEFAULT_LANGUAGES = [
    { code: 'fr', label: 'Français', emoji: '🇫🇷', icon: fr },
    { code: 'ar', label: 'العربية', emoji: '🇸🇦', icon: ar },
    { code: 'en', label: 'English', emoji: '🇬🇧', icon: en },
];

export const LanguageProvider = ({ children }) => {
    const [appLanguage, setAppLanguage] = useState(localStorage.getItem('appLanguage') || 'fr');
    const [languages, setLanguages] = useState(DEFAULT_LANGUAGES);

    useEffect(() => {
        // Fetch languages from backend
        fetch(`${BASE_URL}/api/settings/languages`)
            .then(res => res.json())
            .then(data => {
                if (data && Array.isArray(data)) {
                    setLanguages(data);
                }
            })
            .catch(err => {
                console.error("Failed to fetch languages from backend:", err);
                const saved = localStorage.getItem('appLanguages');
                if (saved) setLanguages(JSON.parse(saved));
            });
    }, []);

    const changeLanguage = (lang) => {
        setAppLanguage(lang);
        localStorage.setItem('appLanguage', lang);
    };

    const addLanguage = async (newLang) => {
        try {
            const updatedLanguages = [...languages, newLang];
            setLanguages(updatedLanguages);
            localStorage.setItem('appLanguages', JSON.stringify(updatedLanguages));

            // Persist to backend
            await fetch(`${BASE_URL}/api/settings/languages`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: updatedLanguages })
            });
        } catch (err) {
            console.error("Failed to save language to backend:", err);
        }
    };

    return (
        <LanguageContext.Provider value={{ appLanguage, changeLanguage, languages, addLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

