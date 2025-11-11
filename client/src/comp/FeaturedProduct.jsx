import React from 'react';
import { FaPlay, FaLongArrowAltRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function FeaturedProduct() {
  return (
    <section className="featured-product-section">
      
      {/* 1. Bloc Visuel : Image de haute qualité du produit/résultat */}
      <div className="product-visual-block">
        {/* L'image doit représenter le résultat final (un pantalon professionnel, par exemple) */}
        <img 
          src="https://images.unsplash.com/photo-1612215327100-60fc5c4d7938?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=764" 
          alt="Cours de Patronage de Pantalons Professionnels"
          className="featured-product-image" 
        />
        {/* Bouton Play stylisé sur l'image */}
        <div className="play-overlay">
          <FaPlay className="play-icon" />
        </div>
      </div>

      {/* 2. Bloc de Contenu : Titres et CTA */}
      <div className="product-content-block">
        <span className="product-tag">COURS VEDETTE & BEST-SELLER</span>
        
        <h2 className="product-main-title">
          Le Cours Maître : <br/>
          **Patronage de Pantalons Professionnels**
        </h2>
        
        <p className="product-description">
          Débloquez les techniques de la coupe parfaite des pantalons de tailleur. Ce cours intensif, étape par étape, vous garantit un ajustement impeccable et une finition digne de la Haute Couture.
        </p>

     

        <Link to="/Vip-access" className="product-cta-button">
          S'inscrire Maintenant (249€) <FaLongArrowAltRight />
        </Link>
      </div>

    </section>
  );
}