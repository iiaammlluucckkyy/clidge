import React from 'react';

export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'cyan' | 'outline' | 'ghost' | 'danger'
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5'
  }[size] || 'text-sm px-4 py-2.5 gap-2';

  const variantStyles = {
    primary: 'bg-navy-900 text-white hover:bg-navy-800 shadow-sm focus:ring-navy-900 border border-navy-800',
    cyan: 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white hover:from-cyan-600 hover:to-cyan-700 shadow-glow-cyan focus:ring-cyan-400 border border-cyan-400/30',
    emerald: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-sm focus:ring-emerald-400 border border-emerald-400/30',
    outline: 'border border-slate-200 bg-white text-navy-900 hover:bg-slate-50 hover:border-slate-300 focus:ring-navy-900 shadow-sm',
    ghost: 'text-slate-600 hover:text-navy-900 hover:bg-slate-100 focus:ring-slate-300',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm focus:ring-rose-500'
  }[variant] || 'bg-navy-900 text-white';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 stroke-[2.2]" />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 stroke-[2.2]" />}
    </button>
  );
};

export default Button;
