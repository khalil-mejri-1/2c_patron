const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://2cparton0011:nYdiX2GXYnduOmyG@cluster0.07ov0j7.mongodb.net/?appName=Cluster0';

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;

        const latest = await db.collection('specializedvideos').find({}).sort({ createdAt: -1 }).limit(5).toArray();
        console.log('Latest 5 videos:', JSON.stringify(latest, null, 2));
        
        await mongoose.disconnect();
    } catch (e) {
        console.log('Error:', e);
    }
}

check();
