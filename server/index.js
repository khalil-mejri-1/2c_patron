











// server.js (الكود النهائي المصحح والمؤمن - الآن يستخدم روابط URL بدلاً من الرفع المحلي للملفات)

// 1. استيراد الوحدات (Imports)
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { GoogleGenAI } = require("@google/genai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
// Note: In the new @google/genai SDK, we don't call getGenerativeModel on the top level
// We call models.generateContent directly on the instance

// --- 🤖 AI MODELS CHECK ---
(async () => {
    try {
        const res = await genAI.models.list();
        console.log("✅ Models Response:", res);
        if (res.models) {
            res.models.map((m) => {
                console.log("👉 Model Name:", m.name);
            });
        }
    } catch (e) {
        console.error("❌ Error listing AI models:", e.message);
    }
})();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dzxxqr90c', // يجب تبديل هذا باسم الكلاود الخاص بك
    api_key: process.env.CLOUDINARY_API_KEY || '675683535499862',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'xwaWkEPrTyGmd-2Amq3_9319uYY'
});

const Command = require('./models/command.js');
// استيراد النماذج
const HomeProduct = require("./models/HomeProduct.js");

const Commentaire = require("./models/Commentaire.js");
const Abonnement = require('./models/Abonnement.js');
const Video = require('./models/Video.js');
const User = require("./models/user.js");
const Product = require("./models/Product.js");
const Message = require("./models/message.js");
const VipCategory = require('./models/VipCategory');
const SpecializedCourse = require('./models/SpecializedCourse.js');
const SpecializedVideo = require('./models/SpecializedVideo.js');
const SiteSetting = require('./models/SiteSetting.js');
const ShopCategory = require('./models/ShopCategory.js');

// 2. إنشاء تطبيق Express
const app = express();
const PORT = 3000;


// -------------------- A. MIDDLEWARE SETUP --------------------

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ ضروري لقراءة form-data


// -------------------- Multer Configuration --------------------
// نستعمل memoryStorage بدلاً من diskStorage لتفادي خطأ read-only system في Vercel
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Serve uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// -------------------- Cloudinary Upload Route --------------------
app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Aucun fichier fourni' });
        }
        // استخدام upload_stream لرفع الملف من الذاكرة مباشرة دون الحاجة لحفظه على قرص الخادم (Vercel يمنع ذلك)
        const stream = cloudinary.uploader.upload_stream(
            { resource_type: 'auto', folder: 'magasin' },
            (error, result) => {
                if (error) {
                    console.error("Erreur d'upload Cloudinary:", error);
                    return res.status(500).json({ message: 'Échec de l\'upload de l\'image', error: error.message });
                }
                res.status(200).json({ url: result.secure_url });
            }
        );
        stream.end(req.file.buffer);
    } catch (error) {
        console.error("Erreur d'upload:", error);
        res.status(500).json({ message: 'Échec de l\'upload', error: error.message });
    }
});


// --- B. MONGODB CONNECTION SETUP ---
const MONGODB_URI = 'mongodb+srv://2cparton0011:nYdiX2GXYnduOmyG@cluster0.07ov0j7.mongodb.net/?appName=Cluster0';

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('🎉 Successfully connected to MongoDB!');
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });


// -------------------- C. ROUTES --------------------
app.get('/favicon.ico', (req, res) => res.status(204).end());

// دالة متقدمة لاستخراج تفاصيل الجهاز (نوعه، نظامه، وإصداره)
const getDeviceInfoFromUA = (ua) => {
    if (!ua) return 'Inconnu';

    let info = '';

    // 1. تحديد نوع الجهاز الأساسي (حاسوب أم هاتف)
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/.test(ua);
    info += isMobile ? '📱 Mobile' : '💻 Ordinateur';

    // 2. تحديد نظام التشغيل والإصدار
    if (ua.includes('Windows NT 10.0')) {
        // ويندوز 10 و 11 يظهران كـ 10.0، لكن سنميز الويندوز بشكل عام
        info += ' (Windows 10/11)';
    } else if (ua.includes('Windows NT 6.3')) {
        info += ' (Windows 8.1)';
    } else if (ua.includes('Windows NT 6.2')) {
        info += ' (Windows 8)';
    } else if (ua.includes('Windows NT 6.1')) {
        info += ' (Windows 7)';
    } else if (ua.includes('iPhone')) {
        info += ' (iPhone)';
    } else if (ua.includes('iPad')) {
        info += ' (iPad)';
    } else if (ua.includes('Android')) {
        info += ' (Android)';
    } else if (ua.includes('Macintosh')) {
        info += ' (Mac OS)';
    } else if (ua.includes('Linux')) {
        info += ' (Linux)';
    }

    return info;
};

app.get('/', (req, res) => {
    res.send('Hello World! Connected to Express and MongoDB. 3/27/2026');
});

// **********************************************
// مسار بث الفيديو القديم (تم الإبقاء عليه كما هو للملفات المرفوعة سابقاً)
// **********************************************
// ⚠️ ملاحظة: هذا المسار سيعمل فقط مع الفيديوهات التي تم رفعها بالطريقة القديمة.
// الفيديوهات الجديدة التي تستخدم روابط URL يجب تشغيلها مباشرةً على الواجهة الأمامية.
app.get('/api/videos/stream/:id', async (req, res) => {
    try {
        // 1. جلب معلومات الفيديو من قاعدة البيانات
        const video = await Video.findById(req.params.id);

        if (!video || !video.fileName) { // إذا لم يكن هناك fileName (يعني رابط خارجي الآن)
            return res.status(404).send('الفيديو غير موجود أو يستخدم رابط خارجي.');
        }

        // ⛔ باقي الكود هنا يتطلب استيراد fs و path الذي تم حذفه
        // لن يعمل هذا المسار الآن حتى تعيد استيراد path و fs،
        // لكنني أبقيت عليه في الكود لأنه قد تكون لديك ملفات قديمة تحتاج بثها.
        // لتشغيل الكود بنجاح، يجب أن تستبدل هذا المسار بـ:
        return res.status(501).send('غير مدعوم: تحتاج لإعادة path و fs لتشغيل مسار البث القديم.');

        /* // إذا كنت تريد تشغيله، أعد استيراد path و fs وأزل السطر 501
        const filePath = path.join(__dirname, 'uploads', 'videos', video.fileName);
        if (!fs.existsSync(filePath)) {
          console.error(`الملف غير موجود في المسار: ${filePath}`);
          return res.status(404).send('لم يتم العثور على الملف الفيزيائي.');
        }
        const stat = fs.statSync(filePath);
        // ... (بقية كود البث)
        */

    } catch (error) {
        console.error("خطأ في بث الفيديو:", error);
        res.status(500).send("خطأ داخلي في الخادم.");
    }
});


