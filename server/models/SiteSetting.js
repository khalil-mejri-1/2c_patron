const mongoose = require('mongoose');

const SiteSettingSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true }
});

module.exports = mongoose.model('SiteSetting', SiteSettingSchema);
