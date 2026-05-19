import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Calendar, Clock, Save, Plus } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { AdminCard } from '../components/admin/AdminCard';
import { AdminTable } from '../components/admin/AdminTable';
import { AdminLoader } from '../components/admin/AdminLoader';
import { EmptyState } from '../components/admin/EmptyState';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { format } from 'date-fns';

export const AdminDrawsPage = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draws, setDraws] = useState([]);
  
  // Date and Time inputs
  const [dateInput, setDateInput] = useState('');
  const [timeInput, setTimeInput] = useState('20:00');

  // Abort Controller reference
  const abortControllerRef = useRef(null);

  const fetchDrawSettingsAndHistory = async () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      const [settings, history] = await Promise.all([
        adminApi.getDrawSettings(abortControllerRef.current.signal),
        adminApi.getDraws(abortControllerRef.current.signal)
      ]);

      setDraws(history || []);

      if (settings?.next_draw_date) {
        const nextDrawDate = new Date(settings.next_draw_date);
        setDateInput(format(nextDrawDate, 'yyyy-MM-dd'));
        setTimeInput(format(nextDrawDate, 'HH:mm'));
      }
    } catch (error) {
      if (error.name !== 'CanceledError') {
        console.error('Failed to load draw data:', error);
        addToast('Failed to load draw controls', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrawSettingsAndHistory();
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const handleSaveCountdown = async (e) => {
    e.preventDefault();
    if (!dateInput) {
      addToast('Please select a draw date', 'error');
      return;
    }

    const nextDrawDateTime = new Date(`${dateInput}T${timeInput}`);
    
    // Validate date is in the future
    if (nextDrawDateTime <= new Date()) {
      addToast('Draw date must be in the future', 'error');
      return;
    }

    try {
      setSaving(true);
      await adminApi.updateDrawSettings({
        next_draw_date: nextDrawDateTime.toISOString(),
      });
      addToast('Next draw date updated successfully! ⏰', 'success');
    } catch (error) {
      console.error('Failed to save draw settings:', error);
      addToast(error.response?.data?.message || 'Failed to update next draw date', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNewDraw = async () => {
    try {
      setSaving(true);
      const payload = {
        draw_date: dateInput || format(new Date(), 'yyyy-MM-dd'),
        status: 'pending',
        jackpot_amount: 0,
        jackpot_rollover: false
      };
      await adminApi.createDraw(payload);
      addToast('New draw created successfully! 🎯', 'success');
      fetchDrawSettingsAndHistory();
    } catch (error) {
      console.error('Failed to create new draw:', error);
      addToast('Failed to create new draw record', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-text">Draw Management</h1>
        <p className="text-text-muted mt-1">Control the countdown timer targets and review draw sessions</p>
      </div>

      {loading ? (
        <AdminLoader message="Fetching draw schedules and histories..." />
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Controls Column */}
          <div className="lg:col-span-1 space-y-6">
            <AdminCard title="Countdown Configuration">
              <form onSubmit={handleSaveCountdown} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-primary" /> Target Date
                  </label>
                  <Input
                    required
                    type="date"
                    min={format(new Date(), 'yyyy-MM-dd')}
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary" /> Target Time
                  </label>
                  <Input
                    required
                    type="time"
                    value={timeInput}
                    onChange={(e) => setTimeInput(e.target.value)}
                  />
                </div>

                <div className="pt-4 space-y-2">
                  <Button type="submit" variant="primary" className="w-full flex items-center justify-center gap-2" disabled={saving}>
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Draw Date'}
                  </Button>
                  <Button type="button" variant="outline" className="w-full flex items-center justify-center gap-2" onClick={handleCreateNewDraw} disabled={saving}>
                    <Plus className="w-4 h-4" /> Create New Draw Record
                  </Button>
                </div>
              </form>
            </AdminCard>
          </div>

          {/* History Column */}
          <div className="lg:col-span-2 space-y-6">
            <AdminCard title="Draw History Log">
              {draws.length === 0 ? (
                <EmptyState
                  icon={Trophy}
                  title="No Draws Recorded"
                  description="No historical draw records have been logged in the system yet. Set a date and create a new draw!"
                />
              ) : (
                <AdminTable headers={['Draw Date', 'Winning Scores', 'Status', 'Jackpot Pool']}>
                  {draws.map((draw) => (
                    <tr key={draw.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-semibold text-text">
                        {format(new Date(draw.draw_date), 'MMMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        {draw.numbers && draw.numbers.length > 0 ? (
                          <div className="flex gap-1.5">
                            {draw.numbers.map((num, index) => (
                              <span key={index} className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20">
                                {num}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-text-muted text-xs italic">Pending simulation</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase ${draw.status === 'published' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                          {draw.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-text font-bold">
                        ₹{Number(draw.jackpot_amount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </AdminTable>
              )}
            </AdminCard>
          </div>
          
        </div>
      )}
    </div>
  );
};
