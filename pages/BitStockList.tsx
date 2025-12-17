import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { MillingBit } from '../types';

const BitStockList: React.FC = () => {
  const navigate = useNavigate();
  const { bits, loading } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  // Helper para extrair diâmetro da haste baseado na pinça
  const getShankDiameter = (bit: MillingBit) => {
    if (!bit.hasCollet || bit.colletSize === 'Sem pinça') return '-';
    // Remove "ER20" e espaços extras para tentar isolar o tamanho
    return bit.colletSize.replace(/ER\d+\s*/i, '').trim();
  };

  const filteredBits = bits.filter(bit => 
    bit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bit.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-10 text-center text-slate-500">Carregando tabela...</div>;

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between border-b border-gray-200 dark:border-gray-800">
        <button 
          onClick={() => navigate('/')} 
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="material-symbols-outlined text-slate-900 dark:text-white">arrow_back</span>
        </button>
        <h2 className="font-bold text-lg flex-1 text-center pr-10">Tabela de Fresas</h2>
      </div>

      {/* Search */}
      <div className="px-4 py-4">
        <div className="relative flex items-center w-full h-10 rounded-xl bg-white dark:bg-[#1A232E] border border-slate-200 dark:border-slate-800 focus-within:ring-1 focus-within:ring-primary/50 shadow-sm">
            <div className="grid place-items-center h-full w-10 text-slate-400">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="peer h-full w-full outline-none bg-transparent text-[14px] text-slate-900 dark:text-white pr-4 placeholder:text-slate-400" 
              placeholder="Filtrar por nome ou tipo..." 
              type="text"
            />
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-x-auto px-4 pb-4">
        <div className="min-w-[600px] bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-slate-800">
                <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Item</th>
                <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Haste</th>
                <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Corte</th>
                <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Qtde.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBits.map((bit) => {
                // Lógica de destaque: Tem pinça E estoque <= 1
                const isCritical = bit.hasCollet && bit.stock <= 1;
                
                return (
                  <tr 
                    key={bit.id} 
                    onClick={() => navigate(`/edit-stock/${bit.id}`)}
                    className={`
                      cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-white/5
                      ${isCritical ? 'bg-red-50 dark:bg-red-900/10' : ''}
                    `}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded bg-slate-200 dark:bg-slate-700 bg-cover bg-center shrink-0 border border-slate-200 dark:border-slate-600" 
                          style={{ backgroundImage: `url("${bit.imageUrl}")` }}
                        ></div>
                        <span className={`text-sm font-semibold ${isCritical ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                          {bit.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-slate-600 dark:text-slate-300">
                      {bit.type}
                    </td>
                    <td className="p-3 text-sm text-slate-600 dark:text-slate-300 text-center">
                      {getShankDiameter(bit)}
                    </td>
                    <td className="p-3 text-sm text-slate-600 dark:text-slate-300 text-center">
                      {bit.diameter}
                    </td>
                    <td className="p-3 text-center">
                       <span className={`
                         inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-xs font-bold
                         ${isCritical 
                            ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 ring-1 ring-inset ring-red-600/20' 
                            : bit.stock === 0 
                              ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' 
                              : 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
                          }
                       `}>
                         {bit.stock}
                       </span>
                    </td>
                  </tr>
                );
              })}
              {filteredBits.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 text-sm">
                    Nenhum item encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BitStockList;