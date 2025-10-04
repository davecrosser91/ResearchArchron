import React from 'react';

interface PowerButtonProps {
  isOn: boolean;
  onClick: () => void;
  color?: 'purple' | 'green' | 'pink' | 'blue' | 'cyan' | 'orange';
  size?: number;
}

export const PowerButton: React.FC<PowerButtonProps> = ({
  isOn,
  onClick,
  color = 'blue',
  size = 40
}) => {
  const colorMap = {
    purple: {
      border: 'border-primary',
      fill: 'bg-primary'
    },
    green: {
      border: 'border-primary',
      fill: 'bg-primary'
    },
    pink: {
      border: 'border-primary',
      fill: 'bg-primary'
    },
    blue: {
      border: 'border-primary',
      fill: 'bg-primary'
    },
    cyan: {
      border: 'border-primary',
      fill: 'bg-primary'
    },
    orange: {
      border: 'border-primary',
      fill: 'bg-primary'
    }
  };

  const styles = colorMap[color];

  return (
    <button
      onClick={onClick}
      className={`
        relative rounded-full border-2 transition-all duration-200
        ${styles.border}
        bg-card
        hover:bg-muted
      `}
      style={{ width: size, height: size }}
    >
      <div className="w-full h-full flex items-center justify-center">
        <svg
          width={size * 0.5}
          height={size * 0.5}
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M12 2L12 12"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className={isOn ? 'text-primary' : 'text-muted-foreground'}
          />
          <path
            d="M18.36 6.64a9 9 0 1 1-12.73 0"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className={isOn ? 'text-primary' : 'text-muted-foreground'}
          />
        </svg>
      </div>
    </button>
  );
};