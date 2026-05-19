import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { useToast } from '../components/ui/Toast';
import api from '../api/axios';

export const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    charity_id: ''
  });
  const [charities, setCharities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const res = await api.get('/charities');
        setCharities(res.data || []);
        if (res.data && res.data.length > 0) {
          setFormData(prev => ({ ...prev, charity_id: String(res.data[0].id) }));
        }
      } catch (err) {
        console.error('Failed to fetch charities:', err);
      }
    };
    fetchCharities();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword, charity_id } = formData;
    
    if (!name || !email || !password || !confirmPassword) {
      addToast('Please fill in all fields', 'error');
      return;
    }

    if (password !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name,
        email,
        password,
        password_confirmation: confirmPassword,
        charity_id: charity_id ? Number(charity_id) : null,
        charity_percentage: 10
      });
      addToast('Account created successfully!', 'success');
      // After signup, take them to subscribe flow
      navigate('/subscribe');
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.error || 'Registration failed';
      addToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>Join GolfHeroes to win and give back</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="name"
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
            />
            <Input
              id="email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
            <Input
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
            />

            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">
                Select Your Charity Support (Min. 10% split)
              </label>
              <select
                id="charity_id"
                value={formData.charity_id}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary text-sm"
              >
                {charities.map(charity => (
                  <option key={charity.id} value={charity.id} className="bg-surface text-text">
                    {charity.name}
                  </option>
                ))}
              </select>
            </div>
            
            <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
              Sign Up
            </Button>

            <div className="text-center text-sm text-text-muted mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Log in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
