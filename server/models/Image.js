const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true
    },
    contentType: {
        type: String,
        default: 'image/webp'
    },
    data: {
        type: Buffer,
        required: true
    },
    size: {
        type: Number
    }
}, {
    timestamps: true
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
