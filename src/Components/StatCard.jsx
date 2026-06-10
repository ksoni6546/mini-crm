import React, { useEffect, useState } from 'react';

const StatCard = ({ title, value, subtitle, icon, colorClass, isCurrency = false }) => {
  // Simple count up animation effect
  const [displayValue, setDisplayValue] = useState(0);
  const targetValue = typeof value === 'number' ? value : parseFloat(value?.toString().replace(/[^0-9.-]+/g,"")) || 0;
  
  useEffect(() => {
    if (targetValue === 0) {
      setDisplayValue(0);
      return;
    }
    
    let startTimestamp = null;
    const duration = 1000; // 1 second animation
    
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing function: easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(easeProgress * targetValue);
      
      setDisplayValue(current);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(targetValue);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [targetValue]);

  const formattedValue = isCurrency && typeof value === 'number'
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(displayValue)
    : displayValue;

  return (
    <div className="stat-card scale-in">
      <div className={`stat-icon ${colorClass}`}>{icon}</div>
      <div className="stat-info">
        <div className="stat-label">{title}</div>
        <div className="stat-value">{typeof value === 'string' && !isCurrency ? value : formattedValue}</div>
        {subtitle && <div className="stat-sub">{subtitle}</div>}
      </div>
    </div>
  );
};

export default StatCard;
