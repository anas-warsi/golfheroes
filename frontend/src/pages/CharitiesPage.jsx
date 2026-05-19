import { useState, useEffect } from 'react';
import { Search, Heart } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Spinner } from '../components/ui/Spinner';
import fallbackCharity from '../assets/fallback-charity.jpg';

export const CharitiesPage = () => {
  const { addToast } = useToast();
  const { user, setUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Format currency with Indian formatting and fallback safety
  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  // Load charities from API - defined stably
  const fetchCharities = async () => {
    try {
      const res = await api.get('/charities');
      setCharities(res.data);
    } catch (error) {
      console.error('Failed to fetch charities:', error);
    } finally {
      setLoading(false);
    }
  };

  // Run EXACTLY once on mount to prevent infinite loop / request spam
  useEffect(() => {
    fetchCharities();
  }, []);

  const filteredCharities = charities.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectCharity = async (charityId, name) => {
    if (!user) {
      addToast('Please log in to select a charity', 'error');
      return;
    }
    try {
      const res = await api.post('/user/charity', {
        charity_id: charityId,
        charity_percentage: 10 // standard minimum of 10%
      });
      setUser(res.data.user);
      addToast(`You are now supporting ${name}! 🎉`, 'success');
      // Refetch charities immediately to refresh dynamic contribution stats
      await fetchCharities();
    } catch (error) {
      console.error('Failed to select charity:', error);
      addToast(error.response?.data?.message || 'Failed to select charity', 'error');
    }
  };

  // Map database charity names to visual high-quality Unsplash images
  const getCharityImage = (charity) => {
    return charity.image_url || fallbackCharity;
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Make an Impact
          </h1>
          <p className="text-lg text-text-muted">
            A minimum of 10% of your GolfHeroes subscription goes to the charity of your choice. Browse and select a cause that matters to you.
          </p>
        </div>

        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
            <Input 
              placeholder="Search charities..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner className="w-10 h-10 text-primary mb-4" />
            <p className="text-text-muted">Loading supported charities...</p>
          </div>
        ) : filteredCharities.length === 0 ? (
          <div className="text-center py-20 text-text-muted">
            No charities found matching "{searchTerm}"
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCharities.map((charity) => {
              const isCurrentlySelected = user?.charity_id === charity.id;
              return (
                <Card key={charity.id} className={`group overflow-hidden flex flex-col transition-all duration-300 ${isCurrentlySelected ? 'border-primary shadow-[0_0_20px_rgba(0,255,135,0.1)]' : 'border-white/5 hover:border-white/20'}`}>
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={getCharityImage(charity)} 
                      alt={charity.name} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = fallbackCharity;
                      }}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
                    {charity.is_featured ? (
                      <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-lg">
                        <Heart className="w-3 h-3 fill-white" /> Featured
                      </div>
                    ) : null}
                  </div>
                  <CardContent className="flex-1 flex flex-col pt-6">
                    <h3 className="text-xl font-heading font-bold text-text mb-3">{charity.name}</h3>
                    <p className="text-text-muted text-sm flex-1 mb-4">
                      {charity.description}
                    </p>
                    
                    <div className="mb-6 p-3 bg-white/5 rounded-xl border border-white/5 text-left">
                      <span className="text-[10px] text-text-muted font-black uppercase tracking-wider block mb-1">Total Raised</span>
                      <span className="text-lg font-heading font-black text-primary">
                        {formatCurrency(Number(charity.total_raised || 0))}
                      </span>
                    </div>

                    <div className="mt-auto">
                      <Button 
                        className="w-full group-hover:bg-primary-hover"
                        variant={isCurrentlySelected ? 'primary' : 'outline'}
                        onClick={() => handleSelectCharity(charity.id, charity.name)}
                      >
                        {isCurrentlySelected ? 'Currently Supporting' : 'Select Charity'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
