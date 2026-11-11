import React, { useState, useEffect } from 'react';
import {
    FaGraduationCap, FaCut, FaCrown, FaCheck, FaAward, FaUsers, FaClock, FaEdit, FaTimes,
    FaTshirt, FaHeart, FaStar, FaGem, FaBookOpen, FaMagic, FaRibbon, FaLightbulb, FaCloudUploadAlt,
    FaPhoneAlt, FaUser, FaCheckCircle, FaPlus, FaTrash, FaPlay
} from 'react-icons/fa';
import Navbar from '../comp/navbar';
import Footer from '../comp/Footer';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../apiConfig';
import { useAlert } from '../context/AlertContext';
import { trackInitiateCheckout, trackPurchase, sanitizePrice } from '../services/metaPixel';
import './offre_cours_premium.css';
import { syncAuthSession } from '../utils/authSession';

import beginnerImg from '../img/fashion_styling_course.png';
import interImg from '../img/draping_mannequin_course.png';
import vipImg from '../img/pattern_drafting_course.png';

// 🔮 Mapping of string keys to React Icons
const iconMap = {
    graduation: <FaGraduationCap />,
    cut: <FaCut />,
    crown: <FaCrown />,
    tshirt: <FaTshirt />,
    heart: <FaHeart />,
    star: <FaStar />,
    gem: <FaGem />,
    book: <FaBookOpen />,
    magic: <FaMagic />,
    ribbon: <FaRibbon />,
    lightbulb: <FaLightbulb />
};

const defaultContent = {
    fr: {
        badge: "OFFRES DE COURS EXCLUSIVES",
        title: "Choisissez le cours adapté à votre niveau",
        subtitle: "Rejoignez notre académie et découvrez l'art du modélisme et de la couture avec des formations d'exception conçues pour vous propulser vers le professionnalisme.",
        period: "/ mois",

        beginnerTitle: "Atelier d'Initiation",
        beginnerSub: "Couture Débutant",
        beginnerDesc: "Parfait pour faire vos premiers pas dans l'univers de la couture. Apprenez à maîtriser la machine à coudre et assemblez vos premiers projets simples.",
        beginnerPrice: "49",
        beginnerPricingOptions: [
            { duration: "1 min (Test)", price: "5" },
            { duration: "1 mois", price: "49" },
            { duration: "3 mois", price: "120" },
            { duration: "6 mois", price: "200" }
        ],
        beginnerStatus: "available",
        beginnerIcon: "graduation",
        beginnerImage: "default_beginner",
        beginnerBg: "#0f172a",
        beginnerFeatures: [
            "Prise en main de la machine à coudre",
            "Apprentissage des points de base",
            "Réalisation de 3 projets (jupe, sac...)",
            "Support de cours PDF téléchargeable",
            "Accès à la communauté d'entraide"
        ],
        beginnerBtn: "Découvrir l'Atelier",
        beginnerBtnLogged: "Découvrir l'Atelier",
        beginnerTrialEnabled: true,
        beginnerTrialBtnText: "Tester une leçon gratuite",
        beginnerTrialUrl: "/les_leçons",

        interTitle: "Atelier Perfectionnement",
        interSub: "Modélisme & Coupe",
        interDesc: "Concevez vos propres patrons et apprenez les techniques de coupe professionnelles pour donner vie à toutes vos créations de vêtements.",
        interPrice: "89",
        interPricingOptions: [
            { duration: "1 min (Test)", price: "5" },
            { duration: "1 mois", price: "89" },
            { duration: "3 mois", price: "240" },
            { duration: "6 mois", price: "420" }
        ],
        interStatus: "available",
        interIcon: "cut",
        interImage: "default_inter",
        interBg: "#0d1527",
        interFeatures: [
            "Tracé de patrons de base sur-mesure",
            "Techniques d'assemblage complexes",
            "Modélisation de robes et vestes",
            "Séances Q&A hebdomadaires en direct",
            "Correction de vos travaux par un tuteur"
        ],
        interBtn: "S'inscrire à l'Atelier",
        interBtnLogged: "S'inscrire à l'Atelier",
        interTrialEnabled: false,
        interTrialBtnText: "Tester une leçon gratuite",
        interTrialUrl: "/les_leçons",
        popular: "Populaire",

        vipTitle: "Masterclass Haute Couture",
        vipSub: "Accès VIP",
        vipDesc: "Accéder à l'élite de la couture. Techniques de finition haute couture, drapé sur mannequin et accompagnement individuel vers le professionnalisme.",
        vipPrice: "149",
        vipPricingOptions: [
            { duration: "1 min (Test)", price: "5" },
            { duration: "1 mois", price: "149" },
            { duration: "3 mois", price: "390" },
            { duration: "6 mois", price: "700" }
        ],
        vipStatus: "available",
        vipIcon: "crown",
        vipImage: "default_vip",
        vipBg: "#0f172a",
        vipFeatures: [
            "Finition haute couture haut de gamme",
            "Drapé et moulage sur mannequin",
            "Création de corsets et robes de mariée",
            "Mentorat individuel (Maître Tailleur)",
            "Certificat agréé en fin de formation"
        ],
        vipBtn: "Rejoindre l'Accès VIP",
        vipBtnLogged: "Rejoindre l'Accès VIP",

        whyTitle: "Pourquoi choisir nos ateliers ?",
        why1Title: "Accompagnement d'experts",
        why1Desc: "Nos mentors qualifiés vous guident pas à pas à chaque étape de votre apprentissage.",
        why2Title: "Certifications Agréées",
        why2Desc: "Obtenez un certificat reconnu pour valoriser vos compétences professionnelles.",
        why3Title: "Accès flexible 24/7",
        why3Desc: "Apprenez à votre propre rythme depuis chez vous grâce à nos plateformes en ligne."
    },
    ar: {
        badge: "عروض الورش والتكوين الحصرية",
        title: "اختر الدورة المناسبة لمستواك",
        subtitle: "انضم إلى أكاديميتنا واكتشف فن التفصيل والخياطة مع خطط تعليمية ممتازة مصممة خصيصاً لمساعدتك على الاحتراف.",
        period: "/ شهرياً",

        beginnerTitle: "ورشة المبتدئين",
        beginnerSub: "أساسيات الخياطة",
        beginnerDesc: "مثالي لخطواتك الأولى في عالم الخياطة. تعلم التحكم في آلة الخياطة وصناعة مشاريعك البسيطة الأولى.",
        beginnerPrice: "49",
        beginnerPricingOptions: [
            { duration: "1 دقيقة (اختبار)", price: "5" },
            { duration: "1 شهر", price: "49" },
            { duration: "3 أشهر", price: "120" },
            { duration: "6 أشهر", price: "200" }
        ],
        beginnerStatus: "available",
        beginnerIcon: "graduation",
        beginnerImage: "default_beginner",
        beginnerBg: "#0f172a",
        beginnerFeatures: [
            "التحكم في آلة الخياطة والتعرف عليها",
            "تعلم الغرز والتقنيات الأساسية",
            "إنجاز 3 مشاريع عملية (تنورة، حقيبة...)",
            "ملخصات دروس PDF قابلة للتحميل",
            "الوصول لمجموعة الدعم والتفاعل"
        ],
        beginnerBtn: "اكتشف الورشة",
        beginnerBtnLogged: "اكتشف الورشة",
        beginnerTrialEnabled: true,
        beginnerTrialBtnText: "جرب درسًا مجانًا",
        beginnerTrialUrl: "/les_leçons",

        interTitle: "ورشة الاتقان",
        interSub: "باترونات وقص",
        interDesc: "صمم الباترونات الخاصة بك وتعلم تقنيات القص الاحترافية لتجسيد وتفصيل كافة تصاميم الملابس الخاصة بك.",
        interPrice: "89",
        interPricingOptions: [
            { duration: "1 دقيقة (اختبار)", price: "5" },
            { duration: "1 شهر", price: "89" },
            { duration: "3 أشهر", price: "240" },
            { duration: "6 أشهر", price: "420" }
        ],
        interStatus: "available",
        interIcon: "cut",
        interImage: "default_inter",
        interBg: "#0d1527",
        interFeatures: [
            "رسم وتعديل الباترونات الأساسية للمقاسات",
            "تقنيات التجميع المعقدة (أطواق، جيوب)",
            "نمذجة وتصميم الفساتين والسترات",
            "جلسات أسئلة وأجوبة أسبوعية مباشرة",
            "تصحيح أعمالك وتوجيهك من قبل مؤطر"
        ],
        interBtn: "تسجيل في الورشة",
        interBtnLogged: "تسجيل في الورشة",
        interTrialEnabled: false,
        interTrialBtnText: "جرب درسًا مجانًا",
        interTrialUrl: "/les_leçons",
        popular: "الأكثر طلباً",

        vipTitle: "الورشة الاحترافية الراقية",
        vipSub: "عضوية VIP",
        vipDesc: "انضم إلى نخبة مصممي الأزياء. تقنيات التشطيب الفاخر، التشكيل على المانيكان، ومرافقة فردية نحو الاحتراف الفعلي.",
        vipPrice: "149",
        vipStatus: "available",
        vipIcon: "crown",
        vipImage: "default_vip",
        vipBg: "#0f172a",
        vipFeatures: [
            "تشطيب الخياطة الراقية الفاخرة",
            "التشكيل والمولاج المباشر على المانيكان",
            "تصميم الكورسيه وفساتين الزفاف",
            "مرافقة فردية مباشرة مع كبير الخياطين",
            "شهادة معتمدة عند إنهاء التدريب"
        ],
        vipBtn: "الالتحاق بعضوية VIP",
        vipBtnLogged: "الالتحاق بعضوية VIP",

        whyTitle: "لماذا تختار ورشاتنا ؟",
        why1Title: "مرافقة وتوجيه من الخبراء",
        why1Desc: "يقوم مؤطرونا الأكفاء بإرشادك خطوة بخطوة طوال مسيرتك التعليمية.",
        why2Title: "شهادات معتمدة",
        why2Desc: "احصل على شهادة معترف بها لتعزيز ملفك المهني وفرص عملك.",
        why3Title: "مرونة كاملة 24/7",
        why3Desc: "تعلم في الوقت الذي يناسبك ومن منزلك عبر منصتنا الرقمية المتقدمة."
    }
};

