import React, { useState, useEffect, useRef } from 'react';
import { Users, Trophy, Heart, TrendingUp, Download, Zap, Eye, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AdminModal } from '../components/admin/AdminModal';
import { AdminLoader } from '../components/admin/AdminLoader';
import { adminApi } from '../services/adminApi';
import { useToast } from '../components/ui/Toast';
import { format } from 'date-fns';

export const AdminPage = () => {
  const { addToast } = useToast();
  const [analytics, setAnalytics] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Confirmation Modals State
  const [confirmSimulate, setConfirmSimulate] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);

  // Abort Controller reference
  const abortControllerRef = useRef(null);

  const fetchDashboardData = async () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      const [analyticsData, usersData] = await Promise.all([
        adminApi.getAnalytics(abortControllerRef.current.signal),
        adminApi.getUsers(1, '', abortControllerRef.current.signal)
      ]);
      setAnalytics(analyticsData);
      setRecentUsers(usersData.data?.slice(0, 4) || []);
    } catch (error) {
      if (error.name !== 'CanceledError') {
        console.error('Failed to fetch admin data:', error);
        addToast('Failed to load control panel overview', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const handleExportCSV = async () => {
    try {
      setActionLoading(true);
      addToast('Preparing subscriber logs for download...', 'info');
      
      const res = await adminApi.getUsers(1, '');
      const usersList = res.data || [];
      
      if (usersList.length === 0) {
        addToast('No users found to export.', 'error');
        return;
      }
      
      const headers = ['ID', 'Name', 'Email', 'Subscription Status', 'Selected Charity', 'Role', 'Created At'];
      const rows = usersList.map(user => [
        user.id,
        user.name,
        user.email,
        user.subscription_status || 'free',
        user.charity?.name || 'None',
        user.role,
        user.created_at
      ]);
      
      const csvContent = [
        headers.join(','), 
        ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `golfheroes_subscribers_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addToast('CSV export downloaded successfully! 📂', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      addToast('Failed to generate export file', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulateDrawSubmit = async () => {
    setConfirmSimulate(false);
    try {
      setActionLoading(true);
      addToast('Triggering draw simulations...', 'info');
      
      const drawsList = await adminApi.getDraws();
      const pendingDraw = drawsList.find(d => d.status === 'pending');
      
      if (!pendingDraw) {
        addToast('No pending draws found. Please create a draw first on the Draws tab!', 'error');
        return;
      }
      
      const res = await adminApi.simulateDraw(pendingDraw.id);
      addToast('Draw simulated successfully! 🎯 ' + res.message, 'success');
      
      // Refresh
      fetchDashboardData();
    } catch (error) {
      console.error('Simulation failed:', error);
      addToast('Simulation trigger failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublishDrawSubmit = async () => {
    setConfirmPublish(false);
    try {
      setActionLoading(true);
      addToast('Publishing draw and updating prizes board...', 'info');
      
      const drawsList = await adminApi.getDraws();
      const pendingDraw = drawsList.find(d => d.status === 'pending');
      
      if (!pendingDraw) {
        addToast('No pending draw available to publish.', 'error');
        return;
      }
      
      const res = await adminApi.publishDraw(pendingDraw.id);
      addToast('Draw results published! Global active pool reset to ₹0. 🏆', 'success');
      
      // Refresh
      fetchDashboardData();
    } catch (error) {
      console.error('Publication failed:', error);
      addToast('Failed to publish draw results', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const stats = [
    { title: 'Total Users', value: loading ? '...' : analytics?.total_users || 0, icon: Users, trend: '+12%', color: 'text-primary' },
    { title: 'Prize Pool', value: loading ? '...' : `₹${Number(analytics?.total_prize_pool || 0).toLocaleString()}`, icon: Trophy, trend: 'Active Pool', color: 'text-yellow-500' },
    { title: 'Charity Raised', value: loading ? '...' : `₹${Number(analytics?.total_charity_contributions || 0).toLocaleString()}`, icon: Heart, trend: '+15%', color: 'text-red-500' },
    { title: 'Active Subscribers', value: loading ? '...' : analytics?.active_subscribers || 0, icon: TrendingUp, trend: 'Active', color: 'text-green-500' },
  ];

  if (loading && !analytics) {
    return <AdminLoader message="Fetching admin console dashboard..." />;
  }

  return (
    <div className="flex-1 space-y-8">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text">Admin Control</h1>
          <p className="text-text-muted mt-1">Platform overview and management dashboard</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Button variant="outline" className="flex items-center gap-2" onClick={handleExportCSV} disabled={actionLoading}>
            <Download className="w-4 h-4" /> Export Data
          </Button>
          <Button variant="primary" className="flex items-center gap-2" onClick={() => setConfirmSimulate(true)} disabled={actionLoading}>
            <Zap className="w-4 h-4" /> Simulate Draw
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="hover:border-white/10 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-white/5 rounded-xl ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                    {stat.trend}
                  </span>
                </div>
                <div className="text-2xl font-heading font-bold mb-1 text-text">{stat.value}</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-text-muted">{stat.title}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Recent Users */}
        <Card>
          <CardHeader className="border-b border-white/5">
            <CardTitle>Recent Subscribers</CardTitle>
            <CardDescription>Latest users joined the GolfHeroes platform</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {recentUsers.length === 0 ? (
                <div className="text-center text-text-muted py-6">No user registrations yet</div>
              ) : (
                recentUsers.map((user, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-background border border-white/5 hover:border-white/10 transition-colors">
                    <div>
                      <div className="font-semibold text-text">{user.name}</div>
                      <div className="text-xs text-text-muted mt-0.5">{user.email}</div>
                    </div>
                    <div className="text-xs font-bold px-3 py-1 bg-surface rounded-full border border-white/5 capitalize text-primary">
                      {user.subscription_status || 'Free'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Draw Management */}
        <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
          <CardHeader className="border-b border-white/5">
            <CardTitle>Pending Draw Cash Split</CardTitle>
            <CardDescription>Calculated prizes based on active pool splits</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="bg-background rounded-xl p-6 border border-white/5 text-center mb-6">
              <div className="text-xs text-text-muted uppercase tracking-widest font-bold mb-2">Estimated Jackpot (40%)</div>
              <div className="text-4xl font-heading font-bold text-primary">
                ₹{((analytics?.total_prize_pool || 0) * 0.4).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm p-4 bg-surface rounded-xl border border-white/5">
                <span className="text-text-muted font-semibold">4-Match Prize Split (35%)</span>
                <span className="font-bold text-text">
                  ₹{((analytics?.total_prize_pool || 0) * 0.35).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex justify-between text-sm p-4 bg-surface rounded-xl border border-white/5">
                <span className="text-text-muted font-semibold">3-Match Prize Split (25%)</span>
                <span className="font-bold text-text">
                  ₹{((analytics?.total_prize_pool || 0) * 0.25).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
            
            <Button className="w-full mt-6 flex items-center justify-center gap-2" variant="primary" onClick={() => setConfirmPublish(true)} disabled={actionLoading}>
              <Eye className="w-4 h-4" /> Publish Next Draw Results
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Simulate Confirmation Modal */}
      <AdminModal
        isOpen={confirmSimulate}
        onClose={() => setConfirmSimulate(false)}
        title="Simulate Draw Results"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-500">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div className="text-xs font-semibold">
              Warning: Simulation will generate winning scores and pick random subscribers to assign cash prizes.
            </div>
          </div>
          <p className="text-sm text-text-muted">
            Are you sure you want to simulate this draw? This will create pending winner records in the database.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-6">
            <Button variant="outline" onClick={() => setConfirmSimulate(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSimulateDrawSubmit}>
              Simulate Now
            </Button>
          </div>
        </div>
      </AdminModal>

      {/* Publish Confirmation Modal */}
      <AdminModal
        isOpen={confirmPublish}
        onClose={() => setConfirmPublish(false)}
        title="Publish Results & Reset Pool"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div className="text-xs font-semibold">
              Caution: Publishing results resets the active cash pool back to ₹0 immediately and updates the winners board.
            </div>
          </div>
          <p className="text-sm text-text-muted">
            Are you sure you want to finalize and publish the next draw results?
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-6">
            <Button variant="outline" onClick={() => setConfirmPublish(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handlePublishDrawSubmit} className="bg-red-500 hover:bg-red-600 text-white border-none">
              Publish & Reset Pool
            </Button>
          </div>
        </div>
      </AdminModal>

    </div>
  );
};