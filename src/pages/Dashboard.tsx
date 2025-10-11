import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { db, isDemoMode } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { Shield, Award, TrendingUp, History } from "lucide-react";
import { LoadingScreen } from "@/components/LoadingScreen";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [verifications, setVerifications] = useState<any[]>([]);
  const [stats, setStats] = useState({ trustScore: 0, verified: 0, badges: 0, points: 0 });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadVerifications();
    }
  }, [user]);

  const loadVerifications = async () => {
    if (!user) return;
    
    // Demo mode - use mock data
    if (isDemoMode) {
      const mockVerifications = [
        {
          id: '1',
          content: 'AI-generated landscape image',
          contentType: 'image',
          result: { trustScore: 25, category: 'Fake or AI-Generated' },
          createdAt: { toDate: () => new Date(Date.now() - 2 * 60 * 60 * 1000) }
        },
        {
          id: '2',
          content: 'News article about climate change',
          contentType: 'text',
          result: { trustScore: 92, category: 'Real & Verified' },
          createdAt: { toDate: () => new Date(Date.now() - 5 * 60 * 60 * 1000) }
        },
        {
          id: '3',
          content: 'Social media video claim',
          contentType: 'video',
          result: { trustScore: 55, category: 'Suspicious' },
          createdAt: { toDate: () => new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      ];
      
      setVerifications(mockVerifications);
      
      const verified = mockVerifications.length;
      const avgTrustScore = mockVerifications.reduce((acc, v) => acc + (v.result?.trustScore || 0), 0) / verified;
      
      setStats({
        trustScore: Math.round(avgTrustScore),
        verified,
        badges: Math.floor(verified / 10) + 1,
        points: verified * 50
      });
      return;
    }
    
    // Real Firebase mode
    if (!db) return;
    
    try {
      const q = query(
        collection(db, 'verifications'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      
      const querySnapshot = await getDocs(q);
      const verificationsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          result: data.result || { trustScore: 0, category: '' }
        };
      });
      
      setVerifications(verificationsData);
      
      // Calculate stats
      const verified = verificationsData.length;
      const avgTrustScore = verificationsData.reduce((acc, v) => acc + (v.result?.trustScore || 0), 0) / (verified || 1);
      
      setStats({
        trustScore: Math.round(avgTrustScore),
        verified,
        badges: Math.floor(verified / 10),
        points: verified * 50
      });
    } catch (error) {
      console.error('Error loading verifications:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading) {
    return <LoadingScreen message="Loading your dashboard..." />;
  }

  const getCategoryEmoji = (category: string) => {
    if (category.includes('Real')) return '🟢';
    if (category.includes('Suspicious')) return '🟠';
    return '🔴';
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Welcome back, <span className="text-gradient">{user?.email?.split('@')[0]}</span>
              </h1>
              <p className="text-muted-foreground">Your verification dashboard</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <Card className="glass-card p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trust Score</p>
                  <p className="text-2xl font-bold">{stats.trustScore}%</p>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center">
                  <History className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Verified</p>
                  <p className="text-2xl font-bold">{stats.verified}</p>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Badges</p>
                  <p className="text-2xl font-bold">{stats.badges}</p>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-trust-high/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-trust-high" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Points</p>
                  <p className="text-2xl font-bold">{stats.points}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="glass-card p-8">
            <h2 className="text-2xl font-bold mb-6">Recent Verifications</h2>
            <div className="space-y-4">
              {verifications.length > 0 ? verifications.map((verification) => (
                <div key={verification.id} className="flex items-center justify-between p-4 rounded-xl bg-background/50">
                  <div>
                    <p className="font-medium">{verification.content?.slice(0, 50)}...</p>
                    <p className="text-sm text-muted-foreground">
                      {verification.createdAt?.toDate?.()?.toLocaleString() || 'Recently'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={
                      verification.result?.trustScore > 70 ? 'text-trust-high' :
                      verification.result?.trustScore > 40 ? 'text-trust-medium' :
                      'text-trust-low'
                    }>
                      {verification.result?.trustScore}% Real
                    </span>
                    <span className="text-2xl">{getCategoryEmoji(verification.result?.category || '')}</span>
                  </div>
                </div>
              )) : (
                <p className="text-center text-muted-foreground py-8">
                  No verifications yet. Start by verifying some content!
                </p>
              )}
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Dashboard;