// models/SpecializedVideo.js - AUCUN CHANGEMENT NÉCESSAIRE

const mongoose = require('mongoose');

const specializedVideoSchema = new mongoose.Schema({
    url: { type: String, required: true }, // Stockera maintenant le chemin du fichier (ex: /uploads/videos/12345.mp4)
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const SpecializedVideo = mongoose.model('SpecializedVideo', specializedVideoSchema);
module.exports = SpecializedVideo;