
const mongoose = require('mongoose');

// Models (Simplified for the script)
const courseItemSchema = new mongoose.Schema({
    title: { type: Object, default: {} },
    technicalName: { type: String, default: '' },
    vip_category: { type: String },
});
const SpecializedCourse = mongoose.model('SpecializedCourse', {
    vip_category: { type: String },
    courses: [courseItemSchema]
});

const SpecializedVideo = mongoose.model('SpecializedVideo', {
    url: { type: String, required: true },
    url_lang: { type: Object, default: {} },
    title: { type: String, required: true },
    title_lang: { type: Object, default: {} },
    status_lang: { type: Object, default: {} },
    category: { type: String, required: true },
    subCategory: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

const MONGODB_URI = 'mongodb+srv://2cparton0011:nYdiX2GXYnduOmyG@cluster0.07ov0j7.mongodb.net/?appName=Cluster0';

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const courses = await SpecializedCourse.find({});
        console.log(`Found ${courses.length} main categories`);

        const videoTemplates = [
            { fr: 'Patron', ar: 'الباترون', tn: 'الباترون' },
            { fr: 'Coup', ar: 'القص', tn: 'القص' },
            { fr: 'Couture', ar: 'الخياطة', tn: 'الخياطة' }
        ];

        let addedCount = 0;

        for (const mainCat of courses) {
            for (const subCat of mainCat.courses) {
                const subCatId = subCat.technicalName || subCat.title?.fr || 'unknown';
                
                for (const template of videoTemplates) {
                    const newVideo = new SpecializedVideo({
                        url: '',
                        url_lang: { fr: '', ar: '', en: '', tn: '' },
                        title: template.fr,
                        title_lang: {
                            fr: template.fr,
                            ar: template.ar,
                            en: template.tn,
                            tn: template.tn
                        },
                        status_lang: { fr: 'VIP', ar: 'VIP', en: 'VIP', tn: 'VIP' },
                        category: mainCat.vip_category,
                        subCategory: subCatId
                    });
                    await newVideo.save();
                    addedCount++;
                }
            }
        }

        console.log(`Successfully added ${addedCount} videos across all subcategories.`);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

run();
