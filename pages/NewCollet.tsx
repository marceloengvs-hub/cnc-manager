import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCollet } from '../services/api';

const NewCollet: React.FC = () => {
  const navigate = useNavigate();
  
  // Form State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [standard, setStandard] = useState('');
  const [boreSize, setBoreSize] = useState('');
  const [totalLength, setTotalLength] = useState('');
  const [outerDiameter, setOuterDiameter] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [saving, setSaving] = useState(false);

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
    if (!standard || !boreSize) {
      alert("Por favor, preencha o padrão (Ex: ER20) e o tamanho do furo.");
      return;
    }
    setSaving(true);

    const newItem = {
      name: `Pinça ${standard}`,
      size: boreSize.includes('mm') || boreSize.includes('"') ? boreSize : `${boreSize}mm`,
      type: standard,
      description: `L:${totalLength || '?'}mm • D:${outerDiameter || '?'}mm`,
      stock: quantity,
      minStock: 2, // Default
      isImperial: boreSize.includes('"'),
      imageUrl: imagePreview || undefined
    };

    try {
        await createCollet(newItem);
        navigate(-1);
    } catch (error) {
        console.error("Failed to create collet", error);
        alert("Falha ao criar pinça.");
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
        <h2 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] text-center flex-1">Nova Pinça</h2>
        <div className="flex w-20 items-center justify-end">
          <button 
            onClick={handleSave}
            disabled={saving}
            className={`text-primary text-base font-bold leading-normal tracking-[0.015em] shrink-0 transition-colors ${saving ? 'opacity-50' : 'hover:text-primary/80'}`}
          >
            {saving ? '...' : 'Salvar'}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6 px-4 py-6 pb-24 max-w-lg mx-auto w-full">
        {/* Photo Section */}
        <div className="flex flex-col items-center justify-center">
          <div 
            className={`relative group w-32 h-32 rounded-full overflow-hidden bg-surface-light dark:bg-surface-dark border-2 border-dashed flex items-center justify-center cursor-pointer transition-all bg-cover bg-center
              ${imagePreview ? 'border-primary border-solid' : 'border-primary/50 hover:bg-surface-dark/80'}
            `}
            style={{ backgroundImage: imagePreview ? `url("${imagePreview}")` : 'none' }}
          >
            <input 
              aria-label="Upload photo" 
              className="absolute inset-0 opacity-0 z-10 cursor-pointer" 
              type="file" 
              accept="image/*"
              onChange={handleImageChange}
            />
            {!imagePreview && (
              <div className="flex flex-col items-center gap-1 pointer-events-none">
                <span className="material-symbols-outlined text-primary text-3xl">add_a_photo</span>
                <span className="text-xs text-[#9dabb9] font-medium">Adicionar</span>
              </div>
            )}
            {imagePreview && (
               <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                 <span className="material-symbols-outlined text-white text-3xl">edit</span>
               </div>
            )}
          </div>
          <p className="mt-3 text-[#9dabb9] text-sm">Toque para {imagePreview ? 'alterar' : 'adicionar'} uma foto</p>
        </div>

        {/* Section 1: Especificações */}
        <div className="flex flex-col gap-4">
          <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] border-l-4 border-primary pl-3">Especificações</h3>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col flex-1">
                  <p className="text-[#111418] dark:text-white text-sm font-medium leading-normal pb-2">Padrão</p>
                  <input 
                    value={standard}
                    onChange={(e) => setStandard(e.target.value)}
                    className="w-full rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dce0e5] dark:border-[#3b4754] bg-white dark:bg-surface-dark h-12 placeholder:text-[#9dabb9] px-4 text-base font-normal" 
                    placeholder="Ex: ER20" 
                  />
                </label>
                <label className="flex flex-col flex-1">
                  <p className="text-[#111418] dark:text-white text-sm font-medium leading-normal pb-2">Furo (mm)</p>
                  <input 
                    value={boreSize}
                    onChange={(e) => setBoreSize(e.target.value)}
                    className="w-full rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dce0e5] dark:border-[#3b4754] bg-white dark:bg-surface-dark h-12 placeholder:text-[#9dabb9] px-4 text-base font-normal" 
                    placeholder="Ex: 6" 
                  />
                </label>
            </div>
            
            <div className="flex gap-4">
              <label className="flex flex-col flex-1 min-w-0">
                <p className="text-[#111418] dark:text-white text-sm font-medium leading-normal pb-2 truncate">Comprimento Total</p>
                <div className="relative">
                    <input 
                      value={totalLength}
                      onChange={(e) => setTotalLength(e.target.value)}
                      className="w-full rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dce0e5] dark:border-[#3b4754] bg-white dark:bg-surface-dark h-12 placeholder:text-[#9dabb9] px-4 text-base font-normal" 
                      placeholder="0" 
                      type="number" 
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9dabb9] text-sm pointer-events-none">mm</span>
                </div>
              </label>
              <label className="flex flex-col flex-1 min-w-0">
                <p className="text-[#111418] dark:text-white text-sm font-medium leading-normal pb-2 truncate">Diâmetro Externo</p>
                <div className="relative">
                    <input 
                      value={outerDiameter}
                      onChange={(e) => setOuterDiameter(e.target.value)}
                      className="w-full rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dce0e5] dark:border-[#3b4754] bg-white dark:bg-surface-dark h-12 placeholder:text-[#9dabb9] px-4 text-base font-normal" 
                      placeholder="0" 
                      type="number" 
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9dabb9] text-sm pointer-events-none">mm</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="h-px bg-[#dce0e5] dark:bg-white/10 w-full my-2"></div>

        {/* Section 2: Estoque Inicial */}
        <div className="flex flex-col gap-6">
          <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] border-l-4 border-green-500 pl-3">Estoque Inicial</h3>
          
          {/* Quantity Stepper */}
          <div className="flex items-center justify-between bg-[#dce0e5]/20 dark:bg-surface-dark p-4 rounded-xl border border-[#dce0e5] dark:border-[#3b4754]">
            <div className="flex flex-col">
              <p className="text-[#111418] dark:text-white text-base font-bold">Quantidade</p>
              <p className="text-[#9dabb9] text-xs">Unidades disponíveis</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setQuantity(q => Math.max(0, q - 1))}
                className="w-10 h-10 rounded-full bg-[#dce0e5] dark:bg-[#2d3748] text-[#111418] dark:text-white flex items-center justify-center hover:bg-opacity-80 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined">remove</span>
              </button>
              <span className="text-xl font-bold text-[#111418] dark:text-white w-6 text-center">{quantity}</span>
              <button 
                onClick={() => setQuantity(q => q + 1)}
                className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewCollet;