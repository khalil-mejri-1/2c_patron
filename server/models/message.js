const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    // 👤 Votre Nom Complet
    nom: {
        type: String,
        required: [true, "Le nom est requis."],
        trim: true,
        maxlength: 100
    },
    // 📧 Votre E-mail
    email: {
        type: String,
        required: [true, "L'email est requis."],
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Veuillez utiliser une adresse e-mail valide.']
    },
    // 📝 Sujet du Message
    sujet: {
        type: String,
        required: [true, "Le sujet est requis."],
        trim: true,
        maxlength: 200
    },
    // 💬 Votre Message
    message: {
        type: String,
        required: [true, "Le message ne peut pas être vide."],
        maxlength: 1000
    },
    // ✅ الحالة (تم الرد عليه/لم يتم الرد عليه)
    estTraite: {
        type: Boolean,
        default: false // القيمة الافتراضية: لم يتم الرد عليه بعد
    },
    // 🕰️ تاريخ ووقت إرسال الرسالة
    dateCreation: {
        type: Date,
        default: Date.now
    }
});

// إنشاء الفهرس لسرعة البحث
messageSchema.index({ email: 1, dateCreation: -1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;