const modalTranslations = {
    ar: {
        limitedAccess: "دخول محدود",
        vipMessage: "هذا المحتوى حصرى لأعضائنا المميزين. من فضلك اترك بياناتك وسنتواصل معك لتفعيل حسابك.",
        vipBenefits: "✦ دروس حصرية، متابعة شخصية، ومحتوى متقدم",
        phoneLabel: "رقم الهاتف",
        nameLabel: "الاسم الكامل",
        namePlaceholder: "اسمك الكامل",
        submitBtn: "إرسال الطلب",
        sendingBtn: "جاري الإرسال...",
        laterBtn: "لاحقاً",
        requestSentTitle: "تم استلام طلبك!",
        requestSentMsg: "سنقوم بمراجعة طلبك والاتصال بك في أقرب وقت ممكن. شكراً لاهتمامك!"
    },
    fr: {
        limitedAccess: "Accès Limité",
        vipMessage: "Ce contenu est exclusif à nos membres privilégiés. Veuillez laisser vos coordonnées et nous vous contacterons pour activer votre accès.",
        vipBenefits: "✦ Cours exclusifs, suivi personnalisé et contenu avancé",
        phoneLabel: "Numéro de Téléphone",
        nameLabel: "Nom Complet",
        namePlaceholder: "Votre Nom et Prénom",
        submitBtn: "Envoyer la demande",
        sendingBtn: "Envoi...",
        laterBtn: "PLUS TARD",
        requestSentTitle: "Demande Reçue !",
        requestSentMsg: "Nous avons bien reçu votre demande. Un administrateur vous contactera sous peu. Merci !"
    }
};

