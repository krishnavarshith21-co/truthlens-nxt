import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Scan, Sparkles } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 animate-float">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Powered by Advanced AI</span>
        </div>

        {/* Main heading */}
        <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
          <span className="text-gradient">VeriFy.AI</span>
          <br />
          <span className="text-4xl md:text-6xl text-foreground/90">Trust What You See</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
          Detect misinformation, deepfakes, and AI-generated content in real-time.
          Powered by next-generation AI models to rebuild digital trust.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button 
            size="lg" 
            className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-6 rounded-2xl glow-primary transition-all duration-300 hover:scale-105 group"
          >
            <Scan className="w-5 h-5 mr-2 group-hover:animate-spin" />
            Start Verification
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="text-lg px-8 py-6 rounded-2xl glass-card border-primary/30 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            See How It Works
          </Button>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { title: "News Verification", desc: "Real-time fact checking from trusted sources" },
            { title: "Deepfake Detection", desc: "Advanced AI to spot manipulated media" },
            { title: "Trust Score", desc: "Clear 0-100% authenticity rating" }
          ].map((feature, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl hover:glow-primary transition-all duration-300 group cursor-pointer">
              <h3 className="font-semibold text-lg mb-2 group-hover:text-gradient transition-colors">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scanning eye animation in corner */}
      <div className="absolute bottom-10 right-10 opacity-20">
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 border-4 border-primary rounded-full animate-ping"></div>
          <div className="absolute inset-4 border-4 border-secondary rounded-full animate-pulse"></div>
          <div className="absolute inset-8 bg-primary rounded-full animate-pulse-slow"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
