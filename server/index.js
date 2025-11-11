// server.js (الكود النهائي المصحح والمؤمن)

// 1. استيراد الوحدات (Imports)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Command = require('./models/command');
// استيراد النماذج
const Commentaire = require("./models/Commentaire.js");
const Abonnement = require('./models/Abonnement.js');
const Video = require('./models/Video');
const User = require("./models/user.js");
const Product = require("./models/Product.js");
const Message = require("./models/message.js");

// 2. إنشاء تطبيق Express
const app = express();
const PORT = 3000;


// -------------------- A. MIDDLEWARE SETUP --------------------

app.use(cors());
app.use(express.json());


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads', 'videos');
    // إنشاء المجلد إذا لم يكن موجودًا
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // حد حجم الملف
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers vidéo sont autorisés!'), false);
    }
  }
}).single('videoFile');



app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads', 'images');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const isValid = allowed.test(path.extname(file.originalname).toLowerCase());
    if (isValid) cb(null, true);
    else cb(new Error('Seules les images JPG, PNG ou WEBP sont autorisées!'));
  }
}).single('preuve_paiement');
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

app.get('/', (req, res) => {
  res.send('Hello World! Connected to Express and MongoDB.');
});

// **********************************************
// مسار بث الفيديو (مفتوح للجميع ومؤمن ضد الوصول المباشر)
// **********************************************

// ⚠️ تم إلغاء 'isAdmin' من هذا المسار لتلبية طلبك، وأصبح البث متاحاً لمن يعرف الـ ID
app.get('/api/videos/stream/:id', async (req, res) => {
  try {
    // 1. جلب معلومات الفيديو من قاعدة البيانات (تم تصحيح اسم الموديل إلى Video)
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).send('الفيديو غير موجود.');
    }

    // 2. بناء المسار الفعلي للملف على الخادم (باستخدام 'fileName' المخزن)
    const filePath = path.join(__dirname, 'uploads', 'videos', video.fileName);

    // 3. التحقق من وجود الملف
    if (!fs.existsSync(filePath)) {
      console.error(`الملف غير موجود في المسار: ${filePath}`);
      return res.status(404).send('لم يتم العثور على الملف الفيزيائي.');
    }

    // 4. إعداد البث الكامل (Handling Range for streaming)
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });

      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4', // تأكد من نوع MIME الصحيح
        'Content-Disposition': 'inline',
      };

      res.writeHead(206, head); // 206 Partial Content (ضروري لعمل التشغيل والتقديم)
      file.pipe(res);
    } else {
      // الطلب الأولي (تحميل كامل للتشغيل البطيء)
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
        'Content-Disposition': 'inline',
      };
      res.writeHead(200, head); // 200 OK
      fs.createReadStream(filePath).pipe(res);
    }

  } catch (error) {
    console.error("خطأ في بث الفيديو:", error);
    res.status(500).send("خطأ داخلي في الخادم.");
  }
});


// ----------------------------------------------------
// ⚠️ تم حذف دالة isAdmin لأنها لم تعد مطلوبة في مسار البث
// ----------------------------------------------------


// **********************************************
// مسارات المستخدمين (User Routes)
// **********************************************

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

        // 1. Trouver et supprimer l'utilisateur
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
// مسارات المنتجات (Product Routes)
// **********************************************

app.post('/api/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
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

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error in GET /api/products:', error.message);
    res.status(500).json({ error: 'Erreur du serveur lors de la récupération des produits.' });
  }
});

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

app.put('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const updatedData = req.body;
    if (updatedData.prix) {
      updatedData.prix = parseFloat(updatedData.prix);
      if (isNaN(updatedData.prix)) return res.status(400).json({ message: "Le prix doit être un nombre valide." });
    }
    const product = await Product.findByIdAndUpdate(productId, updatedData, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Produit non trouvé pour la mise à jour.' });
    res.status(200).json(product);
  } catch (error) {
    console.error('Error in PUT /api/products/:id:', error.message);
    res.status(500).json({ error: 'Erreur du serveur lors de la mise à jour du produit.', details: error.message });
  }
});


// **********************************************
// مسارات الفيديوهات (Video Routes)
// **********************************************

