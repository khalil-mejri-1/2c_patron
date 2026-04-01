const mongoose = require('mongoose');
const SpecializedVideo = require('./models/SpecializedVideo');

const MONGODB_URI = 'mongodb+srv://2cparton0011:nYdiX2GXYnduOmyG@cluster0.07ov0j7.mongodb.net/?appName=Cluster0';

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);
        const newVideo = new SpecializedVideo({
            url: 'test_url',
            title: 'Test AI Video',
            category: 'aaaa',
            subCategory: 'abc',
            title_lang: { fr: 'Test AI Video', ar: 'اختبار', tn: 'test' },
            url_lang: { fr: 'test_url' }
        });
        await newVideo.save();
        console.log('Test video saved:', newVideo._id);
        await mongoose.disconnect();
    } catch (e) {
        console.log('Error:', e);
    }
}

check();
