import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours."
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4">
              <span className="text-gradient">Get In Touch</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Have questions? We'd love to hear from you
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Name</label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What's this about?"
                    required
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help..."
                    required
                    className="bg-background/50 min-h-32"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary hover:opacity-90"
                >
                  Send Message
                </Button>
              </form>
            </Card>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="glass-card p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Email Us</h3>
                    <p className="text-muted-foreground">support@verify-ai.com</p>
                    <p className="text-muted-foreground">business@verify-ai.com</p>
                  </div>
                </div>
              </Card>

              <Card className="glass-card p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Live Chat</h3>
                    <p className="text-muted-foreground">
                      Available Monday - Friday
                    </p>
                    <p className="text-muted-foreground">9:00 AM - 6:00 PM EST</p>
                  </div>
                </div>
              </Card>

              <Card className="glass-card p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Office</h3>
                    <p className="text-muted-foreground">
                      Nxt Step Innovators HQ
                    </p>
                    <p className="text-muted-foreground">
                      Innovation District, Tech City
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="glass-card p-8 bg-gradient-primary/10 border-primary/30">
                <h3 className="font-bold text-lg mb-3">Need Immediate Help?</h3>
                <p className="text-muted-foreground mb-4">
                  Check out our comprehensive FAQ section or reach out to our support team for quick assistance.
                </p>
                <Button variant="outline" className="w-full">
                  View FAQ
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
