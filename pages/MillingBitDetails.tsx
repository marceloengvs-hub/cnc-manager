
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchBitById } from '../services/api';
import { MillingBit } from '../types';
import { calculatePreset, MATERIALS_LIST, CNCPreset } from '../services/materialPresets';
import { generateParametersWithAI, AiPresetResponse } from '../services/geminiService';
import { useData } from '../contexts/DataContext';
import { getRequiredColletSize } from '../services/mockData';
import ImageViewer from '../components/ImageViewer';

const MillingBitDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useData();
  
  const [bit, setBit] = useState<MillingBit | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullImage, setShowFullImage] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('Original');
  const [customMaterialInput, setCustomMaterialInput] = useState<string>('');
  const [aiResult, setAiResult] = useState<AiPresetResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchBitById(id).then(data => {
      setBit(data);
      setLoading(false);
    }).catch(err => {
      console.error("Erro ao carregar detalhes:", err);
      setLoading(false);
    });
  }, [id]);

  // Limpa o resultado da IA se mudar o material para um pré-definido
  useEffect(() => {
    if (selectedMaterial !== 'Outro material (IA)') {
      setAiResult(null);
    }
  }, [selectedMaterial]);

  const handleCallAI = async () => {
    if (!bit || !customMaterialInput.trim()) {
      alert("Por favor, digite o nome do material.");
      return;
    }
    
    setAiLoading(true);
    try {
      const result = await generateParametersWithAI(bit, customMaterialInput);
      setAiResult(result);
    } catch (err) {
      console.error("Erro IA:", err);
      alert("Erro ao consultar a IA.");
    } finally {
      setAiLoading(false);
    }
  };

  const colletInfo = useMemo(() => {
    if (!bit) return { text: '...', isError: false };
    
    // Prioridade total ao valor do banco (pinca_recomendada)
    const dbValue = bit.recommendedCollet;
    const fallback = getRequiredColletSize(bit.colletSize).label;
    
    const text = (dbValue && dbValue.trim() !== '') ? dbValue : fallback;
    const isError = text.toLowerCase().includes('indisponível');
    
    return { text, isError };
  }, [bit]);

  const currentSpecs = useMemo((): CNCPreset | null => {
    if (!bit) return null;
    if (aiResult) {
      return {
        rpm: aiResult.rpm,
        feedRate: aiResult.feedRate,
        plungeRate: aiResult.plungeRate,
        stepDown: aiResult.stepDown,
        description: `🤖 IA: ${aiResult.explanation}`
      };
    }
    if (selectedMaterial === 'Original') {
      return {
        rpm: bit.specs?.rpm || 0,
        feedRate: bit.specs?.feedRate || 0,
        plungeRate: bit.specs?.plungeRate || 0,
        stepDown: bit.specs?.stepDown || 0,
        description: 'Parâmetros salvos no cadastro da fresa.'
      };
    }
    if (selectedMaterial === 'Outro material (IA)') {
      return {
        rpm: 0,
        feedRate: 0,
        plungeRate: 0,
        stepDown: 0,
        description: 'Digite o material e clique em "Calcular via IA".'
      };
    }
    return calculatePreset(bit, selectedMaterial);
  }, [bit, selectedMaterial, aiResult]);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-background-dark h-screen">
      <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
    </div>
  );
  
  if (!bit) return <div className="p-10 text-center text-white bg-background-dark h-screen font-bold">Fresa não encontrada ou erro de conexão.</div>;

  return (
    <div className="bg-background-dark min-h-screen flex flex-col font-display relative pb-32">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center bg-background-dark/80 backdrop-blur-md p-4 justify-between border-b border-slate-800/50">
        <button 
          onClick={() => navigate('/bit-stock')} 
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-surface-dark border border-slate-800 text-white hover:bg-slate-800 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-white text-base font-bold flex-1 text-center">Detalhes da Fresa</h2>
        <button 
          onClick={() => isAdmin && navigate(`/edit/${id}`)}
          className="flex items-center justify-center w-10 h-10 rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors"
        >
          <span className="material-symbols-outlined filled">edit</span>
        </button>
      </div>

      <div className="px-4 pt-2">
        {/* Imagem */}
        <div 
          onClick={() => setShowFullImage(true)} 
          className="w-full aspect-video bg-center bg-cover rounded-xl shadow-2xl relative overflow-hidden border border-slate-800 cursor-zoom-in group"
          style={{ backgroundImage: `url("${bit.imageUrl}")` }}
        >
          <div className="absolute inset-0 bg-black/10 group-active:bg-black/20 transition-colors"></div>
          <div className="absolute bottom-3 left-3 bg-white px-2 py-0.5 rounded-sm shadow-md">
             <p className="text-primary text-[10px] font-bold uppercase tracking-wider">CNC ROUTER</p>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 mb-4">
          <h1 className="text-white text-3xl font-extrabold tracking-tight leading-tight">{bit.name}</h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">{bit.material}</p>
        </div>

        {/* Badges Féis à Imagem */}
        <div className="flex gap-3 mb-8">
          <div className="flex h-11 items-center gap-2 rounded-lg bg-[#1A232E] border border-slate-800 px-4">
            <span className="material-symbols-outlined text-primary text-[20px] filled">inventory_2</span>
            <p className="text-white text-sm font-bold">Estoque: {bit.stock} un</p>
          </div>
          
          <div className={`flex h-11 items-center gap-2 rounded-lg border px-4 transition-all
            ${colletInfo.isError 
              ? 'bg-red-950/40 border-red-500/30 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
              : 'bg-[#1A232E] border-slate-800 text-white'}`}
          >
            <span className={`material-symbols-outlined text-[20px] ${colletInfo.isError ? '' : 'text-slate-500'}`}>
              {colletInfo.isError ? 'block' : 'settings'}
            </span>
            <p className="text-sm font-bold truncate">
              {colletInfo.isError ? colletInfo.text : `Pinça ${colletInfo.text.replace(/Usar Pinça /i, '').replace(/Pinça /i, '')}`}
            </p>
          </div>
        </div>

        {/* Características Físicas */}
        <div className="mt-4 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-[24px]">straighten</span>
            <h3 className="text-white text-xl font-bold">Características Físicas</h3>
          </div>
          <div className="bg-[#1A232E] p-4 rounded-xl border border-slate-800/50 grid grid-cols-2 gap-y-4 gap-x-6">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">COMPRIMENTO</p>
              <p className="text-white font-semibold">{bit.specs?.totalLength ? `${bit.specs.totalLength} mm` : '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">DUREZA (HRC)</p>
              <p className="text-white font-semibold">{bit.specs?.hardness || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">GEOMETRIA</p>
              <p className="text-white font-semibold">{bit.specs?.geometry || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">MATERIAL DA FRESA</p>
              <p className="text-white font-semibold">{bit.material || '—'}</p>
            </div>
          </div>
        </div>

        {/* Parâmetros */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-[24px]">tune</span>
            <h3 className="text-white text-xl font-bold">Parâmetros Aspire</h3>
          </div>
          
          <div className="bg-[#1A232E] p-5 rounded-xl border border-slate-800/50 flex flex-col gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">MATERIAL ALVO:</label>
              <div className="relative">
                <select 
                  value={selectedMaterial} 
                  onChange={e => setSelectedMaterial(e.target.value)} 
                  className="w-full appearance-none rounded-lg bg-[#101922] border border-slate-800 text-white h-12 px-4 text-sm focus:ring-1 focus:ring-primary/50 outline-none"
                  disabled={aiLoading}
                >
                  <option value="Original">Original (Banco de Dados)</option>
                  {MATERIALS_LIST.map(mat => <option key={mat} value={mat}>{mat}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-3.5 text-slate-500 pointer-events-none">
                  {aiLoading ? 'progress_activity' : 'expand_more'}
                </span>
              </div>
            </div>

            {/* Campo Editável para Material IA */}
            {selectedMaterial === 'Outro material (IA)' && !aiResult && (
              <div className="flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <input 
                  type="text"
                  value={customMaterialInput}
                  onChange={(e) => setCustomMaterialInput(e.target.value)}
                  placeholder="Qual material?"
                  className="flex-1 rounded-lg bg-[#101922] border border-slate-800 text-white h-12 px-4 text-sm focus:ring-1 focus:ring-primary/50 outline-none"
                />
                <button 
                  onClick={handleCallAI}
                  disabled={aiLoading || !customMaterialInput.trim()}
                  className="bg-primary hover:bg-primary/90 text-white px-4 rounded-lg text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
                >
                  {aiLoading ? 'Calculando...' : 'Calcular via IA'}
                </button>
              </div>
            )}

            <div className="flex items-start gap-3 p-3 rounded-lg bg-black/20 border border-slate-800/30">
              <span className="material-symbols-outlined text-slate-500 text-[20px]">info</span>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                {aiLoading ? "IA está calculando os melhores parâmetros..." : currentSpecs?.description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-[#1A232E] p-4 rounded-xl border border-slate-800 flex flex-col justify-between h-24">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-500 text-sm">speed</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">RPM</span>
              </div>
              <p className="text-2xl font-bold text-primary">
                {aiLoading ? "..." : currentSpecs?.rpm && currentSpecs.rpm > 0 ? currentSpecs.rpm.toLocaleString('pt-BR') : '—'}
              </p>
            </div>
            <div className="bg-[#1A232E] p-4 rounded-xl border border-slate-800 flex flex-col justify-between h-24">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-500 text-sm">fast_forward</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AVANÇO</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {aiLoading ? "..." : currentSpecs?.feedRate && currentSpecs.feedRate > 0 ? currentSpecs.feedRate.toLocaleString('pt-BR') : '—'}
              </p>
            </div>
            <div className="bg-[#1A232E] p-4 rounded-xl border border-slate-800 flex flex-col justify-between h-24">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-500 text-sm">south</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">MERGULHO</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {aiLoading ? "..." : currentSpecs?.plungeRate && currentSpecs.plungeRate > 0 ? currentSpecs.plungeRate.toLocaleString('pt-BR') : '—'}
              </p>
            </div>
            <div className="bg-[#1A232E] p-4 rounded-xl border border-slate-800 flex flex-col justify-between h-24">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-500 text-sm">layers</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">PASSO VERTICAL</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {aiLoading ? "..." : currentSpecs?.stepDown && currentSpecs.stepDown > 0 ? currentSpecs.stepDown.toLocaleString('pt-BR') : '—'}
              </p>
            </div>
          </div>

          {/* Botão Ajustar Estoque integrado diretamente abaixo da grade de quadros */}
          {isAdmin && (
            <div className="mt-6 flex justify-center">
              <button 
                onClick={() => navigate(`/edit-stock/${id}`)} 
                className="w-full h-14 rounded-xl bg-primary text-white font-bold flex items-center justify-center gap-2 shadow-[0_8px_30px_rgb(19,127,236,0.3)] active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[24px]">edit_note</span> Ajustar Estoque
              </button>
            </div>
          )}
        </div>
      </div>
      
      {showFullImage && <ImageViewer src={bit.imageUrl} alt={bit.name} onClose={() => setShowFullImage(false)} />}
    </div>
  );
};

export default MillingBitDetails;
