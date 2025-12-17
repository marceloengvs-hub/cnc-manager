import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente baseadas no modo (development/production)
  // Casting process to any to avoid TS errors in some environments
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Injeta a API Key se disponível no ambiente de build (Vercel)
      // Usa uma string vazia como fallback se a chave não existir
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      // Polyfill seguro para process.env para evitar crash de bibliotecas que o acessam
      'process.env': {}
    }
  };
});