// ----------------------------------------------------
// ⚠️ تم حذف دالة isAdmin لأنها لم تعد مطلوبة في مسار البث
// ----------------------------------------------------


// **********************************************
// مسارات المستخدمين (User Routes) - (دون تغيير)
// **********************************************

// ... (جميع مسارات المستخدمين هنا دون تغيير) ...
app.post('/api/login-google', async (req, res) => {
    try {
        const { mail, mot_de_pass } = req.body;
        const user = await User.findOne({ mail: mail });
        if (!user) return res.status(404).json({ error: 'User not found in database.' });

        const currentIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        // Skip IP lock for Admins
        if (user.statut !== 'admin') {
            if (!user.lockedIp) {
                user.lockedIp = currentIp;
                await user.save();
                return res.status(200).json({
                    firstLogin: true,
                    message: 'Login successful via Google. Device locked.',
                    id: user._id,
                    nom: user.nom,
                    image: user.image,
                    statut: user.statut,
                    abonne: user.abonne
                });
            } else if (user.lockedIp !== currentIp) {
                return res.status(403).json({
                    errorType: 'IP_LOCKED',
                    error: 'Accès restreint : الجهاز غير معترف به.'
                });
            }
        }

        if (user.mot_de_pass === mot_de_pass) {
            res.status(200).json({ message: 'Login successful via Google.', id: user._id, nom: user.nom, image: user.image, statut: user.statut, abonne: user.abonne, firstLogin: false });
        } else {
            res.status(401).json({ error: 'Email registered, but password/auth method mismatch.' });
        }
    } catch (error) {
        console.error('Error during Google login check:', error.message);
        res.status(500).json({ error: 'Internal server error during login.' });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const { nom, mail, mot_de_pass, image, statut, abonne } = req.body;

        const currentIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        const newUser = new User({
            nom,
            mail,
            mot_de_pass,
            image,
            statut: statut || 'client',
            abonne,
            lockedIp: (statut || 'client') === 'admin' ? null : currentIp,
            registrationIp: currentIp,
            deviceInfo: getDeviceInfoFromUA(req.headers['user-agent']),
            userAgent: req.headers['user-agent']
        });

        await newUser.save();

        res.status(201).json({
            message: 'User created successfully!',
            user: newUser,
            firstLogin: (statut || 'client') === 'admin' ? false : true
        });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ error: 'Email already exists.', details: error.message });
        console.error('Error creating user:', error.message);
        res.status(400).json({ error: 'Failed to create user', details: error.message });
    }
});

app.post('/api/login-traditional', async (req, res) => {
    try {
        const { mail, mot_de_pass } = req.body;
        const user = await User.findOne({ mail: mail });
        if (!user) return res.status(401).json({ error: 'E-mail ou mot de passe incorrect. Veuillez réessayer.' });

        if (user.mot_de_pass === mot_de_pass) {
            const currentIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

            // Skip IP lock for Admins
            if (user.statut !== 'admin') {
                if (!user.lockedIp) {
                    user.lockedIp = currentIp;
                    const ua = req.headers['user-agent'];
                    user.deviceInfo = getDeviceInfoFromUA(ua);
                    user.userAgent = ua;
                    await user.save();
                    return res.status(200).json({
                        firstLogin: true,
                        message: 'Connexion traditionnelle réussie. Appareil vérrouillé.',
                        id: user._id,
                        nom: user.nom,
                        image: user.image,
                        statut: user.statut,
                        abonne: user.abonne
                    });
                } else if (user.lockedIp !== currentIp) {
                    return res.status(403).json({
                        errorType: 'IP_LOCKED',
                        error: 'Accès restreint : الجهاز غير معترف به.'
                    });
                }
            }

            res.status(200).json({ message: 'Connexion traditionnelle réussie.', id: user._id, nom: user.nom, image: user.image, statut: user.statut, abonne: user.abonne, firstLogin: false });
        } else {
            res.status(401).json({ error: 'E-mail ou mot de passe incorrect. Veuillez réessayer.' });
        }
    } catch (error) {
        console.error('Error during traditional login:', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur lors de la connexion.' });
    }
});

// 🔍 Check Status by Email (Admin/VIP/Member)
app.get('/api/users/check-status', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: 'Email query parameter is required.' });

        const user = await User.findOne({ mail: email });
        if (!user) return res.status(404).json({ error: 'User not found.' });

        res.status(200).json({
            id: user._id,
            nom: user.nom,
            statut: user.statut,
            abonne: user.abonne
        });
    } catch (error) {
        console.error('Error checking user status:', error.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

app.get('/api/users/clients', async (req, res) => {
    try {
        const users = await User.find({}).select('-mot_de_pass');
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ error: 'Échec du chargement des données utilisateurs.' });
    }
});

app.put('/api/users/:id/statut', async (req, res) => {
    try {
        const { statut } = req.body;
        const userId = req.params.id;
        if (!statut || (statut !== 'admin' && statut !== 'client')) return res.status(400).json({ error: 'Statut invalide.' });
        const updatedUser = await User.findByIdAndUpdate(userId, { statut: statut }, { new: true, runValidators: true }).select('-mot_de_pass');
        if (!updatedUser) return res.status(404).json({ error: 'Utilisateur non trouvé.' });
        res.status(200).json({ message: 'Statut mis à jour avec succès.', user: updatedUser });
    } catch (error) {
        console.error('Error updating user statut:', error.message);
        res.status(500).json({ error: 'Échec de la mise à jour du statut.' });
    }
});


app.delete('/api/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        // 1. Trouver و supprimer l'utilisateur
        const deletedUser = await User.findByIdAndDelete(userId);

        // 2. Vérifier si l'utilisateur existait
        if (!deletedUser) {
            return res.status(404).json({ error: "Utilisateur non trouvé." });
        }

        // 3. Répondre avec succès
        res.status(200).json({ message: "Utilisateur supprimé avec succès." });

    } catch (error) {
        console.error("Erreur lors de la suppression de l'utilisateur:", error);
        // 4. Répondre en cas d'erreur serveur
        res.status(500).json({ error: "Erreur interne du serveur lors de la suppression." });
    }
});



app.put('/api/users/:id/abonne', async (req, res) => {
    try {
        const { abonne } = req.body;
        const userId = req.params.id;
        if (!abonne || (abonne !== 'oui' && abonne !== 'non')) return res.status(400).json({ error: 'Valeur d\'abonnement invalide (doit être "oui" أو "non").' });
        const updatedUser = await User.findByIdAndUpdate(userId, { abonne: abonne }, { new: true, runValidators: true }).select('-mot_de_pass');
        if (!updatedUser) return res.status(404).json({ error: 'Utilisateur non trouvé.' });
        res.status(200).json({ message: 'Statut d\'abonnement mis à jour avec succès.', user: updatedUser });
    } catch (error) {
        console.error('Error updating user abonne status:', error.message);
        res.status(500).json({ error: 'Échec de la mise à jour de l\'abonnement.' });
    }
});

