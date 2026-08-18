import React from 'react';
import './PremiumSkeleton.css';

/**
 * 🌟 Premium Universal Skeleton Loaders
 * Designed to maintain architectural consistency and high elegance across the site.
 */

// 1. Grid of Product / Course / Item Cards Skeleton
export const ProductGridSkeleton = ({ count = 6 }) => {
    return (
        <div className="skeleton-grid">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="skeleton-card-luxury shimmer">
                    <div className="skeleton-card-img-wrapper shimmer" />
                    <div className="skeleton-card-content">
                        <div className="skeleton-line-pill short shimmer" style={{ marginBottom: '12px' }} />
                        <div className="skeleton-line-pill title shimmer" style={{ marginBottom: '14px' }} />
                        <div className="skeleton-line-pill medium shimmer" style={{ marginBottom: '20px' }} />
                        <div className="skeleton-card-footer">
                            <div className="skeleton-line-pill price shimmer" />
                            <div className="skeleton-line-pill btn shimmer" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// 2. Hero Section Skeleton
export const HeroSkeleton = () => {
    return (
        <div className="skeleton-hero-banner shimmer">
            <div className="skeleton-hero-container">
                <div className="skeleton-line-pill badge shimmer" />
                <div className="skeleton-line-pill hero-title shimmer" />
                <div className="skeleton-line-pill hero-subtitle shimmer" />
                <div className="skeleton-hero-cta-group">
                    <div className="skeleton-line-pill hero-btn shimmer" />
                    <div className="skeleton-line-pill hero-btn secondary shimmer" />
                </div>
            </div>
        </div>
    );
};

// 3. Single Product Details Page Skeleton
export const ProductDetailsSkeleton = ({ direction = 'rtl' }) => {
    return (
        <div className="product-details-skeleton-container" dir={direction}>
            <div className="pd-skeleton-layout">
                {/* Media Side */}
                <div className="pd-skeleton-media-side">
                    <div className="pd-skeleton-main-img shimmer" />
                    <div className="pd-skeleton-thumbs">
                        {[1, 2, 3, 4].map(n => (
                            <div key={n} className="pd-skeleton-thumb shimmer" />
                        ))}
                    </div>
                </div>
                {/* Info Side */}
                <div className="pd-skeleton-info-side">
                    <div className="skeleton-line-pill badge shimmer" style={{ width: '90px' }} />
                    <div className="skeleton-line-pill title shimmer" style={{ height: '42px', width: '80%', margin: '15px 0' }} />
                    <div className="skeleton-line-pill price shimmer" style={{ height: '36px', width: '130px', marginBottom: '25px' }} />
                    <div className="skeleton-line-pill shimmer" style={{ height: '100px', width: '100%', borderRadius: '16px', marginBottom: '30px' }} />
                    
                    <div className="pd-skeleton-box shimmer">
                        <div className="skeleton-line-pill title shimmer" style={{ height: '24px', width: '40%', marginBottom: '20px' }} />
                        <div className="pd-skeleton-inputs">
                            <div className="skeleton-line-pill shimmer" style={{ height: '52px', borderRadius: '12px' }} />
                            <div className="skeleton-line-pill shimmer" style={{ height: '52px', borderRadius: '12px' }} />
                        </div>
                        <div className="skeleton-line-pill shimmer" style={{ height: '56px', borderRadius: '30px', marginTop: '20px' }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// 4. Client Reviews Section Skeleton
export const ClientReviewsSkeleton = () => {
    return (
        <div className="skeleton-reviews-section shimmer">
            <div className="skeleton-reviews-container">
                <div className="skeleton-line-pill badge shimmer" style={{ width: '140px', margin: '0 auto 15px' }} />
                <div className="skeleton-line-pill title shimmer" style={{ width: '40%', margin: '0 auto 40px', height: '32px' }} />
                <div className="skeleton-review-card shimmer">
                    <div className="skeleton-avatar shimmer" />
                    <div className="skeleton-line-pill medium shimmer" style={{ width: '30%', margin: '15px auto' }} />
                    <div className="skeleton-line-pill long shimmer" style={{ width: '70%', margin: '10px auto' }} />
                    <div className="skeleton-stars-row">
                        {[1, 2, 3, 4, 5].map(star => (
                            <div key={star} className="skeleton-star-dot shimmer" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// 5. Specialized Course / Lesson Player Skeleton
export const CoursePlayerSkeleton = () => {
    return (
        <div className="skeleton-course-wrapper">
            <div className="skeleton-course-hero shimmer">
                <div className="skeleton-line-pill title shimmer" style={{ width: '50%', height: '40px' }} />
            </div>
            <div className="skeleton-course-body">
                <div className="skeleton-video-player shimmer" />
                <div className="skeleton-lessons-sidebar">
                    {[1, 2, 3, 4].map(n => (
                        <div key={n} className="skeleton-lesson-item shimmer" />
                    ))}
                </div>
            </div>
        </div>
    );
};

// 6. Premium Inline Error State Component (No dummy data fallback)
export const PremiumErrorState = ({ message, onRetry }) => {
    return (
        <div className="premium-error-banner">
            <div className="premium-error-icon">⚠️</div>
            <div className="premium-error-content">
                <h4>تعذر جلب البيانات من الخادم</h4>
                <p>{message || "حدث خطأ أثناء الاتصال بقاعدة البيانات. يرجى المحاولة مرة أخرى لاحقاً."}</p>
            </div>
            {onRetry && (
                <button onClick={onRetry} className="premium-retry-btn">
                    إعادة المحاولة
                </button>
            )}
        </div>
    );
};

