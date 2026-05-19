import { Link, useLocation } from 'react-router-dom';
import { Users, Trophy, Heart, Award, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

export const AdminSidebar = () => {
  const { pathname } = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: BarChart3 },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Draws', path: '/admin/draws', icon: Trophy },
    { name: 'Charities', path: '/admin/charities', icon: Heart },
    { name: 'Winners', path: '/admin/winners', icon: Award },
  ];

  return (
    <>
      {/* Mobile Admin Navigation Bar */}
      <div className="md:hidden bg-surface border-b border-white/5 p-4 flex gap-2 overflow-x-auto sticky top-20 z-25 w-full">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors',
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-text-muted hover:text-text hover:bg-white/5'
              )}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Desktop Admin Sidebar */}
      <aside className="w-64 bg-surface border-r border-white/5 hidden md:flex flex-col h-[calc(100vh-5rem)] sticky top-20">
        <div className="p-6">
          <h2 className="text-xs font-heading font-bold text-text-muted uppercase tracking-wider">
            Admin Control
          </h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-text-muted hover:text-text hover:bg-white/5'
                )}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
};
