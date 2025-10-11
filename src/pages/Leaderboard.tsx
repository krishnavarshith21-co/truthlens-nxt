import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award } from "lucide-react";

const Leaderboard = () => {
  const topUsers = [
    { rank: 1, name: "TruthSeeker", points: 5420, badges: 12, avatar: "TS" },
    { rank: 2, name: "FactChecker", points: 4890, badges: 10, avatar: "FC" },
    { rank: 3, name: "RealityGuard", points: 4320, badges: 9, avatar: "RG" },
    { rank: 4, name: "VerifyPro", points: 3950, badges: 8, avatar: "VP" },
    { rank: 5, name: "TrustBuilder", points: 3680, badges: 7, avatar: "TB" },
    { rank: 6, name: "FakeBuster", points: 3420, badges: 7, avatar: "FB" },
    { rank: 7, name: "NewsHawk", points: 3150, badges: 6, avatar: "NH" },
    { rank: 8, name: "ValidateX", points: 2980, badges: 6, avatar: "VX" },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-700" />;
      default:
        return <Award className="w-6 h-6 text-primary" />;
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4">
              <span className="text-gradient">Global Leaderboard</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Top truth seekers making the internet safer
            </p>
          </div>

          {/* Top 3 Podium */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {topUsers.slice(0, 3).map((user, idx) => {
              const order = idx === 0 ? 1 : idx === 1 ? 0 : 2;
              const heights = ['h-72', 'h-64', 'h-56'];
              
              return (
                <Card 
                  key={user.rank} 
                  className={`glass-card p-8 flex flex-col items-center justify-end ${heights[order]} ${
                    user.rank === 1 ? 'glow-primary border-primary/50' : ''
                  }`}
                  style={{ order }}
                >
                  <div className="mb-4">
                    {getRankIcon(user.rank)}
                  </div>
                  <Avatar className="w-20 h-20 mb-4">
                    <AvatarFallback className="bg-gradient-primary text-2xl">
                      {user.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold mb-2">{user.name}</h3>
                  <div className="text-3xl font-bold text-gradient mb-2">{user.points.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">points</p>
                  <div className="mt-4 flex items-center gap-2">
                    <Award className="w-4 h-4 text-accent" />
                    <span className="text-sm">{user.badges} badges</span>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Rest of the leaderboard */}
          <Card className="glass-card p-8">
            <h2 className="text-2xl font-bold mb-6">Top Contributors</h2>
            <div className="space-y-3">
              {topUsers.slice(3).map((user) => (
                <div 
                  key={user.rank}
                  className="flex items-center justify-between p-4 rounded-xl bg-background/50 hover:bg-background/70 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/20 font-bold">
                      #{user.rank}
                    </div>
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary/20">
                        {user.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.badges} badges earned</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gradient">{user.points.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">points</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Badges Showcase */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="glass-card p-6 text-center">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="font-bold mb-2">Truth Seeker</h3>
              <p className="text-sm text-muted-foreground">Verify 100+ items</p>
            </Card>

            <Card className="glass-card p-6 text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold mb-2">Fake Buster</h3>
              <p className="text-sm text-muted-foreground">Detect 50+ fake content</p>
            </Card>

            <Card className="glass-card p-6 text-center">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Medal className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="font-bold mb-2">Community Hero</h3>
              <p className="text-sm text-muted-foreground">Help 1000+ users</p>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Leaderboard;
