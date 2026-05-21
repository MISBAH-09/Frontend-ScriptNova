// import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection.jsx';
import Navbar from '../components/Navbar.jsx';
import FeaturesSection from '../components/FeaturesSection';
import PricingSection from '../components/PricingSection.jsx';
import About from '../components/About.jsx';
import Footer from '../components/Footer.jsx';


export default function Landing() {
  return (
    <>
    <Navbar/>
    <HeroSection />
    <FeaturesSection />
    <About />
    <PricingSection />
    <Footer />

    </>


  );
}
