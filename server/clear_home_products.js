const mongoose = require('mongoose');
const HomeProduct = require('./models/HomeProduct');

const MONGODB_URI = 'mongodb+srv://2cparton0011:nYdiX2GXYnduOmyG@cluster0.07ov0j7.mongodb.net/?appName=Cluster0';

async function clearHomeProducts() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
        
        const result = await HomeProduct.deleteMany({});
        console.log(`Successfully deleted ${result.deletedCount} old home products.`);
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
    }
}

clearHomeProducts();
