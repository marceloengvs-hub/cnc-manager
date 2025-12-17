import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { updateColletStock } from '../services/api';
import { Collet } from '../types';
import ImageViewer from '../components/ImageViewer';

const ColletStock: React.FC = () => {
  const navigate = useNavigate();
  const { collets, loading, refreshData, isAdmin } = useData();
  const [filter, setFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Local optimistic state for immediate UI feedback
  const [localUpdates, setLocalUpdates] = useState<{ [key: string]: number }>({});

  const getStock = (collet: Collet) => {
    return localUpdates[collet.id] !== undefined ? localUpdates[collet.id] : collet.stock;
  };

  const handleUpdateStock = async (id: string, newStock: number) => {
     if (!isAdmin) return; // double check

     // Optimistic update
     setLocalUpdates(prev => ({ ...prev, [id]: newStock }));
     
     try {
       await updateColletStock(id, newStock);
       // Silent refresh in background to sync
       refreshData(); 
     } catch (err) {
         console.error("Failed to update stock", err);
         // Revert on failure by removing from localUpdates (could be improved)
         const { [id]: removed, ...rest } = localUpdates;
         setLocalUpdates(rest);
         alert("Falha ao atualizar estoque.");
     }
  };

  const handleIncrement = (id: string, current: number) => {
    if (!isAdmin) return;
    handleUpdateStock(id, current + 1);
  };

  const handleDecrement = (id: string, current: number) => {
    if (!isAdmin) return;
    handleUpdateStock(id, Math.max(0, current - 1));
  };

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const filteredCollets = collets.filter(c => {
    if (filter === 'all') return true;
    if (filter === '3.175') return c.size.includes('3.175');
    if (filter === '6') return c.size.includes('6mm');
    return true;
  });

  const total = collets.reduce((acc, c) => acc + getStock(c), 0);

  if (loading) {
      return <div className="p-10 text-center text-slate-500">Carregando estoque...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display">
      <div className="sticky top-0 z-50 flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between border-b border-gray-200 dark:border-gray-800">
        <button 
          onClick={handleBack} 
          className="text-slate-900 dark:text-white flex size-12 shrink-0 items-center justify-start cursor-pointer hover:opacity-70 transition-opacity active:scale-95"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          Estoque de Pinças
        </h2>
        <div className="flex items-center justify-end absolute right-4">
          {isAdmin && (
            <button 
              onClick={() => navigate('/new-collet')}
              className="flex size-10 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-blue-600 transition-colors"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6 p-4 w-full">
        {/* Stats */}
        <section>
          <div className="flex flex-col gap-2 rounded-xl p-5 bg-surface-light dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-lg">inventory_2</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total</p>
            </div>
            <p className="text-slate-900 dark:text-white text-2xl font-bold leading-tight">{total}</p>
            <p className="text-xs text-slate-400">Unidades totais</p>
          </div>
        </section>

        {/* Filter Control */}
        <section>
          <div className="flex h-12 w-full items-center justify-center rounded-xl bg-gray-200 dark:bg-surface-dark p-1">
            {[{v: 'all', l: 'Todas'}, {v: '3.175', l: '3.175mm'}, {v: '6', l: '6mm'}].map((opt) => (
              <label key={opt.v} className={`flex-1 cursor-pointer h-full items-center justify-center rounded-lg transition-all duration-200 flex ${filter === opt.v ? 'bg-white dark:bg-primary shadow-sm' : ''}`}>
                <input 
                  type="radio" 
                  name="filter" 
                  value={opt.v} 
                  className="hidden" 
                  checked={filter === opt.v}
                  onChange={() => setFilter(opt.v)}
                />
                <span className={`text-sm font-medium ${filter === opt.v ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                  {opt.l}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* List */}
        <section className="flex flex-col gap-4 pb-10">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-900 dark:text-white text-lg font-bold">Lista de Itens</h3>
          </div>

          {filteredCollets.map(item => {
            const count = getStock(item);
            const isCritical = count === 0;
            const isLow = count <= item.minStock && count > 0;

            return (
              <div 
                key={item.id} 
                className={`flex gap-4 items-center bg-surface-light dark:bg-surface-dark p-4 rounded-xl shadow-sm border 
                  ${isCritical ? 'border-alert dark:border-alert' : 'border-gray-100 dark:border-gray-800'}
                  relative overflow-hidden
                `}
              >
                {isCritical && <div className="absolute inset-0 bg-alert/5 pointer-events-none"></div>}

                {/* Thumbnail Logic */}
                {item.imageUrl ? (
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(item.imageUrl || null);
                    }}
                    className="size-12 rounded-lg bg-cover bg-center shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 cursor-zoom-in active:scale-95 transition-transform"
                    style={{ backgroundImage: `url("${item.imageUrl}")` }}
                  />
                ) : (
                  <div className={`flex items-center justify-center rounded-lg shrink-0 size-12 
                      ${isCritical ? 'bg-alert/20 text-alert' : 'bg-gray-100 dark:bg-[#283039] text-slate-600 dark:text-white'}
                  `}>
                    <span className={`material-symbols-outlined ${isCritical ? 'filled' : ''}`}>{isCritical ? 'block' : 'nat'}</span>
                  </div>
                )}

                <div className="flex flex-1 flex-col justify-center min-w-0 z-10">
                  <div className="flex items-center gap-2">
                    <p className={`text-slate-900 dark:text-white text-base font-semibold truncate ${isCritical ? 'opacity-80' : ''}`}>{item.name}</p>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isLow ? 'bg-primary/10 text-primary' : 'bg-gray-200 dark:bg-gray-700 text-slate-600 dark:text-gray-300'}`}>{item.size}</span>
                  </div>
                  {isCritical ? (
                    <p className="text-alert text-xs font-bold mt-0.5 uppercase tracking-wide">Esgotado</p>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{item.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 z-10">
                  <button 
                    onClick={() => handleDecrement(item.id, count)}
                    className={`size-8 flex items-center justify-center rounded-full transition-colors
                      ${(isCritical || !isAdmin) ? 'bg-gray-100 dark:bg-[#283039] text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-50' : 'bg-gray-100 dark:bg-[#283039] text-slate-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'}
                    `}
                    disabled={isCritical || !isAdmin}
                  >
                    <span className="material-symbols-outlined text-base">remove</span>
                  </button>
                  <span className={`w-4 text-center font-bold ${isCritical ? 'text-alert' : 'text-slate-900 dark:text-white'}`}>{count}</span>
                  <button 
                    onClick={() => handleIncrement(item.id, count)}
                    className={`size-8 flex items-center justify-center rounded-full transition-colors shadow-lg 
                       ${(isCritical && isAdmin) ? 'bg-alert text-white hover:bg-red-600 shadow-alert/25' : 'bg-gray-100 dark:bg-[#283039] text-slate-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'}
                       ${(isLow && !isCritical && isAdmin) ? 'bg-primary text-white hover:bg-blue-600 shadow-primary/20' : ''}
                       ${!isAdmin ? 'opacity-50 cursor-not-allowed shadow-none' : ''}
                    `}
                    disabled={!isAdmin}
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                  </button>
                </div>
              </div>
            )
          })}
        </section>
      </div>

      {/* Lightbox / Zoom Modal */}
      {selectedImage && (
        <ImageViewer 
           src={selectedImage}
           alt="Zoom"
           onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
};

export default ColletStock;