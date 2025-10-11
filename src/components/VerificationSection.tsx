import { Upload, Link as LinkIcon, FileText, Image, Video, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const VerificationSection = () => {
  const contentTypes = [
    { icon: FileText, label: "Text", color: "text-primary" },
    { icon: Image, label: "Image", color: "text-secondary" },
    { icon: Video, label: "Video", color: "text-accent" },
    { icon: Mic, label: "Audio", color: "text-trust-medium" },
  ];

  return (
    <section id="verify" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">
            <span className="text-gradient">Verify Any Content</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload or paste news, images, videos, or audio. Our AI analyzes it instantly.
          </p>
        </div>

        {/* Main Verification Card */}
        <Card className="glass-card p-8 rounded-3xl border-primary/20">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 glass-card p-1">
              <TabsTrigger value="upload" className="rounded-xl data-[state=active]:bg-primary/20">
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </TabsTrigger>
              <TabsTrigger value="link" className="rounded-xl data-[state=active]:bg-primary/20">
                <LinkIcon className="w-4 h-4 mr-2" />
                Paste Link
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              {/* Content type selector */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {contentTypes.map((type) => (
                  <button
                    key={type.label}
                    className="glass-card p-6 rounded-2xl hover:glow-primary transition-all duration-300 group"
                  >
                    <type.icon className={`w-8 h-8 mx-auto mb-3 ${type.color} group-hover:scale-110 transition-transform`} />
                    <p className="font-medium text-sm">{type.label}</p>
                  </button>
                ))}
              </div>

              {/* Drop zone */}
              <div className="border-2 border-dashed border-primary/30 rounded-2xl p-12 text-center hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 cursor-pointer group">
                <Upload className="w-16 h-16 mx-auto mb-4 text-primary/50 group-hover:text-primary group-hover:scale-110 transition-all" />
                <p className="text-lg font-medium mb-2">Drag & Drop or Click to Upload</p>
                <p className="text-sm text-muted-foreground">Support for images, videos, audio, and documents</p>
              </div>
            </TabsContent>

            <TabsContent value="link" className="space-y-6">
              <div className="glass-card p-6 rounded-2xl">
                <label className="block text-sm font-medium mb-3">Paste URL or Text</label>
                <textarea
                  placeholder="Paste a news article URL, social media post, or any text you want to verify..."
                  className="w-full h-32 bg-background/50 border border-border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Button */}
          <div className="mt-8 flex justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:opacity-90 text-lg px-12 py-6 rounded-2xl glow-primary transition-all duration-300 hover:scale-105"
            >
              Analyze Content
            </Button>
          </div>
        </Card>

        {/* Info cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="glass-card p-6 rounded-2xl text-center">
            <div className="w-12 h-12 bg-trust-high/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🟢</span>
            </div>
            <h3 className="font-semibold mb-2">Real & Verified</h3>
            <p className="text-sm text-muted-foreground">Confirmed authentic by trusted sources</p>
          </div>
          
          <div className="glass-card p-6 rounded-2xl text-center">
            <div className="w-12 h-12 bg-trust-medium/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🟠</span>
            </div>
            <h3 className="font-semibold mb-2">Suspicious</h3>
            <p className="text-sm text-muted-foreground">Partially true or needs review</p>
          </div>
          
          <div className="glass-card p-6 rounded-2xl text-center">
            <div className="w-12 h-12 bg-trust-low/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔴</span>
            </div>
            <h3 className="font-semibold mb-2">Fake or AI-Generated</h3>
            <p className="text-sm text-muted-foreground">Detected as false or manipulated</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VerificationSection;
