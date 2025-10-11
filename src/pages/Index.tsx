import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import VerificationSection from "@/components/VerificationSection";
import TrustScoreDemo from "@/components/TrustScoreDemo";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <VerificationSection />
      <TrustScoreDemo />
      <Footer />
    </div>
  );
};

export default Index;
