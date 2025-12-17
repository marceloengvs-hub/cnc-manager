import React, { useState, useRef, useEffect } from 'react';

interface ImageViewerProps {
  src: string;
  alt: string;
  onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ src, alt, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  // Refs to store touch data without triggering re-renders during gesture calculation
  const lastTouchRef = useRef<{ dist: number; x: number; y: number }>({ dist: 0, x: 0, y: 0 });

  // Prevent background scrolling while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
       // Pinch Start
       const dist = Math.hypot(
         e.touches[0].clientX - e.touches[1].clientX,
         e.touches[0].clientY - e.touches[1].clientY
       );
       lastTouchRef.current.dist = dist;
    } else if (e.touches.length === 1) {
       // Drag Start
       setIsDragging(true);
       lastTouchRef.current.x = e.touches[0].clientX;
       lastTouchRef.current.y = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Note: 'touch-action: none' in CSS prevents browser scrolling
    
    if (e.touches.length === 2) {
       // Pinching
       const dist = Math.hypot(
         e.touches[0].clientX - e.touches[1].clientX,
         e.touches[0].clientY - e.touches[1].clientY
       );
       
       // Calculate scale delta based on distance change
       // Use a small factor for smooth zooming
       const delta = dist - lastTouchRef.current.dist;
       const sensitivity = 0.005; 
       
       // Update scale (Clamp between 1x and 5x)
       setScale(prevScale => Math.min(Math.max(1, prevScale + delta * sensitivity), 5));
       
       lastTouchRef.current.dist = dist;
    } else if (e.touches.length === 1 && scale > 1 && isDragging) {
       // Panning (only allowed if zoomed in)
       const dx = e.touches[0].clientX - lastTouchRef.current.x;
       const dy = e.touches[0].clientY - lastTouchRef.current.y;
       
       setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
       
       lastTouchRef.current.x = e.touches[0].clientX;
       lastTouchRef.current.y = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // If user lifts fingers, stop dragging
    if (e.touches.length === 0) {
        setIsDragging(false);
        // Reset if zoomed out to practically 1
        if (scale < 1.1) {
            setScale(1);
            setPosition({ x: 0, y: 0 });
        }
    }
  };
  
  const handleDoubleTap = () => {
     if (scale > 1) {
         setScale(1);
         setPosition({ x: 0, y: 0 });
     } else {
         setScale(2.5);
     }
  };

  return (
    <div 
       className="fixed inset-0 z-[150] bg-black/95 flex items-center justify-center touch-none animate-in fade-in duration-200"
       onClick={onClose}
    >
       {/* Image Container */}
       <div 
          className="relative w-full h-full flex items-center justify-center overflow-hidden"
          onClick={(e) => e.stopPropagation()} 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
       >
          <img 
             src={src} 
             alt={alt}
             className="max-w-full max-h-full object-contain origin-center select-none"
             style={{ 
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out', // Smooth transition when not dragging
                cursor: scale > 1 ? 'grab' : 'zoom-in'
             }}
             onDoubleClick={handleDoubleTap}
             draggable={false}
          />
       </div>

       {/* Close Button */}
       <button 
        className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 rounded-full p-2 backdrop-blur-md z-50 hover:bg-white/20 transition-colors"
        onClick={onClose}
      >
        <span className="material-symbols-outlined text-3xl">close</span>
      </button>
      
      {/* Helper Text */}
      <div className="absolute bottom-10 left-0 w-full text-center pointer-events-none opacity-0 animate-[fadeIn_0.5s_ease-in_1s_forwards]">
         <p className="text-white/60 text-xs bg-black/40 inline-block px-4 py-1.5 rounded-full backdrop-blur border border-white/10">
            {scale === 1 ? 'Toque duplo ou use pinça para ampliar' : 'Arraste para mover'}
         </p>
      </div>
      
      {/* Zoom Controls (Optional fallback for non-touch) */}
      {scale > 1 && (
         <button 
            onClick={() => { setScale(1); setPosition({x:0, y:0}); }}
            className="absolute bottom-24 right-4 bg-white/10 backdrop-blur text-white p-2 rounded-full border border-white/20 z-50"
         >
             <span className="material-symbols-outlined">restart_alt</span>
         </button>
      )}
    </div>
  );
};

export default ImageViewer;