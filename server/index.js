











// server.js (الكود النهائي المصحح والمؤمن - الآن يستخدم روابط URL بدلاً من الرفع المحلي للملفات)

// 1. استيراد الوحدات (Imports)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// const path = require('path'); // ❌ تم إلغاؤه
// const fs = require('fs'); // ❌ تم إلغاؤه
// const multer = require('multer'); // ❌ تم إلغاؤه

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

// 2. إنشاء تطبيق Express
const app = express();
const PORT = 3000;


// -------------------- A. MIDDLEWARE SETUP --------------------

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ ضروري لقراءة form-data


// ❌ تم حذف جميع إعدادات Multer (storage, upload, imageStorage, uploadImage)

// ❌ تم حذف مسار الملفات الثابتة /uploads لأنه لم يعد هناك رفع محلي
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// -------------------- نهاية إعداد Multer --------------------


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

app.get('/', (req, res) => {
    res.send('Hello World! Connected to Express and MongoDB. 2/14/2026');
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
        if (user.mot_de_pass === mot_de_pass) {
            res.status(200).json({ message: 'Login successful via Google.', id: user._id, nom: user.nom, image: user.image, statut: user.statut, abonne: user.abonne });
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
        const newUser = new User({ nom, mail, mot_de_pass, image, statut, abonne });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully!', user: newUser });
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
            res.status(200).json({ message: 'Connexion traditionnelle réussie.', id: user._id, nom: user.nom, image: user.image, statut: user.statut, abonne: user.abonne });
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
        const products = await Product.find();
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
            items: items // 🖼️ الآن `items` سيحتوي على `productImage` لكل منتج
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

        res.status(200).json({ abonne: user.abonne });
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
        const { estTraite } = req.body; // facultatif : true/false

        // Récupérer le message actuel
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message non trouvé." });
        }

        // Si estTraite est fourni et boolean, utiliser la valeur, sinon basculer
        message.estTraite = typeof estTraite === 'boolean' ? estTraite : !message.estTraite;

        const updatedMessage = await message.save();

        res.status(200).json(updatedMessage);
    } catch (error) {
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
        res.status(201).json(savedCategory);
    } catch (error) {
        // Handle validation errors (e.g., missing title or unique constraint)
        res.status(400).json({ message: "Erreur lors de la création de la catégorie.", error: error.message });
    }
});

// -----------------------------------------------------------------
// 📖 app.get: Get all categories
// GET /api/vip-categories
// -----------------------------------------------------------------
app.get('/api/vip-categories', async (req, res) => {
    try {
        const categories = await VipCategory.find().sort({ createdAt: -1 });
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
        res.status(200).json({ message: "Catégorie supprimée avec succès." });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression de la catégorie.", error: error.message });
    }
});













// URL: /api/specialized-courses

