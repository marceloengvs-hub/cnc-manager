import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useData();
  const [userEmail, setUserEmail] = useState<string | undefined>('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/'); // App.tsx will catch the auth state change
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display">
      <div className="p-6 pt-12 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-surface-dark flex items-center justify-center mb-4 border-4 border-white dark:border-slate-700 shadow-xl relative">
          <span className="material-symbols-outlined text-4xl text-slate-400">person</span>
          <div className={`absolute bottom-0 right-0 rounded-full p-1.5 border-2 border-white dark:border-slate-700 ${isAdmin ? 'bg-primary' : 'bg-slate-500'}`}>
             <span className="material-symbols-outlined text-white text-xs block">{isAdmin ? 'shield_person' : 'visibility'}</span>
          </div>
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Perfil</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{userEmail || 'Usuário'}</p>
        <span className={`mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isAdmin ? 'bg-primary/10 text-primary' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
          {isAdmin ? 'Administrador' : 'Leitor'}
        </span>
      </div>

      <div className="px-4 mt-6">
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
          
          {isAdmin && (
            <button 
              onClick={() => navigate('/admin-management')}
              className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left"
            >
              <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Gerenciar Administradores</p>
                <p className="text-xs text-slate-500">Adicionar ou remover acesso</p>
              </div>
              <span className="material-symbols-outlined text-slate-400">chevron_right</span>
            </button>
          )}

          <button className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left">
            <span className="material-symbols-outlined text-slate-500">help</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white">Ajuda</p>
              <p className="text-xs text-slate-500">Suporte e documentação</p>
            </div>
            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
          </button>
        </div>

        <button 
          onClick={handleLogout}
          className="mt-8 w-full p-4 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined">logout</span>
          Sair da Conta
        </button>
      </div>
      
      <div className="mt-auto pb-24 text-center">
        <p className="text-xs text-slate-400">CNC Manager v1.0.3</p>
      </div>
    </div>
  );
};

export default Profile;