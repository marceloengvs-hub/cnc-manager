
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBit } from '../services/api';
import { getRequiredColletSize } from '../services/mockData';

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

  // Calcula a string de recomendação baseada no diâmetro da haste (diam_haste)
  const calculatedColletLabel = useMemo(() => {
    const { label } = getRequiredColletSize(shankDia);
    return label;
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
    
    const shankVal = parseFloat(shankDia.replace(',', '.'));
    const colletStorageValue = !isNaN(shankVal) ? shankVal.toString() : shankDia; 
    
    const { targetSize } = getRequiredColletSize(shankVal);
    const isSupported = targetSize !== null;

    const newBit = {
        name: name || 'Nova Fresa',
        type: geometry || 'Standard',
        imageUrl: imagePreview || 'https://ui-avatars.com/api/?name=Nova+Fresa&background=random',
        diameter: `${cuttingDia}mm`,
        colletSize: colletStorageValue, // Mapeado para diam_haste
        // NOTA: 'recommendedCollet' removido para permitir geração automática no DB
        hasCollet: isSupported,
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
    } catch (error: any) {
        console.error("Failed to create", error);
        alert(`Erro ao salvar: ${error.message || 'Erro desconhecido'}`);
        setSaving(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#111418] dark:text-white font-display min-h-screen flex flex-col overflow-x-hidden pb-12">
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
        <div className="flex flex-col items-center justify-center">
          <div 
             className="relative group w-32 h-32 rounded-full overflow-hidden bg-surface-light dark:bg-surface-dark border-2 border-dashed border-primary/50 flex items-center justify-center cursor-pointer hover:bg-surface-dark/80 transition-all bg-cover bg-center shadow-lg"
             style={{ backgroundImage: imagePreview ? `url("${imagePreview}")` : undefined }}
          >
            <input aria-label="Upload photo" className="absolute inset-0 opacity-0 z-10 cursor-pointer" type="file" accept="image/*" onChange={handleImageChange} />
            <div className={`flex flex-col items-center gap-1 ${imagePreview ? 'opacity-0 group-hover:opacity-100 bg-black/40 w-full h-full justify-center text-white' : ''} transition-opacity`}>
              <span className="material-symbols-outlined text-primary text-3xl">add_a_photo</span>
              <span className="text-xs text-[#9dabb9] font-medium">Adicionar</span>
            </div>
          </div>
          <p className="mt-3 text-[#9dabb9] text-sm">Toque para adicionar uma foto</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-5 bg-primary rounded-full"></div>
            <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Características Físicas</h3>
          </div>
          
          <div className="flex flex-col gap-5">
            <label className="flex flex-col flex-1">
              <p className="text-[#111418] dark:text-white text-sm font-bold leading-normal pb-2">Especificação (nome/código)</p>
              <input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full rounded-xl text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dce0e5] dark:border-[#3b4754] bg-white dark:bg-surface-dark h-14 placeholder:text-[#9dabb9] px-4 text-base font-normal shadow-sm" 
                placeholder="Ex: Topo reto 3mm" 
              />
            </label>

            <div className="flex gap-4">
              <label className="flex flex-col flex-1 min-w-0">
                <p className="text-[#111418] dark:text-white text-sm font-bold leading-normal pb-2 truncate">Diâmetro de corte</p>
                <div className="relative">
                  <input 
                    type="text" 
                    inputMode="decimal"
                    value={cuttingDia} 
                    onChange={(e) => setCuttingDia(e.target.value.replace(',', '.'))} 
                    className="w-full rounded-xl text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dce0e5] dark:border-[#3b4754] bg-white dark:bg-surface-dark h-14 placeholder:text-[#9dabb9] px-4 text-base font-normal shadow-sm" 
                    placeholder="3" 
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9dabb9] text-sm font-medium pointer-events-none">mm</span>
                </div>
              </label>
              
              <label className="flex flex-col flex-1 min-w-0">
                <p className="text-[#111418] dark:text-white text-sm font-bold leading-normal pb-2 truncate">Diâmetro da haste</p>
                <div className="relative">
                  <input 
                    type="text" 
                    inputMode="decimal"
                    value={shankDia} 
                    onChange={(e) => setShankDia(e.target.value.replace(',', '.'))} 
                    className="w-full rounded-xl text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dce0e5] dark:border-[#3b4754] bg-white dark:bg-surface-dark h-14 placeholder:text-[#9dabb9] px-4 text-base font-normal shadow-sm" 
                    placeholder="3" 
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9dabb9] text-sm font-medium pointer-events-none">mm</span>
                </div>
              </label>
            </div>

             <label className="flex flex-col flex-1">
              <p className="text-[#111418] dark:text-white text-sm font-bold leading-normal pb-2">Pinça recomendada (calculada)</p>
              <div className={`w-full rounded-xl flex items-center px-4 h-14 text-base font-bold shadow-inner
                  ${calculatedColletLabel.toLowerCase().includes('indisponível') 
                    ? 'bg-red-950/20 border border-red-500/30 text-red-500' 
                    : 'bg-[#1A232E] border border-slate-800 text-white/90'}
                `}>
                {calculatedColletLabel}
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewMillingBit;
