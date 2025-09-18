// client/src/components/Cell.jsx
import React from 'react';
import './Board.css'; // Import the same CSS file

const Cell = ({ row, col, hasQueen, onClick, size = 8, cellSize = 50 }) => {
  const isEven = (row + col) % 2 === 0;
  
  return (
    <div
      className={`cell ${hasQueen ? 'queen' : ''} ${isEven ? 'even' : 'odd'}`}
      onClick={onClick}
      style={{
        width: `${cellSize}px`,
        height: `${cellSize}px`,
        fontSize: `${Math.max(cellSize * 0.6, 16)}px`, // Slightly larger font
        minWidth: `${cellSize}px`,
        minHeight: `${cellSize}px`,
        position: 'relative'
      }}
    >
      {hasQueen && (
        <>
          <span 
            style={{
              position: 'absolute',
              zIndex: 2,
              textShadow: '0 0 3px rgba(0,0,0,0.5)'
            }}
          >
            ♛
          </span>
          {hasQueen && (
            <div 
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '70%',
                height: '70%',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.3)'
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Cell;