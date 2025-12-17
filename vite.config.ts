import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega variáveis do .env local ou do ambiente de CI/CD (Vercel)
  // Using '.' instead of process.cwd() to bypass the TypeScript error: "Property 'cwd' does not exist on type 'Process'"
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      // Garante que a chave esteja disponível globalmente no código do cliente
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      // Evita erros de referência ao process.env em bibliotecas externas
      'process.env': {}
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});