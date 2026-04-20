import React, { useEffect } from 'react'
import Navbar from "../comp/navbar.jsx";
import HeroCarousel from '../comp/HeroCarousel.jsx';
import FeaturedProduct from '../comp/FeaturedProduct.jsx';
import Footer from '../comp/Footer.jsx';
import ClientReviews from '../comp/ClientReviews.jsx';
import './home_premium.css';

export default function Home() {

  useEffect(() => {
    // Simple intersection observer for reveal animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-page-wrapper">
      <Navbar />

      <main className="home-main-content">
        <div className="reveal">
          <HeroCarousel />
        </div>

        <div className="reveal">
          <FeaturedProduct />
        </div>

        <div className="reveal">
          <ClientReviews />
        </div>
      </main>

      <Footer />
    </div>
  )
}
