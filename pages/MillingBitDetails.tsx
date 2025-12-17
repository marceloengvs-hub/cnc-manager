import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchBitById } from '../services/api';
import { MillingBit } from '../types';
import { calculatePreset, MATERIALS_LIST, CNCPreset } from '../services/materialPresets';
import { generateParametersWithAI, AiPresetResponse } from '../services/geminiService';
import { useData } from '../contexts/DataContext';
import ImageViewer from '../components/ImageViewer';

const MillingBitDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBitById, isAdmin } = useData();
  
  const [bit, setBit] = useState<MillingBit | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullImage, setShowFullImage] = useState(false);
  
  // State for calculation
  const [selectedMaterial, setSelectedMaterial] = useState<string>('Original');
  const [customMaterial, setCustomMaterial] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  
  // AI State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AiPresetResponse | null>(null);

  useEffect(() => {
    if (!id) return;

    // 1. Try to get from Context Cache first (Instant)
    const cachedBit = getBitById(id);
    if (cachedBit) {
      setBit(cachedBit);
      setLoading(false);
      // Set initial material selection
      if (cachedBit.material && MATERIALS_LIST.includes(cachedBit.application?.materials?.[0] || '')) {
         setSelectedMaterial(cachedBit.application?.materials?.[0] || 'Original');
      }
    } else {
      // 2. Fallback to API fetch if deep-linked or not in cache
      fetchBitById(id).then(data => {
        setBit(data);
        if (data && data.material && MATERIALS_LIST.includes(data.application?.materials?.[0] || '')) {
             setSelectedMaterial(data.application?.materials?.[0] || 'Original');
        }
        setLoading(false);
      });
    }
  }, [id, getBitById]);

  // Combined logic: DB -> Heuristic -> AI
  const currentSpecs = useMemo((): CNCPreset | null => {
    if (!bit) return null;

    // 1. If AI Result exists, use it
    if (aiResult) {
      return {
        rpm: aiResult.rpm,
        feedRate: aiResult.feedRate,
        plungeRate: aiResult.plungeRate,
        stepDown: aiResult.stepDown,
        description: `🤖 IA: ${aiResult.explanation}`
      };
    }

    // 2. Original Database values
    if (selectedMaterial === 'Original' && !isCustomMode) {
      return {
        rpm: bit.specs?.rpm || 0,
        feedRate: bit.specs?.feedRate || 0,
        plungeRate: bit.specs?.plungeRate || 0,
        stepDown: bit.specs?.stepDown || 0,
        description: 'Parâmetros salvos no cadastro da fresa.'
      };
    }

    // 3. Heuristic Calculator (Standard List)
    if (!isCustomMode) {
      return calculatePreset(bit, selectedMaterial);
    }

    // 4. Custom mode waiting for AI
    return {
        rpm: 0, feedRate: 0, plungeRate: 0, stepDown: 0, description: 'Aguardando cálculo...'
    };

  }, [bit, selectedMaterial, aiResult, isCustomMode]);

  const handleConsultAI = async () => {
    if (!bit) return;
    const mat = isCustomMode ? customMaterial : selectedMaterial;
    if (!mat) return;

    setAiLoading(true);
    setAiResult(null); // Clear previous
    try {
      const result = await generateParametersWithAI(bit, mat);
      setAiResult(result);
    } catch (error) {
      alert("Erro ao consultar Inteligência Artificial. Verifique sua chave de API.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleMaterialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'Custom') {
      setIsCustomMode(true);
      setAiResult(null);
    } else {
      setIsCustomMode(false);
      setSelectedMaterial(val);
      setAiResult(null); // Reset AI if switching back to standard list
    }
  };

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/list');
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Carregando...</div>;
  if (!bit) return <div className="p-10 text-center text-white">Item not found</div>;

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display relative pb-20">
      {/* TopAppBar */}
      <div className="sticky top-0 z-[100] flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between border-b border-gray-200 dark:border-gray-800/50">
        <div className="flex w-12 items-center justify-start">
          <button 
            type="button"
            onClick={handleBack}
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 cursor-pointer z-50"
            aria-label="Voltar"
          >
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
        </div>
        
        <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Detalhes da Fresa</h2>
        
        <div className="flex w-12 items-center justify-end">
           {isAdmin && (
             <button 
               onClick={() => navigate(`/edit/${id}`)}
               className="flex items-center justify-center w-10 h-10 border border-primary text-primary rounded-lg transition-colors hover:bg-primary/10 active:scale-95"
             >
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
           )}
        </div>
      </div>

      <div className="flex-1 flex flex-col pb-8 z-0">
        {/* HeaderImage */}
        <div className="@container">
          <div className="pt-2 px-4">
            <div 
              onClick={() => setShowFullImage(true)}
              className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-gray-200 dark:bg-[#1A232E] rounded-xl min-h-[220px] shadow-lg relative cursor-zoom-in active:scale-[0.99] transition-transform"
              style={{ backgroundImage: `url("${bit.imageUrl}")` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
              <div className="relative p-3 z-10 pointer-events-none">
                <span className="inline-flex items-center rounded-sm bg-white px-2 py-0.5 text-[10px] font-bold text-primary tracking-wide">CNC Router</span>
              </div>
            </div>
          </div>
        </div>

        {/* HeadlineText */}
        <div className="px-4 pt-5 pb-3">
          <h1 className="text-slate-900 dark:text-white tracking-tight text-[26px] font-bold leading-tight text-left">{bit.name}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">{bit.material}</p>
        </div>

        {/* Chips */}
        <div className="flex gap-3 px-4 pb-2 flex-wrap">
          <div className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-slate-200 dark:bg-[#1A232E] px-4 border border-slate-300 dark:border-slate-800">
            <span className="material-symbols-outlined text-primary text-[18px]">inventory_2</span>
            <p className="text-slate-900 dark:text-white text-[13px] font-bold leading-normal">Estoque: {bit.stock} un</p>
          </div>
          <div className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-slate-200 dark:bg-[#1A232E] px-4 border border-slate-300 dark:border-slate-800">
            <span className="material-symbols-outlined text-slate-400 dark:text-slate-400 text-[18px]">settings</span>
            <p className="text-slate-900 dark:text-white text-[13px] font-bold leading-normal">
              {bit.colletSize === 'Sem pinça' ? 'Sem pinça compatível' : `Pinça: ${bit.colletSize}`}
            </p>
          </div>
        </div>

        {/* Aspire Parameters */}
        {currentSpecs && (
          <div className="mt-6 border-t border-slate-100 dark:border-slate-800/50 pt-6">
            <div className="px-4 pb-4">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[24px]">tune</span>
                    <h3 className="text-slate-900 dark:text-white text-[20px] font-bold leading-tight tracking-[-0.015em]">
                      Parâmetros Aspire
                    </h3>
                  </div>
                  {/* AI Status Badge */}
                  {aiResult && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-500 ring-1 ring-inset ring-purple-500/20">
                      <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                      IA Gemini
                    </span>
                  )}
               </div>
               
               {/* Material Selector Area */}
               <div className="bg-slate-50 dark:bg-[#151b24] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                 <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Material Alvo:</label>
                 
                 {!isCustomMode ? (
                   <div className="relative">
                     <select 
                        value={selectedMaterial}
                        onChange={handleMaterialChange}
                        className="w-full appearance-none rounded-lg bg-white dark:bg-[#1A232E] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white h-11 px-3 pr-10 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                     >
                       <option value="Original">Original (Banco de Dados)</option>
                       <option disabled>──────────</option>
                       {MATERIALS_LIST.map(mat => (
                         <option key={mat} value={mat}>{mat}</option>
                       ))}
                       <option disabled>──────────</option>
                       <option value="Custom" className="text-primary font-bold">+ Outro Material (IA)</option>
                     </select>
                     <span className="material-symbols-outlined absolute right-3 bottom-3 text-slate-500 pointer-events-none text-lg">expand_more</span>
                   </div>
                 ) : (
                   <div className="flex gap-2">
                     <div className="relative flex-1">
                        <input 
                          type="text"
                          value={customMaterial}
                          onChange={(e) => setCustomMaterial(e.target.value)}
                          placeholder="Ex: Jacarandá, Carbono..."
                          className="w-full rounded-lg bg-white dark:bg-[#1A232E] border border-primary/50 text-slate-900 dark:text-white h-11 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          autoFocus
                        />
                         <button 
                          onClick={() => setIsCustomMode(false)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                     </div>
                     <button 
                        onClick={handleConsultAI}
                        disabled={aiLoading || !customMaterial}
                        className="bg-primary text-white rounded-lg px-3 flex items-center justify-center disabled:opacity-50 active:scale-95 transition-transform"
                     >
                        {aiLoading ? (
                          <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        ) : (
                          <span className="material-symbols-outlined">auto_awesome</span>
                        )}
                     </button>
                   </div>
                 )}

                 {/* Explanation Text */}
                 <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 flex gap-2 items-start leading-relaxed">
                   <span className="material-symbols-outlined text-[16px] mt-0.5 shrink-0">info</span>
                   <p>{currentSpecs.description}</p>
                 </div>
                 
                 {aiResult?.warning && (
                   <div className="mt-2 text-xs text-warning flex gap-2 items-start leading-relaxed bg-warning/10 p-2 rounded">
                     <span className="material-symbols-outlined text-[16px] mt-0.5 shrink-0">warning</span>
                     <p>{aiResult.warning}</p>
                   </div>
                 )}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3 px-4">
              {/* RPM */}
              <div className="bg-white dark:bg-[#1A232E] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-24 relative overflow-hidden group">
                 <div className="absolute right-0 top-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-[40px]">cyclone</span>
                 </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 z-10">
                  <span className="material-symbols-outlined text-[18px]">speed</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">RPM</span>
                </div>
                <p className="text-[28px] font-bold text-primary tracking-tight z-10">
                  {currentSpecs.rpm > 0 ? currentSpecs.rpm.toLocaleString('pt-BR') : '-'}
                </p>
              </div>
              
              {/* Avanço */}
              <div className="bg-white dark:bg-[#1A232E] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-24 relative overflow-hidden group">
                 <div className="absolute right-0 top-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-[40px]">fast_forward</span>
                 </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 z-10">
                  <span className="material-symbols-outlined text-[18px]">fast_forward</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Avanço</span>
                </div>
                <div className="z-10">
                  <p className="text-[28px] font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                    {currentSpecs.feedRate > 0 ? currentSpecs.feedRate.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) : '-'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">mm/min</p>
                </div>
              </div>
              
              {/* Mergulho */}
              <div className="bg-white dark:bg-[#1A232E] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-24 relative overflow-hidden group">
                 <div className="absolute right-0 top-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-[40px]">download</span>
                 </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 z-10">
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Mergulho</span>
                </div>
                <div className="z-10">
                  <p className="text-[28px] font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                     {currentSpecs.plungeRate > 0 ? currentSpecs.plungeRate.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) : '-'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">mm/min</p>
                </div>
              </div>
              
              {/* Passo Vertical */}
              <div className="bg-white dark:bg-[#1A232E] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-24 relative overflow-hidden group">
                 <div className="absolute right-0 top-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-[40px]">layers</span>
                 </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 z-10">
                  <span className="material-symbols-outlined text-[18px]">layers</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Passo Vertical</span>
                </div>
                <div className="z-10">
                  <p className="text-[28px] font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                    {currentSpecs.stepDown > 0 ? currentSpecs.stepDown.toFixed(1) : '-'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">milímetros</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Characteristics */}
        <div className="mt-8">
          <h3 className="text-slate-900 dark:text-white text-[17px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3">Características Físicas</h3>
          <div className="px-4">
            <div className="bg-white dark:bg-[#1A232E] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center text-slate-500 dark:text-slate-400">
                    <span className="material-symbols-outlined text-[18px]">straighten</span>
                  </div>
                  <span className="text-[14px] font-medium text-slate-600 dark:text-slate-300">Comprimento Total</span>
                </div>
                <span className="text-[14px] font-bold text-slate-900 dark:text-white">{bit.specs?.totalLength || 'N/A'} mm</span>
              </div>
              
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center text-slate-500 dark:text-slate-400">
                    <span className="material-symbols-outlined text-[18px]">diamond</span>
                  </div>
                  <span className="text-[14px] font-medium text-slate-600 dark:text-slate-300">Dureza</span>
                </div>
                <span className="text-[14px] font-bold text-slate-900 dark:text-white">{bit.specs?.hardness || '-'}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center text-slate-500 dark:text-slate-400">
                    <span className="material-symbols-outlined text-[18px]">content_cut</span>
                  </div>
                  <span className="text-[14px] font-medium text-slate-600 dark:text-slate-300">Geometria</span>
                </div>
                <span className="text-[14px] font-bold text-slate-900 dark:text-white">{bit.specs?.geometry || 'Standard'}</span>
              </div>

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center text-slate-500 dark:text-slate-400">
                    <span className="material-symbols-outlined text-[18px]">description</span>
                  </div>
                  <span className="text-[14px] font-medium text-slate-600 dark:text-slate-300">Material da Fresa</span>
                </div>
                <span className="text-[14px] font-bold text-slate-900 dark:text-white">{bit.material}</span>
              </div>
            </div>
          </div>
        </div>
        
      </div>
      
      {/* Bottom Button - Only for Admins */}
      {isAdmin && (
        <div className="bg-white dark:bg-card-dark border-t border-gray-200 dark:border-gray-800 p-4 sticky bottom-0 z-20">
          <button 
            onClick={() => navigate(`/edit-stock/${id}`)}
            className="w-full h-12 rounded-lg bg-primary hover:bg-blue-600 text-white font-bold text-[15px] flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary/20 active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">edit_note</span>
            Ajustar Estoque
          </button>
        </div>
      )}

      {/* Lightbox / Zoom Modal */}
      {showFullImage && (
        <ImageViewer 
           src={bit.imageUrl}
           alt={bit.name}
           onClose={() => setShowFullImage(false)}
        />
      )}
    </div>
  );
};

export default MillingBitDetails;