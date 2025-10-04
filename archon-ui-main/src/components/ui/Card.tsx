import React from 'react';
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  accentColor?: 'purple' | 'green' | 'pink' | 'blue' | 'cyan' | 'orange' | 'none';
  variant?: 'default' | 'bordered';
}
export const Card: React.FC<CardProps> = ({
  children,
  accentColor = 'none',
  variant = 'default',
  className = '',
  ...props
}) => {
  const accentColorMap = {
    purple: {
      border: 'border-border'
    },
    green: {
      border: 'border-border'
    },
    pink: {
      border: 'border-border'
    },
    blue: {
      border: 'border-border'
    },
    cyan: {
      border: 'border-border'
    },
    orange: {
      border: 'border-border'
    },
    none: {
      border: 'border-border'
    }
  };
  const variantClasses = {
    default: 'border',
    bordered: 'border'
  };
  return <div className={`
        relative p-4 rounded-md bg-card
        ${variantClasses[variant]} ${accentColorMap[accentColor].border}
        transition-all duration-200
        ${className}
      `} {...props}>
      {children}
    </div>;
};