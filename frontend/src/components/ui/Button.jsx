import { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { Spinner } from './Spinner';

export const Button = forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'default', 
  isLoading = false, 
  children, 
  disabled, 
  ...props 
}, ref) => {
  
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'bg-transparent text-text hover:bg-white/5 transition-colors',
    danger: 'bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors',
  };

  const sizes = {
    sm: 'py-1.5 px-3 text-sm',
    default: 'py-3 px-6',
    lg: 'py-4 px-8 text-lg',
    icon: 'p-3',
  };

  return (
    <button
      ref={ref}
      disabled={isLoading || disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading && <Spinner className="w-5 h-5 mr-2" />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
