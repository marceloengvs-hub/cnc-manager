import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchBitById, updateBitStock } from '../services/api';
import { MillingBit } from '../types';
import ImageViewer from '../components/ImageViewer';

const EditStock: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bit, setBit] = useState<MillingBit | null>(null);
  const [stock, setStock] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBitById(id).then(data => {
        if (data) {
          setBit(data);
          setStock(data.stock);
        }
        setLoading(false);
      });
    }
  }, [id]);

  const handleSave = async () => {
    if (id) {
      setSaving(true);
      try {
        await updateBitStock(id, stock);
        navigate(-1);
      } catch (e) {
        console.error("Error saving stock", e);
        alert("Erro ao salvar estoque.");
        setSaving(false);
      }
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Carregando...</div>;
  if (!bit) return <div className="p-10 text-center text-white">Item not found</div>;

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-white">
       {/* Header */}
       <div className="sticky top-0 z-10 flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between border-b border-gray-200 dark:border-gray-800">
         <button 
           onClick={() => navigate(-1)} 
           className="text-slate-500 dark:text-slate-400 text-base font-medium hover:text-primary transition-colors"
         >
           Cancelar
         </button>
         <h2 className="font-bold text-lg">Ajustar Estoque</h2>
         <button 
           className={`text-primary text-base font-bold transition-opacity ${saving ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
           onClick={handleSave}
           disabled={saving}
         >
           {saving ? 'Salvando...' : 'Salvar'}
         </button>
       </div>

       {/* Item Info */}
       <div className="p-6 pt-8 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div 
              onClick={() => setShowFullImage(true)}
              className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 bg-cover bg-center shadow-xl border-2 border-white dark:border-slate-700 cursor-zoom-in active:scale-95 transition-transform" 
              style={{ backgroundImage: `url("${bit.imageUrl}")` }}
            ></div>
          <div className="text-center px-4">
             <h1 className="text-xl font-bold leading-tight">{bit.name}</h1>
             <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{bit.material} • {bit.diameter}</p>
          </div>
       </div>

       {/* Controls */}
       <div className="flex-1 px-6 pt-4 flex flex-col max-w-sm mx-auto w-full">
          <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-8 relative overflow-hidden">
             
             {/* Background Decoration */}
             <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
             
             <div className="text-center">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Quantidade Atual</span>
               <span className="text-[80px] font-bold tracking-tighter leading-none text-slate-900 dark:text-white font-variant-numeric tabular-nums">
                 {stock}
               </span>
             </div>
             
             <div className="flex items-center gap-8 w-full justify-center">
                <button 
                  onClick={() => setStock(s => Math.max(0, s - 1))} 
                  className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-2xl flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-90 transition-all"
                >
                    <span className="material-symbols-outlined">remove</span>
                </button>
                <button 
                  onClick={() => setStock(s => s + 1)} 
                  className="w-20 h-20 rounded-2xl bg-primary text-white text-3xl flex items-center justify-center shadow-lg shadow-primary/30 active:scale-90 transition-all hover:bg-blue-600"
                >
                    <span className="material-symbols-outlined">add</span>
                </button>
             </div>
          </div>
          
           {/* Quick Actions */}
           <div className="grid grid-cols-3 gap-3 mt-6">
              <button 
                onClick={() => setStock(s => s + 5)} 
                className="py-3 px-4 rounded-xl bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 font-bold text-sm text-slate-700 dark:text-slate-300 hover:border-primary/50 hover:text-primary active:scale-95 transition-all shadow-sm"
              >
                +5
              </button>
              <button 
                onClick={() => setStock(s => s + 10)} 
                className="py-3 px-4 rounded-xl bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 font-bold text-sm text-slate-700 dark:text-slate-300 hover:border-primary/50 hover:text-primary active:scale-95 transition-all shadow-sm"
              >
                +10
              </button>
              <button 
                onClick={() => setStock(0)} 
                className="py-3 px-4 rounded-xl bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 font-bold text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-200 active:scale-95 transition-all shadow-sm"
              >
                Zerar
              </button>
           </div>
       </div>

       {/* Lightbox / Zoom Modal */}
       {showFullImage && (
        <ImageViewer 
           src={bit.imageUrl}
           alt={bit.name}
           onClose={() => setShowFullImage(false)}
        />
      )}
    </div>
  )
}

export default EditStock;