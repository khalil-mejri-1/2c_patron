const mongoose = require("mongoose");

const homeProductSchema = new mongoose.Schema(
  {
    nom: { type: Object, required: true, default: {} },
    image: { type: String, required: true },
    prix: { type: Number, required: true },
    categorie: { type: String, default: 'General' },
    isFeatured: { type: Boolean, default: false },
    description: { type: Object, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model("HomeProduct", homeProductSchema);
