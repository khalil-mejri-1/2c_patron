import React, { useState } from 'react';
import { FaHeart, FaShoppingBag, FaArrowRight } from 'react-icons/fa';

// محاكاة البيانات الأساسية لـ 10 منتجات (سيتم تكرارها لإنشاء الحلقة اللانهائية)
const baseProductsData = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `Patron Élégance N° ${i + 1}`,
  price: (49.99 + i * 0.5).toFixed(2),
  imageUrl: `https://picsum.photos/400/500?random=${i}`, 
  isNew: i < 3,
}));

// تكرار البيانات 3 مرات لإنشاء تأثير التمرير اللانهائي
const productsData = [...baseProductsData, ...baseProductsData, ...baseProductsData];

export default function ProductCarousel() {
  // الحالة للتحكم في إيقاف/تشغيل الحركة
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section className="shop-carousel-section">
      <div className="carousel-header">
        <h2 className="carousel-title">
          Découvrez nos Derniers Patrons
        </h2>
        <a href="/patterns" className="view-all-link">
          Voir toute la boutique <FaArrowRight />
        </a>
      </div>

      {/* إضافة معالجات الأحداث للتحكم في حالة الإيقاف المؤقت */}
      <div 
        className="products-carousel-container unique-style"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* إضافة فئة 'paused' عند تمرير مؤشر الفأرة */}
        <div className={`products-track ${isPaused ? 'paused' : ''}`}>
          {productsData.map((product, index) => (
            // استخدام index في المفتاح لتجنب تحذيرات التكرار
            <div key={product.id + '-' + index} className="product-card">
              
              {/* الصورة والعلامات */}
              <div className="product-image-container">
                <img src={product.imageUrl} alt={product.name} className="product-image" />
                {product.isNew && <span className="new-tag">NOUVEAU</span>}
                
                {/* Overlay للتفاعل */}
                <div className="card-overlay">
                    <button className="overlay-btn favorite-btn" aria-label="Ajouter aux favoris">
                        <FaHeart />
                    </button>
                    <button className="overlay-btn main-action-btn" aria-label="Ajouter au panier">
                        <FaShoppingBag /> ACHETER
                    </button>
                </div>
              </div>

              {/* تفاصيل المنتج */}
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">
                  <span className="price-value">{product.price}</span> DT
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}