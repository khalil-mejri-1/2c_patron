import React from 'react'
import Navbar from "../comp/navbar.jsx";
import HeroCarousel from '../comp/HeroCarousel.jsx';
import KeyFeatures from '../comp/KeyFeatures.jsx';
import FeaturedProduct from '../comp/FeaturedProduct.jsx';
import DesignGallery from '../comp/DesignGallery.jsx';
import ProductCarousel from '../comp/ProductCarousel.jsx';
import Footer from '../comp/Footer.jsx';
import ClientReviews from '../comp/ClientReviews.jsx';
export default function Home() {
  return (
    <div>
        <Navbar/>

        <HeroCarousel/>
                        {/* <ProductCarousel/>   */}

        <KeyFeatures/>
        <FeaturedProduct/>
        <ClientReviews/>
                <Footer/>

    </div>
  )
}
