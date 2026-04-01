const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://2cparton0011:nYdiX2GXYnduOmyG@cluster0.07ov0j7.mongodb.net/?appName=Cluster0';

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;

        const results = await db.collection('videos').find({
            $or: [
                { category: 'aaaa' },
                { subCategory: 'abc' }
            ]
        }).toArray();
        console.log('Results in "videos":', results);

        await mongoose.disconnect();
    } catch (e) {
        console.log('Error:', e);
    }
}

check();
