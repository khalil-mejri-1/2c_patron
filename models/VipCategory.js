// models/VipCategory.js

const mongoose = require('mongoose');

const VipCategorySchema = new mongoose.Schema({
    // Name of the category (e.g., "Les Corsage")
    title: {
        type: Object,
        required: [true, "Le titre est obligatoire."],
        default: {}
    },
    // Brief description of the category
    description: {
        type: Object,
        required: [true, "La description est obligatoire."],
        default: {}
    },
    // Course duration (e.g., "10 Leçons")
    duration: {
        type: Object,
        default: {}
    },
    // URL of the category image
    image: {
        type: Object,
        required: [true, "L'URL de l'image est obligatoire."],
        default: {}
    },
    technicalName: {
        type: String,
        default: ''
    },

    // Order for displaying the category
    order: {
        type: Number,
        default: 0
    },
    // Access Type (VIP or Gratuit)
    accessType: {
        type: String,
        default: 'vip'
    },
    imageFit: {
        type: String,
        default: 'cover'
    },
    // Automatically adds createdAt and updatedAt fields
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { minimize: false }); // Added minimize: false to preserve empty objects if needed

module.exports = mongoose.model('VipCategory', VipCategorySchema);