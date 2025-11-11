import React from 'react';

// Données des images (à remplacer par vos images réelles)
const galleryImages = [
  { url: 'https://plus.unsplash.com/premium_photo-1664202526559-e21e9c0fb46a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170', alt: 'Robe de soirée élégante', span: 'wide' },
  { url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=720', alt: 'Détail de couture fine', span: 'tall' },
  { url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170', alt: 'Patron sur mannequin', span: 'normal' },
  { url: 'https://images.unsplash.com/photo-1603189343302-e603f7add05a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074', alt: 'Tissu de haute qualité', span: 'normal' },
  { url: 'https://plus.unsplash.com/premium_photo-1683121266311-04c92a01f5e6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170', alt: 'Veste de tailleur', span: 'tall' },
  { url: 'https://images.unsplash.com/photo-1557777586-f6682739fcf3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=735', alt: 'Travail de broderie', span: 'wide' },
  { url: 'https://plus.unsplash.com/premium_photo-1664202525979-80d1da46b34b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1171', alt: 'Travail de broderie', span: 'wide' },

];

export default function DesignGallery() {
  return (
    <section className="design-gallery-section">
      <div className="gallery-header">
        <h2 className="gallery-title">
          Inspirez-vous : L'Art du Patronage
        </h2>
        <p className="gallery-subtitle">
          Découvrez la qualité des créations possibles grâce à nos gabarits et techniques enseignées.
        </p>
      </div>

      <div className="gallery-grid">
        {galleryImages.map((image, index) => (
          <div key={index} className={`gallery-item ${image.span}`}>
            <img src={image.url} alt={image.alt} className="gallery-image" />
          </div>
        ))}
      </div>

      <a href="/gallery" className="gallery-cta-button">
          Voir toute la Collection
      </a>
    </section>
  );
}