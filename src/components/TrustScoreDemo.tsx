import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

const TrustScoreDemo = () => {
  const trustScore = 87;
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (trustScore / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 70) return "stroke-trust-high";
    if (score >= 40) return "stroke-trust-medium";
    return "stroke-trust-low";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 70) return <CheckCircle className="w-16 h-16 text-trust-high" />;
    if (score >= 40) return <AlertTriangle className="w-16 h-16 text-trust-medium" />;
    return <XCircle className="w-16 h-16 text-trust-low" />;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 70) return { text: "Real & Verified", emoji: "🟢" };
    if (score >= 40) return { text: "Suspicious", emoji: "🟠" };
    return { text: "Fake or AI-Generated", emoji: "🔴" };
  };

  const scoreLabel = getScoreLabel(trustScore);

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-transparent to-primary/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">
            <span className="text-gradient">Trust Score Analysis</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get instant clarity on content authenticity with our AI-powered scoring system
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Trust Score Visualization */}
          <Card className="glass-card p-12 rounded-3xl flex flex-col items-center justify-center">
            <div className="relative w-64 h-64">
              {/* Background circle */}
              <svg className="transform -rotate-90 w-64 h-64">
                <circle
                  cx="128"
                  cy="128"
                  r="90"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-muted/20"
                />
                {/* Animated progress circle */}
                <circle
                  cx="128"
                  cy="128"
                  r="90"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className={`${getScoreColor(trustScore)} transition-all duration-1000 ease-out animate-pulse-slow`}
                />
              </svg>
              
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-6xl font-bold text-gradient mb-2">{trustScore}%</div>
                <div className="text-sm text-muted-foreground">Trust Score</div>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3">
              {scoreLabel.emoji}
              <span className="text-xl font-semibold">{scoreLabel.text}</span>
            </div>
          </Card>

          {/* Explanation Card */}
          <div className="space-y-6">
            <Card className="glass-card p-8 rounded-3xl border-l-4 border-primary">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                {getScoreIcon(trustScore)}
                <span>AI Analysis Results</span>
              </h3>
              <div className="space-y-4 text-muted-foreground">
                <p className="leading-relaxed">
                  <strong className="text-foreground">Summary:</strong> This content has been verified against multiple trusted sources and AI detection models.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">Authenticity:</strong> High confidence in the legitimacy of this content based on cross-referencing with established fact-checking databases.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">AI Detection:</strong> No signs of AI generation or manipulation detected in the analyzed media.
                </p>
              </div>
            </Card>

            {/* Sources */}
            <Card className="glass-card p-6 rounded-2xl">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">🔍</span>
                Verified Sources
              </h4>
              <div className="space-y-2">
                {["Google Fact Check", "NewsAPI.org", "AI Detection Models"].map((source, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">{source}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustScoreDemo;
