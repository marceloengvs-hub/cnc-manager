import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Scanner: React.FC = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(true);

  // Simula o tempo de leitura ou inicialização da câmera
  useEffect(() => {
    const timer = setTimeout(() => {
      // Lógica futura de leitura real
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col items-center justify-between font-display animate-in zoom-in-90 slide-in-from-bottom-10 duration-300 ease-out origin-bottom">
      
      {/* Top Bar Overlay */}
      <div className="w-full p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-10 pt-8">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <span className="material-symbols-outlined text-white">close</span>
        </button>
        <span className="font-bold tracking-wide text-sm opacity-90">Escanear Fresa/Pinça</span>
        <button className="w-10 h-10 rounded-full flex items-center justify-center opacity-0 pointer-events-none">
          <span className="material-symbols-outlined">flash_on</span>
        </button>
      </div>

      {/* Camera Viewport Area */}
      <div className="relative flex-1 w-full flex items-center justify-center">
        {/* Scanner Frame */}
        <div className="relative w-64 h-64 border-2 border-white/30 rounded-3xl overflow-hidden">
          {/* Active Corners */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl"></div>
          
          {/* Scanning Laser Animation */}
          {scanning && (
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent to-primary/40 border-b-2 border-primary animate-[scan_2s_infinite_linear]"></div>
          )}

          {/* Label inside frame */}
          <div className="absolute bottom-4 left-0 w-full text-center">
             <p className="text-xs font-medium text-white/70 bg-black/40 inline-block px-3 py-1 rounded-full backdrop-blur-sm">
                Aponte para o QR Code
             </p>
          </div>
        </div>

        {/* Background Overlay Effect (Simulated Camera Feed) */}
        <div className="absolute inset-0 -z-10 bg-[#1A232E]">
            <div className="w-full h-full opacity-10 flex items-center justify-center">
                 <span className="material-symbols-outlined text-[120px]">qr_code_2</span>
            </div>
            <p className="absolute bottom-1/4 w-full text-center text-white/20 text-sm">Simulação de Câmera</p>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="w-full p-8 pb-12 bg-gradient-to-t from-black/90 to-transparent flex flex-col items-center gap-6">
        <div className="flex items-center gap-8">
            <button className="flex flex-col items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="material-symbols-outlined">image</span>
                </div>
                <span className="text-[10px]">Galeria</span>
            </button>

            {/* Shutter / Scan Button (Expanded visual anchor) */}
            <div className="relative">
                <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping"></div>
                <button 
                    onClick={() => {}} 
                    className="w-20 h-20 rounded-full bg-primary border-4 border-white/20 flex items-center justify-center shadow-[0_0_30px_rgba(19,127,236,0.6)] active:scale-95 transition-transform"
                >
                    <span className="material-symbols-outlined text-4xl">qr_code_scanner</span>
                </button>
            </div>

            <button className="flex flex-col items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="material-symbols-outlined">flash_on</span>
                </div>
                <span className="text-[10px]">Flash</span>
            </button>
        </div>
        <p className="text-white/40 text-xs">Toque no botão para focar</p>
      </div>

      {/* Inline styles for the custom scan animation */}
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(200%); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Scanner;