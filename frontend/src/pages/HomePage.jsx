import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowRight, Trophy, Heart, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePrizePool } from '../hooks/usePrizePool';
import api from '../api/axios';
import { format } from "date-fns";

export const HomePage = () => {
  const { user } = useAuth();
  const { prizePool, loading } = usePrizePool();
  const [nextDrawDate, setNextDrawDate] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchSettings = async () => {
      try {
        const res = await api.get('/draw-settings');
        if (active && res.data?.next_draw_date) {
          setNextDrawDate(new Date(res.data.next_draw_date));
        }
      } catch (err) {
        console.error('Failed to fetch draw date settings:', err);
      }
    };
    fetchSettings();
    return () => { active = false; };
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-semibold">Live Draw in 4 days</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-heading font-bold mb-6 animate-slide-up">
            Play Golf. Win Big.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
              Change Lives.
            </span>
          </h1>
          
          <p className="text-lg text-text-muted max-w-2xl mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
            Subscribe to GolfHeroes, enter your Stableford scores, and win cash prizes every week. 
            A minimum of 10% of your subscription goes directly to a charity of your choice.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  Go to Dashboard <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto gap-2">
                    Get Started <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="#how-it-works">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    How it works
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Prize Pool Section */}
      <section className="py-20 bg-surface border-y border-white/5 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-sm font-bold tracking-widest text-text-muted uppercase mb-4">Current Prize Pool</h2>
          <div className="text-6xl md:text-8xl font-heading font-bold text-primary animate-pulse">
            {loading ? '...' : `₹${Number(prizePool.total_pool).toLocaleString()}`}
          </div>
          <p className="mt-4 text-text-muted">
            {nextDrawDate 
              ? `Next draw: ${format(nextDrawDate, 'MMMM dd, yyyy')} at ${format(nextDrawDate, 'hh:mm a')}` 
              : 'Next draw: Saturday at 8:00 PM'}
          </p>
        </div>
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">It's as easy as 1-2-3</h2>
            <p className="text-text-muted">Join the community, play your game, and let your scores work for you and for those in need.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: CheckCircle2, title: 'Subscribe', desc: 'Join for ₹499/mo. Select the charity you want to support.' },
              { icon: TrendingUp, title: 'Enter Scores', desc: 'Submit up to 5 of your latest 18-hole Stableford scores.' },
              { icon: Trophy, title: 'Win & Give', desc: 'Match your scores in the weekly draw to win big. We handle the donations.' }
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <Card key={i} className="bg-surface/50 border-white/5 hover:border-primary/50 transition-colors">
                  <CardContent className="pt-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 text-primary">
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-heading font-bold mb-3">{step.title}</h3>
                    <p className="text-text-muted">{step.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Charity Spotlight */}
      <section className="py-24 bg-surface border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-500 mb-6">
                <Heart className="w-4 h-4" />
                <span className="text-sm font-semibold">Featured Charity</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
                Macmillan Cancer Support
              </h2>
              <p className="text-text-muted text-lg mb-8">
                Whatever cancer throws your way, we're right there with you. By selecting Macmillan, your subscription directly funds support workers, nurses, and financial grants for those affected by cancer.
              </p>
              <Link to="/charities">
                <Button variant="outline">View All Charities</Button>
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <img 
                  src="https://images.unsplash.com/photo-1532938911079-1b06ac7ce122?auto=format&fit=crop&w=800&q=80" 
                  alt="Charity Event" 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-primary rounded-xl -z-10 blur-xl opacity-50" />
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">Ready to tee off?</h2>
          <p className="text-xl text-text-muted mb-10 max-w-2xl mx-auto">
            Join thousands of golfers winning cash prizes and making a difference.
          </p>
          <Link to="/subscribe">
            <Button size="lg" className="px-10 py-4 text-lg">
              Start Your Journey
            </Button>
          </Link>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-primary/5 pointer-events-none" />
      </section>
    </div>
  );
};