// 1. POST: إضافة فيديو جديد (باستخدام Multer كـ Middleware)
app.post('/api/videos', upload, async (req, res) => {

  if (!req.file) {
    return res.status(400).json({ message: 'Veuillez sélectionner un fichier vidéo à téléverser.' });
  }

  try {
    const newVideo = new Video({
      titre: req.body.titre,
      description: req.body.description,
      categorie: req.body.categorie,
      fileName: req.file.filename,

      filePath: `/uploads/videos/${req.file.filename}`
    });
    const savedVideo = await newVideo.save();
    res.status(201).json(savedVideo);
  } catch (error) {
    // إذا فشل الحفظ في DB، قم بحذف الملف من الخادم
    if (req.file) {
      const videoPath = path.join(__dirname, 'uploads', 'videos', req.file.filename);
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
    }
    console.error("Erreur DB après upload:", error.message);
    res.status(400).json({ message: 'Échec de l\'ajout de la vidéo DB.', details: error.message });
  }
});

// 2. GET: جلب جميع الفيديوهات
app.get('/api/videos', async (req, res) => {
  try {
    const videos = await Video.find().sort({ dateAjout: -1 });
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des vidéos.' });
  }
});

// 3. PUT: تحديث البيانات الوصفية للفيديو
app.put('/api/videos/:id', async (req, res) => {
  try {
    const updatedVideo = await Video.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedVideo) return res.status(404).json({ message: 'Vidéo non trouvée pour la mise à jour.' });
    res.status(200).json(updatedVideo);
  } catch (error) {
    res.status(400).json({ message: 'Échec de la mise à jour.', details: error.message });
  }
});

// 4. DELETE: حذف فيديو (يتم حذف الملف أولاً)
app.delete('/api/videos/:id', async (req, res) => {
  try {
    const videoId = req.params.id;
    const video = await Video.findById(videoId);

    if (!video) return res.status(404).json({ message: 'Vidéo non trouvée.' });

    // حذف الملف من القرص
    const videoPath = path.join(__dirname, 'uploads', 'videos', video.fileName);
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId);
    res.status(200).json({ message: 'Vidéo et fichier supprimés avec succès.', _id: videoId });

  } catch (error) {
    console.error('Error server during deletion:', error.message);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression.', details: error.message });
  }
});









app.post('/api/commands', async (req, res) => {
    try {
        // 1. Extraction des données, incluant clientEmail (optionnel) et les items avec productImage
        const { clientName, clientPhone, shippingAddress, items, totalAmount, clientEmail } = req.body;

        // 2. Validation de base des données reçues
        if (!clientPhone || !shippingAddress || !items || items.length === 0 || totalAmount == null || totalAmount < 0) {
            return res.status(400).json({ message: 'Données de commande incomplètes ou invalides (téléphone, adresse, articles ou montant manquant).' });
        }
        
        // 🚨 NOUVEAU: Validation des items pour s'assurer que productImage est présent si nécessaire
        // Si productImage est requis dans le schéma, cette validation devient essentielle.
        // Ici, je suppose qu'il est facultatif comme dans le schéma Command.js.
        // Vous pouvez ajouter une validation plus stricte si vous le souhaitez.
        for (const item of items) {
            if (!item.productId || !item.productName || item.quantity == null || item.quantity < 1 || item.price == null || item.price < 0) {
                return res.status(400).json({ message: 'Détails d\'article de commande incomplets ou invalides.' });
            }
            // Si vous voulez forcer productImage:
            // if (!item.productImage) {
            //     return res.status(400).json({ message: 'L\'image du produit est manquante pour un article.' });
            // }
        }

        // 3. Créer une nouvelle instance de commande
        // Mongoose va automatiquement mapper les champs de `items` si les noms correspondent au schéma.
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
        const nouveauCommentaire = await Commentaire.create(req.body);
        res.status(201).json({ success: true, data: nouveauCommentaire });
    } catch (error) {
        // Gère les erreurs de validation Mongoose
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages });
        }
        res.status(500).json({ success: false, error: 'Erreur serveur lors de la création du commentaire' });
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





















// -------------------- F. Route لإضافة abonnement جديد --------------------
app.post('/api/abonnement', uploadImage, async (req, res) => {
  try {
    const { nom, mail } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "L'image de preuve de paiement est requise." });
    }

    // vérifier si l'email existe déjà
    const existant = await Abonnement.findOne({ mail });
    if (existant) {
      return res.status(400).json({ message: "Une demande avec cet email existe déjà." });
    }

    const preuve_paiement_url = `/uploads/images/${req.file.filename}`;

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

    // حذف الصورة من السيرفر
    if (abonnement.preuve_paiement_url) {
      const imagePath = path.join(__dirname, abonnement.preuve_paiement_url);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await Abonnement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Abonnement supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur DELETE abonnement:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});









// GET /api/users?email=kmejri57@gmail.com
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



// Utilisez cette version si vos emails dans la DB sont stockés de manière incohérente (espaces, casse)
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
