import React, { useState } from 'react';
import { FaHeart, FaShoppingBag, FaArrowRight } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

// محاكاة البيانات الأساسية لـ 10 منتجات (سيتم تكرارها لإنشاء الحلقة اللانهائية)
const baseProductsData = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: {
    fr: `Patron Élégance N° ${i + 1}`,
    ar: `باترون أناقة رقم ${i + 1}`,
    en: `Elegance Pattern No. ${i + 1}`
  },
  price: (49.99 + i * 0.5).toFixed(2),
  imageUrl: `https://picsum.photos/400/500?random=${i}`,
  isNew: i < 3,
}));

// تكرار البيانات 3 مرات لإنشاء تأثير التمرير اللانهائي
const productsData = [...baseProductsData, ...baseProductsData, ...baseProductsData];

const translations = {
  fr: {
    title: "Découvrez nos Derniers Patrons",
    viewAll: "Voir toute la boutique",
    new: "NOUVEAU",
    buy: "ACHETER"
  },
  ar: {
    title: "اكتشفوا أحدث الباترونات لدينا",
    viewAll: "عرض المتجر بالكامل",
    new: "جديد",
    buy: "شراء"
  },
  en: {
    title: "Discover our Latest Patterns",
    viewAll: "View all shop",
    new: "NEW",
    buy: "BUY"
  }
};

export default function ProductCarousel() {
  const { appLanguage } = useLanguage();
  const t = translations[appLanguage] || translations.fr;
  const isRTL = appLanguage === 'ar';

  // الحالة للتحكم في إيقاف/تشغيل الحركة
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section className="shop-carousel-section" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="carousel-header">
        <h2 className="carousel-title">
          {t.title}
        </h2>
        <a href="/magasin" className="view-all-link">
          {t.viewAll} {isRTL ? <FaArrowRight style={{ transform: 'scaleX(-1)' }} /> : <FaArrowRight />}
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
                <img src={product.imageUrl} alt={product.name[appLanguage] || product.name.fr} className="product-image" />
                {product.isNew && <span className="new-tag">{t.new}</span>}

                {/* Overlay للتفاعل */}
                <div className="card-overlay">
                  <button className="overlay-btn favorite-btn" aria-label="Ajouter aux favoris">
                    <FaHeart />
                  </button>
                  <button className="overlay-btn main-action-btn" aria-label="Ajouter au panier">
                    <FaShoppingBag /> {t.buy}
                  </button>
                </div>
              </div>

              {/* تفاصيل المنتج */}
              <div className="product-info">
                <h3 className="product-name">{product.name[appLanguage] || product.name.fr}</h3>
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