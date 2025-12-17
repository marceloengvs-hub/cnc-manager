import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchHistory } from '../services/api';
import { HistoryLog } from '../types';

const History: React.FC = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<HistoryLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory().then(data => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  const handleBack = () => navigate('/');

  // Group logs by Date
  const groupedLogs = logs.reduce((groups, log) => {
    const date = log.timestamp;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let key = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    
    // Friendly labels
    if (date.toDateString() === today.toDateString()) key = 'Hoje';
    else if (date.toDateString() === yesterday.toDateString()) key = 'Ontem';

    if (!groups[key]) groups[key] = [];
    groups[key].push(log);
    return groups;
  }, {} as Record<string, HistoryLog[]>);

  if (loading) return <div className="p-10 text-center text-slate-500">Carregando histórico...</div>;

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between border-b border-gray-200 dark:border-gray-800">
        <button 
          onClick={handleBack} 
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="material-symbols-outlined text-slate-900 dark:text-white">arrow_back</span>
        </button>
        <h2 className="font-bold text-lg flex-1 text-center pr-10">Histórico de Uso</h2>
      </div>

      <div className="p-4 space-y-6">
        {Object.entries(groupedLogs).map(([dateLabel, items]: [string, HistoryLog[]]) => (
          <div key={dateLabel} className="animate-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 ml-1">
              {dateLabel}
            </h3>
            
            <div className="flex flex-col gap-3">
              {items.map((log) => {
                const isUsage = log.type === 'usage';
                
                return (
                  <div key={log.id} className="relative bg-surface-light dark:bg-surface-dark rounded-xl p-3 flex items-center gap-3 border border-slate-200 dark:border-slate-800 shadow-sm">
                    {/* Vertical line connector visualization can go here if needed */}
                    
                    {/* Thumbnail */}
                    <div 
                      className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 bg-cover bg-center shrink-0 border border-slate-100 dark:border-slate-700" 
                      style={{ backgroundImage: `url("${log.itemImage}")` }}
                    ></div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate pr-2">
                          {log.itemName}
                        </h4>
                        <span className="text-[11px] font-medium text-slate-400 tabular-nums">
                          {log.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`material-symbols-outlined text-[14px] ${isUsage ? 'text-amber-500' : 'text-green-500'}`}>
                          {isUsage ? 'history_edu' : 'inventory_2'}
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                           {isUsage ? (log.project ? `Uso: ${log.project}` : 'Retirada para uso') : 'Reposição de estoque'}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Badge */}
                    <div className={`flex flex-col items-end gap-0.5 pl-2 border-l border-slate-100 dark:border-slate-700/50 ${isUsage ? 'text-slate-600 dark:text-slate-300' : 'text-green-600 dark:text-green-400'}`}>
                       <span className="text-[10px] uppercase font-bold text-slate-400">Qtd</span>
                       <span className="text-lg font-bold leading-none">
                         {isUsage ? '-' : '+'}{log.quantity}
                       </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {logs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <span className="material-symbols-outlined text-4xl mb-2">history_toggle_off</span>
            <p className="text-sm">Nenhum registro encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;