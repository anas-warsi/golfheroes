import React, { useState, useEffect, useRef } from 'react';
import { Heart, Plus, Edit2, Trash2, Search } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { AdminTable } from '../components/admin/AdminTable';
import { AdminCard } from '../components/admin/AdminCard';
import { AdminModal } from '../components/admin/AdminModal';
import { AdminLoader } from '../components/admin/AdminLoader';
import { EmptyState } from '../components/admin/EmptyState';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import fallbackCharity from '../assets/fallback-charity.jpg';

export const AdminCharitiesPage = () => {
  const { addToast } = useToast();
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingCharity, setEditingCharity] = useState(null);
  const [deletingCharity, setDeletingCharity] = useState(null);

  // Form inputs
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  // Abort Controller reference
  const abortControllerRef = useRef(null);

  const fetchCharities = async () => {
    // Abort previous request if in progress
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      const data = await adminApi.getCharities(abortControllerRef.current.signal);
      setCharities(data || []);
    } catch (error) {
      if (error.name !== 'CanceledError') {
        console.error('Failed to load charities:', error);
        addToast('Failed to load charities', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharities();
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const openAddModal = () => {
    setEditingCharity(null);
    setName('');
    setDescription('');
    setImageUrl('');
    setIsFeatured(false);
    setIsFormOpen(true);
  };

  const openEditModal = (charity) => {
    setEditingCharity(charity);
    setName(charity.name);
    setDescription(charity.description || '');
    setImageUrl(charity.image_url || '');
    setIsFeatured(!!charity.is_featured);
    setIsFormOpen(true);
  };

  const openDeleteModal = (charity) => {
    setDeletingCharity(charity);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      addToast('Please fill out all required fields', 'error');
      return;
    }

    const payload = {
      name,
      description,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1532938911079-1b06ac7ce122?auto=format&fit=crop&w=600&q=80',
      is_featured: isFeatured ? 1 : 0
    };

    const previousCharities = [...charities];
    setIsFormOpen(false);

    if (editingCharity) {
      // Optimistic Edit Update
      const updatedCharity = { ...editingCharity, ...payload };
      setCharities(prev => prev.map(c => c.id === editingCharity.id ? updatedCharity : c));
      addToast('Charity updated successfully! 🎉', 'success');

      try {
        await adminApi.updateCharity(editingCharity.id, payload);
      } catch (err) {
        // Rollback state on error
        setCharities(previousCharities);
        addToast('Failed to save charity update', 'error');
      }
    } else {
      // Optimistic Add Update
      const tempId = Date.now();
      const optimisticCharity = { id: tempId, ...payload, total_raised: 0.00, created_at: new Date().toISOString() };
      setCharities(prev => [optimisticCharity, ...prev]);
      addToast('Charity added successfully! 🎉', 'success');

      try {
        const saved = await adminApi.createCharity(payload);
        // Replace temp row with saved db row
        setCharities(prev => prev.map(c => c.id === tempId ? saved.charity : c));
      } catch (err) {
        // Rollback state on error
        setCharities(previousCharities);
        addToast('Failed to add charity', 'error');
      }
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deletingCharity) return;

    const previousCharities = [...charities];
    setIsDeleteOpen(false);

    // Optimistic Delete Update
    setCharities(prev => prev.filter(c => c.id !== deletingCharity.id));
    addToast('Charity deleted successfully.', 'success');

    try {
      await adminApi.deleteCharity(deletingCharity.id);
    } catch (err) {
      // Rollback state on error
      setCharities(previousCharities);
      addToast('Failed to delete charity', 'error');
    } finally {
      setDeletingCharity(null);
    }
  };

  const filteredCharities = charities.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text">Charities</h1>
          <p className="text-text-muted mt-1">Manage platform-supported charities and organizations</p>
        </div>
        <Button variant="primary" onClick={openAddModal} className="flex items-center gap-2 max-w-xs">
          <Plus className="w-5 h-5" /> Add Charity
        </Button>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
          <Input
            placeholder="Search by name or description..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Charities View */}
      {loading ? (
        <AdminLoader message="Fetching organization list..." />
      ) : filteredCharities.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No Charities Found"
          description={searchTerm ? `No results match your search "${searchTerm}"` : "Get started by adding a brand new charity supporting our golfers."}
          actionText={!searchTerm ? "Add Your First Charity" : null}
          onAction={!searchTerm ? openAddModal : null}
        />
      ) : (
         <AdminTable headers={['Logo', 'Name', 'Description', 'Total Raised', 'Contributors', 'Growth', 'Latest Donation', 'Featured', 'Actions']}>
          {filteredCharities.map((charity) => (
            <tr key={charity.id} className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4">
                <img
                  src={charity.image_url || fallbackCharity}
                  alt={charity.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = fallbackCharity;
                  }}
                  className="w-12 h-12 rounded-lg object-cover border border-white/5"
                />
              </td>
              <td className="px-6 py-4 font-bold text-text">{charity.name}</td>
              <td className="px-6 py-4 text-xs text-text-muted max-w-xs truncate">{charity.description}</td>
              <td className="px-6 py-4 font-bold text-primary">
                ₹{Number(charity.total_raised || 0).toLocaleString()}
              </td>
              <td className="px-6 py-4 font-bold text-text text-sm">
                {charity.contributors_count || 0}
              </td>
              <td className="px-6 py-4 font-bold text-green-400 text-xs">
                +{charity.percentage_growth || 0}%
              </td>
              <td className="px-6 py-4 text-xs text-text-muted">
                {charity.latest_donation_timestamp 
                  ? new Date(charity.latest_donation_timestamp).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })
                  : 'No donations'}
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase ${charity.is_featured ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-white/5 text-text-muted'}`}>
                  {charity.is_featured ? 'Featured' : 'Standard'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(charity)}
                    className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-white/5 transition-colors"
                    title="Edit Charity"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(charity)}
                    className="p-2 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/5 transition-colors"
                    title="Delete Charity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      {/* CRUD Form Modal */}
      <AdminModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingCharity ? 'Edit Charity' : 'Add Charity'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Charity Name *</label>
            <Input
              required
              placeholder="e.g. Save the Children"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Description *</label>
            <textarea
              required
              rows={4}
              placeholder="Give a brief summary of the charity's mission..."
              className="w-full bg-background rounded-lg border border-white/5 p-3 text-sm text-text focus:outline-none focus:border-primary/50"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Image Unsplash URL (Optional)</label>
            <Input
              placeholder="e.g. https://images.unsplash.com/photo-..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              id="isFeatured"
              className="w-4 h-4 rounded accent-primary bg-background border border-white/5"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
            />
            <label htmlFor="isFeatured" className="text-sm font-semibold text-text cursor-pointer select-none">
              Feature this charity on top spotlight carousel
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingCharity ? 'Save Changes' : 'Create Charity'}
            </Button>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <AdminModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Are you absolutely sure you want to delete <strong className="text-text">{deletingCharity?.name}</strong>?
            This operation will remove this charity immediately from database records.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-6">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="outline" className="border-red-500/50 hover:bg-red-500/10 text-red-500" onClick={handleDeleteSubmit}>
              Delete Permanently
            </Button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
};
