import React from 'react';
/**
 * Props for the Button component
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  accentColor?: 'purple' | 'green' | 'pink' | 'blue' | 'cyan' | 'orange';
  neonLine?: boolean;
  icon?: React.ReactNode;
}
/**
 * Button - A customizable button component
 *
 * This component provides a reusable button with various styles,
 * sizes, and color options.
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  accentColor = 'purple',
  neonLine = false,
  icon,
  className = '',
  ...props
}) => {
  // Size variations
  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 rounded',
    md: 'text-sm px-4 py-2 rounded-md',
    lg: 'text-base px-6 py-2.5 rounded-md'
  };
  // Style variations based on variant
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-muted text-muted-foreground hover:bg-muted/80',
    outline: 'border border-border bg-background hover:bg-muted',
    ghost: 'hover:bg-muted'
  };
  return <button className={`
        inline-flex items-center justify-center transition-all duration-200
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `} {...props}>
      <span className="flex items-center justify-center">
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </span>
    </button>;
};