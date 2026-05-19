import React, { useState, useEffect, useRef } from 'react';
import { Users, Search, Shield, ChevronLeft, ChevronRight, Check, AlertTriangle } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { AdminTable } from '../components/admin/AdminTable';
import { AdminLoader } from '../components/admin/AdminLoader';
import { EmptyState } from '../components/admin/EmptyState';
import { AdminModal } from '../components/admin/AdminModal';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

export const AdminUsersPage = () => {
  const { addToast } = useToast();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  // Confirmation Modal State
  const [confirmRoleUser, setConfirmRoleUser] = useState(null);

  // Abort Controller reference
  const abortControllerRef = useRef(null);

  const fetchUsers = async () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      const res = await adminApi.getUsers(page, search, abortControllerRef.current.signal);
      
      // Res can be direct array or paginated object from Laravel
      if (res && res.data) {
        setUsers(res.data || []);
        setTotalPages(res.last_page || 1);
      } else {
        setUsers(res || []);
        setTotalPages(1);
      }
    } catch (error) {
      if (error.name !== 'CanceledError') {
        console.error('Failed to load users:', error);
        addToast('Failed to load user list', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleRoleToggleClick = (targetUser) => {
    // 1. Prevent self-demotion frontend check
    if (currentUser && currentUser.id === targetUser.id) {
      addToast('You cannot remove your own admin access', 'error');
      return;
    }
    
    // 2. Open confirmation warning modal
    setConfirmRoleUser(targetUser);
  };

  const handleRoleToggleSubmit = async () => {
    if (!confirmRoleUser) return;
    const targetUser = confirmRoleUser;
    setConfirmRoleUser(null);

    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    
    // Save previous state for rollback
    const previousUsers = [...users];
    setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u));
    setUpdatingUserId(targetUser.id);

    try {
      await adminApi.updateUser(targetUser.id, { role: newRole });
      addToast(`Role for ${targetUser.name} updated to ${newRole}! 🔐`, 'success');
    } catch (error) {
      console.error('Failed to update role:', error);
      setUsers(previousUsers); // rollback
      
      // Pull actual backend validation message
      const errMsg = error.response?.data?.message || 'Failed to change user authorization role';
      addToast(errMsg, 'error');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleSubscriptionToggle = async (user) => {
    const newStatus = user.subscription_status === 'active' ? 'inactive' : 'active';
    
    // Save previous state for rollback
    const previousUsers = [...users];
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, subscription_status: newStatus } : u));
    setUpdatingUserId(user.id);

    try {
      await adminApi.updateUser(user.id, { subscription_status: newStatus });
      addToast(`Subscription for ${user.name} set to ${newStatus}! 💳`, 'success');
    } catch (error) {
      console.error('Failed to update subscription:', error);
      setUsers(previousUsers); // rollback
      addToast('Failed to update subscription state', 'error');
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-text">Users Management</h1>
        <p className="text-text-muted mt-1">Review active platform participants and grant administration keys</p>
      </div>

      {/* Filter Row */}
      <form onSubmit={handleSearchSubmit} className="flex gap-3 max-w-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
          <Input
            placeholder="Search users by name or email..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button type="submit" variant="outline">Search</Button>
      </form>

      {/* Main Table */}
      {loading ? (
        <AdminLoader message="Loading directory profiles..." />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Users Found"
          description={search ? `No user profiles match search filter "${search}"` : "Wait for players to register on your GolfHeroes platform."}
        />
      ) : (
        <div className="space-y-4">
          <AdminTable headers={['Name', 'Email', 'Charity Choice', 'Status', 'Role Badge', 'Member Since']}>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-semibold text-text">{user.name}</td>
                <td className="px-6 py-4 text-text-muted text-xs">{user.email}</td>
                <td className="px-6 py-4 text-xs">
                  {user.charity?.name ? (
                    <span className="text-primary font-semibold">{user.charity.name}</span>
                  ) : (
                    <span className="text-text-muted italic">None Selected</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button
                    disabled={updatingUserId === user.id}
                    onClick={() => handleSubscriptionToggle(user)}
                    className={`px-3 py-1 text-xs font-bold rounded-full uppercase transition-all hover:scale-105 active:scale-95 ${user.subscription_status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/25' : 'bg-red-500/10 text-red-400 border border-red-500/25'}`}
                  >
                    {user.subscription_status === 'active' ? 'Active Subscriber' : 'Free Member'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <button
                    disabled={updatingUserId === user.id}
                    onClick={() => handleRoleToggleClick(user)}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full uppercase border transition-all hover:scale-105 active:scale-95 ${user.role === 'admin' 
                      ? 'bg-red-500/10 text-red-400 border-red-500/25 font-black' 
                      : 'bg-white/5 text-text-muted border-white/10 font-medium'}`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    {user.role === 'admin' ? 'Admin' : 'User'}
                  </button>
                </td>
                <td className="px-6 py-4 text-xs text-text-muted">
                  {format(new Date(user.created_at), 'MMM dd, yyyy')}
                </td>
              </tr>
            ))}
          </AdminTable>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs text-text-muted font-semibold">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  className="flex items-center gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Role Toggle Confirmation Modal */}
      <AdminModal
        isOpen={confirmRoleUser !== null}
        onClose={() => setConfirmRoleUser(null)}
        title="Modify Administrator Role"
      >
        {confirmRoleUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-500">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div className="text-xs font-semibold">
                Warning: Changing this role will modify authorization permissions for {confirmRoleUser.name}.
              </div>
            </div>
            
            <p className="text-sm text-text-muted">
              Are you sure you want to {confirmRoleUser.role === 'admin' ? 'REMOVE administrator privileges from' : 'GRANT full administrator access to'} <strong className="text-text">{confirmRoleUser.name}</strong> ({confirmRoleUser.email})?
            </p>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-6">
              <Button variant="outline" onClick={() => setConfirmRoleUser(null)}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleRoleToggleSubmit} 
                className={confirmRoleUser.role === 'admin' ? 'bg-red-500 hover:bg-red-600 border-none text-white' : ''}
              >
                {confirmRoleUser.role === 'admin' ? 'Revoke Admin' : 'Grant Admin'}
              </Button>
            </div>
          </div>
        )}
      </AdminModal>

    </div>
  );
};
