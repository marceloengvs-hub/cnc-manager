
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { checkColletCompatibility } from '../services/mockData';

const SkeletonCard = () => (
  <div className="flex flex-col flex-1 rounded-xl p-4 bg-surface-light dark:bg-surface-dark shadow-sm border border-slate-100 dark:border-slate-800 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="size-10 rounded-lg bg-slate-200 dark:bg-slate-700"></div>
      <div className="w-12 h-5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
    </div>
    <div className="mt-4 space-y-2">
      <div className="w-20 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
      <div className="w-12 h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
    </div>
  </div>
);

const SkeletonAlert = () => (
  <div className="flex flex-col rounded-xl bg-surface-light dark:bg-surface-dark border-l-4 border-l-slate-200 dark:border-l-slate-700 shadow-sm animate-pulse">
    <div className="flex p-4 gap-4">
      <div className="w-20 h-20 shrink-0 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
      <div className="flex flex-col flex-1 justify-between py-1">
        <div className="space-y-2">
          <div className="w-3/4 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="w-1/2 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
        <div className="w-24 h-6 bg-slate-200 dark:bg-slate-700 rounded mt-2"></div>
      </div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { bits, collets, loading, refreshData, seedData, isAdmin } = useData();
  const [refreshing, setRefreshing] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedData();
    } catch (error) {
      alert("Erro ao importar dados.");
    } finally {
      setSeeding(false);
    }
  };

  const stats = useMemo(() => {
    const totalBits = bits.reduce((acc, curr) => acc + curr.stock, 0);
    const totalCollets = collets.reduce((acc, curr) => acc + curr.stock, 0);
    
    // Critical: Low stock AND we have a collet for it
    const criticalBits = bits.filter(bit => 
      bit.stock <= bit.minStock && checkColletCompatibility(bit.colletSize, collets)
    );
    
    return { totalBits, totalCollets, criticalBits };
  }, [bits, collets]);

  const readinessStats = useMemo(() => {
    const activeBits = bits.filter(b => b.stock > 0);
    const totalActiveSKUs = activeBits.length;
    if (totalActiveSKUs === 0) return { percent: 0, color: 'text-slate-500', bg: 'bg-slate-500/10' };

    const usableSKUs = activeBits.filter(bit => checkColletCompatibility(bit.colletSize, collets)).length;

    const percent = Math.round((usableSKUs / totalActiveSKUs) * 100);
    let color = percent < 30 ? 'text-red-500' : percent < 80 ? 'text-warning' : 'text-green-500';
    let bg = percent < 30 ? 'bg-red-500/10' : percent < 80 ? 'bg-warning/10' : 'bg-green-500/10';
    return { percent, color, bg };
  }, [bits, collets]);

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <div className="sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center p-4 justify-between w-full">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">CNC Manager</p>
            <h2 className="text-2xl font-bold leading-tight tracking-tight">Dashboard</h2>
          </div>
          <div className="flex gap-2">
            <button 
               onClick={handleRefresh}
               disabled={refreshing}
               className={`flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 dark:bg-surface-dark transition-colors ${refreshing ? 'animate-spin text-primary' : 'text-slate-700 dark:text-slate-300'}`}
             >
              <span className="material-symbols-outlined">sync</span>
            </button>
            <button className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 dark:bg-surface-dark text-slate-700 dark:text-slate-300">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-6">
        
        {loading && bits.length === 0 ? (
          <>
            <div className="flex gap-3">
              <SkeletonCard />
              <SkeletonCard />
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-32 h-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <SkeletonAlert />
              <SkeletonAlert />
            </div>
          </>
        ) : (
          <>
            {isAdmin && bits.length === 0 && collets.length === 0 && (
               <div className="rounded-xl p-6 bg-surface-light dark:bg-surface-dark border-2 border-dashed border-primary/30 flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                  </div>
                  <h3 className="text-lg font-bold">Banco de Dados Vazio</h3>
                  <button onClick={handleSeed} disabled={seeding} className="bg-primary text-white font-bold py-2.5 px-6 rounded-lg w-full flex justify-center items-center gap-2">
                    {seeding ? 'Importando...' : 'Importar Dados de Exemplo'}
                  </button>
               </div>
            )}

            <div className="flex gap-3">
              <div className="flex flex-1 flex-col justify-between rounded-xl p-4 bg-surface-light dark:bg-surface-dark shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-start justify-between w-full">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <span className="material-symbols-outlined">precision_manufacturing</span>
                  </div>
                  <span className={`text-xs font-bold ${readinessStats.bg} ${readinessStats.color} px-2 py-1 rounded-full whitespace-nowrap ml-2`}>
                    {readinessStats.percent}% Úteis
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Fresas Total</p>
                  <p className="text-3xl font-bold tracking-tight mt-1">{stats.totalBits}</p>
                </div>
              </div>
              
              <div className="flex flex-1 flex-col justify-between rounded-xl p-4 bg-surface-light dark:bg-surface-dark shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-warning/10 text-warning">
                    <span className="material-symbols-outlined">donut_large</span>
                  </div>
                  <span className="text-slate-400 text-xs font-bold bg-slate-500/10 px-2 py-1 rounded-full">-</span>
                </div>
                <div className="mt-3">
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Pinças Total</p>
                  <p className="text-3xl font-bold tracking-tight mt-1">{stats.totalCollets}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Alertas Críticos</h3>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{stats.criticalBits.length}</span>
              </div>
              
              {stats.criticalBits.length === 0 ? (
                <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-xl text-center text-slate-500 text-sm">Nenhum alerta crítico para fresas com pinças disponíveis</div>
              ) : (
                stats.criticalBits.map((bit) => (
                  <div key={bit.id} className="flex flex-col rounded-xl bg-surface-light dark:bg-surface-dark border-l-4 border-l-danger shadow-sm overflow-hidden" onClick={() => navigate(`/details/${bit.id}`)}>
                    <div className="flex p-4 gap-4">
                      <div className="w-20 h-20 shrink-0 bg-slate-100 dark:bg-slate-800 rounded-lg bg-cover bg-center border border-slate-200 dark:border-slate-700" style={{ backgroundImage: bit.imageUrl ? `url("${bit.imageUrl}")` : 'none' }}>
                        {!bit.imageUrl && <span className="material-symbols-outlined text-slate-500 text-2xl m-auto">image</span>}
                      </div>
                      <div className="flex flex-col flex-1 justify-between py-0.5">
                        <h4 className="font-bold text-base truncate">{bit.name}</h4>
                        <div className="flex items-center gap-1.5 text-danger">
                          <span className="material-symbols-outlined text-[16px]">warning</span>
                          <p className="text-sm font-semibold">Estoque Crítico ({bit.stock} un)</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); navigate('/list'); }} className="mt-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 py-1.5 px-3 rounded w-fit transition-colors">
                          Solicitar Reposição
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold">Acesso Rápido</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate('/bit-stock')} className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-surface-light dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-white/5 border border-slate-100 dark:border-slate-800 transition-all active:scale-95 group">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20">
                <span className="material-symbols-outlined text-primary text-[28px]">inventory_2</span>
              </div>
              <span className="text-sm font-semibold">Estoque</span>
            </button>
            {isAdmin && (
              <button onClick={() => navigate('/new')} className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-surface-light dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-white/5 border border-slate-100 dark:border-slate-800 transition-all active:scale-95 group">
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20">
                  <span className="material-symbols-outlined text-primary text-[28px]">add_circle</span>
                </div>
                <span className="text-sm font-semibold">Nova Fresa</span>
              </button>
            )}
            <button onClick={() => navigate('/history')} className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-surface-light dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-white/5 border border-slate-100 dark:border-slate-800 transition-all active:scale-95 group">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20">
                <span className="material-symbols-outlined text-primary text-[28px]">history</span>
              </div>
              <span className="text-sm font-semibold">Histórico</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-surface-light dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-white/5 border border-slate-100 dark:border-slate-800 transition-all active:scale-95 group">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20">
                <span className="material-symbols-outlined text-primary text-[28px]">build</span>
              </div>
              <span className="text-sm font-semibold">Manutenção</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