// 1. GET (Récupérer les cours. Peut filtrer par categoryId via ?category=)
app.get('/api/specialized-courses', async (req, res) => {
    try {
        const query = {};

        // إذا تم تمرير اسم الفئة كـ query parameter
        if (req.query.category) {
            const categoryName = req.query.category;
            // جلب فقط المجموعات التي تحتوي على courses بنفس الاسم
            query['courses.vip_category'] = categoryName;
        }

        const courses = await SpecializedCourse.find(query).sort({ createdAt: -1 });
        res.json(courses);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});



// 3. PUT (Mettre à jour un cours)
app.put('/api/specialized-courses/:id', async (req, res) => {
    try {
        const updatedCourse = await SpecializedCourse.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedCourse) return res.status(404).json({ message: 'Cours non trouvé' });
        res.json(updatedCourse);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 4. DELETE (Supprimer un cours)
app.delete('/api/specialized-courses/:id', async (req, res) => {
    try {
        const deletedCourse = await SpecializedCourse.findByIdAndDelete(req.params.id);
        if (!deletedCourse) return res.status(404).json({ message: 'Cours non trouvé' });
        res.json({ message: 'Cours supprimé' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});




app.post('/api/specialized-courses/group', async (req, res) => {
    try {
        const { video_link, courses } = req.body;

        if (!courses || !Array.isArray(courses) || courses.length === 0) {
            return res.status(400).json({ message: 'Aucun cours fourni.' });
        }

        // نأخذ اسم الفئة من أول كورس
        const vipCategoryName = courses[0].vip_category;

        // البحث عن مجموعة موجودة بنفس الاسم
        let existingGroup = await SpecializedCourse.findOne({ 'courses.vip_category': vipCategoryName });

        if (existingGroup) {
            // إضافة الكورسات الجديدة
            existingGroup.courses.push(...courses);

            // تحديث الفيديو إذا تم إدخاله
            if (video_link && video_link.trim() !== '') {
                existingGroup.video_link = video_link;
            }

            await existingGroup.save();
            return res.status(200).json({ message: 'Cours ajoutés à la catégorie existante.', data: existingGroup });
        }

        // إنشاء مجموعة جديدة إذا لم توجد
        const newGroup = new SpecializedCourse({
            video_link,
            courses,
        });

        await newGroup.save();

        res.status(201).json({ message: 'Nouvelle catégorie créée avec succès.', data: newGroup });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});











app.post('/api/specialized-videos/', async (req, res) => {

    // 1. Désormais, pas de gestion de fichier uploadé
    const { title, description, category, videoUrl } = req.body; // 💡 videoUrl est le nouveau champ

    // 2. Vérification des données (y compris la nouvelle URL)
    if (!videoUrl || !title || !category) {
        // Le message d'erreur est mis à jour
        return res.status(400).json({ message: "Le titre, la catégorie et l'URL de la vidéo sont obligatoires." });
    }

    try {
        // 3. Sauvegarder les métadonnées dans MongoDB
        // Le champ 'url' dans le modèle va maintenant stocker l'URL du lien.
        const newVideo = new SpecializedVideo({ // Renommé 'SpecializedVideo' ici pour correspondre à votre usage dans la route
            url: videoUrl, // 💡 Stocke l'URL externe fournie par l'utilisateur
            title,
            description,
            category
        });

        await newVideo.save();

        res.status(201).json({
            message: "Vidéo ajoutée avec succès via lien URL.",
            data: newVideo
        });
    } catch (dbErr) {
        console.error(dbErr);
        // Plus besoin de fs.unlink car aucun fichier local n'est uploadé
        res.status(500).json({ message: "Erreur serveur lors de la sauvegarde des données." });
    }
});



// 📋 Récupérer toutes les vidéos ou filtrer par catégorie


app.get('/api/specialized-videos', async (req, res) => {
    try {
        const query = {};
        if (req.query.category) {
            query.category = req.query.category;
        }
        const videos = await SpecializedVideo.find(query).sort({ createdAt: -1 });
        res.json(videos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur." });
    }
});

// ✅ Mettre à jour une vidéo spécialisée par ID (تم تعديل المسار لإزالة معالجة Multer)
app.put('/api/specialized-videos/:id', async (req, res) => {
    try {
        const { title, description, category, videoUrl } = req.body; // 💡 videoUrl هو الحقل الجديد

        if (!title || !category) {
            return res.status(400).json({ message: "Les champs 'title' et 'category' sont requis." });
        }

        const videoId = req.params.id;

        // 🔍 تحقق من أن الـ ID صالح
        if (!videoId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "ID de vidéo invalide." });
        }

        // 🔄 إعداد البيانات لتحديثها
        const updateData = {
            title: title.trim(),
            description: description?.trim() || '',
            category: category.trim(),
        };

        // 💡 إضافة/تحديث حقل الرابط الجديد
        if (videoUrl) {
            updateData.url = videoUrl;
        }

        // ❌ تم حذف محاولة حذف الملف القديم (fs.unlinkSync)

        // 🧩 تحديث الفيديو في قاعدة البيانات
        const updatedVideo = await SpecializedVideo.findByIdAndUpdate(
            videoId,
            updateData,
            { new: true }
        );

        if (!updatedVideo) {
            return res.status(404).json({ message: "Vidéo non trouvée." });
        }

        res.json({ message: "✅ Vidéo mise à jour avec succès.", data: updatedVideo });

    } catch (error) {
        console.error("Erreur lors de la mise à jour :", error);
        res.status(500).json({ message: "Erreur serveur lors de la mise à jour de la vidéo." });
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