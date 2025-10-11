import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Award, TrendingUp, History } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

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
                  <p className="text-2xl font-bold">95%</p>
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
                  <p className="text-2xl font-bold">24</p>
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
                  <p className="text-2xl font-bold">3</p>
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
                  <p className="text-2xl font-bold">1,250</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="glass-card p-8">
            <h2 className="text-2xl font-bold mb-6">Recent Verifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-background/50">
                <div>
                  <p className="font-medium">AI-generated landscape image</p>
                  <p className="text-sm text-muted-foreground">2 hours ago</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-trust-low">25% Real</span>
                  <span className="text-2xl">🔴</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-xl bg-background/50">
                <div>
                  <p className="font-medium">News article about climate change</p>
                  <p className="text-sm text-muted-foreground">5 hours ago</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-trust-high">92% Real</span>
                  <span className="text-2xl">🟢</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-background/50">
                <div>
                  <p className="font-medium">Social media video claim</p>
                  <p className="text-sm text-muted-foreground">1 day ago</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-trust-medium">55% Real</span>
                  <span className="text-2xl">🟠</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Dashboard;
