import React from 'react';

export const Snowfall = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
    <style>{`
      @keyframes snow {
        0% { transform: translateY(-10vh) translateX(0); opacity: 1; }
        100% { transform: translateY(110vh) translateX(20px); opacity: 0.3; }
      }
      .snowflake {
        position: absolute;
        top: -10px;
        color: rgba(255, 255, 255, 0.15);
        animation: snow 10s linear infinite;
        font-size: 1rem;
      }
      .snowflake:nth-child(2n) { animation-duration: 12s; animation-delay: 1s; }
      .snowflake:nth-child(3n) { animation-duration: 8s; animation-delay: 2s; font-size: 0.8rem; }
      .snowflake:nth-child(4n) { animation-duration: 15s; animation-delay: 0s; font-size: 1.2rem; }
    `}</style>
    {[...Array(15)].map((_, i) => (
      <div key={i} className="snowflake" style={{ left: `${Math.random() * 100}vw`, animationDelay: `${Math.random() * 5}s` }}>❄</div>
    ))}
  </div>
);