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
  warning: "Configure a API_KEY no Vercel ou aguarde a cota resetar."
});

export const generateParametersWithAI = async (
  bit: MillingBit, 
  material: string
): Promise<AiPresetResponse> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    console.error("ERRO: API_KEY não encontrada.");
    return getMockData("Chave de API não configurada");
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Mudando para Flash: muito mais rápido e com cota maior que o Pro
    const modelId = 'gemini-3-flash-preview';

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
        temperature: 0.2, // Temperatura baixa para maior precisão técnica
        thinkingConfig: { thinkingBudget: 0 } // Desabilitado para resposta instantânea
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim()) as AiPresetResponse;
    }
    
    throw new Error("Resposta da IA vazia.");

  } catch (error: any) {
    console.error("Falha na chamada da API Gemini:", error);
    
    // Mensagem amigável para erro de cota
    if (error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
        return getMockData("Cota da API excedida. Tente novamente em alguns minutos ou use uma chave paga.");
    }

    return getMockData(error?.message || "Erro na conexão com a IA");
  }
};