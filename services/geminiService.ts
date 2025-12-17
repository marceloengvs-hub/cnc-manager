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

// Helper para dados simulados
const getMockData = (reason: string): AiPresetResponse => ({
  rpm: 18000,
  feedRate: 2500,
  plungeRate: 800,
  stepDown: 1.5,
  explanation: `Modo Demo: ${reason}`,
  warning: "Dados simulados (IA indisponível)"
});

export const generateParametersWithAI = async (
  bit: MillingBit, 
  material: string
): Promise<AiPresetResponse> => {
  // 1. Verificação inicial da chave
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    console.warn("API Key ausente. Usando fallback.");
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockData("Chave de API não configurada"));
      }, 1000);
    });
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey });
    const modelId = 'gemini-2.5-flash';

    const prompt = `
      Atue como um especialista em usinagem CNC (Engenheiro Mecânico).
      Calcule os parâmetros de corte ideais (Conservative a Moderado) para a seguinte configuração:

      FERRAMENTA:
      - Nome: ${bit.name}
      - Tipo: ${bit.type}
      - Diâmetro de Corte: ${bit.diameter}
      - Material da Fresa: ${bit.material}
      - Número de Facas/Cortes: ${bit.specs?.geometry || '2'}
      
      MATERIAL A SER USINADO:
      - ${material}

      Retorne os parâmetros otimizados para uma máquina CNC Router de porte médio (hobby/semi-profissional).
    `;

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        rpm: { type: Type.INTEGER, description: "Rotação do Spindle (RPM)" },
        feedRate: { type: Type.INTEGER, description: "Velocidade de Avanço (mm/min)" },
        plungeRate: { type: Type.INTEGER, description: "Velocidade de Mergulho (mm/min)" },
        stepDown: { type: Type.NUMBER, description: "Passo Vertical / Profundidade por passe (mm)" },
        explanation: { type: Type.STRING, description: "Breve explicação técnica (max 20 palavras)" },
        warning: { type: Type.STRING, description: "Aviso de segurança curto se necessário", nullable: true }
      },
      required: ["rpm", "feedRate", "plungeRate", "stepDown", "explanation"]
    };

    const result = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2,
      }
    });

    if (result.text) {
      return JSON.parse(result.text) as AiPresetResponse;
    }
    
    throw new Error("Resposta vazia da IA");

  } catch (error) {
    // 2. Fallback para erros de execução (Chave inválida, Cota excedida, Erro de rede)
    console.error("Erro na API Gemini (usando fallback):", error);
    return getMockData("Erro na conexão com a IA (Verifique a Chave API)");
  }
};