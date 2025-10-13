import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Link as LinkIcon, FileText, Image, Video, Mic, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useContentVerification } from "@/hooks/useContentVerification";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useImageUpload } from "@/hooks/useImageUpload";
const VerificationSection = () => {
  const [textInput, setTextInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [selectedType, setSelectedType] = useState("text");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { verifyContent, isLoading } = useContentVerification();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { uploadImage, isUploading } = useImageUpload();
  
  const contentTypes = [
    { icon: FileText, label: "text", color: "text-primary" },
    { icon: Image, label: "image", color: "text-secondary" },
    { icon: Video, label: "video", color: "text-accent" },
    { icon: Mic, label: "audio", color: "text-trust-medium" },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      if (selectedFile.type.startsWith('image/')) {
        setSelectedType('image');
      } else if (selectedFile.type.startsWith('video/')) {
        setSelectedType('video');
      } else if (selectedFile.type.startsWith('audio/')) {
        setSelectedType('audio');
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove the data URL prefix to get just the base64 string
        resolve(base64.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyze = async () => {
    if (!user) {
      toast({
        title: "🔐 Authentication Required",
        description: "Please log in to analyze content",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (!textInput.trim() && !file) {
      toast({
        title: "Input Required",
        description: "Please upload a file or paste text/link to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    toast({
      title: "🔍 Analyzing Content",
      description: file ? `AI is analyzing your ${selectedType}...` : "AI is verifying your content...",
    });

    try {
      let result;
      
      if (file && file.type.startsWith('image/')) {
        // For images, convert to base64 and send with image flag
        const base64Image = await fileToBase64(file);
        result = await verifyContent(base64Image, selectedType, {
          isBase64Image: true,
          mimeType: file.type,
          fileName: file.name
        });
      } else if (file && file.type.startsWith('video/')) {
        // For videos, upload to videos bucket and invoke verification function
        const uploadedUrl = await uploadImage(file);
        if (!uploadedUrl) throw new Error('Video upload failed');
        
        toast({
          title: "🎬 Uploading Video",
          description: "Video uploaded. AI analysis starting...",
        });
        
        const { data, error } = await supabase.functions.invoke('verify-video', {
          body: { fileUrl: uploadedUrl, mimeType: file.type, fileName: file.name }
        });
        
        if (error) {
          console.error('Video verification error:', error);
          throw new Error(error.message || 'Video verification failed');
        }
        
        result = data;
      } else {
        // For text content
        result = await verifyContent(textInput, selectedType);
      }
      
      if (result) {
        toast({
          title: "✅ Analysis Complete",
          description: "Content has been verified successfully!",
        });
        navigate('/result', { state: { result, content: file?.name || textInput.substring(0, 100) } });
      } else {
        throw new Error('No result returned');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "❌ Analysis Failed",
        description: "Unable to analyze. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

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
                    onClick={() => setSelectedType(type.label)}
                    disabled={isAnalyzing || isLoading}
                    className={`glass-card p-6 rounded-2xl hover:glow-primary transition-all duration-300 group active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                      selectedType === type.label ? 'ring-2 ring-primary bg-primary/10' : ''
                    }`}
                  >
                    <type.icon className={`w-8 h-8 mx-auto mb-3 ${type.color} group-hover:scale-110 transition-transform`} />
                    <p className="font-medium text-sm capitalize">{type.label}</p>
                  </button>
                ))}
              </div>

              {/* Drop zone */}
              <div className="border-2 border-dashed border-primary/30 rounded-2xl p-12 text-center hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 cursor-pointer group">
                <Input
                  type="file"
                  id="file-upload"
                  accept="image/*,video/*,audio/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-16 h-16 mx-auto mb-4 text-primary/50 group-hover:text-primary group-hover:scale-110 transition-all" />
                  <p className="text-lg font-medium mb-2">
                    {file ? file.name : "Drag & Drop or Click to Upload"}
                  </p>
                  <p className="text-sm text-muted-foreground">Support for images, videos, audio, and documents</p>
                </label>
              </div>
            </TabsContent>

            <TabsContent value="link" className="space-y-6">
              <div className="glass-card p-6 rounded-2xl">
                <label className="block text-sm font-medium mb-3">Paste URL or Text</label>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste a news article URL, social media post, or any text you want to verify..."
                  className="w-full h-32 bg-background/50 border border-border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Button */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <Button 
              size="lg"
              onClick={handleAnalyze}
              disabled={isAnalyzing || isLoading || isUploading || (!textInput.trim() && !file)}
              className="bg-gradient-primary hover:opacity-90 text-lg px-12 py-6 rounded-2xl glow-primary transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isAnalyzing || isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Content'
              )}
            </Button>
            {!textInput.trim() && !file && !isAnalyzing && !isLoading && (
              <p className="text-sm text-muted-foreground animate-pulse">
                ↑ Upload a file or paste text above to enable analysis
              </p>
            )}
            {(isAnalyzing || isLoading || isUploading) && (
              <p className="text-sm text-primary animate-pulse font-medium">
                {file ? `Analyzing your ${selectedType}...` : 'Verifying your content...'}
              </p>
            )}
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