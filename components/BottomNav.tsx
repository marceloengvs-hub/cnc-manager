import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 flex justify-center pointer-events-none">
       <div className="w-full max-w-md bg-surface-light dark:bg-surface-dark border-t border-slate-200 dark:border-slate-800 px-6 py-2 pb-6 flex justify-between items-center pointer-events-auto shadow-lg">
        <button 
          onClick={() => navigate('/')}
          className={`flex flex-col items-center gap-1 transition-colors ${isActive('/') ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-primary'}`}
        >
          <span className={`material-symbols-outlined ${isActive('/') ? 'filled' : ''}`}>dashboard</span>
          <span className="text-[10px] font-bold">Início</span>
        </button>
        
        <button 
          onClick={() => navigate('/stock')}
          className={`flex flex-col items-center gap-1 transition-colors ${isActive('/stock') ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-primary'}`}
        >
          <span className={`material-symbols-outlined ${isActive('/stock') ? 'filled' : ''}`}>inventory</span>
          <span className="text-[10px] font-medium">Pinças</span>
        </button>
        
        {/* Floating Action Button for center item */}
        <div className="relative -top-6">
          <button 
            onClick={() => navigate('/scan')} // Placeholder for QR scan
            className="flex items-center justify-center w-14 h-14 rounded-full bg-primary shadow-lg shadow-primary/40 text-white hover:scale-105 transition-transform active:scale-95"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>qr_code_scanner</span>
          </button>
        </div>
        
        <button 
          onClick={() => navigate('/list')}
          className={`flex flex-col items-center gap-1 transition-colors ${isActive('/list') ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-primary'}`}
        >
          <span className={`material-symbols-outlined ${isActive('/list') ? 'filled' : ''}`}>list</span>
          <span className="text-[10px] font-medium">Fresas</span>
        </button>
        
        <button 
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center gap-1 transition-colors ${isActive('/profile') ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-primary'}`}
        >
          <span className={`material-symbols-outlined ${isActive('/profile') ? 'filled' : ''}`}>person</span>
          <span className="text-[10px] font-medium">Perfil</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNav;