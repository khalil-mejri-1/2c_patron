const mongoose = require('mongoose');

const courseItemSchema = new mongoose.Schema({
    title: { type: Object, required: true, default: {} },
    duration: { type: Object, required: false, default: {} },
    image: { type: String, required: true },
    vip_category: { type: String, required: true },
    hero_content: { type: Object, default: {} }, // Multi-language object
    hero_bg: { type: String, required: false },
});

const specializedCourseSchema = new mongoose.Schema({
    video_link: { type: Object, required: false, default: {} },
    hero_bg: { type: String, required: false },
    hero_content: { type: Object, default: {} }, // Multi-language object
    vip_category: { type: String, required: false }, // Top-level category name
    courses: [courseItemSchema],
    createdAt: { type: Date, default: Date.now },
});

const SpecializedCourse = mongoose.model('SpecializedCourse', specializedCourseSchema);
module.exports = SpecializedCourse;
