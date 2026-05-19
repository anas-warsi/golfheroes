import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CreditCard, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { Modal } from '../components/ui/Modal';
import { cn } from '../utils/cn';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export const SubscribePage = () => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user, setUser } = useAuth();

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: '₹499',
      period: '/month',
      description: 'Perfect for regular golfers',
      features: [
        'Enter up to 5 Stableford scores',
        'Weekly prize draw entry',
        'Choose your supported charity',
        'Cancel anytime'
      ]
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: '₹4999',
      period: '/year',
      description: 'Save ₹1000+ per year',
      features: [
        'Everything in Monthly',
        '2 months free',
        'Priority customer support',
        'Exclusive partner discounts'
      ]
    }
  ];

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    console.log("AUTHENTICATED USER STATE BEFORE SUBSCRIPTION PURCHASE:", user);

    try {
      const res = await api.post('/subscribe', {
        plan: selectedPlan,
      });

      console.log("SUBSCRIBE RESPONSE:", res.data);

      setUser(res.data.user);

      addToast('Payment successful! 🎉', 'success');
      navigate('/dashboard');

    } catch (error) {
      addToast(error.response?.data?.message || 'Payment failed', 'error');
    } finally {
      setIsProcessing(false);
      setIsPaymentModalOpen(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-text-muted">
            Join the community, win cash prizes, and support great causes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                "relative cursor-pointer transition-all duration-300 hover:-translate-y-2",
                selectedPlan === plan.id ? "border-primary shadow-[0_0_30px_rgba(0,255,135,0.15)] ring-2 ring-primary ring-offset-2 ring-offset-background" : "border-white/10 hover:border-white/30"
              )}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.id === 'yearly' && (
                <div className="absolute top-0 right-0 bg-primary text-background text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg uppercase tracking-wider">
                  Best Value
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-8">
                  <span className="text-5xl font-heading font-bold">{plan.price}</span>
                  <span className="text-text-muted">{plan.period}</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="mt-1 bg-primary/20 rounded-full p-1">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-text-muted">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={selectedPlan === plan.id ? 'primary' : 'outline'}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlan(plan.id);
                    setIsPaymentModalOpen(true);
                  }}
                >
                  {selectedPlan === plan.id ? 'Continue to Payment' : 'Select Plan'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => !isProcessing && setIsPaymentModalOpen(false)}
        title="Complete Subscription"
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-6">
          <div className="bg-surface border border-white/5 p-4 rounded-lg flex justify-between items-center mb-6">
            <div>
              <p className="text-sm text-text-muted">Selected Plan</p>
              <p className="font-semibold capitalize">{selectedPlan} Plan</p>
            </div>
            <div className="text-xl font-heading font-bold text-primary">
              {plans.find(p => p.id === selectedPlan)?.price}
            </div>
          </div>

          <div className="space-y-4">
            <Input label="Cardholder Name" placeholder="John Doe" required disabled={isProcessing} />
            <Input label="Card Number" placeholder="0000 0000 0000 0000" required disabled={isProcessing} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Expiry Date" placeholder="MM/YY" required disabled={isProcessing} />
              <Input label="CVV" placeholder="123" type="password" maxLength={4} required disabled={isProcessing} />
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-text-muted pt-2">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            <span>Payments are secure and encrypted.</span>
          </div>

          <Button type="submit" className="w-full gap-2" isLoading={isProcessing}>
            {!isProcessing && <CreditCard className="w-5 h-5" />}
            {isProcessing ? 'Processing Payment...' : 'Pay Now'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};
