const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://2cparton0011:nYdiX2GXYnduOmyG@cluster0.07ov0j7.mongodb.net/?appName=Cluster0';

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;

        const abcVideos = await db.collection('specializedvideos').find({ subCategory: 'abc' }).toArray();
        console.log('Videos with subCategory "abc":', abcVideos);

        const abcVideosDash = await db.collection('specialized-videos').find({ subCategory: 'abc' }).toArray();
        console.log('Videos with subCategory "abc" (dash):', abcVideosDash);
        
        await mongoose.disconnect();
    } catch (e) {
        console.log('Error:', e);
    }
}

check();