// **********************************************
// مسارات المنتجات (Product Routes) - (دون تغيير)
// **********************************************

// ... (جميع مسارات المنتجات هنا دون تغيير) ...
// Product Model (يجب أن يكون مستوردًا هنا)
// const Product = require('./models/Product'); 

// 1. إضافة منتج (POST /api/products)
app.post('/api/products', async (req, res) => {
    try {
        // 💡 لا حاجة للتحويل المعقد هنا. المخطط الجديد يتوقع:
        // - mainImage (String)
        // - secondaryImages (Array of String, optional)

        // تنظيف البيانات الواردة للتأكد من استخدام الحقول الجديدة
        const productData = {
            nom: req.body.nom,
            mainImage: req.body.mainImage,
            secondaryImages: req.body.secondaryImages || [], // افتراضيًا مصفوفة فارغة
            prix: req.body.prix,
            categorie: req.body.categorie,
            order: req.body.order || 0
            // تجاهل الحقول القديمة (image, images)
        };

        const newProduct = new Product(productData);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);

    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ error: 'Validation failed', details: messages.join('; ') });
        }
        console.error('Error in POST /api/products:', error.message);
        res.status(500).json({ error: 'Erreur du serveur lors de l\'ajout du produit.' });
    }
});

// 2. جلب جميع المنتجات (GET /api/products)
app.get('/api/products', async (req, res) => {
    try {
        // سيتم جلب الحقول mainImage و secondaryImages كما هي معرفة في المخطط
        const products = await Product.find().sort({ order: 1, createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        console.error('Error in GET /api/products:', error.message);
        res.status(500).json({ error: 'Erreur du serveur lors de la récupération des produits.' });
    }
});

// 3. تحديث منتج (PUT /api/products/:id)
app.put('/api/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const updatedData = req.body;

        // التحقق من السعر
        if (updatedData.prix) {
            updatedData.prix = parseFloat(updatedData.prix);
            if (isNaN(updatedData.prix)) return res.status(400).json({ message: "Le prix doit être un nombre صالح." });
        }

        // 💡 تنظيف بيانات التحديث: لا تسمح بحقول images أو image القديمة
        delete updatedData.image;
        delete updatedData.images;

        // إذا تم إرسال secondaryImages، يجب أن تكون مصفوفة
        if (updatedData.secondaryImages && !Array.isArray(updatedData.secondaryImages)) {
            updatedData.secondaryImages = [updatedData.secondaryImages].filter(Boolean);
        }

        // تحديث المنتج، مع تشغيل المدقق (Validators) لضمان صحة mainImage
        const product = await Product.findByIdAndUpdate(
            productId,
            updatedData,
            { new: true, runValidators: true }
        );

        if (!product) return res.status(404).json({ message: 'Produit غير موجود للتحديث.' });
        res.status(200).json(product);

    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ error: 'Validation failed', details: messages.join('; ') });
        }
        console.error('Error in PUT /api/products/:id:', error.message);
        res.status(500).json({ error: 'Erreur du serveur lors de la mise à jour du produit.', details: error.message });
    }
});

// 4. حذف منتج (DELETE /api/products/:id)
app.delete('/api/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const deletedProduct = await Product.findByIdAndDelete(productId);
        if (!deletedProduct) return res.status(404).json({ message: 'Produit non trouvé.' });
        res.status(200).json({ message: 'Produit supprimé avec succès.', _id: productId });
    } catch (error) {
        console.error('Error in DELETE /api/products/:id:', error.message);
        res.status(500).json({ error: 'Erreur du serveur lors de la suppression du produit.' });
    }
});

// **********************************************
// مسارات الفيديوهات (Video Routes) - تم التعديل لإزالة الرفع المحلي
// **********************************************

// 1. POST: إضافة فيديو جديد (الآن يستخدم 'videoUrl' بدلاً من رفع الملف)
app.post('/api/videos', async (req, res) => {
    // 💡 نستبدل Multer بتحقق بسيط من وجود الرابط في الـ body
    const { titre, description, categorie, videoUrl } = req.body;

    if (!videoUrl) {
        return res.status(400).json({ message: 'L\'URL de la vidéo est obligatoire.' });
    }

    try {
        const newVideo = new Video({
            titre,
            description,
            categorie,
            // 💡 نستبدل fileName و filePath بـ videoUrl (نفترض أن videoUrl هو الحقل الصحيح في نموذج Video)
            // إذا كان نموذج Video لا يحتوي على حقل باسم videoUrl أو url، يجب تعديل النموذج
            // سأفترض أنك ستستخدم الحقل الذي كان يُستخدم للملف الآن للرابط. سأستخدم هنا 'videoUrl'
            videoUrl: videoUrl,
            // 💡 يتم تعيين الحقول القديمة (fileName/filePath) إلى قيمة خالية إذا كانت لا تزال موجودة في النموذج
            fileName: null,
            filePath: null
        });
        const savedVideo = await newVideo.save();
        res.status(201).json(savedVideo);
    } catch (error) {
        console.error("Erreur DB après soumission de l'URL:", error.message);
        res.status(400).json({ message: 'Échec de l\'ajout de la vidéo DB.', details: error.message });
    }
});

// 2. GET: جلب جميع الفيديوهات (دون تغيير)
app.get('/api/videos', async (req, res) => {
    try {
        const videos = await Video.find().sort({ dateAjout: -1 });
        res.status(200).json(videos);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des vidéos.' });
    }
});

// 3. PUT: تحديث البيانات الوصفية للفيديو (دون تغيير - يفترض أن التحديثات لا تشمل ملفاً)
app.put('/api/videos/:id', async (req, res) => {
    try {
        const updatedVideo = await Video.findByIdAndUpdate(
            req.params.id,
            req.body, // الآن يمكن تضمين 'videoUrl' هنا
            { new: true, runValidators: true }
        );
        if (!updatedVideo) return res.status(404).json({ message: 'Vidéo non trouvée pour la mise à jour.' });
        res.status(200).json(updatedVideo);
    } catch (error) {
        res.status(400).json({ message: 'Échec de la mise à jour.', details: error.message });
    }
});

// 4. DELETE: حذف فيديو (تم إزالة محاولة حذف الملف المحلي)
app.delete('/api/videos/:id', async (req, res) => {
    try {
        const videoId = req.params.id;
        const video = await Video.findById(videoId);

        if (!video) return res.status(404).json({ message: 'Vidéo non trouvée.' });

        // ❌ تم حذف محاولة حذف الملف من القرص (fs.unlinkSync)

        const deletedVideo = await Video.findByIdAndDelete(videoId);
        res.status(200).json({ message: 'Vidéo supprimée avec succès (الملف المحلي لم يتم حذفه لأنه لم يُرفع).', _id: videoId });

    } catch (error) {
        console.error('Error server during deletion:', error.message);
        res.status(500).json({ message: 'Erreur serveur lors de la suppression.', details: error.message });
    }
});

