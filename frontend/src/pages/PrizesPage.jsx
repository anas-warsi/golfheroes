import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { usePrizePool } from '../hooks/usePrizePool';

import { format } from 'date-fns';

export const PrizesPage = () => {
  const [currentDraw, setCurrentDraw] = useState(null);
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', mins: '00', secs: '00' });
  const [nextDrawDate, setNextDrawDate] = useState(null);
  const { prizePool, loading: prizePoolLoading } = usePrizePool();

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        const [drawRes, winnersRes, settingsRes] = await Promise.all([
          api.get('/draws/current'),
          api.get('/winners'),
          api.get('/draw-settings')
        ]);
        if (active) {
          setCurrentDraw(drawRes.data);
          setWinners(winnersRes.data?.slice(0, 5) || []);
          if (settingsRes.data?.next_draw_date) {
            setNextDrawDate(new Date(settingsRes.data.next_draw_date));
          }
        }
      } catch (error) {
        console.error('Failed to fetch draw data:', error);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => { active = false; };
  }, []);

  // Countdown timer to nextDrawDate
  useEffect(() => {
    if (!nextDrawDate) return;

    const timer = setInterval(() => {
      const now = new Date();
      const diff = nextDrawDate - now;

      if (diff <= 0) {
        setTimeLeft({ days: '00', hours: '00', mins: '00', secs: '00' });
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0'),
        hours: String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0'),
        mins: String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, '0'),
        secs: String(Math.floor((diff / 1000) % 60)).padStart(2, '0'),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [nextDrawDate]);

  const prizePoolVal = prizePool.total_pool;
  const jackpot = prizePool.jackpot_pool;
  const fourMatch = prizePool.four_match_pool;
  const threeMatch = prizePool.three_match_pool;

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-16 relative">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Win Big While Giving Back
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto mb-10">
            The prize pool grows with every new subscriber. Match your scores in the monthly draw to win cash prizes!
          </p>
          
          <div className="inline-block p-[1px] rounded-2xl bg-gradient-to-r from-primary/50 to-primary/10">
            <div className="bg-surface px-12 py-8 rounded-2xl text-center shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/5"></div>
              <p className="text-sm font-bold tracking-widest text-text-muted uppercase mb-2">Current Prize Pool</p>
              <div className="text-6xl md:text-8xl font-heading font-bold text-primary animate-pulse">
                {prizePoolLoading ? '...' : `₹${Number(prizePoolVal).toLocaleString()}`}
              </div>
            </div>
          </div>
        </div>

        {/* Prize Tiers */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <Card className="border-primary/30 relative overflow-hidden transform hover:-translate-y-2 transition-transform">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] rounded-full"></div>
            <CardContent className="pt-8 text-center relative z-10">
              <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-heading font-bold text-text mb-2">5-Number Match</h3>
              <p className="text-sm font-bold text-primary mb-4">JACKPOT • 40% OF POOL</p>
              <div className="text-4xl font-heading font-bold text-text mb-4">
                {prizePoolLoading ? '...' : `₹${Number(jackpot).toLocaleString()}`}
              </div>
              <p className="text-sm text-text-muted">
                Match all 5 of your Stableford scores. If not won, this prize rolls over to next month!
              </p>
            </CardContent>
          </Card>

          <Card className="hover:-translate-y-2 transition-transform">
            <CardContent className="pt-8 text-center">
              <Medal className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-heading font-bold text-text mb-2">4-Number Match</h3>
              <p className="text-sm font-bold text-gray-300 mb-4">35% OF POOL</p>
              <div className="text-4xl font-heading font-bold text-text mb-4">
                {prizePoolLoading ? '...' : `₹${Number(fourMatch).toLocaleString()}`}
              </div>
              <p className="text-sm text-text-muted">
                Split equally among all players who match 4 out of 5 numbers.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:-translate-y-2 transition-transform">
            <CardContent className="pt-8 text-center">
              <Award className="w-16 h-16 text-amber-600 mx-auto mb-4" />
              <h3 className="text-2xl font-heading font-bold text-text mb-2">3-Number Match</h3>
              <p className="text-sm font-bold text-amber-600 mb-4">25% OF POOL</p>
              <div className="text-4xl font-heading font-bold text-text mb-4">
                {prizePoolLoading ? '...' : `₹${Number(threeMatch).toLocaleString()}`}
              </div>
              <p className="text-sm text-text-muted">
                Split equally among all players who match 3 out of 5 numbers.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Countdown Timer */}
          <Card>
            <CardHeader className="border-b border-white/5 bg-surface/50">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Next Draw Countdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 text-center">
              <div className="grid grid-cols-4 gap-4 max-w-sm mx-auto mb-8">
                {['Days', 'Hours', 'Mins', 'Secs'].map((label, idx) => (
                  <div key={idx}>
                    <div className="bg-background border border-white/10 rounded-lg p-3 text-2xl font-heading font-bold text-primary mb-1">
                      {[timeLeft.days, timeLeft.hours, timeLeft.mins, timeLeft.secs][idx]}
                    </div>
                    <div className="text-xs text-text-muted uppercase tracking-wider">{label}</div>
                  </div>
                ))}
              </div>
               <p className="text-text-muted mb-6">
                {nextDrawDate 
                  ? `Next draw: ${format(nextDrawDate, 'MMMM dd, yyyy')} at ${format(nextDrawDate, 'hh:mm a')}` 
                  : 'Draw takes place at the end of every month.'}
              </p>
              <Link to="/subscribe">
                <Button className="w-full gap-2">
                  Enter Draw Now <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Winners */}
          <Card>
            <CardHeader className="border-b border-white/5 bg-surface/50">
              <CardTitle>Recent Winners</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="text-center py-8 text-text-muted">Loading winners...</div>
              ) : winners.length === 0 ? (
                <div className="text-center py-8 text-text-muted">No winners yet — be the first!</div>
              ) : (
                <div className="divide-y divide-white/5">
                  {winners.map((winner, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                      <div>
                        <div className="font-semibold text-text">{winner.user?.name || 'Anonymous'}</div>
                        <div className="text-xs text-text-muted">
                          {winner.draw?.draw_date ? format(new Date(winner.draw.draw_date), 'MMMM dd, yyyy') : ''}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">₹{Number(winner.prize_amount).toLocaleString()}</div>
                        <div className="text-xs text-text-muted uppercase tracking-wider">
                          {winner.match_type || `${winner.prize_tier || '3'}-Match`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};