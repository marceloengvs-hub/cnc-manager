import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MillingBit } from '../types';

export interface AiPresetResponse {
  rpm: number;
  feedRate: number;
  plungeRate: number;
  stepDown: number;
  explanation: string;
  warning?: string;
}

// Helper para dados simulados em caso de falha ou falta de chave
const getMockData = (reason: string): AiPresetResponse => ({
  rpm: 18000,
  feedRate: 2500,
  plungeRate: 800,
  stepDown: 1.5,
  explanation: `Modo Demo: ${reason}`,
  warning: "Configure a API_KEY no Vercel para usar IA real."
});

export const generateParametersWithAI = async (
  bit: MillingBit, 
  material: string
): Promise<AiPresetResponse> => {
  // A chave deve vir obrigatoriamente do environment configurado no build/Vercel
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    console.error("ERRO: API_KEY não encontrada nas variáveis de ambiente do Vercel.");
    return getMockData("Chave de API não configurada no servidor");
  }
  
  try {
    // Inicialização seguindo as diretrizes Senior: nomeado, nova instância por chamada
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Usando Gemini 3 Pro para tarefas complexas de lógica e STEM (parâmetros de usinagem)
    // NOTA: O modelo 'gemini-3-pro-preview' requer obrigatoriamente um thinkingBudget > 0.
    const modelId = 'gemini-3-pro-preview';

    const prompt = `
      Atue como um especialista sênior em usinagem CNC.
      Calcule parâmetros de corte precisos e seguros para a seguinte ferramenta:

      ESPECIFICAÇÕES DA FRESA:
      - Nome: ${bit.name}
      - Diâmetro: ${bit.diameter}
      - Material: ${bit.material}
      - Geometria: ${bit.specs?.geometry || '2 cortes'}
      
      MATERIAL ALVO:
      - ${material}

      Considere uma CNC Router de precisão média. Forneça RPM, Avanço (mm/min), Mergulho (mm/min) e Passo Vertical (mm).
    `;

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        rpm: { type: Type.INTEGER, description: "Rotação ideal" },
        feedRate: { type: Type.INTEGER, description: "Velocidade de avanço lateral em mm/min" },
        plungeRate: { type: Type.INTEGER, description: "Velocidade de mergulho vertical em mm/min" },
        stepDown: { type: Type.NUMBER, description: "Profundidade máxima por passe em mm" },
        explanation: { type: Type.STRING, description: "Breve justificativa técnica" },
        warning: { type: Type.STRING, description: "Aviso de segurança importante", nullable: true }
      },
      required: ["rpm", "feedRate", "plungeRate", "stepDown", "explanation"]
    };

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 1, // Geralmente utiliza-se temperature 1 com modelos de 'thinking' para melhor exploração de caminhos lógicos
        thinkingConfig: { thinkingBudget: 4096 } // Definindo um orçamento positivo para evitar erro INVALID_ARGUMENT
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim()) as AiPresetResponse;
    }
    
    throw new Error("Resposta da IA retornou sem conteúdo de texto.");

  } catch (error: any) {
    console.error("Falha na chamada da API Gemini:", error);
    
    // Tratamento específico para erro de entidade não encontrada (comum em chaves novas ou projetos mal vinculados)
    if (error?.message?.includes("Requested entity was not found")) {
        return getMockData("Erro de permissão na API (Verifique o projeto no Google Cloud)");
    }

    // Retorna mensagem de erro detalhada para facilitar o debug pelo usuário
    return getMockData(`Erro técnico: ${error?.message || 'Falha na conexão'}`);
  }
};