// **********************************************
// مسارات الطلبات (Commands Routes) - (دون تغيير)
// **********************************************

// ... (جميع مسارات الطلبات هنا دون تغيير) ...
app.post('/api/commands', async (req, res) => {
    try {
        // 1. Extraction des données، incluant clientEmail (optionnel) et les items avec productImage
        const { clientName, clientPhone, shippingAddress, items, totalAmount, clientEmail } = req.body;

        // 2. Validation de base des données reçues
        if (!clientPhone || !shippingAddress || !items || items.length === 0 || totalAmount == null || totalAmount < 0) {
            return res.status(400).json({ message: 'Données de commande incomplètes ou invalides (téléphone, adresse, articles ou montant manquant).' });
        }

        // 🚨 NOUVEAU: Validation des items pour s'assurer que productImage est présent si nécessaire
        // إذا كان productImage هو رابط URL، فإنه يأتي مباشرةً في الـ body، لذا لا حاجة لـ Multer هنا.
        for (const item of items) {
            if (!item.productId || !item.productName || item.quantity == null || item.quantity < 1 || item.price == null || item.price < 0) {
                return res.status(400).json({ message: 'Détails d\'article de commande incomplets ou invalides.' });
            }
        }

        // 3. Créer une nouvelle instance de commande
        const newCommand = new Command({
            clientName,
            clientPhone,
            clientEmail, // ⬅️ Ajout pour gérer les utilisateurs connectés
            shippingAddress,
            totalAmount,
            items: items, // 🖼️ الآن `items` سيحتوي على `productImage` لكل منتج
            ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            deviceInfo: getDeviceInfoFromUA(req.headers['user-agent'])
        });

        // 4. Sauvegarder la commande dans la base de données
        const savedCommand = await newCommand.save();

        // 5. Réponse de succès
        res.status(201).json({
            message: 'Commande enregistrée avec succès!',
            commandId: savedCommand._id, // Ou savedCommand.commandId si le virtuel est configuré
        });

    } catch (error) {
        console.error('Erreur lors de l\'enregistrement de la commande:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: 'Erreur de validation: ' + messages.join(', ') });
        }

        res.status(500).json({ message: 'Erreur interne du serveur lors de la soumission de la commande.' });
    }
});



// 1. 💡 AFFICHER (GET /api/commands) - جلب جميع الطلبات
app.get('/api/commands', async (req, res) => {
    try {
        const commands = await Command.find().sort({ orderDate: -1 });
        res.status(200).json(commands);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des commandes.", details: error.message });
    }
});

app.put('/api/commands/:id/status', async (req, res) => {
    const { status } = req.body;
    const commandId = req.params.id;

    if (!status) {
        return res.status(400).json({ message: "Le nouveau statut est requis." });
    }

    try {
        const command = await Command.findByIdAndUpdate(
            commandId,
            { status: status },
            { new: true, runValidators: true } // new: true لإرجاع الوثيقة المحدثة، runValidators: للتحقق من أن الحالة موجودة في enum
        );

        if (!command) {
            return res.status(404).json({ message: "Commande non trouvée." });
        }

        res.status(200).json(command);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Statut invalide.", details: error.message });
        }
        res.status(500).json({ message: "Échec de la mise à jour du statut.", details: error.message });
    }
});

// 3. 💡 DELETE (DELETE /api/commands/:id) - حذف طلب
app.delete('/api/commands/:id', async (req, res) => {
    const commandId = req.params.id;
    try {
        const result = await Command.findByIdAndDelete(commandId);

        if (!result) {
            return res.status(404).json({ message: "Commande non trouvée." });
        }

        res.status(200).json({ message: "Commande supprimée avec succès." });
    } catch (error) {
        res.status(500).json({ message: "Échec de la suppression de la commande.", details: error.message });
    }
});


