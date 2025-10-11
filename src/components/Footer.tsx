import { Shield, Mail, Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-12 px-4 mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center glow-primary">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-xl text-gradient">VeriFy.AI</div>
                <div className="text-xs text-muted-foreground">by Nxt Step Innovators</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              Building digital trust through advanced AI-powered verification. 
              Detect misinformation, deepfakes, and AI-generated content in real-time.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 glass-card rounded-xl flex items-center justify-center hover:glow-primary transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 glass-card rounded-xl flex items-center justify-center hover:glow-primary transition-all">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 glass-card rounded-xl flex items-center justify-center hover:glow-primary transition-all">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">API</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Team</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 VeriFy.AI by Nxt Step Innovators. All rights reserved.
          </p>
          <a 
            href="mailto:contact@verify-ai.com" 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Mail className="w-4 h-4" />
            contact@verify-ai.com
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
