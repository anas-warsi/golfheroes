import { Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-surface border-t border-white/5 py-12 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Trophy className="h-6 w-6 text-primary" />
              <span className="font-heading font-bold text-xl text-text">
                Golf<span className="text-primary">Heroes</span>
              </span>
            </Link>
            <p className="text-text-muted text-sm max-w-sm">
              Play Golf. Win Big. Change Lives. The first golf subscription platform that rewards you for playing while making a positive impact.
            </p>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold text-text mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li><Link to="/#how-it-works" className="hover:text-primary transition-colors">How it works</Link></li>
              <li><Link to="/charities" className="hover:text-primary transition-colors">Charities</Link></li>
              <li><Link to="/prizes" className="hover:text-primary transition-colors">Prizes</Link></li>
              <li><Link to="/subscribe" className="hover:text-primary transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-text mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-text-muted text-sm">
            &copy; {new Date().getFullYear()} GolfHeroes. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0 text-text-muted text-sm">
            <span>Built for golfers.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
