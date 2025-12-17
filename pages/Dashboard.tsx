import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';

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
      console.error("Seed failed:", error);
      alert("Erro ao importar dados. Verifique o console.");
    } finally {
      setSeeding(false);
    }
  };

  // Cálculos de Totais e Lógica de Disponibilidade
  const totalBits = bits.reduce((acc, curr) => acc + curr.stock, 0);
  const totalCollets = collets.reduce((acc, curr) => acc + curr.stock, 0);
  
  const criticalBits = bits.filter(bit => bit.stock <= bit.minStock || !bit.hasCollet);

  // Lógica do Percentual de Disponibilidade
  // Calcula a porcentagem de Tipos de Fresas (SKUs) em estoque que possuem pinça compatível
  const readinessStats = useMemo(() => {
    // 1. Considera apenas SKUs (itens) que têm estoque > 0
    const activeBits = bits.filter(b => b.stock > 0);
    const totalActiveSKUs = activeBits.length;

    if (totalActiveSKUs === 0) return { percent: 0, color: 'text-slate-500', bg: 'bg-slate-500/10' };

    // 2. Normalização auxiliar (remove espaços, troca vírgula por ponto, lowercase)
    const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, '').replace(',', '.');

    // 3. Prepara lista de termos de pinças disponíveis
    const availableTerms = collets
      .filter(c => c.stock > 0)
      .map(c => normalize(c.size));

    // 4. Conta quantos SKUs ativos têm pinça compatível
    const usableSKUs = activeBits.filter(bit => {
      const req = normalize(bit.colletSize || '');
      
      // Se não tem info ou é 'sem pinça', ignora
      if (!req || req.includes('sempinça') || req.includes('sem')) return false;

      // Verifica match flexível
      return availableTerms.some(term => {
        // Match direto (ex: 'er206mm' contem '6mm') ou reverso
        if (req.includes(term) || term.includes(req)) return true;
        
        // Tratamento especial para 1/8" vs 3.175mm
        const isImperial = term.includes('1/8') || term.includes('3.175');
        const reqImperial = req.includes('1/8') || req.includes('3.175');
        if (isImperial && reqImperial) return true;

        return false;
      });
    }).length;

    const percent = Math.round((usableSKUs / totalActiveSKUs) * 100);
    
    // Determina cor baseada no percentual
    let color = 'text-green-500';
    let bg = 'bg-green-500/10';
    
    if (percent < 30) {
      color = 'text-red-500';
      bg = 'bg-red-500/10';
    } else if (percent < 80) {
      color = 'text-warning';
      bg = 'bg-warning/10';
    }

    return { percent, color, bg };
  }, [bits, collets]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-slate-500">Carregando Dashboard...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header */}
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
               className={`flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 dark:bg-surface-dark hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors ${refreshing ? 'animate-spin text-primary' : 'text-slate-700 dark:text-slate-300'}`}
               title="Atualizar dados"
             >
              <span className="material-symbols-outlined">sync</span>
            </button>
            <button className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 dark:bg-surface-dark hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">settings</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-6">
        
        {/* Empty State / Seed Action - Only for Admins */}
        {isAdmin && !loading && bits.length === 0 && collets.length === 0 && (
           <div className="rounded-xl p-6 bg-surface-light dark:bg-surface-dark border-2 border-dashed border-primary/30 flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-3xl">cloud_upload</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">Banco de Dados Vazio</h3>
                <p className="text-slate-500 text-sm mt-1">Deseja importar os dados de exemplo para começar?</p>
              </div>
              <button 
                onClick={handleSeed}
                disabled={seeding}
                className="bg-primary text-white font-bold py-2.5 px-6 rounded-lg hover:bg-primary/90 active:scale-95 transition-all w-full flex justify-center items-center gap-2"
              >
                {seeding && <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>}
                {seeding ? 'Importando...' : 'Importar Dados de Exemplo'}
              </button>
           </div>
        )}

        {/* Stats Overview */}
        <div className="flex gap-3">
          {/* Total Fresas */}
          <div className="flex flex-1 flex-col justify-between rounded-xl p-4 bg-surface-light dark:bg-surface-dark shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-start justify-between w-full">
              <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary">
                <span className="material-symbols-outlined">precision_manufacturing</span>
              </div>
              <span className={`text-xs font-bold ${readinessStats.bg} ${readinessStats.color} px-2 py-1 rounded-full whitespace-nowrap ml-2`} title="% do estoque com pinça disponível">
                {readinessStats.percent}% Úteis
              </span>
            </div>
            <div className="mt-3">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Fresas Total</p>
              <p className="text-3xl font-bold tracking-tight mt-1">{totalBits}</p>
            </div>
          </div>
          
          {/* Total Pinças */}
          <div className="flex flex-1 flex-col justify-between rounded-xl p-4 bg-surface-light dark:bg-surface-dark shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-lg bg-warning/10 dark:bg-warning/20 text-warning">
                <span className="material-symbols-outlined">donut_large</span>
              </div>
              {/* Placeholder para futura métrica de pinças */}
              <span className="text-slate-400 text-xs font-bold bg-slate-500/10 px-2 py-1 rounded-full">-</span>
            </div>
            <div className="mt-3">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Pinças Total</p>
              <p className="text-3xl font-bold tracking-tight mt-1">{totalCollets}</p>
            </div>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Alertas Críticos</h3>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{criticalBits.length}</span>
          </div>
          
          {/* Loop through all critical items */}
          {criticalBits.length === 0 ? (
            <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-xl text-center text-slate-500 text-sm">Nenhum alerta crítico</div>
          ) : (
            criticalBits.map((bit, idx) => (
              <div key={bit.id} className={`flex flex-col rounded-xl bg-surface-light dark:bg-surface-dark border-l-4 ${!bit.hasCollet ? 'border-l-warning' : 'border-l-danger'} shadow-sm overflow-hidden`}>
                <div className="flex p-4 gap-4">
                  <div 
                    className="w-20 h-20 shrink-0 bg-slate-100 dark:bg-slate-800 rounded-lg bg-cover bg-center" 
                    style={{ backgroundImage: `url("${bit.imageUrl}")` }}
                  ></div>
                  <div className="flex flex-col flex-1 justify-between py-0.5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-base">{bit.name}</h4>
                      </div>
                      {!bit.hasCollet ? (
                        <div className="flex items-center gap-1.5 text-warning dark:text-warning">
                          <span className="material-symbols-outlined text-[16px]">block</span>
                          <p className="text-sm font-semibold">Sem Pinça Compatível</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-danger dark:text-danger">
                          <span className="material-symbols-outlined text-[16px]">warning</span>
                          <p className="text-sm font-semibold">Estoque Crítico ({bit.stock} un)</p>
                        </div>
                      )}
                    </div>
                    <button 
                       onClick={() => navigate(bit.stock <= bit.minStock ? '/list' : '/stock')}
                       className="mt-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white py-1.5 px-3 rounded w-fit transition-colors"
                    >
                      {!bit.hasCollet ? 'Ver Pinças' : 'Solicitar Reposição'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Access */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold">Acesso Rápido</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate('/bit-stock')} className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-surface-light dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-[#252b36] shadow-sm border border-slate-100 dark:border-slate-800 transition-all active:scale-95 group">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '28px' }}>inventory_2</span>
              </div>
              <span className="text-sm font-semibold">Estoque</span>
            </button>
            
            {/* Show New Bit button only to Admins */}
            {isAdmin && (
              <button onClick={() => navigate('/new')} className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-surface-light dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-[#252b36] shadow-sm border border-slate-100 dark:border-slate-800 transition-all active:scale-95 group">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '28px' }}>add_circle</span>
                </div>
                <span className="text-sm font-semibold">Nova Fresa</span>
              </button>
            )}

            <button onClick={() => navigate('/history')} className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-surface-light dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-[#252b36] shadow-sm border border-slate-100 dark:border-slate-800 transition-all active:scale-95 group">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '28px' }}>history</span>
              </div>
              <span className="text-sm font-semibold">Histórico</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-surface-light dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-[#252b36] shadow-sm border border-slate-100 dark:border-slate-800 transition-all active:scale-95 group">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '28px' }}>build</span>
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