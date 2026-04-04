const mongoose = require("mongoose");

const homeProductSchema = new mongoose.Schema(
  {
    nom: { type: Object, required: true, default: {} },
    image: { type: String, required: true },
    prix: { type: Number, required: true },
    categorie: { type: String, default: 'General' },
    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    description: { type: Object, default: {} },
    secondaryImages: { type: [String], default: [] },
    innerImages: { type: [String], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model("HomeProduct", homeProductSchema);
