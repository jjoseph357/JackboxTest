import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  className = '',
  onClick,
  selected = false,
}) => {
  const clickable = onClick ? 'card--clickable' : '';
  const selectedClass = selected ? 'card--selected' : '';

  return (
    <div
      className={`card ${clickable} ${selectedClass} ${className}`}
      onClick={onClick}
    >
      {title && <h3 className="card__title">{title}</h3>}
      <div className="card__content">{children}</div>
    </div>
  );
};
