import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBit } from '../services/api';

const NewMillingBit: React.FC = () => {
  const navigate = useNavigate();

  // State for logic
  const [name, setName] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [cuttingDia, setCuttingDia] = useState('');
  const [shankDia, setShankDia] = useState('');
  const [totalLength, setTotalLength] = useState('');
  const [hardness, setHardness] = useState('');
  const [geometry, setGeometry] = useState('');
  const [material, setMaterial] = useState('Metal Duro (Tungstênio)');
  const [cutType, setCutType] = useState('Up-cut');
  const [advantage, setAdvantage] = useState('');
  const [rpm, setRpm] = useState('');
  const [stepDown, setStepDown] = useState('');
  const [feedRate, setFeedRate] = useState('');
  const [plungeRate, setPlungeRate] = useState('');
  const [stock, setStock] = useState(1);
  const [saving, setSaving] = useState(false);

  const calculatedCollet = useMemo(() => {
    const val = parseFloat(shankDia);
    if (isNaN(val)) return '---';
    
    if (val <= 3.175) return '3.175mm';
    if (val === 6) return '6mm';
    return 'Sem pinça';
  }, [shankDia]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Determine collet info
    let colletSize = 'Sem pinça';
    let hasCollet = false;
    const shankVal = parseFloat(shankDia);
    if (!isNaN(shankVal)) {
        if (shankVal <= 3.175) {
            colletSize = 'ER20 3.175mm';
            hasCollet = true; 
        } else if (shankVal === 6) {
            colletSize = 'ER20 6mm';
            hasCollet = true;
        }
    }

    const newBit = {
        name: name || 'Nova Fresa',
        type: geometry || 'Standard',
        imageUrl: imagePreview || 'https://ui-avatars.com/api/?name=Nova+Fresa&background=random',
        diameter: `${cuttingDia}mm`,
        colletSize,
        hasCollet,
        material,
        stock,
        minStock: 2,
        application: {
            materials: [],
            cutType,
            advantage
        },
        specs: {
            rpm: parseInt(rpm) || 0,
            feedRate: parseInt(feedRate) || 0,
            plungeRate: parseInt(plungeRate) || 0,
            stepDown: parseFloat(stepDown) || 0,
            totalLength: parseFloat(totalLength) || 0,
            hardness,
            geometry
        }
    };

    try {
        await createBit(newBit);
        navigate(-1);
    } catch (error) {
        console.error("Failed to create", error);
        alert("Falha ao criar fresa.");
        setSaving(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#111418] dark:text-white font-display min-h-screen flex flex-col overflow-x-hidden pb-12">
      {/* Top App Bar */}
      <div className="sticky top-0 z-50 flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between border-b dark:border-white/10 border-black/5 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
        <div className="flex w-20 items-center justify-start">
          <button onClick={() => navigate(-1)} className="text-[#9dabb9] text-base font-normal leading-normal tracking-[0.015em] shrink-0 hover:text-primary transition-colors">Cancelar</button>
        </div>
        <h2 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] text-center flex-1">Nova Fresa</h2>
        <div className="flex w-20 items-center justify-end">
          <button onClick={handleSave} disabled={saving} className={`text-primary text-base font-bold leading-normal tracking-[0.015em] shrink-0 transition-colors ${saving ? 'opacity-50' : 'hover:text-primary/80'}`}>{saving ? '...' : 'Salvar'}</button>
        </div>
      </div>

      <div className="flex flex-col gap-6 px-4 py-6 pb-24 max-w-lg mx-auto w-full">
        {/* Photo Section */}
        <div className="flex flex-col items-center justify-center">
          <div 
             className="relative group w-32 h-32 rounded-full overflow-hidden bg-surface-light dark:bg-surface-dark border-2 border-dashed border-primary/50 flex items-center justify-center cursor-pointer hover:bg-surface-dark/80 transition-all bg-cover bg-center"
             style={{ backgroundImage: imagePreview ? `url("${imagePreview}")` : undefined }}
          >
            <input aria-label="Upload photo" className="absolute inset-0 opacity-0 z-10 cursor-pointer" type="file" accept="image/*" onChange={handleImageChange} />
            <div className={`flex flex-col items-center gap-1 ${imagePreview ? 'opacity-0 group-hover:opacity-100 bg-black/40 w-full h-full justify-center text-white' : ''}`}>
              <span className="material-symbols-outlined text-primary text-3xl">add_a_photo</span>
              <span className="text-xs text-[#9dabb9] font-medium">Adicionar</span>
            </div>
          </div>
          <p className="mt-3 text-[#9dabb9] text-sm">Toque para adicionar uma foto</p>
        </div>

        {/* Section 1: Características Físicas */}
        <div className="flex flex-col gap-4">
          <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] border-l-4 border-primary pl-3">Características Físicas</h3>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col flex-1">
              <p className="text-[#111418] dark:text-white text-sm font-medium leading-normal pb-2">Especificação (Nome/Código)</p>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dce0e5] dark:border-[#3b4754] bg-white dark:bg-surface-dark h-12 placeholder:text-[#9dabb9] px-4 text-base font-normal" placeholder="Ex: 6mm 2 Cortes Helicoidal" />
            </label>

            {/* NEW FIELDS: Cutting Diameter & Shank Diameter */}
            <div className="flex gap-4">
              <label className="flex flex-col flex-1 min-w-0">
                <p className="text-[#111418] dark:text-white text-sm font-medium leading-normal pb-2 truncate">Diâmetro de Corte</p>
                <div className="relative">
                  <input 
                    type="number"
                    value={cuttingDia}
                    onChange={(e) => setCuttingDia(e.target.value)}
                    className="w-full rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dce0e5] dark:border-[#3b4754] bg-white dark:bg-surface-dark h-12 placeholder:text-[#9dabb9] px-4 text-base font-normal" 
                    placeholder="Ex: 6" 
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9dabb9] text-sm pointer-events-none">mm</span>
                </div>
              </label>
              <label className="flex flex-col flex-1 min-w-0">
                <p className="text-[#111418] dark:text-white text-sm font-medium leading-normal pb-2 truncate">Diâmetro da Haste</p>
                <div className="relative">
                  <input 
                    type="number"
                    value={shankDia}
                    onChange={(e) => setShankDia(e.target.value)}
                    className="w-full rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dce0e5] dark:border-[#3b4754] bg-white dark:bg-surface-dark h-12 placeholder:text-[#9dabb9] px-4 text-base font-normal" 
                    placeholder="Ex: 6" 
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9dabb9] text-sm pointer-events-none">mm</span>
                </div>
              </label>
            </div>

            {/* Calculated Collet Field */}
             <label className="flex flex-col flex-1">
              <p className="text-[#111418] dark:text-white text-sm font-medium leading-normal pb-2">Pinça (Calculada)</p>
              <div className={`w-full rounded-lg border flex items-center px-4 h-12 text-base font-bold
                  ${calculatedCollet === 'Sem pinça' 
                    ? 'bg-red-50 dark:bg-red-900/10 border-red-200 text-red-600 dark:text-red-400' 
                    : 'bg-slate-100 dark:bg-slate-800 border-transparent text-[#111418] dark:text-white'}
                `}>
                {calculatedCollet}
              </div>
            </label>

            <div className="flex gap-4">
              <label className="flex flex-col flex-1 min-w-0">
                <p className="text-[#111418] dark:text-white text-sm font-medium leading-normal pb-2 truncate">Comp. Total (mm)</p>
                <input value={totalLength} onChange={e => setTotalLength(e.target.value)} className="w-full rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dce0e5] dark:border-[#3b4754] bg-white dark:bg-surface-dark h-12 placeholder:text-[#9dabb9] px-4 text-base font-normal" placeholder="50" type="number" />
              </label>
              <label className="flex flex-col flex-1 min-w-0">
                <p className="text-[#111418] dark:text-white text-sm font-medium leading-normal pb-2 truncate">Dureza (HRC)</p>
                <input value={hardness} onChange={e => setHardness(e.target.value)} className="w-full rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dce0e5] dark:border-[#3b4754] bg-white dark:bg-surface-dark h-12 placeholder:text-[#9dabb9] px-4 text-base font-normal" placeholder="55" type="text" />
              </label>
            </div>
            <label className="flex flex-col flex-1">
              <p className="text-[#111418] dark:text-white text-sm font-medium leading-normal pb-2">Geometria de Corte</p>
              <input value={geometry} onChange={e => setGeometry(e.target.value)} className="w-full rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dce0e5] dark:border-[#3b4754] bg-white dark:bg-surface-dark h-12 placeholder:text-[#9dabb9] px-4 text-base font-normal" placeholder="Ex: Topo Reto, Esférica..." />
            </label>
          </div>
        </div>

        <div className="h-px bg-[#dce0e5] dark:bg-white/10 w-full my-2"></div>

        {/* Section 2: Aplicação */}
        <div className="flex flex-col gap-4">
          <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] border-l-4 border-primary pl-3">Aplicação</h3>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col flex-1">
              <p className="text-[#111418] dark:text-white text-sm font-medium leading-normal pb-2">Material</p>
              <div className="relative">
                <select value={material} onChange={e => setMaterial(e.target.value)} className="w-full appearance-none rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dce0e5] dark:border-[#3b4754] bg-white dark:bg-surface-dark h-12 px-4 pr-10 text-base font-normal">
                  <option disabled>Selecionar</option>
                  <option>Metal Duro (Tungstênio)</option>
                  <option>MDF / Madeira</option>
                  <option>Acrílico</option>
                  <option>Alumínio</option>
                  <option>ACM</option>
                  <option>PVC Expandido</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#9dabb9] pointer-events-none">expand_more</span>
              </div>
            </label>
            <label className="flex flex-col flex-1">
              <p className="text-[#111418] dark:text-white text-sm font-medium leading-normal pb-2">Tipo de Corte</p>
              <div className="relative">
                <select value={cutType} onChange={e => setCutType(e.target.value)} className="w-full appearance-none rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dce0e5] dark:border-[#3b4754] bg-white dark:bg-surface-dark h-12 px-4 pr-10 text-base font-normal">
                  <option disabled>Selecionar</option>
                  <option>Up-cut</option>
                  <option>Down-cut</option>
                  <option>Compressão</option>
                  <option>Reto</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#9dabb9] pointer-events-none">expand_more</span>
              </div>
            </label>
          </div>
          <label className="flex flex-col flex-1">
            <p className="text-[#111418] dark:text-white text-sm font-medium leading-normal pb-2">Vantagem / Notas</p>
            <textarea value={advantage} onChange={e => setAdvantage(e.target.value)} className="w-full rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dce0e5] dark:border-[#3b4754] bg-white dark:bg-surface-dark min-h-[80px] placeholder:text-[#9dabb9] p-4 text-base font-normal resize-none" placeholder="Ex: Bom acabamento em MDF laminado"></textarea>
          </label>
        </div>

        <div className="h-px bg-[#dce0e5] dark:bg-white/10 w-full my-2"></div>

        {/* Section 3: Configuração Aspire */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] border-l-4 border-purple-500 pl-3">Configuração Aspire</h3>
            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">Preset</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* RPM */}
            <label className="flex flex-col flex-1 bg-[#dce0e5]/30 dark:bg-white/5 p-3 rounded-lg border border-transparent focus-within:border-purple-500/50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-purple-400 text-lg">cyclone</span>
                <p className="text-[#111418] dark:text-white text-xs font-bold uppercase tracking-wider">RPM</p>
              </div>
              <input value={rpm} onChange={e => setRpm(e.target.value)} className="w-full bg-transparent text-[#111418] dark:text-white text-xl font-bold focus:outline-none placeholder:text-gray-500" placeholder="18000" type="number" />
              <span className="text-xs text-[#9dabb9]">rot/min</span>
            </label>
            {/* Passo Vertical */}
            <label className="flex flex-col flex-1 bg-[#dce0e5]/30 dark:bg-white/5 p-3 rounded-lg border border-transparent focus-within:border-purple-500/50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-purple-400 text-lg">layers</span>
                <p className="text-[#111418] dark:text-white text-xs font-bold uppercase tracking-wider">Passo Vert.</p>
              </div>
              <input value={stepDown} onChange={e => setStepDown(e.target.value)} className="w-full bg-transparent text-[#111418] dark:text-white text-xl font-bold focus:outline-none placeholder:text-gray-500" placeholder="3.0" type="number" />
              <span className="text-xs text-[#9dabb9]">mm</span>
            </label>
            {/* Avanço */}
            <label className="flex flex-col flex-1 bg-[#dce0e5]/30 dark:bg-white/5 p-3 rounded-lg border border-transparent focus-within:border-purple-500/50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-purple-400 text-lg">fast_forward</span>
                <p className="text-[#111418] dark:text-white text-xs font-bold uppercase tracking-wider">Avanço</p>
              </div>
              <input value={feedRate} onChange={e => setFeedRate(e.target.value)} className="w-full bg-transparent text-[#111418] dark:text-white text-xl font-bold focus:outline-none placeholder:text-gray-500" placeholder="2500" type="number" />
              <span className="text-xs text-[#9dabb9]">mm/min</span>
            </label>
            {/* Mergulho */}
            <label className="flex flex-col flex-1 bg-[#dce0e5]/30 dark:bg-white/5 p-3 rounded-lg border border-transparent focus-within:border-purple-500/50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-purple-400 text-lg">download</span>
                <p className="text-[#111418] dark:text-white text-xs font-bold uppercase tracking-wider">Mergulho</p>
              </div>
              <input value={plungeRate} onChange={e => setPlungeRate(e.target.value)} className="w-full bg-transparent text-[#111418] dark:text-white text-xl font-bold focus:outline-none placeholder:text-gray-500" placeholder="800" type="number" />
              <span className="text-xs text-[#9dabb9]">mm/min</span>
            </label>
          </div>
        </div>

        <div className="h-px bg-[#dce0e5] dark:bg-white/10 w-full my-2"></div>

        {/* Section 4: Estoque e Ferramenta */}
        <div className="flex flex-col gap-6">
          <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] border-l-4 border-green-500 pl-3">Estoque Inicial</h3>
          
          {/* Quantity Stepper */}
          <div className="flex items-center justify-between bg-[#dce0e5]/20 dark:bg-surface-dark p-4 rounded-xl border border-[#dce0e5] dark:border-[#3b4754]">
            <div className="flex flex-col">
              <p className="text-[#111418] dark:text-white text-base font-bold">Quantidade</p>
              <p className="text-[#9dabb9] text-xs">Itens em estoque</p>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setStock(s => Math.max(0, s - 1))} className="w-10 h-10 rounded-full bg-[#dce0e5] dark:bg-[#2d3748] text-[#111418] dark:text-white flex items-center justify-center hover:bg-opacity-80 active:scale-95 transition-all">
                <span className="material-symbols-outlined">remove</span>
              </button>
              <span className="text-xl font-bold text-[#111418] dark:text-white w-6 text-center">{stock}</span>
              <button onClick={() => setStock(s => s + 1)} className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all">
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewMillingBit;