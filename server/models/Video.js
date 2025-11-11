const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  // 💡 تم إضافة حقل الفئة هنا
  categorie: {
    type: String,
    required: true, // اجعله مطلوبًا كما هو في الواجهة الأمامية
    trim: true,
    enum: ["Tutoriel", "Cours", "Actualités", "Divertissement", "Autre"], // (اختياري) للتحقق من صحة القيمة
  },
  fileName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  }
});

const Video = mongoose.model('Video', videoSchema);
module.exports = Video;