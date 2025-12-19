
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchBitById, updateBit } from '../services/api';
import { MillingBit } from '../types';
import { getRequiredColletSize } from '../services/mockData';
import { useData } from '../contexts/DataContext';

const EditMillingBit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshData } = useData();
  
  const [bit, setBit] = useState<MillingBit | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
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

  useEffect(() => {
    if (id) {
        fetchBitById(id).then(data => {
            if (data) {
                setBit(data);
                setName(data.name);
                setImagePreview(data.imageUrl);
                setCuttingDia(data.diameter?.replace(/[^\d.]/g, '') || '');
                
                // Extrai apenas o número da colletSize (que vem da coluna diam_haste)
                let sDia = '';
                if (data.colletSize) {
                    const match = String(data.colletSize).match(/(\d+(\.\d+)?)/);
                    if (match) sDia = match[0];
                }
                setShankDia(sDia);
                
                setTotalLength(data.specs?.totalLength?.toString() || '');
                setHardness(data.specs?.hardness || '');
                setGeometry(data.specs?.geometry || '');
                setMaterial(data.material || 'Metal Duro (Tungstênio)');
                
                if (data.application) {
                    if (data.application.cutType.includes('Reto')) setCutType('Reto');
                    else if (data.application.cutType.includes('Down')) setCutType('Down-cut');
                    else if (data.application.cutType.includes('Compressão')) setCutType('Compressão');
                    else setCutType('Up-cut');
                    
                    setAdvantage(data.application.advantage || '');
                }
                
                setRpm(data.specs?.rpm?.toString() || '');
                setStepDown(data.specs?.stepDown?.toString() || '');
                setFeedRate(data.specs?.feedRate?.toString() || '');
                setPlungeRate(data.specs?.plungeRate?.toString() || '');
            }
            setLoading(false);
        }).catch(() => setLoading(false));
    }
  }, [id]);

  const calculatedColletLabel = useMemo(() => {
    // A lógica de negócio usa shankDia para buscar na coluna diam_haste
    const { label } = getRequiredColletSize(shankDia);
    return label;
  }, [shankDia]);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-background-dark h-screen">
      <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
    </div>
  );
  
  if (!bit) return <div className="p-10 text-center text-white bg-background-dark h-screen font-bold">Fresa não encontrada.</div>;

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
    if (!id) return;
    setSaving(true);
    
    const shankVal = parseFloat(shankDia.replace(',', '.'));
    const colletStorageValue = !isNaN(shankVal) ? shankVal.toString() : shankDia; 
    
    const { targetSize } = getRequiredColletSize(shankVal);
    const isSupported = targetSize !== null;

    const updates: Partial<MillingBit> = {
        name,
        imageUrl: imagePreview || bit.imageUrl,
        diameter: `${cuttingDia}mm`,
        colletSize: colletStorageValue, // Mapeado para diam_haste no API
        // NOTA: 'recommendedCollet' removido para evitar erro de coluna gerada no banco
        hasCollet: isSupported,
        material,
        application: {
            materials: bit.application?.materials || [],
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
        await updateBit(id, updates);
        await refreshData();
        navigate(-1);
    } catch (error: any) {
        console.error("Falha ao atualizar:", error);
        alert(`Erro ao salvar: ${error.message || 'Erro desconhecido'}`);
        setSaving(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#111418] dark:text-white font-display min-h-screen flex flex-col overflow-x-hidden pb-12">
      {/* App Bar Fiel à Imagem */}
      <div className="sticky top-0 z-50 flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between border-b dark:border-white/10 border-black/5 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
        <div className="flex w-20 items-center justify-start">
          <button onClick={() => navigate(-1)} className="text-[#9dabb9] text-base font-normal leading-normal tracking-[0.015em] shrink-0 hover:text-primary transition-colors">Cancelar</button>
        </div>
        <h2 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] text-center flex-1">Editar Fresa</h2>
        <div className="flex w-20 items-center justify-end">
          <button onClick={handleSave} disabled={saving} className={`text-primary text-base font-bold leading-normal tracking-[0.015em] shrink-0 transition-colors ${saving ? 'opacity-50' : 'hover:text-primary/80'}`}>{saving ? '...' : 'Salvar'}</button>
        </div>
      </div>

      <div className="flex flex-col gap-6 px-4 py-6 pb-24 max-w-lg mx-auto w-full">
        {/* Avatar Section */}
        <div className="flex flex-col items-center justify-center">
          <div 
            className="relative group w-32 h-32 rounded-full overflow-hidden bg-surface-light dark:bg-surface-dark border-2 border-dashed border-primary/50 flex items-center justify-center cursor-pointer hover:bg-surface-dark/80 transition-all bg-cover bg-center"
            style={{ backgroundImage: `url("${imagePreview}")` }}
          >
            <input aria-label="Upload photo" className="absolute inset-0 opacity-0 z-10 cursor-pointer" type="file" accept="image/*" onChange={handleImageChange} />
            <div className={`flex flex-col items-center gap-1 bg-black/40 w-full h-full justify-center text-white ${imagePreview ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'} transition-opacity`}>
              <span className="material-symbols-outlined text-3xl font-light">edit</span>
            </div>
          </div>
          <p className="mt-3 text-[#9dabb9] text-sm">Toque para alterar a foto</p>
        </div>

        {/* Inputs Físicos Féis à Imagem */}
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
                onChange={(e) => setName(e.target.value)} 
                className="w-full rounded-xl text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dce0e5] dark:border-[#3b4754] bg-white dark:bg-surface-dark h-14 placeholder:text-[#9dabb9] px-4 text-base font-normal shadow-sm" 
                placeholder="Ex: Topo reto 3mm" 
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
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
                <div className="relative group">
                  <input 
                    type="text" 
                    inputMode="decimal"
                    value={shankDia} 
                    onChange={(e) => setShankDia(e.target.value.replace(',', '.'))} 
                    className="w-full rounded-xl text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dce0e5] dark:border-[#3b4754] bg-white dark:bg-surface-dark h-14 placeholder:text-[#9dabb9] px-4 text-base font-normal shadow-sm ring-1 ring-primary/30" 
                    placeholder="3" 
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9dabb9] text-sm font-medium pointer-events-none">mm</span>
                </div>
              </label>
            </div>

             <label className="flex flex-col flex-1">
              <p className="text-[#111418] dark:text-white text-sm font-bold leading-normal pb-2">Pinça recomendada (calculada)</p>
              <div className={`w-full rounded-xl flex items-center px-4 h-14 text-base font-bold shadow-inner transition-colors
                  ${calculatedColletLabel.toLowerCase().includes('indisponível') 
                    ? 'bg-red-950/20 border border-red-500/30 text-red-500' 
                    : 'bg-[#1A232E] border border-slate-800 text-white/90'}
                `}>
                {calculatedColletLabel}
              </div>
            </label>

            {/* Novos campos adicionados conforme solicitação */}
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col flex-1 min-w-0">
                <p className="text-[#111418] dark:text-white text-sm font-bold leading-normal pb-2 truncate">Comprimento total</p>
                <div className="relative">
                  <input 
                    type="text" 
                    inputMode="decimal"
                    value={totalLength} 
                    onChange={(e) => setTotalLength(e.target.value.replace(',', '.'))} 
                    className="w-full rounded-xl text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dce0e5] dark:border-[#3b4754] bg-white dark:bg-surface-dark h-14 placeholder:text-[#9dabb9] px-4 text-base font-normal shadow-sm" 
                    placeholder="Ex: 50" 
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9dabb9] text-sm font-medium pointer-events-none">mm</span>
                </div>
              </label>
              
              <label className="flex flex-col flex-1 min-w-0">
                <p className="text-[#111418] dark:text-white text-sm font-bold leading-normal pb-2 truncate">Dureza (HRC)</p>
                <input 
                  type="text" 
                  value={hardness} 
                  onChange={(e) => setHardness(e.target.value)} 
                  className="w-full rounded-xl text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dce0e5] dark:border-[#3b4754] bg-white dark:bg-surface-dark h-14 placeholder:text-[#9dabb9] px-4 text-base font-normal shadow-sm" 
                  placeholder="Ex: 55" 
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col flex-1 min-w-0">
                <p className="text-[#111418] dark:text-white text-sm font-bold leading-normal pb-2 truncate">Geometria</p>
                <input 
                  type="text" 
                  value={geometry} 
                  onChange={(e) => setGeometry(e.target.value)} 
                  className="w-full rounded-xl text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dce0e5] dark:border-[#3b4754] bg-white dark:bg-surface-dark h-14 placeholder:text-[#9dabb9] px-4 text-base font-normal shadow-sm" 
                  placeholder="Ex: 2 Cortes" 
                />
              </label>
              
              <label className="flex flex-col flex-1 min-w-0">
                <p className="text-[#111418] dark:text-white text-sm font-bold leading-normal pb-2 truncate">Material da fresa</p>
                <input 
                  type="text" 
                  value={material} 
                  onChange={(e) => setMaterial(e.target.value)} 
                  className="w-full rounded-xl text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dce0e5] dark:border-[#3b4754] bg-white dark:bg-surface-dark h-14 placeholder:text-[#9dabb9] px-4 text-base font-normal shadow-sm" 
                  placeholder="Ex: Metal Duro" 
                />
              </label>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default EditMillingBit;
