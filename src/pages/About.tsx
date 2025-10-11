import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Shield, Target, Users, Zap } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4">
              <span className="text-gradient">About VeriFy.AI</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Rebuilding digital trust through advanced AI verification technology
            </p>
          </div>

          {/* Mission Statement */}
          <Card className="glass-card p-12 mb-12 text-center">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              In an era of deepfakes and AI-generated misinformation, VeriFy.AI stands as your digital guardian. 
              We empower users to verify the authenticity of any content—news, images, videos, or audio—using 
              cutting-edge AI models and trusted verification sources. Our goal is simple: 
              <span className="text-foreground font-semibold"> Trust What You See</span>.
            </p>
          </Card>

          {/* Core Values */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card className="glass-card p-6 text-center hover:glow-primary transition-all duration-300">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Trust & Security</h3>
              <p className="text-sm text-muted-foreground">
                Verified sources and encrypted data protection
              </p>
            </Card>

            <Card className="glass-card p-6 text-center hover:glow-primary transition-all duration-300">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Accuracy First</h3>
              <p className="text-sm text-muted-foreground">
                Multiple AI models for precise verification
              </p>
            </Card>

            <Card className="glass-card p-6 text-center hover:glow-primary transition-all duration-300">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-bold text-lg mb-2">Community Driven</h3>
              <p className="text-sm text-muted-foreground">
                Collaborative verification and knowledge sharing
              </p>
            </Card>

            <Card className="glass-card p-6 text-center hover:glow-primary transition-all duration-300">
              <div className="w-16 h-16 bg-trust-high/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-trust-high" />
              </div>
              <h3 className="font-bold text-lg mb-2">Real-Time Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Instant verification results with AI speed
              </p>
            </Card>
          </div>

          {/* How It Works */}
          <Card className="glass-card p-12">
            <h2 className="text-3xl font-bold mb-8 text-center">How VeriFy.AI Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-bold text-lg mb-3">Upload Content</h3>
                <p className="text-muted-foreground">
                  Submit news articles, images, videos, or audio files for instant analysis
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-secondary">2</span>
                </div>
                <h3 className="font-bold text-lg mb-3">AI Analysis</h3>
                <p className="text-muted-foreground">
                  Multiple AI models scan for manipulation, verify sources, and cross-check facts
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-accent">3</span>
                </div>
                <h3 className="font-bold text-lg mb-3">Get Results</h3>
                <p className="text-muted-foreground">
                  Receive a trust score, detailed explanation, and verified sources instantly
                </p>
              </div>
            </div>
          </Card>

          {/* Team Section */}
          <div className="text-center mt-16">
            <h2 className="text-3xl font-bold mb-6">Built by Nxt Step Innovators</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A team of AI researchers, developers, and digital trust advocates dedicated to 
              making the internet a safer place for everyone.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
