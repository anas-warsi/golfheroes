import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2, Edit2, TrendingUp, Heart, Trophy, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { usePrizePool } from '../hooks/usePrizePool';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { prizePool, loading: prizePoolLoading } = usePrizePool();

  const [scores, setScores] = useState([]);
  const [newScore, setNewScore] = useState('');
  const [newDate, setNewDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loadingScores, setLoadingScores] = useState(true);
  const [editingScore, setEditingScore] = useState(null);

  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [winners, setWinners] = useState([]);

  // Load scores from API
  useEffect(() => {
    fetchScores();
    fetchWinners();
  }, []);

  const fetchScores = async () => {
    try {
      const res = await api.get('/scores');
      setScores(res.data);
    } catch (error) {
      addToast('Failed to load scores', 'error');
    } finally {
      setLoadingScores(false);
    }
  };

  const fetchWinners = async () => {
    try {
      const res = await api.get('/winners');

      setWinners(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const uploadProof = async () => {

  if (!proofFile) {
    addToast('Please select image', 'error');
    return;
  }

  try {

    setIsSubmittingProof(true);

    const formData = new FormData();

    formData.append('proof', proofFile);

    const res = await api.post(
      `/winners/${activeWinner.id}/upload-proof`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    addToast('Proof uploaded successfully', 'success');

  } catch (error) {

    console.error(error.response?.data || error);

    addToast('Upload failed', 'error');

  } finally {

    setIsSubmittingProof(false);
  }
};

  const activeWinner = winners.find(
    (winner) =>
      winner.user_id === user?.id &&
      winner.verification_status !== 'approved'
  );

  const handleAddScore = async (e) => {
    e.preventDefault();
    const scoreVal = parseInt(newScore);

    if (isNaN(scoreVal) || scoreVal < 1 || scoreVal > 45) {
      addToast('Score must be between 1 and 45', 'error');
      return;
    }

    try {
      if (editingScore) {
        // Edit existing score
        await api.put(`/scores/${editingScore.id}`, { score: scoreVal, date: newDate });
        addToast('Score updated', 'success');
        setEditingScore(null);
      } else {
        // Add new score
        await api.post('/scores', { score: scoreVal, date: newDate });
        if (scores.length >= 5) {
          addToast('Score added. Oldest score removed (max 5 kept).', 'info');
        } else {
          addToast('Score added successfully', 'success');
        }
      }
      setNewScore('');
      setNewDate(format(new Date(), 'yyyy-MM-dd'));
      fetchScores();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save score';
      addToast(message, 'error');
    }
  };

  const handleEditScore = (score) => {
    setEditingScore(score);
    setNewScore(score.score);
    setNewDate(score.date);
  };

  const handleDeleteScore = async (id) => {
    try {
      await api.delete(`/scores/${id}`);
      addToast('Score deleted', 'success');
      fetchScores();
    } catch (error) {
      addToast('Failed to delete score', 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditingScore(null);
    setNewScore('');
    setNewDate(format(new Date(), 'yyyy-MM-dd'));
  };

  // Subscription status from real user data
  const isActive = user?.subscription_status === 'active';

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text">Dashboard</h1>
          <p className="text-text-muted mt-1">Welcome back, {user?.name || 'Golfer'}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* Left Column: Scores */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="text-primary w-5 h-5" />
                Your Stableford Scores
              </CardTitle>
              <CardDescription>
                Submit up to 5 of your latest scores. Newest scores replace oldest automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddScore} className="flex gap-4 mb-8">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Score (1-45)"
                    value={newScore}
                    onChange={(e) => setNewScore(e.target.value)}
                    min="1"
                    max="45"
                    required
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    max={format(new Date(), 'yyyy-MM-dd')}
                    required
                  />
                </div>
                <Button type="submit" className="gap-2 shrink-0">
                  <Plus className="w-4 h-4" /> {editingScore ? 'Update' : 'Add'}
                </Button>
                {editingScore && (
                  <Button type="button" variant="outline" onClick={handleCancelEdit} className="shrink-0">
                    Cancel
                  </Button>
                )}
              </form>

              <div className="space-y-3">
                {loadingScores ? (
                  <div className="text-center py-8 text-text-muted">Loading scores...</div>
                ) : scores.length === 0 ? (
                  <div className="text-center py-8 text-text-muted bg-surface/50 rounded-lg border border-white/5 border-dashed">
                    No scores entered yet. Start adding your scores!
                  </div>
                ) : (
                  scores.map((score) => (
                    <div key={score.id} className="flex items-center justify-between p-4 rounded-lg bg-background border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                          {score.score}
                        </div>
                        <div>
                          <div className="font-semibold text-text">
                            {score.date
                              ? format(new Date(score.date), 'MMMM do, yyyy')
                              : 'No date'}
                          </div>
                          <div className="text-sm text-text-muted">Stableford Points</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditScore(score)}
                          className="p-2 text-text-muted hover:text-text transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteScore(score.id)}
                          className="p-2 text-text-muted hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}

                {scores.length > 0 && (
                  <div className="text-sm text-text-muted text-right mt-2">
                    {scores.length} / 5 scores used
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Widgets */}
        <div className="space-y-8">
          {/* Subscription Status */}
          <Card className="bg-gradient-to-br from-surface to-surface/80">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${isActive
                  ? 'bg-green-500/10 text-green-500'
                  : 'bg-red-500/10 text-red-500'
                  }`}>
                  {isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              <h3 className="text-lg font-heading font-semibold text-text mb-1">
                {user?.subscription_plan
                  ? `${user.subscription_plan.charAt(0).toUpperCase() + user.subscription_plan.slice(1)} Plan`
                  : 'No Plan'}
              </h3>
              <p className="text-sm text-text-muted mb-4">
                {user?.subscription_renewal_date
                  ? `Renews on ${format(new Date(user.subscription_renewal_date), 'MMM dd, yyyy')}`
                  : 'No active subscription'}
              </p>
              {!isActive && (
                <Button variant="primary" className="w-full text-sm" onClick={() => window.location.href = '/subscribe'}>
                  Subscribe Now
                </Button>
              )}
              {isActive && (
                <Button variant="outline" className="w-full text-sm">Manage Subscription</Button>
              )}
            </CardContent>
          </Card>

          {/* Current Prize Pool */}
          <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-semibold">Current Prize Pool</h3>
              </div>
              <div className="text-4xl font-heading font-bold text-primary mb-2">
                {prizePoolLoading ? '...' : `₹${Number(prizePool.total_pool).toLocaleString()}`}
              </div>
              <p className="text-sm text-text-muted mb-4">
                The pool grows with every subscription! Join now to win cash prizes.
              </p>
              <div className="space-y-2 border-t border-white/5 pt-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted">Jackpot (40%):</span>
                  <span className="font-semibold text-text">₹{prizePoolLoading ? '...' : Number(prizePool.jackpot_pool).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">4-Match (35%):</span>
                  <span className="font-semibold text-text">₹{prizePoolLoading ? '...' : Number(prizePool.four_match_pool).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">3-Match (25%):</span>
                  <span className="font-semibold text-text">₹{prizePoolLoading ? '...' : Number(prizePool.three_match_pool).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charity Status */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-5 h-5 text-red-500" />
                <h3 className="font-heading font-semibold">Your Impact</h3>
              </div>
              <div className="bg-background rounded-lg p-4 border border-white/5 mb-4">
                <div className="text-sm text-text-muted mb-1">Supported Charity</div>
                <div className="font-semibold">
                  {user?.charity?.name || 'No charity selected'}
                </div>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-muted">Contribution</span>
                <span className="font-semibold text-primary">{user?.charity_percentage || 10}%</span>
              </div>
              <div className="w-full bg-background rounded-full h-2 mb-4">
                <div className="bg-primary h-2 rounded-full" style={{ width: `${user?.charity_percentage || 10}%` }}></div>
              </div>
              <Button
                variant="ghost"
                className="w-full text-sm"
                onClick={() => window.location.href = '/charities'}
              >
                Change Charity
              </Button>
            </CardContent>
          </Card>

          {/* Winnings */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h3 className="font-heading font-semibold">Winnings</h3>
              </div>
              <div className="text-4xl font-heading font-bold text-text mb-2">₹0.00</div>
              <p className="text-sm text-text-muted mb-6">
                {isActive
                  ? "You're entered in the next draw! Match scores to win."
                  : 'Subscribe to enter the monthly draw!'}
              </p>
              <Button variant="outline" className="w-full text-sm" disabled>Claim Winnings</Button>
            </CardContent>
          </Card>

          {activeWinner && (
            <div className="bg-card rounded-2xl p-6 border border-white/10 mt-6 w-full overflow-hidden">

              <h2 className="text-2xl font-bold mb-3 break-words">
                Winner Verification
              </h2>

              <div className="mb-4">
                <span className="inline-block bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                  🎉 Congratulations!
                </span>

                <h3 className="text-2xl md:text-3xl font-bold mt-3 break-words">
                  You Won ₹{activeWinner.prize_amount}
                </h3>
              </div>

              <p className="text-text-muted mb-4 break-words">
                Upload your golf score screenshot for admin verification.
              </p>

              <div className="flex flex-col gap-4 w-full">

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProofFile(e.target.files[0])}
                  className="w-full text-sm overflow-hidden"
                />

                <button
                  onClick={uploadProof}
                  disabled={isSubmittingProof}
                  className="w-full md:w-fit px-4 py-3 rounded-lg bg-primary text-white font-semibold"
                >
                  {isSubmittingProof ? 'Uploading...' : 'Upload Proof'}
                </button>

              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};