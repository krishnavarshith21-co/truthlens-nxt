import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Award, TrendingUp, History, LogOut } from "lucide-react";
import { LoadingScreen } from "@/components/LoadingScreen";

interface UserProfile {
  display_name: string | null;
  total_verifications: number;
  trust_points: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);

      // Load recent verifications
      const { data: verificationsData } = await supabase
        .from('verifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setVerifications(verificationsData || []);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (authLoading || isLoading) {
    return <LoadingScreen message="Loading your dashboard..." />;
  }

  const getCategoryEmoji = (trustScore: number) => {
    if (trustScore >= 70) return '🟢';
    if (trustScore >= 40) return '🟠';
    return '🔴';
  };

  const avgTrustScore = verifications.length > 0
    ? Math.round(verifications.reduce((acc, v) => acc + (v.trust_score || 0), 0) / verifications.length)
    : 0;

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Welcome back, <span className="text-gradient">{profile?.display_name || user?.email?.split('@')[0]}</span>
              </h1>
              <p className="text-muted-foreground">Your verification dashboard</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
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
                  <p className="text-sm text-muted-foreground">Avg Trust Score</p>
                  <p className="text-2xl font-bold">{avgTrustScore}%</p>
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
                  <p className="text-2xl font-bold">{profile?.total_verifications || 0}</p>
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
                  <p className="text-2xl font-bold">{Math.floor((profile?.total_verifications || 0) / 10)}</p>
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
                  <p className="text-2xl font-bold">{profile?.trust_points || 0}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="glass-card p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Recent Verifications</h2>
              <Button variant="outline" onClick={() => navigate('/history')}>
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {verifications.length > 0 ? verifications.map((verification) => (
                <div key={verification.id} className="flex items-center justify-between p-4 rounded-xl bg-background/50 hover:bg-background/70 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium line-clamp-1">
                      {verification.content_text?.slice(0, 60) || verification.content_url || 'Image verification'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(verification.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-semibold ${
                      verification.trust_score >= 70 ? 'text-trust-high' :
                      verification.trust_score >= 40 ? 'text-trust-medium' :
                      'text-trust-low'
                    }`}>
                      {verification.trust_score}%
                    </span>
                    <span className="text-2xl">{getCategoryEmoji(verification.trust_score)}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12">
                  <History className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-lg font-medium mb-2">No verifications yet</p>
                  <p className="text-muted-foreground mb-4">
                    Start by verifying some content to build your history
                  </p>
                  <Button onClick={() => navigate('/#verify')}>
                    Start Verifying
                  </Button>
                </div>
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
