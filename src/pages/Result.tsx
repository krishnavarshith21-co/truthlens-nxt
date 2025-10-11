import { useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, XCircle, Download, Share2 } from "lucide-react";
import type { VerificationResult } from "@/hooks/useContentVerification";

const Result = () => {
  const location = useLocation();
  const result = (location.state?.result as VerificationResult) || {
    trustScore: 87,
    category: "Real & Verified",
    summary: "This content has been verified against multiple trusted sources and AI detection models with high confidence.",
    authenticity: "Cross-referenced with established fact-checking databases shows strong evidence of legitimacy.",
    aiDetection: "No significant signs of AI generation or manipulation detected in the analyzed content.",
    sources: ["Gemini Analysis"],
    processingTime: 2.3,
    sourcesChecked: 15,
    confidence: "High"
  };
  
  const trustScore = result.trustScore;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (trustScore / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 70) return "stroke-trust-high";
    if (score >= 40) return "stroke-trust-medium";
    return "stroke-trust-low";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 70) return <CheckCircle className="w-20 h-20 text-trust-high" />;
    if (score >= 40) return <AlertTriangle className="w-20 h-20 text-trust-medium" />;
    return <XCircle className="w-20 h-20 text-trust-low" />;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 70) return { text: "Real & Verified", emoji: "🟢", color: "text-trust-high" };
    if (score >= 40) return { text: "Suspicious", emoji: "🟠", color: "text-trust-medium" };
    return { text: "Fake or AI-Generated", emoji: "🔴", color: "text-trust-low" };
  };

  const scoreLabel = getScoreLabel(trustScore);

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">
              <span className="text-gradient">Verification Results</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              AI-powered analysis complete
            </p>
          </div>

          {/* Trust Score Visualization */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="glass-card p-12 flex flex-col items-center justify-center">
              <div className="relative w-80 h-80">
                <svg className="transform -rotate-90 w-80 h-80">
                  <circle
                    cx="160"
                    cy="160"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="16"
                    fill="none"
                    className="text-muted/20"
                  />
                  <circle
                    cx="160"
                    cy="160"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className={`${getScoreColor(trustScore)} transition-all duration-1000 ease-out`}
                  />
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-7xl font-bold text-gradient mb-4">{trustScore}%</div>
                  <div className="text-lg text-muted-foreground">Trust Score</div>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <span className="text-3xl">{scoreLabel.emoji}</span>
                <span className={`text-2xl font-semibold ${scoreLabel.color}`}>{scoreLabel.text}</span>
              </div>
            </Card>

            {/* AI Analysis */}
            <div className="space-y-6">
              <Card className="glass-card p-8 border-l-4 border-primary">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  {getScoreIcon(trustScore)}
                  <span>AI Analysis</span>
                </h3>
                <div className="space-y-4 text-muted-foreground">
                  <p className="leading-relaxed">
                    <strong className="text-foreground">Summary:</strong> {result.summary}
                  </p>
                  <p className="leading-relaxed">
                    <strong className="text-foreground">Authenticity:</strong> {result.authenticity}
                  </p>
                  <p className="leading-relaxed">
                    <strong className="text-foreground">AI Detection:</strong> {result.aiDetection}
                  </p>
                </div>
              </Card>

              <div className="flex gap-4">
                <Button className="flex-1 bg-gradient-primary hover:opacity-90">
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Results
                </Button>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="glass-card p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">🔍</span>
                Verified Sources
              </h4>
              <div className="space-y-2">
                {result.sources.map((source, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">{source}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="glass-card p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Detection Models
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Text Analysis</span>
                    <span className="text-trust-high">95%</span>
                  </div>
                  <div className="w-full bg-muted/20 rounded-full h-2">
                    <div className="bg-trust-high h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Image Analysis</span>
                    <span className="text-trust-high">88%</span>
                  </div>
                  <div className="w-full bg-muted/20 rounded-full h-2">
                    <div className="bg-trust-high h-2 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                Quick Stats
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Processing Time</span>
                  <span className="font-medium">{result.processingTime}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sources Checked</span>
                  <span className="font-medium">{result.sourcesChecked}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confidence Level</span>
                  <span className={`font-medium ${
                    result.confidence === 'High' ? 'text-trust-high' : 
                    result.confidence === 'Medium' ? 'text-trust-medium' : 
                    'text-trust-low'
                  }`}>{result.confidence}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Result;
