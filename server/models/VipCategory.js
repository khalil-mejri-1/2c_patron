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
        type: String,
        required: [true, "L'URL de l'image est obligatoire."]
    },
    // Order for displaying the category
    order: {
        type: Number,
        default: 0
    },
    // Automatically adds createdAt and updatedAt fields
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('VipCategory', VipCategorySchema);