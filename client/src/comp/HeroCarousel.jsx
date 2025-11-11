import React, { useState, useEffect } from 'react';
import { FaArrowRight, FaShoppingCart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
// استيراد صور المنتجات هنا (افتراضياً)
// import product1 from '...'; 
// import product2 from '...'; 

export default function HeroSection() {
    const products = [
        { id: 1, name: 'Patron Robe d\'Élégance', price: 49, url: 'https://images.unsplash.com/photo-1716004353202-3a7d594f80be?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687', alt: 'Robe élégante' },
        { id: 2, name: 'Gabarit Jupe Crayon', price: 25, url: 'https://images.unsplash.com/photo-1716004355861-daafad06adc8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687', alt: 'Jupe Crayon' },
        { id: 3, name: 'Masterclass Tissus Fluides', price: 99, url: 'https://images.unsplash.com/photo-1746900535641-36451eef8c29?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687', alt: 'Masterclass Tissus' },
    ];

    const [currentSlide, setCurrentSlide] = useState(0);
    const totalSlides = products.length;
    const transformValue = `translateX(-${currentSlide * (100 / totalSlides)}%)`;

    // لوجيك التمرير التلقائي
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prevSlide) => (prevSlide + 1) % totalSlides);
        }, 5000); // تغيير كل 5 ثواني
        return () => clearInterval(interval);
    }, [totalSlides]);

    // الملاحظة: يجب أن يكون عرض حاوية الـ product-carousel-container في CSS هو 100%
    // ويتم التحكم في العرض الفعلي بواسطة قيمة الـ width التي تحسبها في JSX.

    return (
        <section className="modern-hero-section">
            
            {/* 1. Bloc de Contenu (النص والأزرار) */}
            <div className="hero-content-block">
                <h1 className="hero-main-title">
                    <span style={{color:"#333333"}}>L'ATELIER</span>
                    <span className="accent-text">COUTURE</span>
                    <span className="hero-subline">MAÎTRISER L'ART DU PATRONAGE</span>
                </h1>
                <p className="hero-intro-text">
                    Accédez aux secrets du patronage et du moulage avec des cours vidéo exclusifs. 
                    Devenez l'artisan d'art que vous avez toujours rêvé d'être.
                </p>
                <Link to="/magasin" className="hero-cta-button">
                    Découvrir le Master Atelier <FaArrowRight />
                </Link>
            </div>

            {/* 2. Bloc Visuel: شريط المنتجات المتحرك */}
            <div className="hero-visual-block">
                <div 
                    className="product-carousel-container" 
                    style={{ 
                        // عرض الحاوية يعادل مجموع عرض الشرائح
                        width: `${totalSlides * 100}%`,
                        transform: `translateX(-${currentSlide * (100 / totalSlides)}%)` 
                    }}
                >
                    {products.map((product) => (
                        <div 
                            key={product.id} 
                            className="product-slide"
                            style={{ 
                                // عرض كل شريحة يعادل العرض الكلي مقسومًا على عدد الشرائح
                                width: `calc(100% / ${totalSlides})` 
                            }}
                        >
                            <img 
                                className='product-image' 
                                src={product.url} 
                                alt={product.alt} 
                            />
                            {/* NEW: إضافة div لتطبيق التدرج */}
                            <div className="image-gradient-overlay"></div>

                            {/* 🌟 NEW: حاوية التفاصيل فوق التدرج 🌟 */}
                            <div className="product-details">
                                <h3 className="product-name">{product.name}</h3>
                                <div className="product-info-row">
                                    <span className="product-price">{product.price} DT</span>
                                    {/* تم إصلاح زر Achat في CSS لإزالة الـ right: 70px */}
                                    <button className="add-to-cart-button">
                                        <FaShoppingCart /> Achat
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </section>
    );
}