// ... (بقية مسارات المستخدمين هنا دون تغيير) ...
app.get("/api/users/:email", async (req, res) => {
    try {
        const email = req.params.email.toLowerCase();

        // نبحث عن المستخدم حسب الحقل mail
        const user = await User.findOne({ mail: email });

        if (!user) {
            return res.status(200).json({ abonne: "non" });
        }

        res.status(200).json({ abonne: user.abonne, statut: user.statut });
    } catch (error) {
        console.error("Erreur lors de la vérification du VIP:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});







app.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password'); // عدم إرسال كلمة المرور
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

















// 1. POST /api/messages - Créer un nouveau message
app.post('/api/messages', async (req, res) => {
    try {
        const newMessage = new Message(req.body);
        const savedMessage = await newMessage.save();
        res.status(201).json(savedMessage);
    } catch (error) {
        res.status(400).json({
            message: "Erreur lors de la création du message.",
            details: error.message
        });
    }
});

// 2. DELETE /api/messages/:id - Supprimer un message par ID
app.delete('/api/messages/:id', async (req, res) => {
    try {
        const messageId = req.params.id;
        const deletedMessage = await Message.findByIdAndDelete(messageId);

        if (!deletedMessage) {
            return res.status(404).json({ message: "Message non trouvé." });
        }

        // Statut 200 avec le message supprimé ou 204 No Content
        res.status(200).json({ message: "Message supprimé avec succès.", deleted: deletedMessage });
    } catch (error) {
        // Gérer les IDs invalides ou autres erreurs
        res.status(500).json({ message: "Erreur lors de la suppression du message.", details: error.message });
    }
});

// 3. PUT /api/messages/:id/status - Mettre à jour le statut 'estTraite' par ID
// 3. PUT /api/messages/:id/status - Mettre à jour le statut 'estTraite' par ID
app.put('/api/messages/:id/status', async (req, res) => {
    try {
        const messageId = req.params.id;
        let { estTraite } = req.body;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message non trouvé." });
        }

        // If body is empty or estTraite is undefined, just toggle
        if (estTraite === undefined) {
            message.estTraite = !message.estTraite;
        } else {
            message.estTraite = Boolean(estTraite);
        }

        const updatedMessage = await message.save();
        res.status(200).json(updatedMessage);
    } catch (error) {
        console.error("Error updating message status:", error);
        res.status(500).json({ message: "Erreur lors de la mise à jour du statut.", details: error.message });
    }
});

app.get('/api/messages', async (req, res) => {
    try {
        // استرجاع الرسائل مرتبة حسب تاريخ الإنشاء من الأحدث إلى الأقدم
        const messages = await Message.find().sort({ dateCreation: -1 });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({
            message: "Erreur lors de la récupération des messages.",
            details: error.message
        });
    }
});













app.get('/api/commentaires/filtre', async (req, res) => {
    try {
        const commentaires = await Commentaire.find({ statut: 'Approuvé' }).sort({ date_creation: -1 });
        res.status(200).json(commentaires);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des commentaires', error: error.message });
    }
});

app.get('/api/commentaires', async (req, res) => {
    try {
        // ✅ تم إزالة شرط الفلترة { statut: 'Approuvé' } لعرض جميع التعليقات
        // الترتيب حسب تاريخ الإنشاء التنازلي (-1) ما زال مطبقًا.
        const commentaires = await Commentaire.find({}).sort({ date_creation: -1 });

        res.status(200).json(commentaires);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des commentaires', error: error.message });
    }
});
// ===================================================
// Route 2: POST un nouveau commentaire
// POST /api/commentaires
// (Pour l'utilisateur non-admin)
// ===================================================
app.post('/api/commentaires', async (req, res) => {
    try {
        // البيانات القادمة من React هي: { nom, commentaire, rating, productId }
        const newCommentaire = new Commentaire(req.body);

        // حفظ الكائن الجديد في قاعدة البيانات
        const savedCommentaire = await newCommentaire.save();

        // إرسال استجابة نجاح
        res.status(201).json({
            message: 'Commentaire créé avec succès',
            commentId: savedCommentaire._id
        });
    } catch (error) {
        // معالجة أخطاء التحقق (Validation Errors) مثل الحقول المفقودة
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                message: 'Erreur de validation',
                errors: messages
            });
        }
        // معالجة الأخطاء الأخرى
        res.status(500).json({ message: 'Erreur serveur lors de l\'enregistrement du commentaire', error: error.message });
    }
});
// ===================================================
// Route 3: PUT (Modifier) le statut d'un commentaire
// PUT /api/commentaires/statut/:id
// (Pour l'administration)
// ===================================================
app.put('/api/commentaires/statut/:id', async (req, res) => {
    const { statut } = req.body;

    // Vérification simple du statut
    if (!['Approuvé', 'Rejeté', 'En attente'].includes(statut)) {
        return res.status(400).json({ message: 'Statut invalide.' });
    }

    try {
        const commentaire = await Commentaire.findByIdAndUpdate(
            req.params.id,
            { statut: statut },
            { new: true, runValidators: true } // Retourne le doc mis à jour, exécute les validateurs du schéma
        );

        if (!commentaire) {
            return res.status(404).json({ message: 'Commentaire non trouvé' });
        }

        res.status(200).json({ success: true, data: commentaire });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du statut', error: error.message });
    }
});

// ===================================================
// Route 4: DELETE un commentaire
// DELETE /api/commentaires/:id
// (Pour l'administration)
// ===================================================
app.delete('/api/commentaires/:id', async (req, res) => {
    try {
        const commentaire = await Commentaire.findByIdAndDelete(req.params.id);

        if (!commentaire) {
            return res.status(404).json({ message: 'Commentaire non trouvé' });
        }

        res.status(200).json({ success: true, message: 'Commentaire supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur lors de la suppression', error: error.message });
    }
});





















