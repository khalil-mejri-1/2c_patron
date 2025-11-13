// models/VipCategory.js

const mongoose = require('mongoose');

const VipCategorySchema = new mongoose.Schema({
    // Name of the category (e.g., "Les Corsage")
    title: {
        type: String,
        required: [true, "Le titre est obligatoire."],
        trim: true,
        unique: true
    },
    // Brief description of the category
    description: {
        type: String,
        required: [true, "La description est obligatoire."]
    },
    // Course duration (e.g., "10 Leçons")
    duration: {
        type: String,
        default: "Non spécifiée"
    },
    // URL of the category image
    image: {
        type: String,
        required: [true, "L'URL de l'image est obligatoire."]
    },
    // Automatically adds createdAt and updatedAt fields
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('VipCategory', VipCategorySchema);