export default function OffreDeCours() {
    const { appLanguage, languages } = useLanguage();
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const [pageContent, setPageContent] = useState(defaultContent);
    const [editContent, setEditContent] = useState(defaultContent);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeEditSection, setActiveEditSection] = useState(null); // 'hero', 'beginner', 'inter', 'vip', 'why'

    // Accès Limité Modal State
    const [showVipModal, setShowVipModal] = useState(false);
    const [selectedCardForModal, setSelectedCardForModal] = useState('beginner'); // 'beginner' or 'inter'
    const [vipPhone, setVipPhone] = useState('');
    const [vipFullName, setVipFullName] = useState('');
    const [isSubmittingVip, setIsSubmittingVip] = useState(false);
    const [vipRequestSuccess, setVipRequestSuccess] = useState(false);

    const t = pageContent[appLanguage] || pageContent.fr;
    const mt = modalTranslations[appLanguage] || modalTranslations.fr;
    const direction = (appLanguage === 'ar' || appLanguage === 'tn') ? 'rtl' : 'ltr';

    // Helper to get selected duration, price and title for a card
    const getCoursePlanDetails = (cardType) => {
        let selectedDuration = '';
        let selectedPriceStr = '';
        let numPrice = 0;
        let courseTitle = '';

        if (cardType === 'inter') {
            const intOpt = (t.interPricingOptions && t.interPricingOptions[selectedIntDurationIndex])
                ? t.interPricingOptions[selectedIntDurationIndex]
                : { duration: t.period ? t.period.replace('/', '').trim() : '1 mois', price: t.interPrice || '89' };
            selectedDuration = intOpt.duration;
            selectedPriceStr = `${intOpt.price} DT`;
            numPrice = sanitizePrice(intOpt.price);
            courseTitle = `${t.interTitle || 'Atelier Perfectionnement'} (${selectedDuration})`;
        } else {
            const begOpt = (t.beginnerPricingOptions && t.beginnerPricingOptions[selectedBegDurationIndex])
                ? t.beginnerPricingOptions[selectedBegDurationIndex]
                : { duration: t.period ? t.period.replace('/', '').trim() : '1 mois', price: t.beginnerPrice || '49' };
            selectedDuration = begOpt.duration;
            selectedPriceStr = `${begOpt.price} DT`;
            numPrice = sanitizePrice(begOpt.price);
            courseTitle = `${t.beginnerTitle || "Atelier d'Initiation"} (${selectedDuration})`;
        }

        const courseId = `course_${cardType}_${String(selectedDuration).replace(/\s+/g, '_')}`;

        return { selectedDuration, selectedPriceStr, numPrice, courseTitle, courseId };
    };

    // 🎯 Fired immediately when clicking the "Acheter le cours" button
    const handleBuyCourse = (cardType) => {
        const { selectedDuration, numPrice, courseTitle, courseId } = getCoursePlanDetails(cardType);

        // 📊 Meta Pixel + CAPI: Track InitiateCheckout immediately with the exact chosen duration price
        trackInitiateCheckout({
            name: courseTitle,
            category: 'Online Courses',
            ids: [courseId],
            numItems: 1,
            value: numPrice,
            currency: 'TND',
            contents: [{
                id: courseId,
                quantity: 1,
                item_price: numPrice
            }]
        });

        if (isLoggedIn) {
            if (cardType === 'inter') {
                navigate('/contact');
            } else {
                navigate('/Vip-access');
            }
        } else {
            setSelectedCardForModal(cardType);
            setShowVipModal(true);
        }
    };

    const handleVipRequest = async (e) => {
        e.preventDefault();
        const userEmail = localStorage.getItem('loggedInUserEmail') || localStorage.getItem('currentUserEmail') || 'invite@ateliersfax.com';

        if (!vipPhone) return;
        setIsSubmittingVip(true);

        const { selectedDuration, selectedPriceStr, numPrice, courseTitle, courseId } = getCoursePlanDetails(selectedCardForModal || 'beginner');

        try {
            const res = await fetch(`${BASE_URL}/api/abonnement`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nom: vipFullName || 'Client',
                    mail: userEmail,
                    telephone: vipPhone,
                    duree: selectedDuration,
                    prix: selectedPriceStr,
                    offre_nom: courseTitle
                })
            });
            if (res.ok) {
                // 📊 Meta Pixel + CAPI: Track Purchase (Course Enrollment) with exact chosen price
                trackPurchase({
                    value: numPrice,
                    ids: [courseId],
                    name: courseTitle,
                    numItems: 1,
                    currency: 'TND',
                    contents: [{ id: courseId, quantity: 1, item_price: numPrice }],
                    userData: {
                        em: userEmail,
                        ph: vipPhone,
                        fn: vipFullName
                    }
                });

                setVipRequestSuccess(true);
                setTimeout(() => {
                    setShowVipModal(false);
                    setVipRequestSuccess(false);
                    setVipFullName('');
                    setVipPhone('');
                }, 5000);
            } else {
                const data = await res.json();
                showAlert('error', 'Error', data.message || 'Erreur lors de l\'envoi');
            }
        } catch (err) {
            console.error(err);
            showAlert('error', 'Error', 'Connection error');
        } finally {
            setIsSubmittingVip(false);
        }
    };

    const [isVipExpired, setIsVipExpired] = useState(false);

    // Fetch Content & Check Admin & VIP Expiration Status
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });

        // 🍎 iOS Safari Fix: Restore session from cookies before checking auth
        syncAuthSession();

        setIsLoggedIn(localStorage.getItem('login') === 'true');

        // Verify User VIP & Expiration Status
        const email = localStorage.getItem('currentUserEmail') || localStorage.getItem('loggedInUserEmail');
        if (email) {
            fetch(`${BASE_URL}/api/users/${email}`)
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (data) {
                        if (data.statut === 'admin') {
                            setIsAdmin(true);
                        }
                        if (data.isExpired) {
                            setIsVipExpired(true);
                        } else {
                            setIsVipExpired(false);
                        }
                    }
                })
                .catch(err => console.error("User verification error:", err));
        }

        // Fetch custom page content settings
        fetch(`${BASE_URL}/api/settings/offre-cours-content`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                const merged = { ...defaultContent };
                if (data) {
                    Object.keys(data).forEach(langKey => {
                        merged[langKey] = {
                            ...(defaultContent[langKey] || defaultContent.fr || {}),
                            ...data[langKey]
                        };
                    });
                }
                
                // Synchronize shared fields across all languages
                const sharedFields = [
                    'beginnerBg', 'interBg', 'vipBg',
                    'beginnerStatus', 'interStatus', 'vipStatus',
                    'beginnerIcon', 'interIcon', 'vipIcon',
                    'beginnerImage', 'interImage', 'vipImage',
                    'beginnerPrice', 'interPrice', 'vipPrice'
                ];

                const fallbackLang = (data && data[appLanguage]) ? appLanguage : (data && data.fr ? 'fr' : (data && data.ar ? 'ar' : 'fr'));
                const sharedValues = {};
                sharedFields.forEach(field => {
                    if (data && data[fallbackLang] && data[fallbackLang][field] !== undefined) {
                        sharedValues[field] = data[fallbackLang][field];
                    } else if (merged[fallbackLang] && merged[fallbackLang][field] !== undefined) {
                        sharedValues[field] = merged[fallbackLang][field];
                    }
                });

                if (languages && Array.isArray(languages)) {
                    languages.forEach(lang => {
                        const code = lang.code;
                        if (!merged[code]) {
                            const baseLang = (code === 'tn' || code === 'ar') ? 'ar' : 'fr';
                            merged[code] = {
                                ...(defaultContent[baseLang] || defaultContent.fr || {})
                            };
                        }
                    });
                }

                // Apply shared values to all languages
                Object.keys(merged).forEach(code => {
                    Object.keys(sharedValues).forEach(field => {
                        merged[code][field] = sharedValues[field];
                    });
                });

                setPageContent(merged);
                setEditContent(merged);
            })
            .catch(err => console.error("Error fetching page content:", err));

    }, [languages]);

    // Save content to Backend settings API
    const handleSaveContent = async () => {
        setPageContent(editContent);
        setActiveEditSection(null);
        try {
            const res = await fetch(`${BASE_URL}/api/settings/offre-cours-content`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: editContent })
            });
            if (res.ok) {
                showAlert('success', 'Succès', appLanguage === 'ar' ? 'تم حفظ التغييرات بنجاح' : 'Contenu enregistré avec succès');
            } else {
                showAlert('error', 'Erreur', 'Erreur lors de l\'enregistrement');
            }
        } catch (err) {
            console.error("Failed to save content:", err);
            showAlert('error', 'Erreur', 'Erreur de connexion');
        }
    };

    // Handler to open trial lesson (no login required)
    const handleOpenTrialLesson = (trialUrl) => {
        if (!trialUrl) return;
        sessionStorage.setItem('is_trial_mode', 'true');
        const separator = trialUrl.includes('?') ? '&' : '?';
        navigate(`${trialUrl}${separator}trial=true`);
    };

    // Helper to update translation field
    const handleFieldChange = (sectionKey, value) => {
        const sharedFields = [
            'beginnerBg', 'interBg', 'vipBg',
            'beginnerStatus', 'interStatus', 'vipStatus',
            'beginnerIcon', 'interIcon', 'vipIcon',
            'beginnerImage', 'interImage', 'vipImage',
            'beginnerPrice', 'interPrice', 'vipPrice',
            'beginnerTrialEnabled', 'beginnerTrialUrl',
            'interTrialEnabled', 'interTrialUrl'
        ];

        setEditContent(prev => {
            const updated = { ...prev };
            if (sharedFields.includes(sectionKey)) {
                Object.keys(updated).forEach(lang => {
                    updated[lang] = {
                        ...updated[lang],
                        [sectionKey]: value
                    };
                });
            } else {
                updated[appLanguage] = {
                    ...updated[appLanguage],
                    [sectionKey]: value
                };
            }
            return updated;
        });
    };

    // Helper to update list item field
    const handleListFieldChange = (listKey, index, value) => {
        setEditContent(prev => {
            const listCopy = [...(prev[appLanguage][listKey] || [])];
            listCopy[index] = value;
            return {
                ...prev,
                [appLanguage]: {
                    ...prev[appLanguage],
                    [listKey]: listCopy
                }
            };
        });
    };

    // Duration Select States for Cards
    const [selectedBegDurationIndex, setSelectedBegDurationIndex] = useState(0);
    const [selectedIntDurationIndex, setSelectedIntDurationIndex] = useState(0);

    // Helpers to manage duration & pricing options (Admin)
    const handleAddDurationOption = (cardPrefix) => {
        const listKey = `${cardPrefix}PricingOptions`;
        setEditContent(prev => {
            const currentList = prev[appLanguage]?.[listKey] || [];
            const newItem = {
                duration: appLanguage === 'ar' ? 'مدة جديدة' : 'Nouvelle durée',
                price: '50'
            };
            return {
                ...prev,
                [appLanguage]: {
                    ...prev[appLanguage],
                    [listKey]: [...currentList, newItem]
                }
            };
        });
    };

    const handleUpdateDurationOption = (cardPrefix, index, field, value) => {
        const listKey = `${cardPrefix}PricingOptions`;
        setEditContent(prev => {
            const currentList = [...(prev[appLanguage]?.[listKey] || [])];
            if (currentList[index]) {
                currentList[index] = { ...currentList[index], [field]: value };
            }
            return {
                ...prev,
                [appLanguage]: {
                    ...prev[appLanguage],
                    [listKey]: currentList
                }
            };
        });
    };

    const handleRemoveDurationOption = (cardPrefix, index) => {
        const listKey = `${cardPrefix}PricingOptions`;
        setEditContent(prev => {
            const currentList = (prev[appLanguage]?.[listKey] || []).filter((_, i) => i !== index);
            return {
                ...prev,
                [appLanguage]: {
                    ...prev[appLanguage],
                    [listKey]: currentList
                }
            };
        });
    };

    // Helper to render icon
    const getCardIcon = (iconName, fallback) => {
        return iconMap[iconName] || fallback;
    };

    // Helper to resolve card image
    const getCardImage = (imageKey, defaultImg) => {
        if (imageKey === 'default_beginner') return beginnerImg;
        if (imageKey === 'default_inter') return interImg;
        if (imageKey === 'default_vip') return vipImg;
        return imageKey || defaultImg;
    };

    // Helper to lighten hex color for hover effect
    const lightenColor = (hex, percent) => {
        if (!hex) return hex;
        let color = hex.replace(/^\s*#|\s*$/g, '');
        if (color.length === 3) {
            color = color.replace(/(.)/g, '$1$1');
        }
        let r = parseInt(color.substr(0, 2), 16),
            g = parseInt(color.substr(2, 2), 16),
            b = parseInt(color.substr(4, 2), 16);

        r = Math.min(255, Math.floor(r + (255 - r) * percent));
        g = Math.min(255, Math.floor(g + (255 - g) * percent));
        b = Math.min(255, Math.floor(b + (255 - b) * percent));

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    // Upload handler for custom card images
    const handleModalFileUpload = async (e, fieldKey) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await fetch(`${BASE_URL}/api/upload`, {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                const data = await res.json();
                handleFieldChange(fieldKey, data.url);
            }
        } catch (err) {
            console.error("Image upload failed:", err);
        }
    };

    // Card status helper variables
    const begStatus = t.beginnerStatus || 'available';
    const intStatus = t.interStatus || 'available';
    const vStatus = t.vipStatus || 'available';

    return (
        <div className="offre-cours-page" dir={direction}>
            <Navbar />

            {/* --- HERO SECTION --- */}
            <header className="cours-hero">
                {isAdmin && (
                    <button className="edit-section-btn" onClick={() => setActiveEditSection('hero')} title="Modifier le Hero">
                        <FaEdit size={16} />
                    </button>
                )}
                <div className="hero-subtitle-badge">{t.badge}</div>
                <h1 className="hero-main-title">{t.title}</h1>
                <p className="hero-sub-text">{t.subtitle}</p>
            </header>

            {/* --- CARDS SECTION --- */}
            <main className="cards-section">
                <div className="cards-grid">

                    {/* 1. BEGINNER CARD */}
                    <div 
                        className={`premium-course-card ${begStatus === 'unavailable' ? 'unavailable-card' : ''} ${begStatus === 'soon' ? 'soon-card' : ''}`}
                        style={{
                            '--card-bg': t.beginnerBg || '#0f172a',
                            '--card-bg-hover': lightenColor(t.beginnerBg || '#0f172a', 0.08)
                        }}
                    >
                        {isAdmin && (
                            <button className="edit-section-btn" onClick={() => setActiveEditSection('beginner')} title="Modifier">
                                <FaEdit size={14} />
                            </button>
                        )}
                        {begStatus !== 'available' && (
                            <div className={`status-overlay-badge ${begStatus}`}>
                                {begStatus === 'unavailable'
                                    ? (appLanguage === 'ar' ? 'غير متوفر' : 'Non disponible')
                                    : (appLanguage === 'ar' ? 'قريباً' : 'Bientôt')}
                            </div>
                        )}
                        <div className="card-banner-wrapper">
                            <img src={getCardImage(t.beginnerImage, beginnerImg)} alt={t.beginnerTitle} className="card-banner-img" />
                        </div>
                        <div className="card-header-icon">
                            {getCardIcon(t.beginnerIcon, <FaGraduationCap />)}
                        </div>
                        <h3 className="card-title" style={{ marginTop: '25px' }}>{t.beginnerTitle}</h3>
                        <p style={{ color: '#d4af37', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' }}>
                            {t.beginnerSub}
                        </p>
                        <p className="card-desc">{t.beginnerDesc}</p>

                        {/* Duration Pills (for non-logged in or when options exist) */}
                        {(!isLoggedIn || (t.beginnerPricingOptions && t.beginnerPricingOptions.length > 0)) && (
                            <div className="duration-pills-box">
                                <div className="duration-pills-header">
                                    <label className="duration-pills-label">
                                        {appLanguage === 'ar' ? 'اختر مدة اشتراكك:' : 'CHOISIR LA DURÉE :'}
                                    </label>
                                    {isAdmin && (
                                        <button
                                            type="button"
                                            className="admin-inline-edit-price-btn"
                                            onClick={() => setActiveEditSection('beginner')}
                                            title={appLanguage === 'ar' ? 'تعديل المدد والأسعار' : 'Gérer les prix et durées'}
                                        >
                                            <FaEdit size={12} />
                                            <span>{appLanguage === 'ar' ? 'تعديل المدد والأسعار' : 'Gérer les tarifs'}</span>
                                        </button>
                                    )}
                                </div>
                                <div className="duration-pills-list">
                                    {(t.beginnerPricingOptions && t.beginnerPricingOptions.length > 0
                                        ? t.beginnerPricingOptions
                                        : [{ duration: t.period ? t.period.replace('/', '').trim() : '1 mois', price: t.beginnerPrice || '49' }]
                                    ).map((opt, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            className={`duration-pill${selectedBegDurationIndex === idx ? ' active' : ''}`}
                                            onClick={() => setSelectedBegDurationIndex(idx)}
                                        >
                                            <span className="pill-duration">{opt.duration}</span>
                                            <span className="pill-price">{opt.price} {appLanguage === 'ar' ? 'د.ت' : 'DT'}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Trial Lesson Button (Admin configurable) - Placed under CHOISIR LA DURÉE */}
                        {!isVipExpired && t.beginnerTrialEnabled && t.beginnerTrialUrl && (
                            <button
                                className="card-trial-btn"
                                onClick={() => handleOpenTrialLesson(t.beginnerTrialUrl)}
                            >
                                <FaPlay className="trial-icon" />
                                <span>{t.beginnerTrialBtnText || (appLanguage === 'ar' ? 'جرب درساً مجاناً' : 'Tester une leçon gratuite')}</span>
                            </button>
                        )}

                        <div className="card-price-container">
                            <span className="price-amount">
                                {t.beginnerPricingOptions && t.beginnerPricingOptions[selectedBegDurationIndex]
                                    ? t.beginnerPricingOptions[selectedBegDurationIndex].price
                                    : (t.beginnerPrice || "49")}
                            </span>
                            <span className="price-currency" style={{ marginInlineStart: '6px', fontSize: '1.3rem' }}>
                                {appLanguage === 'ar' ? 'د.ت' : 'DT'}
                            </span>
                            <span className="price-period">
                                / {t.beginnerPricingOptions && t.beginnerPricingOptions[selectedBegDurationIndex]
                                    ? t.beginnerPricingOptions[selectedBegDurationIndex].duration
                                    : (t.period || "mois")}
                            </span>

                            {isAdmin && (
                                <button
                                    type="button"
                                    className="admin-inline-edit-price-btn"
                                    onClick={() => setActiveEditSection('beginner')}
                                    style={{ marginInlineStart: 'auto' }}
                                    title={appLanguage === 'ar' ? 'تعديل السعر والمدة' : 'Modifier le prix'}
                                >
                                    <FaEdit size={12} />
                                </button>
                            )}
                        </div>

                        <ul className="card-features-list">
                            {(t.beginnerFeatures || []).map((feature, i) => (
                                <li key={i} className="feature-item">
                                    <FaCheck className="feature-check-icon" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            className="card-action-btn"
                            onClick={(begStatus === 'available' && !isVipExpired) ? () => handleBuyCourse('beginner') : undefined}
                            disabled={begStatus !== 'available' || isVipExpired}
                            style={{
                                opacity: isVipExpired ? 0.6 : 1,
                                cursor: isVipExpired ? 'not-allowed' : 'pointer',
                                background: isVipExpired ? '#dc2626' : undefined,
                                borderColor: isVipExpired ? '#ef4444' : undefined,
                                color: isVipExpired ? '#ffffff' : undefined
                            }}
                        >
                            <span>
                                {isVipExpired
                                    ? (appLanguage === 'ar' ? 'منتهي (تم حظر الوصول)' : 'Expiré (Accès VIP Bloqué)')
                                    : (begStatus === 'available'
                                        ? (isLoggedIn ? (t.beginnerBtnLogged || t.beginnerBtn) : t.beginnerBtn)
                                        : (begStatus === 'unavailable'
                                            ? (appLanguage === 'ar' ? 'غير متوفر' : 'Non disponible')
                                            : (appLanguage === 'ar' ? 'قريباً جداً' : 'Bientôt disponible')))}
                            </span>
                        </button>
                    </div>

                    {/* 2. INTERMEDIATE CARD (FEATURED) */}
                    <div 
                        className={`premium-course-card featured-card ${intStatus === 'unavailable' ? 'unavailable-card' : ''} ${intStatus === 'soon' ? 'soon-card' : ''}`}
                        style={{
                            '--card-bg': t.interBg || '#0d1527',
                            '--card-bg-hover': lightenColor(t.interBg || '#0d1527', 0.08)
                        }}
                    >
                        {isAdmin && (
                            <button className="edit-section-btn" onClick={() => setActiveEditSection('inter')} title="Modifier">
                                <FaEdit size={14} />
                            </button>
                        )}
                        {intStatus === 'available' && <div className="popular-badge">{t.popular}</div>}
                        {intStatus !== 'available' && (
                            <div className={`status-overlay-badge ${intStatus}`}>
                                {intStatus === 'unavailable'
                                    ? (appLanguage === 'ar' ? 'غير متوفر' : 'Non disponible')
                                    : (appLanguage === 'ar' ? 'قريباً' : 'Bientôt')}
                            </div>
                        )}
                        <div className="card-banner-wrapper">
                            <img src={getCardImage(t.interImage, interImg)} alt={t.interTitle} className="card-banner-img" />
                        </div>
                        <div className="card-header-icon">
                            {getCardIcon(t.interIcon, <FaCut />)}
                        </div>
                        <h3 className="card-title" style={{ marginTop: '25px' }}>{t.interTitle}</h3>
                        <p style={{ color: '#f3e5ab', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' }}>
                            {t.interSub}
                        </p>
                        <p className="card-desc">{t.interDesc}</p>

                        {/* Duration Pills (for non-logged in or when options exist) */}
                        {(!isLoggedIn || (t.interPricingOptions && t.interPricingOptions.length > 0)) && (
                            <div className="duration-pills-box">
                                <div className="duration-pills-header">
                                    <label className="duration-pills-label">
                                        {appLanguage === 'ar' ? 'اختر مدة اشتراكك:' : 'CHOISIR LA DURÉE :'}
                                    </label>
                                    {isAdmin && (
                                        <button
                                            type="button"
                                            className="admin-inline-edit-price-btn"
                                            onClick={() => setActiveEditSection('inter')}
                                            title={appLanguage === 'ar' ? 'تعديل المدد والأسعار' : 'Gérer les prix et durées'}
                                        >
                                            <FaEdit size={12} />
                                            <span>{appLanguage === 'ar' ? 'تعديل المدد والأسعار' : 'Gérer les tarifs'}</span>
                                        </button>
                                    )}
                                </div>
                                <div className="duration-pills-list">
                                    {(t.interPricingOptions && t.interPricingOptions.length > 0
                                        ? t.interPricingOptions
                                        : [{ duration: t.period ? t.period.replace('/', '').trim() : '1 mois', price: t.interPrice || '89' }]
                                    ).map((opt, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            className={`duration-pill${selectedIntDurationIndex === idx ? ' active' : ''}`}
                                            onClick={() => setSelectedIntDurationIndex(idx)}
                                        >
                                            <span className="pill-duration">{opt.duration}</span>
                                            <span className="pill-price">{opt.price} {appLanguage === 'ar' ? 'د.ت' : 'DT'}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Trial Lesson Button (Admin configurable) - Placed under CHOISIR LA DURÉE */}
                        {!isVipExpired && t.interTrialEnabled && t.interTrialUrl && (
                            <button
                                className="card-trial-btn"
                                onClick={() => handleOpenTrialLesson(t.interTrialUrl)}
                            >
                                <FaPlay className="trial-icon" />
                                <span>{t.interTrialBtnText || (appLanguage === 'ar' ? 'جرب درساً مجاناً' : 'Tester une leçon gratuite')}</span>
                            </button>
                        )}

                        <div className="card-price-container">
                            <span className="price-amount">
                                {t.interPricingOptions && t.interPricingOptions[selectedIntDurationIndex]
                                    ? t.interPricingOptions[selectedIntDurationIndex].price
                                    : (t.interPrice || "89")}
                            </span>
                            <span className="price-currency" style={{ marginInlineStart: '6px', fontSize: '1.3rem' }}>
                                {appLanguage === 'ar' ? 'د.ت' : 'DT'}
                            </span>
                            <span className="price-period">
                                / {t.interPricingOptions && t.interPricingOptions[selectedIntDurationIndex]
                                    ? t.interPricingOptions[selectedIntDurationIndex].duration
                                    : (t.period || "mois")}
                            </span>

                            {isAdmin && (
                                <button
                                    type="button"
                                    className="admin-inline-edit-price-btn"
                                    onClick={() => setActiveEditSection('inter')}
                                    style={{ marginInlineStart: 'auto' }}
                                    title={appLanguage === 'ar' ? 'تعديل السعر والمدة' : 'Modifier le prix'}
                                >
                                    <FaEdit size={12} />
                                </button>
                            )}
                        </div>

                        <ul className="card-features-list">
                            {(t.interFeatures || []).map((feature, i) => (
                                <li key={i} className="feature-item">
                                    <FaCheck className="feature-check-icon" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            className="card-action-btn"
                            onClick={(intStatus === 'available' && !isVipExpired) ? () => handleBuyCourse('inter') : undefined}
                            disabled={intStatus !== 'available' || isVipExpired}
                            style={{
                                opacity: isVipExpired ? 0.6 : 1,
                                cursor: isVipExpired ? 'not-allowed' : 'pointer',
                                background: isVipExpired ? '#dc2626' : undefined,
                                borderColor: isVipExpired ? '#ef4444' : undefined,
                                color: isVipExpired ? '#ffffff' : undefined
                            }}
                        >
                            <span>
                                {isVipExpired
                                    ? (appLanguage === 'ar' ? 'منتهي (تم حظر الوصول)' : 'Expiré (Accès VIP Bloqué)')
                                    : (intStatus === 'available'
                                        ? (isLoggedIn ? (t.interBtnLogged || t.interBtn) : t.interBtn)
                                        : (intStatus === 'unavailable'
                                            ? (appLanguage === 'ar' ? 'غير متوفر' : 'Non disponible')
                                            : (appLanguage === 'ar' ? 'قريباً جداً' : 'Bientôt disponible')))}
                            </span>
                        </button>
                    </div>

                    {/* 3. VIP CARD REMOVED */}

                </div>
            </main>

            {/* --- VALUE PROPOSITION SECTION --- */}
            <section className="value-proposition" style={{ position: 'relative' }}>
                {isAdmin && (
                    <button className="edit-section-btn" onClick={() => setActiveEditSection('why')} title="Modifier">
                        <FaEdit size={14} />
                    </button>
                )}
                <h3>{t.whyTitle}</h3>
                <div className="value-grid">
                    <div className="value-item">
                        <div className="value-icon">
                            <FaUsers />
                        </div>
                        <h4 className="value-title">{t.why1Title}</h4>
                        <p className="value-desc">{t.why1Desc}</p>
                    </div>
                    <div className="value-item">
                        <div className="value-icon">
                            <FaAward />
                        </div>
                        <h4 className="value-title">{t.why2Title}</h4>
                        <p className="value-desc">{t.why2Desc}</p>
                    </div>
                    <div className="value-item">
                        <div className="value-icon">
                            <FaClock />
                        </div>
                        <h4 className="value-title">{t.why3Title}</h4>
                        <p className="value-desc">{t.why3Desc}</p>
                    </div>
                </div>
            </section>

            <Footer />

            {/* --- 🛠️ EDIT MODALS FOR ADMIN 🛠️ --- */}
            {activeEditSection && (
                <div className="offre-edit-modal-backdrop" onClick={() => setActiveEditSection(null)}>
                    <div className="offre-edit-modal" onClick={e => e.stopPropagation()}>
                        <button className="offre-edit-modal-close" onClick={() => setActiveEditSection(null)}>
                            <FaTimes />
                        </button>

                        <h2 className="offre-edit-modal-title">
                            {appLanguage === 'ar' ? 'تعديل المحتوى' : 'Modifier le contenu'} ({appLanguage.toUpperCase()})
                        </h2>

                        <div className="offre-edit-form-content">

                            {/* HERO EDIT */}
                            {activeEditSection === 'hero' && (
                                <>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'شارة العنوان الفرعي' : 'Badge'}</label>
                                        <input type="text" value={editContent[appLanguage]?.badge || ''} onChange={e => handleFieldChange('badge', e.target.value)} />
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'العنوان الرئيسي' : 'Titre principal'}</label>
                                        <input type="text" value={editContent[appLanguage]?.title || ''} onChange={e => handleFieldChange('title', e.target.value)} />
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'الوصف' : 'Description'}</label>
                                        <textarea rows={4} value={editContent[appLanguage]?.subtitle || ''} onChange={e => handleFieldChange('subtitle', e.target.value)} />
                                    </div>
                                </>
                            )}

                            {/* BEGINNER CARD EDIT */}
                            {activeEditSection === 'beginner' && (
                                <>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'حالة العرض' : "Statut de l'offre"}</label>
                                        <select
                                            value={editContent[appLanguage]?.beginnerStatus || 'available'}
                                            onChange={e => handleFieldChange('beginnerStatus', e.target.value)}
                                        >
                                            <option value="available">{appLanguage === 'ar' ? 'متوفر' : 'Disponible'}</option>
                                            <option value="unavailable">{appLanguage === 'ar' ? 'غير متوفر' : 'Non disponible'}</option>
                                            <option value="soon">{appLanguage === 'ar' ? 'قريباً' : 'Bientôt'}</option>
                                        </select>
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'أيقونة الكارت' : "Icône de la carte"}</label>
                                        <select
                                            value={editContent[appLanguage]?.beginnerIcon || 'graduation'}
                                            onChange={e => handleFieldChange('beginnerIcon', e.target.value)}
                                        >
                                            <option value="graduation">🎓 {appLanguage === 'ar' ? 'قبعة التخرج' : 'Chapeau académique'}</option>
                                            <option value="cut">✂️ {appLanguage === 'ar' ? 'مقص الخياطة' : 'Ciseaux'}</option>
                                            <option value="crown">👑 {appLanguage === 'ar' ? 'تاج ملكي' : 'Couronne VIP'}</option>
                                            <option value="tshirt">👕 {appLanguage === 'ar' ? 'قميص / ملابس' : 'T-shirt'}</option>
                                            <option value="heart">❤️ {appLanguage === 'ar' ? 'قلب (شغف)' : 'Cœur'}</option>
                                            <option value="star">⭐ {appLanguage === 'ar' ? 'نجمة (تميز)' : 'Étoile'}</option>
                                            <option value="gem">💎 {appLanguage === 'ar' ? 'جوهرة (فاخر)' : 'Diamant / Gemme'}</option>
                                            <option value="book">📖 {appLanguage === 'ar' ? 'كتاب مفتوح' : 'Livre'}</option>
                                            <option value="magic">🪄 {appLanguage === 'ar' ? 'سحر الإبداع' : 'Magie / Création'}</option>
                                            <option value="ribbon">🎀 {appLanguage === 'ar' ? 'شريط تزيين' : 'Ruban'}</option>
                                            <option value="lightbulb">💡 {appLanguage === 'ar' ? 'فكرة / ذكاء' : 'Idée'}</option>
                                        </select>
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'لون الكارت' : 'Couleur de la carte'}</label>
                                        <div className="color-palette-container" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '5px' }}>
                                            {[
                                                { hex: '#0f172a', label: 'Default' },
                                                { hex: '#062c23', label: 'Emerald' },
                                                { hex: '#1a103c', label: 'Violet' },
                                                { hex: '#2d0b16', label: 'Burgundy' },
                                                { hex: '#221a0f', label: 'Bronze' },
                                                { hex: '#121212', label: 'Charcoal' }
                                            ].map(color => (
                                                <button
                                                    key={color.hex}
                                                    type="button"
                                                    className="color-palette-circle"
                                                    style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '50%',
                                                        backgroundColor: color.hex,
                                                        border: (editContent[appLanguage]?.beginnerBg || '#0f172a') === color.hex ? '3px solid #d4af37' : '1px solid rgba(255,255,255,0.2)',
                                                        cursor: 'pointer',
                                                        boxShadow: (editContent[appLanguage]?.beginnerBg || '#0f172a') === color.hex ? '0 0 8px #d4af37' : 'none',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onClick={() => handleFieldChange('beginnerBg', color.hex)}
                                                    title={color.label}
                                                />
                                            ))}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginInlineStart: '10px' }}>
                                                <input
                                                    type="color"
                                                    className="custom-color-input"
                                                    value={editContent[appLanguage]?.beginnerBg || '#0f172a'}
                                                    onChange={e => handleFieldChange('beginnerBg', e.target.value)}
                                                />
                                                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                                    {appLanguage === 'ar' ? 'مخصص' : 'Personnalisé'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'صورة الكارت' : "Image de la carte"}</label>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <input
                                                type="text"
                                                value={editContent[appLanguage]?.beginnerImage || ''}
                                                onChange={e => handleFieldChange('beginnerImage', e.target.value)}
                                                placeholder="https://..."
                                            />
                                            <input
                                                type="file"
                                                id="beginner-upload"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={e => handleModalFileUpload(e, 'beginnerImage')}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => document.getElementById('beginner-upload').click()}
                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '50px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: '#d4af37', borderRadius: '14px', cursor: 'pointer' }}
                                            >
                                                <FaCloudUploadAlt size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'عنوان الكارت' : 'Titre de la carte'}</label>
                                        <input type="text" value={editContent[appLanguage]?.beginnerTitle || ''} onChange={e => handleFieldChange('beginnerTitle', e.target.value)} />
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'العنوان الفرعي للمستوى' : 'Sous-titre niveau'}</label>
                                        <input type="text" value={editContent[appLanguage]?.beginnerSub || ''} onChange={e => handleFieldChange('beginnerSub', e.target.value)} />
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'الوصف' : 'Description'}</label>
                                        <textarea rows={3} value={editContent[appLanguage]?.beginnerDesc || ''} onChange={e => handleFieldChange('beginnerDesc', e.target.value)} />
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'السعر الافتراضي' : 'Prix par défaut'}</label>
                                        <input type="text" value={editContent[appLanguage]?.beginnerPrice || ''} onChange={e => handleFieldChange('beginnerPrice', e.target.value)} />
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'الفترة الافتراضية (مثال: / شهرياً)' : 'Période par défaut (Ex: / mois)'}</label>
                                        <input type="text" value={editContent[appLanguage]?.period || ''} onChange={e => handleFieldChange('period', e.target.value)} />
                                    </div>

                                    {/* DURATION & PRICING OPTIONS MANAGER (ADMIN) */}
                                    <div className="offre-edit-form-group duration-options-manager-group">
                                        <label className="manager-title-label">
                                            {appLanguage === 'ar' ? '⚙️ خيارات المدد والأسعار (التي تظهر للمستخدم)' : '⚙️ Options de durées et tarifs'}
                                        </label>
                                        <div className="duration-options-list">
                                            {((editContent[appLanguage]?.beginnerPricingOptions) || []).map((opt, idx) => (
                                                <div key={idx} className="duration-option-row">
                                                    <input
                                                        type="text"
                                                        placeholder={appLanguage === 'ar' ? 'المدة (مثلاً: 3 أشهر)' : 'Durée (Ex: 3 mois)'}
                                                        value={opt.duration || ''}
                                                        onChange={e => handleUpdateDurationOption('beginner', idx, 'duration', e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder={appLanguage === 'ar' ? 'السعر' : 'Prix'}
                                                        value={opt.price || ''}
                                                        onChange={e => handleUpdateDurationOption('beginner', idx, 'price', e.target.value)}
                                                        style={{ width: '90px' }}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="remove-duration-btn"
                                                        onClick={() => handleRemoveDurationOption('beginner', idx)}
                                                        title={appLanguage === 'ar' ? 'حذف' : 'Supprimer'}
                                                    >
                                                        <FaTrash size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            className="add-duration-btn"
                                            onClick={() => handleAddDurationOption('beginner')}
                                        >
                                            <FaPlus size={12} /> {appLanguage === 'ar' ? 'إضافة مدة وسعر جديد' : 'Ajouter une durée/prix'}
                                        </button>
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'زر الطلب (قبل تسجيل الدخول)' : 'Bouton d\'action (Avant connexion)'}</label>
                                        <input type="text" value={editContent[appLanguage]?.beginnerBtn || ''} onChange={e => handleFieldChange('beginnerBtn', e.target.value)} />
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'زر الطلب (بعد تسجيل الدخول)' : 'Bouton d\'action (Après connexion)'}</label>
                                        <input type="text" value={editContent[appLanguage]?.beginnerBtnLogged || ''} onChange={e => handleFieldChange('beginnerBtnLogged', e.target.value)} />
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'المميزات' : 'Caractéristiques (5 items)'}</label>
                                        {Array.from({ length: 5 }).map((_, idx) => (
                                            <input
                                                key={idx}
                                                type="text"
                                                style={{ marginBottom: '8px' }}
                                                value={(editContent[appLanguage]?.beginnerFeatures || [])[idx] || ''}
                                                onChange={e => handleListFieldChange('beginnerFeatures', idx, e.target.value)}
                                            />
                                        ))}
                                    </div>

                                    {/* --- Trial Lesson Settings --- */}
                                    <div className="offre-edit-form-group" style={{ borderTop: '1px solid rgba(212,175,55,0.2)', paddingTop: '16px', marginTop: '8px' }}>
                                        <label style={{ color: '#d4af37', fontWeight: 800 }}>
                                            {appLanguage === 'ar' ? '⚙️ زر الدرس التجريبي المجاني' : '⚙️ Bouton de leçon d\'essai gratuite'}
                                        </label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 600 }}>
                                                <input
                                                    type="checkbox"
                                                    checked={!!editContent[appLanguage]?.beginnerTrialEnabled}
                                                    onChange={e => handleFieldChange('beginnerTrialEnabled', e.target.checked)}
                                                    style={{ width: '18px', height: '18px', accentColor: '#d4af37' }}
                                                />
                                                {appLanguage === 'ar' ? 'تفعيل الزر' : 'Activer le bouton'}
                                            </label>
                                        </div>
                                        <label style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>
                                            {appLanguage === 'ar' ? 'نص الزر' : 'Texte du bouton'}
                                        </label>
                                        <input
                                            type="text"
                                            value={editContent[appLanguage]?.beginnerTrialBtnText || ''}
                                            onChange={e => handleFieldChange('beginnerTrialBtnText', e.target.value)}
                                            placeholder={appLanguage === 'ar' ? 'جرب درساً مجاناً' : 'Tester une leçon gratuite'}
                                            style={{ marginBottom: '8px' }}
                                        />
                                        <label style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>
                                            {appLanguage === 'ar' ? 'رابط الدرس التجريبي' : 'URL de la leçon d\'essai'}
                                        </label>
                                        <input
                                            type="text"
                                            value={editContent[appLanguage]?.beginnerTrialUrl || ''}
                                            onChange={e => handleFieldChange('beginnerTrialUrl', e.target.value)}
                                            placeholder="/les_leçons/Nom-Du-Cours"
                                        />
                                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                                            {appLanguage === 'ar'
                                                ? 'نصيحة: ضع الرابط الكامل لصفحة الدرس، مثل: /les_leçons/اسم-الكورس'
                                                : 'Conseil : entrez le chemin complet vers la page du cours, ex: /les_leçons/Nom-Du-Cours'}
                                        </p>
                                    </div>
                                </>
                            )}

                            {/* INTERMEDIATE CARD EDIT */}
                            {activeEditSection === 'inter' && (
                                <>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'حالة العرض' : "Statut de l'offre"}</label>
                                        <select
                                            value={editContent[appLanguage]?.interStatus || 'available'}
                                            onChange={e => handleFieldChange('interStatus', e.target.value)}
                                        >
                                            <option value="available">{appLanguage === 'ar' ? 'متوفر' : 'Disponible'}</option>
                                            <option value="unavailable">{appLanguage === 'ar' ? 'غير متوفر' : 'Non disponible'}</option>
                                            <option value="soon">{appLanguage === 'ar' ? 'قريباً' : 'Bientôt'}</option>
                                        </select>
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'أيقونة الكارت' : "Icône de la carte"}</label>
                                        <select
                                            value={editContent[appLanguage]?.interIcon || 'cut'}
                                            onChange={e => handleFieldChange('interIcon', e.target.value)}
                                        >
                                            <option value="graduation">🎓 {appLanguage === 'ar' ? 'قبعة التخرج' : 'Chapeau académique'}</option>
                                            <option value="cut">✂️ {appLanguage === 'ar' ? 'مقص الخياطة' : 'Ciseaux'}</option>
                                            <option value="crown">👑 {appLanguage === 'ar' ? 'تاج ملكي' : 'Couronne VIP'}</option>
                                            <option value="tshirt">👕 {appLanguage === 'ar' ? 'قميص / ملابس' : 'T-shirt'}</option>
                                            <option value="heart">❤️ {appLanguage === 'ar' ? 'قلب (شغف)' : 'Cœur'}</option>
                                            <option value="star">⭐ {appLanguage === 'ar' ? 'نجمة (تميز)' : 'Étoile'}</option>
                                            <option value="gem">💎 {appLanguage === 'ar' ? 'جوهرة (فاخر)' : 'Diamant / Gemme'}</option>
                                            <option value="book">📖 {appLanguage === 'ar' ? 'كتاب مفتوح' : 'Livre'}</option>
                                            <option value="magic">🪄 {appLanguage === 'ar' ? 'سحر الإبداع' : 'Magie / Création'}</option>
                                            <option value="ribbon">🎀 {appLanguage === 'ar' ? 'شريط تزيين' : 'Ruban'}</option>
                                            <option value="lightbulb">💡 {appLanguage === 'ar' ? 'فكرة / ذكاء' : 'Idée'}</option>
                                        </select>
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'لون الكارت' : 'Couleur de la carte'}</label>
                                        <div className="color-palette-container" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '5px' }}>
                                            {[
                                                { hex: '#0d1527', label: 'Default' },
                                                { hex: '#062c23', label: 'Emerald' },
                                                { hex: '#1a103c', label: 'Violet' },
                                                { hex: '#2d0b16', label: 'Burgundy' },
                                                { hex: '#221a0f', label: 'Bronze' },
                                                { hex: '#121212', label: 'Charcoal' }
                                            ].map(color => (
                                                <button
                                                    key={color.hex}
                                                    type="button"
                                                    className="color-palette-circle"
                                                    style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '50%',
                                                        backgroundColor: color.hex,
                                                        border: (editContent[appLanguage]?.interBg || '#0d1527') === color.hex ? '3px solid #d4af37' : '1px solid rgba(255,255,255,0.2)',
                                                        cursor: 'pointer',
                                                        boxShadow: (editContent[appLanguage]?.interBg || '#0d1527') === color.hex ? '0 0 8px #d4af37' : 'none',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onClick={() => handleFieldChange('interBg', color.hex)}
                                                    title={color.label}
                                                />
                                            ))}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginInlineStart: '10px' }}>
                                                <input
                                                    type="color"
                                                    className="custom-color-input"
                                                    value={editContent[appLanguage]?.interBg || '#0d1527'}
                                                    onChange={e => handleFieldChange('interBg', e.target.value)}
                                                />
                                                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                                    {appLanguage === 'ar' ? 'مخصص' : 'Personnalisé'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'صورة الكارت' : "Image de la carte"}</label>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <input
                                                type="text"
                                                value={editContent[appLanguage]?.interImage || ''}
                                                onChange={e => handleFieldChange('interImage', e.target.value)}
                                                placeholder="https://..."
                                            />
                                            <input
                                                type="file"
                                                id="inter-upload"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={e => handleModalFileUpload(e, 'interImage')}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => document.getElementById('inter-upload').click()}
                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '50px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: '#d4af37', borderRadius: '14px', cursor: 'pointer' }}
                                            >
                                                <FaCloudUploadAlt size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'عنوان الكارت' : 'Titre de la carte'}</label>
                                        <input type="text" value={editContent[appLanguage]?.interTitle || ''} onChange={e => handleFieldChange('interTitle', e.target.value)} />
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'العنوان الفرعي للمستوى' : 'Sous-titre niveau'}</label>
                                        <input type="text" value={editContent[appLanguage]?.interSub || ''} onChange={e => handleFieldChange('interSub', e.target.value)} />
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'الوصف' : 'Description'}</label>
                                        <textarea rows={3} value={editContent[appLanguage]?.interDesc || ''} onChange={e => handleFieldChange('interDesc', e.target.value)} />
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'السعر الافتراضي' : 'Prix par défaut'}</label>
                                        <input type="text" value={editContent[appLanguage]?.interPrice || ''} onChange={e => handleFieldChange('interPrice', e.target.value)} />
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'الفترة الافتراضية (مثال: / شهرياً)' : 'Période par défaut (Ex: / mois)'}</label>
                                        <input type="text" value={editContent[appLanguage]?.period || ''} onChange={e => handleFieldChange('period', e.target.value)} />
                                    </div>

                                    {/* DURATION & PRICING OPTIONS MANAGER (ADMIN) */}
                                    <div className="offre-edit-form-group duration-options-manager-group">
                                        <label className="manager-title-label">
                                            {appLanguage === 'ar' ? '⚙️ خيارات المدد والأسعار (التي تظهر للمستخدم)' : '⚙️ Options de durées et tarifs'}
                                        </label>
                                        <div className="duration-options-list">
                                            {((editContent[appLanguage]?.interPricingOptions) || []).map((opt, idx) => (
                                                <div key={idx} className="duration-option-row">
                                                    <input
                                                        type="text"
                                                        placeholder={appLanguage === 'ar' ? 'المدة (مثلاً: 3 أشهر)' : 'Durée (Ex: 3 mois)'}
                                                        value={opt.duration || ''}
                                                        onChange={e => handleUpdateDurationOption('inter', idx, 'duration', e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder={appLanguage === 'ar' ? 'السعر' : 'Prix'}
                                                        value={opt.price || ''}
                                                        onChange={e => handleUpdateDurationOption('inter', idx, 'price', e.target.value)}
                                                        style={{ width: '90px' }}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="remove-duration-btn"
                                                        onClick={() => handleRemoveDurationOption('inter', idx)}
                                                        title={appLanguage === 'ar' ? 'حذف' : 'Supprimer'}
                                                    >
                                                        <FaTrash size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            className="add-duration-btn"
                                            onClick={() => handleAddDurationOption('inter')}
                                        >
                                            <FaPlus size={12} /> {appLanguage === 'ar' ? 'إضافة مدة وسعر جديد' : 'Ajouter une durée/prix'}
                                        </button>
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'شارة مميزة (مثال: الأكثر طلباً)' : 'Badge populaire'}</label>
                                        <input type="text" value={editContent[appLanguage]?.popular || ''} onChange={e => handleFieldChange('popular', e.target.value)} />
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'زر الطلب (قبل تسجيل الدخول)' : 'Bouton d\'action (Avant connexion)'}</label>
                                        <input type="text" value={editContent[appLanguage]?.interBtn || ''} onChange={e => handleFieldChange('interBtn', e.target.value)} />
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'زر الطلب (بعد تسجيل الدخول)' : 'Bouton d\'action (Après connexion)'}</label>
                                        <input type="text" value={editContent[appLanguage]?.interBtnLogged || ''} onChange={e => handleFieldChange('interBtnLogged', e.target.value)} />
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'المميزات' : 'Caractéristiques (5 items)'}</label>
                                        {Array.from({ length: 5 }).map((_, idx) => (
                                            <input
                                                key={idx}
                                                type="text"
                                                style={{ marginBottom: '8px' }}
                                                value={(editContent[appLanguage]?.interFeatures || [])[idx] || ''}
                                                onChange={e => handleListFieldChange('interFeatures', idx, e.target.value)}
                                            />
                                        ))}
                                    </div>

                                    {/* --- Trial Lesson Settings --- */}
                                    <div className="offre-edit-form-group" style={{ borderTop: '1px solid rgba(212,175,55,0.2)', paddingTop: '16px', marginTop: '8px' }}>
                                        <label style={{ color: '#d4af37', fontWeight: 800 }}>
                                            {appLanguage === 'ar' ? '⚙️ زر الدرس التجريبي المجاني' : '⚙️ Bouton de leçon d\'essai gratuite'}
                                        </label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 600 }}>
                                                <input
                                                    type="checkbox"
                                                    checked={!!editContent[appLanguage]?.interTrialEnabled}
                                                    onChange={e => handleFieldChange('interTrialEnabled', e.target.checked)}
                                                    style={{ width: '18px', height: '18px', accentColor: '#d4af37' }}
                                                />
                                                {appLanguage === 'ar' ? 'تفعيل الزر' : 'Activer le bouton'}
                                            </label>
                                        </div>
                                        <label style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>
                                            {appLanguage === 'ar' ? 'نص الزر' : 'Texte du bouton'}
                                        </label>
                                        <input
                                            type="text"
                                            value={editContent[appLanguage]?.interTrialBtnText || ''}
                                            onChange={e => handleFieldChange('interTrialBtnText', e.target.value)}
                                            placeholder={appLanguage === 'ar' ? 'جرب درساً مجاناً' : 'Tester une leçon gratuite'}
                                            style={{ marginBottom: '8px' }}
                                        />
                                        <label style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>
                                            {appLanguage === 'ar' ? 'رابط الدرس التجريبي' : 'URL de la leçon d\'essai'}
                                        </label>
                                        <input
                                            type="text"
                                            value={editContent[appLanguage]?.interTrialUrl || ''}
                                            onChange={e => handleFieldChange('interTrialUrl', e.target.value)}
                                            placeholder="/les_leçons/Nom-Du-Cours"
                                        />
                                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                                            {appLanguage === 'ar'
                                                ? 'نصيحة: ضع الرابط الكامل لصفحة الدرس، مثل: /les_leçons/اسم-الكورس'
                                                : 'Conseil : entrez le chemin complet vers la page du cours, ex: /les_leçons/Nom-Du-Cours'}
                                        </p>
                                    </div>
                                </>
                            )}

                            {/* VIP CARD EDIT */}
                            {activeEditSection === 'vip' && (
                                <>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'حالة العرض' : "Statut de l'offre"}</label>
                                        <select
                                            value={editContent[appLanguage]?.vipStatus || 'available'}
                                            onChange={e => handleFieldChange('vipStatus', e.target.value)}
                                        >
                                            <option value="available">{appLanguage === 'ar' ? 'متوفر' : 'Disponible'}</option>
                                            <option value="unavailable">{appLanguage === 'ar' ? 'غير متوفر' : 'Non disponible'}</option>
                                            <option value="soon">{appLanguage === 'ar' ? 'قريباً' : 'Bientôt'}</option>
                                        </select>
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'أيقونة الكارت' : "Icône de la carte"}</label>
                                        <select
                                            value={editContent[appLanguage]?.vipIcon || 'crown'}
                                            onChange={e => handleFieldChange('vipIcon', e.target.value)}
                                        >
                                            <option value="graduation">🎓 {appLanguage === 'ar' ? 'قبعة التخرج' : 'Chapeau académique'}</option>
                                            <option value="cut">✂️ {appLanguage === 'ar' ? 'مقص الخياطة' : 'Ciseaux'}</option>
                                            <option value="crown">👑 {appLanguage === 'ar' ? 'تاج ملكي' : 'Couronne VIP'}</option>
                                            <option value="tshirt">👕 {appLanguage === 'ar' ? 'قميص / ملابس' : 'T-shirt'}</option>
                                            <option value="heart">❤️ {appLanguage === 'ar' ? 'قلب (شغف)' : 'Cœur'}</option>
                                            <option value="star">⭐ {appLanguage === 'ar' ? 'نجمة (تميز)' : 'Étoile'}</option>
                                            <option value="gem">💎 {appLanguage === 'ar' ? 'جوهرة (فاخر)' : 'Diamant / Gemme'}</option>
                                            <option value="book">📖 {appLanguage === 'ar' ? 'كتاب مفتوح' : 'Livre'}</option>
                                            <option value="magic">🪄 {appLanguage === 'ar' ? 'سحر الإبداع' : 'Magie / Création'}</option>
                                            <option value="ribbon">🎀 {appLanguage === 'ar' ? 'شريط تزيين' : 'Ruban'}</option>
                                            <option value="lightbulb">💡 {appLanguage === 'ar' ? 'فكرة / ذكاء' : 'Idée'}</option>
                                        </select>
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'لون الكارت' : 'Couleur de la carte'}</label>
                                        <div className="color-palette-container" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '5px' }}>
                                            {[
                                                { hex: '#0f172a', label: 'Default' },
                                                { hex: '#062c23', label: 'Emerald' },
                                                { hex: '#1a103c', label: 'Violet' },
                                                { hex: '#2d0b16', label: 'Burgundy' },
                                                { hex: '#221a0f', label: 'Bronze' },
                                                { hex: '#121212', label: 'Charcoal' }
                                            ].map(color => (
                                                <button
                                                    key={color.hex}
                                                    type="button"
                                                    className="color-palette-circle"
                                                    style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '50%',
                                                        backgroundColor: color.hex,
                                                        border: (editContent[appLanguage]?.vipBg || '#0f172a') === color.hex ? '3px solid #d4af37' : '1px solid rgba(255,255,255,0.2)',
                                                        cursor: 'pointer',
                                                        boxShadow: (editContent[appLanguage]?.vipBg || '#0f172a') === color.hex ? '0 0 8px #d4af37' : 'none',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onClick={() => handleFieldChange('vipBg', color.hex)}
                                                    title={color.label}
                                                />
                                            ))}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginInlineStart: '10px' }}>
                                                <input
                                                    type="color"
                                                    className="custom-color-input"
                                                    value={editContent[appLanguage]?.vipBg || '#0f172a'}
                                                    onChange={e => handleFieldChange('vipBg', e.target.value)}
                                                />
                                                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                                    {appLanguage === 'ar' ? 'مخصص' : 'Personnalisé'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'صورة الكارت' : "Image de la carte"}</label>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <input
                                                type="text"
                                                value={editContent[appLanguage]?.vipImage || ''}
                                                onChange={e => handleFieldChange('vipImage', e.target.value)}
                                                placeholder="https://..."
                                            />
                                            <input
                                                type="file"
                                                id="vip-upload"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={e => handleModalFileUpload(e, 'vipImage')}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => document.getElementById('vip-upload').click()}
                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '50px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: '#d4af37', borderRadius: '14px', cursor: 'pointer' }}
                                            >
                                                <FaCloudUploadAlt size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'عنوان الكارت' : 'Titre de la carte'}</label>
                                        <input type="text" value={editContent[appLanguage]?.vipTitle || ''} onChange={e => handleFieldChange('vipTitle', e.target.value)} />
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'العنوان الفرعي للمستوى' : 'Sous-titre niveau'}</label>
                                        <input type="text" value={editContent[appLanguage]?.vipSub || ''} onChange={e => handleFieldChange('vipSub', e.target.value)} />
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'الوصف' : 'Description'}</label>
                                        <textarea rows={3} value={editContent[appLanguage]?.vipDesc || ''} onChange={e => handleFieldChange('vipDesc', e.target.value)} />
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'السعر' : 'Prix'}</label>
                                        <input type="text" value={editContent[appLanguage]?.vipPrice || ''} onChange={e => handleFieldChange('vipPrice', e.target.value)} />
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'الفترة (مثال: / شهرياً)' : 'Période (Ex: / mois)'}</label>
                                        <input type="text" value={editContent[appLanguage]?.period || ''} onChange={e => handleFieldChange('period', e.target.value)} />
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'زر الطلب (قبل تسجيل الدخول)' : 'Bouton d\'action (Avant connexion)'}</label>
                                        <input type="text" value={editContent[appLanguage]?.vipBtn || ''} onChange={e => handleFieldChange('vipBtn', e.target.value)} />
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'زر الطلب (بعد تسجيل الدخول)' : 'Bouton d\'action (Après connexion)'}</label>
                                        <input type="text" value={editContent[appLanguage]?.vipBtnLogged || ''} onChange={e => handleFieldChange('vipBtnLogged', e.target.value)} />
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'المميزات' : 'Caractéristiques (5 items)'}</label>
                                        {Array.from({ length: 5 }).map((_, idx) => (
                                            <input
                                                key={idx}
                                                type="text"
                                                style={{ marginBottom: '8px' }}
                                                value={(editContent[appLanguage]?.vipFeatures || [])[idx] || ''}
                                                onChange={e => handleListFieldChange('vipFeatures', idx, e.target.value)}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* WHY US SECTION EDIT */}
                            {activeEditSection === 'why' && (
                                <>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'عنوان القسم' : 'Titre de la section'}</label>
                                        <input type="text" value={editContent[appLanguage]?.whyTitle || ''} onChange={e => handleFieldChange('whyTitle', e.target.value)} />
                                    </div>

                                    <hr style={{ border: 'none', height: '1px', background: 'rgba(255,255,255,0.08)', margin: '20px 0' }} />

                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'الميزة 1: العنوان' : 'Caractéristique 1: Titre'}</label>
                                        <input type="text" value={editContent[appLanguage]?.why1Title || ''} onChange={e => handleFieldChange('why1Title', e.target.value)} />
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'الميزة 1: الوصف' : 'Caractéristique 1: Description'}</label>
                                        <textarea rows={2} value={editContent[appLanguage]?.why1Desc || ''} onChange={e => handleFieldChange('why1Desc', e.target.value)} />
                                    </div>

                                    <hr style={{ border: 'none', height: '1px', background: 'rgba(255,255,255,0.08)', margin: '20px 0' }} />

                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'الميزة 2: العنوان' : 'Caractéristique 2: Titre'}</label>
                                        <input type="text" value={editContent[appLanguage]?.why2Title || ''} onChange={e => handleFieldChange('why2Title', e.target.value)} />
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'الميزة 2: الوصف' : 'Caractéristique 2: Description'}</label>
                                        <textarea rows={2} value={editContent[appLanguage]?.why2Desc || ''} onChange={e => handleFieldChange('why2Desc', e.target.value)} />
                                    </div>

                                    <hr style={{ border: 'none', height: '1px', background: 'rgba(255,255,255,0.08)', margin: '20px 0' }} />

                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'الميزة 3: العنوان' : 'Caractéristique 3: Titre'}</label>
                                        <input type="text" value={editContent[appLanguage]?.why3Title || ''} onChange={e => handleFieldChange('why3Title', e.target.value)} />
                                    </div>
                                    <div className="offre-edit-form-group">
                                        <label>{appLanguage === 'ar' ? 'الميزة 3: الوصف' : 'Caractéristique 3: Description'}</label>
                                        <textarea rows={2} value={editContent[appLanguage]?.why3Desc || ''} onChange={e => handleFieldChange('why3Desc', e.target.value)} />
                                    </div>
                                </>
                            )}

                        </div>

                        <div className="offre-edit-btn-group">
                            <button className="secondary" onClick={() => setActiveEditSection(null)}>
                                {appLanguage === 'ar' ? 'إلغاء' : 'Annuler'}
                            </button>
                            <button className="gold" onClick={handleSaveContent}>
                                {appLanguage === 'ar' ? 'حفظ التغييرات' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🛑 Modal Accès Limité */}
            {showVipModal && (
                <div className="premium-modal-backdrop" onClick={() => !isSubmittingVip && setShowVipModal(false)}>
                    <div className="creative-modal-content" onClick={(e) => e.stopPropagation()} style={{ overflow: 'visible' }}>
                        <div className="creative-crown-wrapper">
                            <FaCrown />
                        </div>

                        <div className="creative-modal-header">
                            <button className="creative-close-btn" onClick={() => setShowVipModal(false)}><FaTimes /></button>
                            <h2 className="creative-title">{mt.limitedAccess}</h2>
                        </div>

                        <div className="creative-modal-body">
                            {!vipRequestSuccess ? (
                                <>
                                    <p className="creative-subtitle">{mt.vipMessage}</p>
                                    {selectedCardForModal && (
                                        <div style={{
                                            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(15, 23, 42, 0.6))',
                                            border: '1px solid #d4af37',
                                            borderRadius: '12px',
                                            padding: '10px 16px',
                                            margin: '0 auto 15px auto',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            width: '100%',
                                            color: '#ffffff',
                                            fontSize: '0.92rem',
                                            fontWeight: 'bold'
                                        }}>
                                            <span>{getCoursePlanDetails(selectedCardForModal).courseTitle}</span>
                                            <span style={{ color: '#d4af37', fontSize: '1.05rem' }}>{getCoursePlanDetails(selectedCardForModal).selectedPriceStr}</span>
                                        </div>
                                    )}
                                    <div className="creative-benefit-pill">{mt.vipBenefits}</div>
                                    <form onSubmit={handleVipRequest} style={{ width: '100%' }}>
                                        <div className="creative-input-group">
                                            <label>{mt.phoneLabel}</label>
                                            <div className="creative-input-wrapper">
                                                <FaPhoneAlt />
                                                <input type="tel" placeholder="Ex: 22 222 222" value={vipPhone} onChange={(e) => setVipPhone(e.target.value.replace(/\D/g, ''))} minLength={8} required className="creative-input" />
                                            </div>
                                        </div>
                                        <div className="creative-input-group">
                                            <label>{mt.nameLabel}</label>
                                            <div className="creative-input-wrapper">
                                                <FaUser />
                                                <input type="text" placeholder={mt.namePlaceholder} value={vipFullName} onChange={(e) => setVipFullName(e.target.value.replace(/[^a-zA-Z\s\u0600-\u06FF]/g, ''))} required className="creative-input" />
                                            </div>
                                        </div>
                                        <button type="submit" className="creative-submit-btn" disabled={isSubmittingVip}>
                                            {isSubmittingVip ? mt.sendingBtn : mt.submitBtn}
                                        </button>
                                        <button type="button" className="creative-later-btn" onClick={() => setShowVipModal(false)}>
                                            {mt.laterBtn}
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <div style={{ padding: '15px 0' }}>
                                    <div className="success-icon-badge"><FaCheckCircle /></div>
                                    <h3 style={{ color: '#0f172a', fontSize: '1.6rem', marginBottom: '10px', fontWeight: '900' }}>{mt.requestSentTitle}</h3>
                                    <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.6', maxWidth: '300px', margin: '0 auto' }}>{mt.requestSentMsg}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
