import React, { useState, useEffect, useRef } from 'react';
import { Award, CheckCircle, Clock, Check, XCircle } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { AdminTable } from '../components/admin/AdminTable';
import { AdminLoader } from '../components/admin/AdminLoader';
import { EmptyState } from '../components/admin/EmptyState';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { format } from 'date-fns';

export const AdminWinnersPage = () => {
  const { addToast } = useToast();
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Abort Controller reference
  const abortControllerRef = useRef(null);

  const fetchWinners = async () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      const data = await adminApi.getWinners(abortControllerRef.current.signal);
      setWinners(data || []);
    } catch (error) {
      if (error.name !== 'CanceledError') {
        console.error('Failed to load winners:', error);
        addToast('Failed to load winners log', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWinners();
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const handleVerify = async (winner, newStatus) => {
    const previousWinners = [...winners];
    setWinners(prev => prev.map(w => w.id === winner.id ? { ...w, verification_status: newStatus } : w));
    setUpdatingId(winner.id);

    try {
      await adminApi.verifyWinner(winner.id, newStatus);
      addToast(`Winner verification status updated to ${newStatus}! ✔`, 'success');
    } catch (error) {
      console.error('Failed to verify:', error);
      setWinners(previousWinners);
      addToast('Failed to save verification change', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePayout = async (winner, newStatus) => {
    const previousWinners = [...winners];
    setWinners(prev => prev.map(w => w.id === winner.id ? { ...w, payout_status: newStatus } : w));
    setUpdatingId(winner.id);

    try {
      await adminApi.payoutWinner(winner.id, newStatus);
      addToast(`Winner payout status updated to ${newStatus}! 💳`, 'success');
    } catch (error) {
      console.error('Failed to update payout status:', error);
      setWinners(previousWinners);
      addToast('Failed to save payout status update', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-text">Draw Winners</h1>
        <p className="text-text-muted mt-1">Review simulated match winners and approve prize payouts</p>
      </div>

      {loading ? (
        <AdminLoader message="Fetching draw winners board logs..." />
      ) : winners.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No Winners Yet"
          description="Simulate and publish draw results to pick golf scores and generate winning player profiles."
        />
      ) : (
        <AdminTable headers={['Winner Name', 'Draw Session', 'Match Type', 'Prize Cash', 'Proof', 'Payout Status', 'Verification']}>
          {winners.map((winner) => (
            <tr key={winner.id} className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 font-semibold text-text">
                {winner.user?.name || 'Anonymous'}
              </td>
              <td className="px-6 py-4 text-xs text-text-muted">
                {winner.draw?.draw_date ? format(new Date(winner.draw.draw_date), 'MMMM dd, yyyy') : 'Pending'}
              </td>
              <td className="px-6 py-4 text-xs">
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold uppercase">
                  {winner.match_type || `${winner.prize_tier || '3'}-Match`}
                </span>
              </td>
              <td className="px-6 py-4 font-bold text-text">
                ₹{Number(winner.prize_amount).toLocaleString()}
              </td>
              <td className="px-6 py-4">
                {winner.proof_image ? (
                  <a
                    href={`http://localhost:8000/storage/${winner.proof_image}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src={`http://localhost:8000/storage/${winner.proof_image}`}
                      alt="proof"
                      className="w-24 h-24 object-cover rounded-lg border border-white/10 hover:scale-105 transition"
                    />
                  </a>
                ) : (
                  <span className="text-text-muted text-xs">
                    No Proof
                  </span>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button
                    disabled={updatingId === winner.id}
                    onClick={() => handleVerify(winner, 'approved')}
                    className={`px-2 py-1 rounded text-xs font-bold transition-all ${winner.verification_status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/5 text-text-muted hover:text-green-400'}`}
                  >
                    Approve
                  </button>
                  <button
                    disabled={updatingId === winner.id}
                    onClick={() => handleVerify(winner, 'rejected')}
                    className={`px-2 py-1 rounded text-xs font-bold transition-all ${winner.verification_status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-white/5 text-text-muted hover:text-red-400'}`}
                  >
                    Reject
                  </button>
                </div>
              </td>
              <td className="px-6 py-4">
                <button
                  disabled={updatingId === winner.id}
                  onClick={() => handlePayout(winner, winner.payout_status === 'paid' ? 'pending' : 'paid')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase border transition-all hover:scale-105 active:scale-95 ${winner.payout_status === 'paid' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}
                >
                  {winner.payout_status === 'paid' ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      Paid
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 animate-pulse" />
                      Pending Payout
                    </>
                  )}
                </button>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}
    </div>
  );
};
