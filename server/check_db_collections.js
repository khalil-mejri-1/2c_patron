const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://2cparton0011:nYdiX2GXYnduOmyG@cluster0.07ov0j7.mongodb.net/?appName=Cluster0';

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;

        const videoDash = await db.collection('specialized-videos').findOne({ category: 'aaaa' });
        console.log('Video for aaaa (dash):', videoDash);

        const videoNoDash = await db.collection('specializedvideos').findOne({ category: 'aaaa' });
        console.log('Video for aaaa (no dash):', videoNoDash);
        
        await mongoose.disconnect();
    } catch (e) {
        console.log('Error:', e);
    }
}

check();
