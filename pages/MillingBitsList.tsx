import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';

const MillingBitsList: React.FC = () => {
  const navigate = useNavigate();
  const { bits, loading, isAdmin } = useData();
  const [filter, setFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering Logic (runs efficiently in memory)
  const filteredBits = bits.filter(bit => {
      // 1. Filter by Category Chip
      let matchesCategory = true;
      if (filter === 'Baixo Estoque') matchesCategory = bit.stock <= bit.minStock;
      else if (filter === 'Sem Pinça') matchesCategory = !bit.hasCollet;
      else if (filter === '6mm') matchesCategory = bit.diameter.includes('6mm');
      else if (filter === '3.175mm') matchesCategory = bit.diameter.includes('3.175mm');

      // 2. Filter by Search Query
      let matchesSearch = true;
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        matchesSearch = 
          bit.name.toLowerCase().includes(q) ||
          bit.type.toLowerCase().includes(q) ||
          bit.diameter.toLowerCase().includes(q) ||
          (bit.material || '').toLowerCase().includes(q);
      }

      return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Header */}
      <div className="bg-surface-light dark:bg-surface-dark flex flex-col shrink-0 z-20 shadow-sm border-b border-slate-200/50 dark:border-slate-800/50">
        <header className="px-4 pb-2 pt-1 flex items-center justify-between mt-2">
          <h1 className="text-[34px] font-bold tracking-tight text-slate-900 dark:text-white leading-tight">Fresas</h1>
          {isAdmin && (
            <button 
              onClick={() => navigate('/new')}
              className="bg-primary hover:bg-primary/90 text-white rounded-full p-1.5 w-9 h-9 flex items-center justify-center transition-colors shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-[24px]">add</span>
            </button>
          )}
        </header>
        
        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative flex items-center w-full h-10 rounded-xl bg-slate-100 dark:bg-[#2C2C2E] transition-all group focus-within:ring-1 focus-within:ring-primary/50">
            <div className="grid place-items-center h-full w-10 text-slate-400 group-focus-within:text-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="peer h-full w-full outline-none bg-transparent text-[17px] text-slate-900 dark:text-white pr-4 placeholder:text-slate-400" 
              placeholder="Buscar (ex: 6mm, V-Bit...)" 
              type="text"
            />
            {searchQuery.length > 0 && (
              <button 
                onClick={() => setSearchQuery('')}
                className="grid place-items-center h-full w-10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Chips */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar items-center">
          {['Todos', 'Baixo Estoque', 'Sem Pinça', '6mm', '3.175mm'].map((chip) => {
             const isActive = filter === chip;
             return (
               <button 
                key={chip}
                onClick={() => setFilter(chip)}
                className={`flex items-center justify-center px-4 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap shadow-sm transition-colors
                  ${isActive 
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' 
                    : 'bg-slate-100 dark:bg-[#2C2C2E] text-slate-600 dark:text-slate-300 active:bg-slate-200'}
                `}
               >
                 {chip === 'Baixo Estoque' && <span className="w-1.5 h-1.5 rounded-full bg-warning mr-1.5"></span>}
                 {chip === 'Sem Pinça' && <span className="w-1.5 h-1.5 rounded-full bg-danger mr-1.5"></span>}
                 {chip}
               </button>
             )
          })}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28 space-y-3 no-scrollbar">
        {loading ? (
           <div className="text-center p-4 text-slate-500">Carregando fresas...</div>
        ) : filteredBits.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-center">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
              <p>Nenhuma fresa encontrada.</p>
           </div>
        ) : (
          filteredBits.map((bit) => (
            <div 
              key={bit.id}
              onClick={() => navigate(`/details/${bit.id}`)}
              className={`bg-surface-light dark:bg-surface-dark rounded-xl p-3 flex items-center gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.05)] active:scale-[0.99] transition-transform cursor-pointer relative overflow-hidden
                ${!bit.hasCollet ? 'border-l-[4px] border-l-danger' : ''}
              `}
            >
              <div 
                className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 bg-cover bg-center shrink-0 border border-slate-100 dark:border-slate-700 ml-1" 
                style={{ backgroundImage: `url("${bit.imageUrl}")` }}
              ></div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="text-[17px] font-semibold text-slate-900 dark:text-white truncate">{bit.name}</h3>
                </div>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-tight">{bit.specs?.geometry || 'Standard'} • {bit.material}</p>
                
                <div className="flex flex-col gap-1 mt-1.5">
                  {!bit.hasCollet ? (
                    <div className="inline-flex items-center gap-1 text-[12px] font-semibold text-danger">
                      <span className="material-symbols-outlined text-[14px]">block</span>
                      {bit.colletSize === 'Sem pinça' ? 'Sem Pinça' : `Sem Pinça (${bit.colletSize})`}
                    </div>
                  ) : (
                    <span className="text-[12px] font-medium text-slate-400 dark:text-slate-500">Estoque: {bit.stock}</span>
                  )}
                </div>
              </div>
              
              {isAdmin && (
                <div className="self-center">
                   <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/edit/${bit.id}`);
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-primary transition-colors"
                   >
                     <span className="material-symbols-outlined text-[20px]">edit</span>
                   </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MillingBitsList;