app.post('/api/abonnement', async (req, res) => {
    try {
        // 💡 Ces données sont maintenant envoyées par le frontend au format JSON,
        // 💡 après que le frontend ait uploadé l'image sur ImgBB.
        const { nom, mail, preuve_paiement_url } = req.body;

        if (!preuve_paiement_url) {
            return res.status(400).json({ message: "L'URL de preuve de paiement est requise." });
        }

        // vérifier si l'email existe déjà
        const existant = await Abonnement.findOne({ mail });
        if (existant) {
            return res.status(400).json({ message: "Une demande avec cet email existe déjà." });
        }

        const abonnement = new Abonnement({ nom, mail, preuve_paiement_url });
        await abonnement.save();

        res.status(201).json({
            message: "Abonnement ajouté avec succès.",
            abonnement
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});



app.get('/api/abonnement', async (req, res) => {
    try {
        const abonnements = await Abonnement.find().sort({ date: -1 });
        res.json(abonnements);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});



app.put('/api/abonnement/:id', async (req, res) => {
    try {
        const { statut_abonnement } = req.body;

        const abonnement = await Abonnement.findByIdAndUpdate(
            req.params.id,
            { statut_abonnement },
            { new: true }
        );

        if (!abonnement) return res.status(404).json({ message: 'Abonnement introuvable.' });

        res.json({ message: 'Statut mis à jour.', abonnement });
    } catch (error) {
        console.error('Erreur PUT abonnement:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

app.delete('/api/abonnement/:id', async (req, res) => {
    try {
        const abonnement = await Abonnement.findById(req.params.id);

        if (!abonnement) return res.status(404).json({ message: 'Abonnement introuvable.' });

        // ❌ تم حذف محاولة حذف الصورة من السيرفر (fs.unlinkSync)


        await Abonnement.findByIdAndDelete(req.params.id);
        res.json({ message: 'Abonnement supprimé avec succès.' });
    } catch (error) {
        console.error('Erreur DELETE abonnement:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});



// ... (بقية المسارات دون تغيير) ...
app.get('/api/users', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ message: "Email requis" });

        const user = await User.findOne({ mail: email }); // لاحظ الحقل mail في DB
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

        res.json({ nom: user.nom, mail: user.mail });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});










app.put('/api/user/abonne', async (req, res) => {
    console.log("Body reçu:", req.body); // Debug
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email requis pour mettre à jour l\'abonnement.' });
    }

    try {
        const user = await User.findOne({ mail: email }); // تأكد استخدام 'mail' وليس 'email'

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé.' });
        }

        user.abonne = 'oui';
        await user.save();

        res.json({ message: `L'utilisateur ${email} est maintenant abonné.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur lors de la mise à jour de l\'abonnement.' });
    }
});



// Utilisez هذه version si vos emails dans la DB sont stockés de manière incohérente (espaces, casse)
// Assurez-vous d'avoir importé Mongoose et votre modèle Command
// const Command = require('./models/Command'); // Exemple d'importation
app.get('/api/commands_user', async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: 'Email du client requis' });
        }

        // جلب جميع الأوامر المطابقة للبريد الإلكتروني مع تجاهل حالة الأحرف
        const commands = await Command.find({
            clientEmail: { $regex: `^${email.trim()}$`, $options: 'i' } // ^ و $ لضمان التطابق الكامل
        }).sort({ orderDate: -1 }); // ترتيب من الأحدث للأقدم

        if (commands.length === 0) {
            return res.status(404).json({ message: 'لا توجد أوامر لهذا البريد' });
        }

        res.json(commands); // يرجع جميع الأوامر المطابقة
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});








app.post('/api/vip-categories', async (req, res) => {
    try {
        const newCategory = new VipCategory(req.body);
        const savedCategory = await newCategory.save();

        // --- Cross-System Synchronization ---
        // 1. If we added a category, ensure a SpecializedCourse group exists for it
        const catName = savedCategory.title?.fr || savedCategory.title;
        if (catName) {
            const existingGroup = await SpecializedCourse.findOne({ vip_category: catName });
            if (!existingGroup) {
                const newGroup = new SpecializedCourse({
                    vip_category: catName,
                    courses: []
                });
                await newGroup.save();
            }
        }

        res.status(201).json(savedCategory);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la création de la catégorie.", error: error.message });
    }
});

// -----------------------------------------------------------------
// 📖 app.get: Get all categories
// GET /api/vip-categories
// -----------------------------------------------------------------
app.get('/api/vip-categories', async (req, res) => {
    try {
        const categories = await VipCategory.find().sort({ order: 1, createdAt: -1 });
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des catégories.", error: error.message });
    }
});

// -----------------------------------------------------------------
// ✍️ app.put: Update a category by ID
// PUT /api/vip-categories/:id
// -----------------------------------------------------------------
app.put('/api/vip-categories/:id', async (req, res) => {
    try {
        const updatedCategory = await VipCategory.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // Return the new document and run schema validation
        );

        if (!updatedCategory) {
            return res.status(404).json({ message: "Catégorie non trouvée." });
        }
        res.status(200).json(updatedCategory);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la mise à jour de la catégorie.", error: error.message });
    }
});

// 🗑️ app.delete: Delete a category by ID
// DELETE /api/vip-categories/:id
// -----------------------------------------------------------------
app.delete('/api/vip-categories/:id', async (req, res) => {
    try {
        const deletedCategory = await VipCategory.findByIdAndDelete(req.params.id);

        if (!deletedCategory) {
            return res.status(404).json({ message: "Catégorie non trouvée." });
        }

        // --- Cross-System Cleanup ---
        // 1. Delete associated course groups (SpecializedCourse) by name
        const catName = deletedCategory.title?.fr || deletedCategory.title;
        if (catName) {
            await SpecializedCourse.deleteMany({ vip_category: catName });
        }

        // 2. Delete associated videos
        // (VipCategory might have technical names or just use the main name)
        await SpecializedVideo.deleteMany({ category: catName });

        res.status(200).json({ message: "Catégorie supprimée avec succès sur tous les systèmes." });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression de la catégorie.", error: error.message });
    }
});













// URL: /api/specialized-courses

// 1. GET (Récupérer les cours. Peut filtrer par categoryId via ?category=)
app.get('/api/specialized-courses', async (req, res) => {
    try {
        const query = {};

        if (req.query.category) {
            const categoryName = req.query.category;
            query.$or = [
                { vip_category: categoryName },
                { 'courses.vip_category': categoryName },
                { 'hero_content.fr.title': categoryName },
                { 'hero_content.ar.title': categoryName },
                { 'hero_content.en.title': categoryName },
                { 'hero_content.TN.title': categoryName }
            ];
        }

        const courses = await SpecializedCourse.find(query).sort({ createdAt: -1 });
        res.json(courses);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// 2. GET by ID
app.get('/api/specialized-courses/:id', async (req, res) => {
    try {
        const course = await SpecializedCourse.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Cours non trouvé' });
        res.json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



// 3. PUT (Mettre à jour un cours)
app.put('/api/specialized-courses/:id', async (req, res) => {
    try {
        const dataToUpdate = { ...req.body };

        // إذا تم تحديث الاسم الرئيسي، نقوم بتحديثه أيضاً داخل مصفوفة الكورسات لضمان التزامن
        if (dataToUpdate.vip_category) {
            const group = await SpecializedCourse.findById(req.params.id);
            if (group && group.courses) {
                group.courses.forEach(c => {
                    c.vip_category = dataToUpdate.vip_category;
                });
                dataToUpdate.courses = group.courses;
            }
        }

        const updatedCourse = await SpecializedCourse.findByIdAndUpdate(
            req.params.id,
            dataToUpdate,
            { new: true, runValidators: true }
        );
        if (!updatedCourse) return res.status(404).json({ message: 'Cours non trouvé' });
        res.json(updatedCourse);
    } catch (err) {
        console.error("Error in PUT /api/specialized-courses:", err);
        res.status(400).json({ message: err.message });
    }
});

// 4. DELETE (Supprimer un cours)
app.delete('/api/specialized-courses/:id', async (req, res) => {
    try {
        const deletedCourse = await SpecializedCourse.findByIdAndDelete(req.params.id);
        if (!deletedCourse) return res.status(404).json({ message: 'Cours non trouvé' });

        // --- Multi-Step Cleanup ---
        const categoriesToDelete = [deletedCourse.vip_category];
        if (deletedCourse.courses) {
            deletedCourse.courses.forEach(c => {
                const titleStr = typeof c.title === 'object' ? (c.title.fr || c.title.ar) : c.title;
                const cat = c.technicalName || c.vip_category || titleStr;
                if (cat && !categoriesToDelete.includes(cat)) {
                    categoriesToDelete.push(cat);
                }
            });
        }

        // 1. Delete associated videos
        await SpecializedVideo.deleteMany({ category: { $in: categoriesToDelete } });

        // 2. Sync Deletion with VIP Categories (Public cards)
        // If this group was the "parent" group matching a public category name, delete it.
        if (deletedCourse.vip_category) {
            await VipCategory.deleteMany({
                $or: [
                    { title: deletedCourse.vip_category },
                    { 'title.fr': deletedCourse.vip_category },
                    { 'title.ar': deletedCourse.vip_category }
                ]
            });
        }

        res.json({ message: 'Cours, vidéos et cartes VIP associées supprimés' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});




app.post('/api/specialized-courses/group', async (req, res) => {
    try {
        const { video_link, courses, vip_category, hero_bg, hero_content } = req.body;

        const vipCategoryName = (courses && courses.length > 0) ? courses[0].vip_category : vip_category;

        if (!vipCategoryName) {
            return res.status(400).json({ message: 'Catégorie requise.' });
        }

        // // البحث عن مجموعة موجودة بنفس الاسم (تحقق من المستوى العلوي أو المصفوفة)
        let existingGroup = await SpecializedCourse.findOne({
            $or: [
                { vip_category: vipCategoryName },
                { 'courses.vip_category': vipCategoryName }
            ]
        });

        if (existingGroup) {
            if (courses && courses.length > 0) {
                existingGroup.courses.push(...courses);
            }
            if (video_link && video_link !== undefined && video_link !== '') {
                existingGroup.video_link = video_link;
            }
            if (hero_bg !== undefined) existingGroup.hero_bg = hero_bg;
            if (hero_content !== undefined) existingGroup.hero_content = hero_content;

            // ضمان وجود الاسم في المستوى العلوي أيضاً
            existingGroup.vip_category = vipCategoryName;

            await existingGroup.save();
            return res.status(200).json({ message: 'Mise à jour réussie.', data: existingGroup });
        }

        // إنشاء مجموعة جديدة إذا لم توجد
        const newGroup = new SpecializedCourse({
            video_link: video_link || {},
            courses: courses || [],
            vip_category: vipCategoryName,
            hero_bg: hero_bg || '',
            hero_content: hero_content || {}
        });

        await newGroup.save();

        // --- Cross-System Synchronization ---
        // Ensure a VipCategory exists for this course group so it shows on the UI
        try {
            const existingVip = await VipCategory.findOne({
                $or: [
                    { title: vipCategoryName },
                    { 'title.fr': vipCategoryName }
                ]
            });
            if (!existingVip) {
                const firstCourse = courses && courses[0];
                const newVip = new VipCategory({
                    title: { fr: vipCategoryName, ar: '', tn: '' },
                    description: { fr: (firstCourse?.description?.fr || firstCourse?.description || "Nouvelle formation"), ar: '', tn: '' },
                    duration: { fr: (firstCourse?.duration?.fr || firstCourse?.duration || "Access 24/7"), ar: '', tn: '' },
                    image: firstCourse?.image || '',
                    order: 99
                });
                await newVip.save();
            }
        } catch (e) { console.error("Sync error:", e); }

        res.status(201).json({ message: 'Nouvelle catégorie créée avec succès.', data: newGroup });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});











app.post('/api/specialized-videos', upload.fields([
    { name: 'video_fr', maxCount: 1 },
    { name: 'video_ar', maxCount: 1 },
    { name: 'video_en', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]), async (req, res) => {
    try {
        const { title, description, category, subCategory, videoUrl, title_lang, status_lang, url_lang, order, thumbnail } = req.body;

        // 1. Handle Main URL
        let finalUrl = videoUrl;
        if (req.files['video']) {
            finalUrl = `/uploads/specialized-videos/${req.files['video'][0].filename}`;
        }

        // 2. Handle Multi-lang URLs
        let finalUrlLang = typeof url_lang === 'string' ? JSON.parse(url_lang) : (url_lang || {});
        ['fr', 'ar', 'en'].forEach(lang => {
            if (req.files[`video_${lang}`]) {
                finalUrlLang[lang] = `/uploads/specialized-videos/${req.files[`video_${lang}`][0].filename}`;
            }
        });

        if (!finalUrl && !finalUrlLang.fr && !finalUrlLang.ar && !finalUrlLang.en && !title && !category) {
            return res.status(400).json({ message: "Les données sont incomplètes." });
        }

        const newVideo = new SpecializedVideo({
            url: finalUrl || finalUrlLang.fr || finalUrlLang.ar || finalUrlLang.en || "",
            url_lang: finalUrlLang,
            title,
            description,
            thumbnail,
            category,
            subCategory: subCategory || '',
            title_lang: typeof title_lang === 'string' ? JSON.parse(title_lang) : title_lang,
            status_lang: typeof status_lang === 'string' ? JSON.parse(status_lang) : status_lang,
            order: Number(order) || 0
        });

        await newVideo.save();
        res.status(201).json({ message: "Vidéo ajoutée avec succès.", data: newVideo });
    } catch (err) {
        console.error("Erreur lors de l'ajout de la vidéo :", err);
        res.status(500).json({ message: "Erreur serveur." });
    }
});

// Optional: A dedicated upload route if needed, but the above POST handles it.
app.post('/api/specialized-videos/upload', upload.single('video'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "Aucun fichier n'a été téléchargé." });
    }
    res.status(200).json({
        message: "Fichier téléchargé avec succès.",
        filePath: `/uploads/specialized-videos/${req.file.filename}`
    });
});


// 📋 Récupérer toutes les vidéos ou filtrer par catégorie


app.get('/api/specialized-videos', async (req, res) => {
    try {
        const query = {};
        const queryCategory = req.query.category || req.query['category[]'];
        if (queryCategory) {
            const matchArr = Array.isArray(queryCategory) ? queryCategory : [queryCategory];

            // Check both category (for backwards compatibility/main category) 
            // and subCategory (for the new hierarchical architecture)
            query.$or = [
                { category: { $in: matchArr } },
                { subCategory: { $in: matchArr } }
            ];
        }
        const videos = await SpecializedVideo.find(query).sort({ order: 1, createdAt: -1 });
        res.json(videos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur." });
    }
});

// 🗑️ Delete all videos matching a specific category
app.delete('/api/specialized-videos/by-category', async (req, res) => {
    try {
        const queryCategory = req.query.category || req.query['category[]'];
        if (!queryCategory) {
            return res.status(400).json({ message: "Catégorie requise." });
        }

        let categoriesToDelete = [];
        if (Array.isArray(queryCategory)) {
            categoriesToDelete = queryCategory;
        } else {
            categoriesToDelete = [queryCategory];
        }

        const result = await SpecializedVideo.deleteMany({ category: { $in: categoriesToDelete } });
        res.json({ message: "Vidéos supprimées", deletedCount: result.deletedCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur lors de la suppression par catégorie." });
    }
});

// ✅ Mettre à jour une vidéo spécialisée par ID
app.put('/api/specialized-videos/:id', upload.fields([
    { name: 'video_fr', maxCount: 1 },
    { name: 'video_ar', maxCount: 1 },
    { name: 'video_en', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]), async (req, res) => {
    try {
        const { title, description, category, subCategory, videoUrl, title_lang, status_lang, url_lang, order, thumbnail } = req.body;

        const videoId = req.params.id;
        if (!videoId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "ID de vidéo invalide." });
        }

        const updateData = {};

        if (title !== undefined) updateData.title = title.trim();
        if (description !== undefined) updateData.description = description.trim();
        if (category !== undefined) updateData.category = category.trim();
        if (order !== undefined) updateData.order = Number(order);
        if (thumbnail !== undefined) updateData.thumbnail = thumbnail;

        if (title_lang !== undefined) {
            updateData.title_lang = typeof title_lang === 'string' ? JSON.parse(title_lang) : title_lang;
        }
        if (status_lang !== undefined) {
            updateData.status_lang = typeof status_lang === 'string' ? JSON.parse(status_lang) : status_lang;
        }

        if (subCategory !== undefined) {
            updateData.subCategory = subCategory.trim() || '';
        }

        // Handle Main URL
        if (req.files && req.files['video']) {
            updateData.url = `/uploads/specialized-videos/${req.files['video'][0].filename}`;
        } else if (videoUrl) {
            updateData.url = videoUrl;
        }

        // Handle Multi-lang URLs
        if (url_lang !== undefined || (req.files && Object.keys(req.files).some(k => k.startsWith('video_')))) {
            let finalUrlLang = typeof url_lang === 'string' ? JSON.parse(url_lang) : (url_lang || {});
            ['fr', 'ar', 'en'].forEach(lang => {
                if (req.files && req.files[`video_${lang}`]) {
                    finalUrlLang[lang] = `/uploads/specialized-videos/${req.files[`video_${lang}`][0].filename}`;
                }
            });
            updateData.url_lang = finalUrlLang;
        }

        const updatedVideo = await SpecializedVideo.findByIdAndUpdate(
            videoId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedVideo) {
            return res.status(404).json({ message: "Vidéo non trouvée." });
        }

        res.json({ message: "✅ Vidéo mise à jour avec succès.", data: updatedVideo });
    } catch (error) {
        console.error("Erreur lors de la mise à jour :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
});

// ✅ Mettre à jour les miniatures en masse par TITRE (Update thumbnails in bulk by TITLE)
app.patch('/api/specialized-videos/bulk-thumbnail', async (req, res) => {
    try {
        const { title, thumbnail } = req.body;
        if (!title || !thumbnail) {
            return res.status(400).json({ message: "Titre et miniature requis." });
        }

        // Use case-insensitive match to be safe
        const result = await SpecializedVideo.updateMany(
            { title: { $regex: new RegExp(`^${title.trim()}$`, 'i') } },
            { $set: { thumbnail } }
        );

        res.json({
            message: `✅ ${result.modifiedCount} vidéos mises à jour avec succès.`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error("Bulk thumbnail update error:", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
});




// ❌ Supprimer une vidéo par ID (دون تغيير، لكن لا يوجد ملف محلي للحذف)
app.delete('/api/specialized-videos/:id', async (req, res) => {
    try {
        const deletedVideo = await SpecializedVideo.findByIdAndDelete(req.params.id);
        if (!deletedVideo) return res.status(404).json({ message: "Vidéo non trouvée." });

        res.json({ message: "Vidéo محذوفة (الملف المحلي لم يُحذف لأنه لم يُرفع).", data: deletedVideo });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur." });
    }
});





// ------------------------- POST (ADD) -------------------------
app.post("/api/home-products", async (req, res) => {
    try {
        const newProduct = new HomeProduct(req.body);
        const saved = await newProduct.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: "Erreur lors de l'ajout.", error: err.message });
    }
});


app.get("/api/home-products", async (req, res) => {
    try {
        const products = await HomeProduct.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: "Erreur lors de la récupération." });
    }
});

// ------------------------- GET ONE -------------------------
app.get("/api/home-products/:id", async (req, res) => {
    try {
        const product = await HomeProduct.findById(req.params.id);

        if (!product) return res.status(404).json({ message: "Produit introuvable." });

        res.json(product);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur." });
    }
});



// ------------------------- PUT (UPDATE) -------------------------
app.put("/api/home-products/:id", async (req, res) => {
    try {
        const updatedProduct = await HomeProduct.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedProduct)
            return res.status(404).json({ message: "Produit introuvable." });

        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: "Erreur de mise à jour." });
    }
});

// ------------------------- SHOP CATEGORIES -------------------------
app.get('/api/shop-categories', async (req, res) => {
    try {
        const categories = await ShopCategory.find().sort({ order: 1 });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/shop-categories', async (req, res) => {
    try {
        const newCategory = new ShopCategory(req.body);
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put('/api/shop-categories/:id', async (req, res) => {
    try {
        const updated = await ShopCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/shop-categories/:id', async (req, res) => {
    try {
        await ShopCategory.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ------------------------- DELETE -------------------------
app.delete("/api/home-products/:id", async (req, res) => {
    try {
        const deleted = await HomeProduct.findByIdAndDelete(req.params.id);

        if (!deleted)
            return res.status(404).json({ message: "Produit introuvable." });

        res.json({ message: "Produit supprimé avec succès !" });
    } catch (err) {
        res.status(500).json({ message: "Erreur lors de la suppression." });
    }
});


// ------------------------- SITE SETTINGS -------------------------
app.get('/api/settings/:key', async (req, res) => {
    try {
        const setting = await SiteSetting.findOne({ key: req.params.key });
        res.json(setting ? setting.value : null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/settings/:key', async (req, res) => {
    try {
        const setting = await SiteSetting.findOneAndUpdate(
            { key: req.params.key },
            { value: req.body.value },
            { new: true, upsert: true }
        );
        res.json(setting);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ------------------------- BULK RESET (SPECIALIZED) -------------------------
// Delete all specialized videos
app.delete('/api/specialized-videos-all/reset-now', async (req, res) => {
    try {
        await SpecializedVideo.deleteMany({});
        res.json({ message: 'Tous les vidéos spécialisées ont été supprimées' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete all specialized courses
app.delete('/api/specialized-courses-all/reset-now', async (req, res) => {
    try {
        await SpecializedCourse.deleteMany({});
        res.json({ message: 'Tous les cours spécialisés ont été supprimés' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ------------------------- AI CHAT ASSISTANT -------------------------
app.post('/api/ai-chat', async (req, res) => {
    const { message, language } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    try {
        const prompt = `
            You are a professional assistant specialized ONLY in sewing, clothing, fashion design, and patterns (مجال الخياطة والملابس).
            Your name is "Assistant Atelier Sfax".
            
            RULES:
            1. If the user asks about ANYTHING outside the field of sewing, clothing, or fashion (food, sports, politics, math, general info), you MUST answer EXACTLY with:
               "أسف، لا يمكنني الإجابة خارج مجال الخياطة والملابس." (if the question is in Arabic)
               or "Désolé, je ne peux pas répondre en dehors du domaine de la couture et de l'habillement." (if the question is in French).
            2. Be professional and helpful for sewing tasks.
            3. Use the language: ${language === 'ar' ? 'Arabic' : 'French'}.
            4. Keep responses concise and practical.

            User message: ${message}
        `;

        const result = await genAI.models.generateContent({
            model: "models/gemini-2.5-flash",
            contents: prompt
        });

        const responseText = result.text || result.response?.text();
        res.status(200).json({ reply: responseText });
    } catch (error) {
        console.error("Gemini AI Error:", error);
        res.status(500).json({ error: 'AI Assistant Error' });
    }
});

mongoose.connect('mongodb+srv://2cparton0011:nYdiX2GXYnduOmyG@cluster0.07ov0j7.mongodb.net/?appName=Cluster0')
    .then(() => {
        console.log('🎉 Successfully connected to MongoDB!');
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });