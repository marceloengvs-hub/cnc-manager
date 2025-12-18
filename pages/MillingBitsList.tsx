
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { getRequiredColletSize, checkColletCompatibility } from '../services/mockData';

const MillingBitsList: React.FC = () => {
  const navigate = useNavigate();
  const { bits, collets, loading, isAdmin } = useData();
  const [filter, setFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const getShankVal = (colletSizeStr: string) => {
      const normalized = String(colletSizeStr).replace(',', '.');
      const match = normalized.match(/(\d+(\.\d+)?)/);
      return match ? parseFloat(match[0]) : NaN;
  };

  const filteredBits = useMemo(() => {
    return bits.filter(bit => {
      let matchesCategory = true;
      if (filter === 'Baixo Estoque') matchesCategory = bit.stock <= bit.minStock;
      else if (filter === 'Sem Pinça') matchesCategory = !checkColletCompatibility(bit.colletSize, collets);
      else if (filter === '6mm') {
          const val = getShankVal(bit.colletSize);
          matchesCategory = Math.abs(val - 5) < 0.2 || Math.abs(val - 6) < 0.2;
      }
      else if (filter === '3.175mm') {
          const val = getShankVal(bit.colletSize);
          matchesCategory = Math.abs(val - 3) < 0.2 || Math.abs(val - 3.175) < 0.05;
      }

      let matchesSearch = true;
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        matchesSearch = bit.name.toLowerCase().includes(q) || bit.type.toLowerCase().includes(q);
      }
      return matchesCategory && matchesSearch;
    });
  }, [bits, collets, filter, searchQuery]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background-dark">
      <div className="bg-background-dark flex flex-col shrink-0 z-20 shadow-sm border-b border-slate-800/50">
        <header className="px-4 pb-2 pt-1 flex items-center justify-between mt-2">
          <h1 className="text-[34px] font-bold tracking-tight text-white leading-tight">Fresas</h1>
          {isAdmin && (
            <button onClick={() => navigate('/new')} className="bg-primary hover:bg-primary/90 text-white rounded-full p-1.5 w-9 h-9 flex items-center justify-center transition-colors shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[24px]">add</span>
            </button>
          )}
        </header>
        
        <div className="px-4 pb-3">
          <div className="relative flex items-center w-full h-10 rounded-xl bg-[#2C2C2E] focus-within:ring-1 focus-within:ring-primary/50">
            <div className="grid place-items-center h-full w-10 text-slate-400">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="peer h-full w-full outline-none bg-transparent text-[17px] text-white pr-4 placeholder:text-slate-400" 
              placeholder="Buscar (ex: 6mm, V-Bit...)" 
              type="text"
            />
          </div>
        </div>
        
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar items-center">
          {['Todos', 'Baixo Estoque', 'Sem Pinça', '6mm', '3.175mm'].map((chip) => {
             const isActive = filter === chip;
             return (
               <button 
                key={chip}
                onClick={() => setFilter(chip)}
                className={`flex items-center justify-center px-4 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap shadow-sm transition-colors
                  ${isActive ? 'bg-white text-slate-900' : 'bg-[#2C2C2E] text-slate-300 active:bg-slate-200'}
                `}
               >
                 {chip}
               </button>
             )
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28 space-y-3 no-scrollbar">
        {loading ? (
           <div className="text-center p-4 text-slate-500">Carregando fresas...</div>
        ) : filteredBits.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-center">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
              <p>Nenhuma fresa encontrada.</p>
           </div>
        ) : (
          filteredBits.map((bit) => {
            const hasCompatibleCollet = checkColletCompatibility(bit.colletSize, collets);
            const { label } = getRequiredColletSize(bit.colletSize);
            const isCritical = !hasCompatibleCollet;

            return (
              <div 
                key={bit.id}
                onClick={() => navigate(`/details/${bit.id}`)}
                className={`bg-[#1A232E] rounded-xl p-3 flex items-center gap-3 shadow-md active:scale-[0.99] transition-all cursor-pointer relative overflow-hidden border border-slate-800
                  ${isCritical ? 'border-l-[4px] border-l-red-500' : ''}
                `}
              >
                <div 
                  className="w-16 h-16 rounded-lg bg-slate-800 bg-cover bg-center shrink-0 border border-slate-700 ml-1" 
                  style={{ backgroundImage: `url("${bit.imageUrl}")` }}
                ></div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-[17px] font-bold text-white truncate">{bit.name}</h3>
                  <p className="text-[13px] text-slate-400 leading-tight">
                    {bit.specs?.geometry || '2F'} • {bit.material}
                  </p>
                  
                  <div className="flex flex-col gap-1 mt-1.5">
                    {isCritical ? (
                      <div className="inline-flex items-center gap-1 text-[13px] font-bold text-red-500">
                        <span className="material-symbols-outlined text-[16px]">block</span>
                        {label}
                      </div>
                    ) : (
                      <span className="text-[12px] font-medium text-slate-500">
                        Estoque: {bit.stock} un • Pinça OK
                      </span>
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
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-primary transition-colors hover:bg-slate-700"
                     >
                       <span className="material-symbols-outlined text-[20px] filled">edit</span>
                     </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MillingBitsList;
