import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { supabase } from '../services/supabaseClient';

const AdminManagement: React.FC = () => {
  const navigate = useNavigate();
  const { adminEmails, addAdmin, removeAdmin, isAdmin } = useData();
  const [newEmail, setNewEmail] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setCurrentUserEmail(data.user.email);
      }
    });
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEmail && newEmail.includes('@')) {
      addAdmin(newEmail);
      setNewEmail('');
    } else {
      alert('Por favor, insira um e-mail válido.');
    }
  };

  const handleRemove = (email: string) => {
    const targetEmail = email.toLowerCase().trim();
    const myEmail = currentUserEmail?.toLowerCase().trim();

    // Check if user is removing themselves
    if (myEmail && targetEmail === myEmail) {
      const confirmSelf = window.confirm(
        'ATENÇÃO: Você está prestes a remover seu próprio acesso de administrador.\n\nVocê perderá acesso a esta tela imediatamente.\n\nDeseja continuar?'
      );
      if (!confirmSelf) return;
    } else {
      const confirmOther = window.confirm(`Tem certeza que deseja remover ${email} dos administradores?`);
      if (!confirmOther) return;
    }
    
    // Proceed with removal
    removeAdmin(email);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark p-6 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">lock</span>
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">Acesso Negado</h2>
        <p className="text-slate-500 mt-2 mb-6">Você não tem permissão para visualizar esta página.</p>
        <button 
           onClick={() => navigate('/')}
           className="px-6 py-2 bg-slate-200 dark:bg-slate-800 rounded-lg font-bold text-slate-700 dark:text-white"
        >
          Voltar ao Início
        </button>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between border-b border-gray-200 dark:border-gray-800">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="material-symbols-outlined text-slate-900 dark:text-white">arrow_back</span>
        </button>
        <h2 className="font-bold text-lg flex-1 text-center pr-10">Gerenciar Admins</h2>
      </div>

      <div className="p-6 flex flex-col gap-8 max-w-lg mx-auto w-full">
        
        {/* Add Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-1">
             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">person_add</span>
             </div>
             <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Adicionar Administrador</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Permite acesso total ao sistema</p>
             </div>
          </div>
          
          <form onSubmit={handleAdd} className="flex gap-2">
            <input 
              type="email" 
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="E-mail do usuário"
              className="flex-1 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 px-4 h-12 outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
            />
            <button 
              type="submit"
              disabled={!newEmail}
              className="bg-primary disabled:opacity-50 text-white font-bold h-12 px-6 rounded-xl hover:bg-blue-600 transition-colors active:scale-95"
            >
              Adicionar
            </button>
          </form>
        </section>

        <div className="h-px bg-slate-200 dark:bg-slate-800 w-full"></div>

        {/* List Section */}
        <section className="flex flex-col gap-4">
           <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
             Administradores Atuais ({adminEmails.length})
           </h3>
           
           <div className="flex flex-col gap-3">
             {adminEmails.map((email, index) => {
               const isMe = currentUserEmail && email.toLowerCase() === currentUserEmail.toLowerCase();
               return (
                 <div key={`${email}-${index}`} className={`flex items-center justify-between p-4 bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in slide-in-from-bottom-2 ${isMe ? 'ring-1 ring-primary/30 bg-primary/5 dark:bg-primary/5' : ''}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isMe ? 'bg-primary/20 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        <span className="material-symbols-outlined text-lg">shield_person</span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{email}</span>
                        {isMe && <span className="text-[10px] text-primary font-bold">Você</span>}
                      </div>
                    </div>
                    
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemove(email);
                      }}
                      className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer relative z-20 shrink-0"
                      title="Remover acesso"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-xl pointer-events-none">delete</span>
                    </button>
                 </div>
               );
             })}
           </div>
        </section>

      </div>
    </div>
  );
};

export default AdminManagement;