import { MillingBit, Collet } from '../types';

// Helper to convert Drive View links to Direct Image links
const getImageUrl = (originalUrl: string | undefined, index: number) => {
  if (!originalUrl || !originalUrl.startsWith('http')) {
    // Return a colorful placeholder based on index if no valid URL
    return `https://ui-avatars.com/api/?name=Fresa+${index}&background=random&size=256&font-size=0.3`;
  }
  // Extract ID from Google Drive URL
  const match = originalUrl.match(/\/d\/(.+)\//);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}=s400`; // Google helper for direct images
  }
  return originalUrl;
};

// Helper to determine collet logic based on Shank Diameter
const getColletInfo = (shank: string) => {
  const s = shank.replace(',', '.').trim();
  const val = parseFloat(s);
  
  if (val === 3.175) return { size: 'ER20 3.175mm (1/8")', has: true };
  if (val === 6) return { size: 'ER20 6mm', has: true };
  if (val === 4) return { size: 'ER20 4mm', has: true }; // Assuming user has 4mm based on data
  if (val === 8) return { size: 'ER20 8mm', has: false }; // Often requires larger collet not standard in kit
  
  return { size: 'Sem pinça', has: false };
};

export const mockBits: MillingBit[] = [
  {
    id: '1',
    name: 'Topo Reto 3mm',
    type: 'Topo reto',
    diameter: '3mm',
    imageUrl: getImageUrl('Página1_Images/1.Imagem.185647.jpg', 1),
    stock: 1,
    minStock: 2,
    material: 'HRC55',
    colletSize: 'Sem pinça',
    hasCollet: false, // 3mm usually needs specific collet, often not in basic 1/8 / 6mm kits
    specs: {
      rpm: 18000,
      feedRate: 1500,
      plungeRate: 500,
      stepDown: 1.0,
      totalLength: 50,
      hardness: 'HRC55',
      geometry: '2F'
    },
    application: {
      materials: ['Aços em geral', 'Ferro fundido'],
      cutType: 'Canais e contornos',
      advantage: 'Boa evacuação de cavacos'
    }
  },
  {
    id: '2',
    name: 'Topo Esférico 2mm',
    type: 'Topo esférico',
    diameter: '2mm',
    imageUrl: getImageUrl('Página1_Images/2.Imagem.185717.jpg', 2),
    stock: 5,
    minStock: 2,
    material: 'HRC55',
    colletSize: 'ER20 4mm',
    hasCollet: false, 
    specs: {
      rpm: 20000,
      feedRate: 1200,
      plungeRate: 400,
      stepDown: 0.5,
      totalLength: 50,
      hardness: 'HRC55',
      geometry: '2F'
    },
    application: {
      materials: ['Aços', 'Ferro Fundido', 'Materiais duros'],
      cutType: 'Acabamento 3D',
      advantage: 'Deixa a superfície lisa e polida'
    }
  },
  {
    id: '3',
    name: 'Topo Esférico 1mm',
    type: 'Topo esférico',
    diameter: '1mm',
    imageUrl: getImageUrl('Página1_Images/3.Imagem.185738.jpg', 3),
    stock: 6,
    minStock: 3,
    material: 'HRC55',
    colletSize: 'ER20 4mm',
    hasCollet: false,
    specs: {
      rpm: 22000,
      feedRate: 1000,
      plungeRate: 300,
      stepDown: 0.2,
      totalLength: 50,
      hardness: 'HRC55',
      geometry: '2F'
    },
    application: {
      materials: ['Aços', 'Ferro Fundido'],
      cutType: 'Acabamento 3D',
      advantage: 'Deixa a superfície lisa e polida'
    }
  },
  {
    id: '4',
    name: 'Topo Esférico 4mm',
    type: 'Topo esférico',
    diameter: '4mm',
    imageUrl: getImageUrl('Página1_Images/4.Imagem.185756.jpg', 4),
    stock: 1,
    minStock: 2,
    material: 'HRC45',
    colletSize: 'ER20 4mm',
    hasCollet: false,
    specs: {
      rpm: 18000,
      feedRate: 2000,
      plungeRate: 800,
      stepDown: 1.0,
      totalLength: 50,
      hardness: 'HRC45',
      geometry: '2F'
    },
    application: {
      materials: ['Alumínio', 'Cobre', 'Madeira'],
      cutType: 'Acabamento 3D',
      advantage: 'Não "empaçoca" fácil em alumínio/madeira'
    }
  },
  {
    id: '5',
    name: 'Topo Esférico 1mm (HRC45)',
    type: 'Topo esférico',
    diameter: '1mm',
    imageUrl: getImageUrl('Imagens_Images/5.Imagem.220909.jpg', 5),
    stock: 5,
    minStock: 3,
    material: 'HRC45',
    colletSize: 'ER20 4mm',
    hasCollet: false,
    specs: {
      rpm: 22000,
      feedRate: 1000,
      plungeRate: 300,
      stepDown: 0.2,
      totalLength: 50,
      hardness: 'HRC45',
      geometry: '2F'
    },
    application: {
      materials: ['Aços', 'Materiais duros'],
      cutType: 'Acabamento 3D',
      advantage: 'Superfície lisa com passo fino'
    }
  },
  {
    id: '6',
    name: 'Topo Esférico 0.5mm',
    type: 'Topo esférico',
    diameter: '0.5mm',
    imageUrl: getImageUrl('Página1_Images/6.Imagem.185846.jpg', 6),
    stock: 3,
    minStock: 5,
    material: 'HRC60',
    colletSize: 'ER20 4mm',
    hasCollet: false,
    specs: {
      rpm: 24000,
      feedRate: 500,
      plungeRate: 100,
      stepDown: 0.05,
      totalLength: 50,
      hardness: 'HRC60',
      geometry: '2F'
    },
    application: {
      materials: ['Aços temperados', 'Inox'],
      cutType: 'Micro-usinagem',
      advantage: 'Extremamente frágil. Exige rotação alta'
    }
  },
  {
    id: '7',
    name: 'Topo Reto 1mm (4F)',
    type: 'Topo reto',
    diameter: '1mm',
    imageUrl: getImageUrl('Página1_Images/7.Imagem.185533.jpg', 7),
    stock: 3,
    minStock: 2,
    material: 'HRC55',
    colletSize: 'ER20 4mm',
    hasCollet: false,
    specs: {
      rpm: 20000,
      feedRate: 800,
      plungeRate: 300,
      stepDown: 0.5,
      totalLength: 50,
      hardness: 'HRC55',
      geometry: '4F'
    },
    application: {
      materials: ['Aços duros', 'Inox'],
      cutType: 'Acabamento fino',
      advantage: '4 Facas dão mais resistência'
    }
  },
  {
    id: '8',
    name: 'Topo Esférico 2mm',
    type: 'Topo esférico',
    diameter: '2mm',
    imageUrl: getImageUrl('Página1_Images/8.Imagem.185832.jpg', 8),
    stock: 1,
    minStock: 2,
    material: 'HRC55',
    colletSize: 'ER20 4mm',
    hasCollet: false,
    specs: {
      rpm: 18000,
      feedRate: 1500,
      plungeRate: 500,
      stepDown: 0.5,
      totalLength: 50,
      hardness: 'HRC55',
      geometry: '2F'
    },
    application: {
      materials: ['Aços em geral', 'Ferro Fundido'],
      cutType: 'Canais e furos',
      advantage: 'Facilita saída de cavaco'
    }
  },
  {
    id: '9',
    name: 'Topo Esférico 0.7mm',
    type: 'Topo esférico',
    diameter: '0.7mm',
    imageUrl: getImageUrl('Página1_Images/9.Imagem.185906.jpg', 9),
    stock: 1,
    minStock: 2,
    material: 'HRC55',
    colletSize: 'ER20 4mm',
    hasCollet: false,
    specs: {
      rpm: 24000,
      feedRate: 600,
      plungeRate: 200,
      stepDown: 0.1,
      totalLength: 50,
      hardness: 'HRC55',
      geometry: '2F'
    },
    application: {
      materials: ['Ligas resistentes'],
      cutType: 'Micro-usinagem',
      advantage: 'Alta precisão, cuidado redobrado'
    }
  },
  {
    id: '10',
    name: 'Topo Reto 3mm (3F)',
    type: 'Topo reto',
    diameter: '3mm',
    imageUrl: getImageUrl('Página1_Images/10.Imagem.185919.jpg', 10),
    stock: 1,
    minStock: 2,
    material: 'HRC55',
    colletSize: 'ER20 4mm',
    hasCollet: false,
    specs: {
      rpm: 18000,
      feedRate: 1800,
      plungeRate: 600,
      stepDown: 1.5,
      totalLength: 50,
      hardness: 'HRC55',
      geometry: '3F'
    },
    application: {
      materials: ['Aços em geral', 'Ferro Fundido'],
      cutType: 'Uso misto (canal/acabamento)',
      advantage: 'Ponto de equilíbrio entre vibração e limpeza'
    }
  },
  {
    id: '11',
    name: 'Topo Reto 4mm Longa',
    type: 'Topo reto',
    diameter: '4mm',
    imageUrl: getImageUrl('https://drive.google.com/file/d/1n2TejjG0JD2bq4Q0tl_Ng3lQ6YCiQLGD/view?usp=sharing', 11),
    stock: 1,
    minStock: 2,
    material: 'HRC55',
    colletSize: 'ER20 6mm',
    hasCollet: true,
    specs: {
      rpm: 16000,
      feedRate: 2000,
      plungeRate: 600,
      stepDown: 2.0,
      totalLength: 75,
      hardness: 'HRC55',
      geometry: '4F'
    },
    application: {
      materials: ['Aços em geral', 'Materiais duros'],
      cutType: 'Perfilamento e contornos',
      advantage: 'Haste grossa (6mm) garante rigidez'
    }
  },
  {
    id: '12',
    name: 'Topo Esférico 5mm',
    type: 'Topo esférico',
    diameter: '5mm',
    imageUrl: getImageUrl('https://drive.google.com/file/d/1FpgtxZNNhVzU04sz1FZlaYcnqJphPSiE/view?usp=sharing', 12),
    stock: 1,
    minStock: 2,
    material: 'HRC55',
    colletSize: 'Sem pinça',
    hasCollet: false,
    specs: {
      rpm: 16000,
      feedRate: 2500,
      plungeRate: 800,
      stepDown: 2.5,
      totalLength: 50,
      hardness: 'HRC55',
      geometry: '2F'
    },
    application: {
      materials: ['Aços em geral'],
      cutType: 'Desbaste agressivo',
      advantage: 'Corpo contínuo 5mm, muito estável'
    }
  },
  {
    id: '13',
    name: 'Topo Esférico 5mm (Slot)',
    type: 'Topo esférico',
    diameter: '5mm',
    imageUrl: getImageUrl('https://drive.google.com/file/d/10tyVra4LCPIKOwIGR444nVqrKg5SwOlf/view?usp=sharing', 13),
    stock: 1,
    minStock: 2,
    material: 'HRC55',
    colletSize: 'Sem pinça',
    hasCollet: false,
    specs: {
      rpm: 16000,
      feedRate: 2500,
      plungeRate: 800,
      stepDown: 2.5,
      totalLength: 50,
      hardness: 'HRC55',
      geometry: '2F'
    },
    application: {
      materials: ['Aços em geral'],
      cutType: 'Abertura de canais (Slotting)',
      advantage: 'Permite descer fundo sem colisão da haste'
    }
  },
  {
    id: '14',
    name: 'Topo Reto 6mm (4F)',
    type: 'Topo reto',
    diameter: '6mm',
    imageUrl: getImageUrl('https://drive.google.com/file/d/1C7300L2uMag_epMrfNUnM9mQzh20SWXZ/view?usp=sharing', 14),
    stock: 1,
    minStock: 3,
    material: 'HRC45',
    colletSize: 'ER20 6mm',
    hasCollet: true,
    specs: {
      rpm: 15000,
      feedRate: 3000,
      plungeRate: 1000,
      stepDown: 3.0,
      totalLength: 50,
      hardness: 'HRC45',
      geometry: '4F'
    },
    application: {
      materials: ['Aços comuns', 'Cobre', 'Latão'],
      cutType: 'Acabamento lateral',
      advantage: 'Robusta e menos quebradiça'
    }
  },
  {
    id: '15',
    name: 'Topo Reto 6mm Alumínio',
    type: 'Topo reto',
    diameter: '6mm',
    imageUrl: getImageUrl('https://drive.google.com/file/d/1IgYkpsmqsSawJv8HietGYg_-zAr-vTfN/view?usp=sharing', 15),
    stock: 1,
    minStock: 3,
    material: 'HRC45',
    colletSize: 'ER20 6mm',
    hasCollet: true,
    specs: {
      rpm: 18000,
      feedRate: 3500,
      plungeRate: 1200,
      stepDown: 3.0,
      totalLength: 50,
      hardness: 'HRC45',
      geometry: '3F'
    },
    application: {
      materials: ['Alumínio', 'Cobre', 'Latão'],
      cutType: 'Uso misto e versátil',
      advantage: '3 Facas: favoritas para Alumínio, evita trepidação'
    }
  },
  {
    id: '16',
    name: 'Topo Reto 5mm Alumínio',
    type: 'Topo reto',
    diameter: '5mm',
    imageUrl: getImageUrl('https://drive.google.com/file/d/1XuspcIlCDvxjhoKUTlE1lu9e00Grj3VE/view?usp=sharing', 16),
    stock: 1,
    minStock: 2,
    material: 'HRC45',
    colletSize: 'Sem pinça',
    hasCollet: false,
    specs: {
      rpm: 18000,
      feedRate: 3000,
      plungeRate: 1000,
      stepDown: 2.5,
      totalLength: 50,
      hardness: 'HRC45',
      geometry: '3F'
    },
    application: {
      materials: ['Alumínio', 'Latão', 'Metais moles'],
      cutType: 'Uso Geral',
      advantage: 'Vibram menos e limpam bem'
    }
  },
  {
    id: '17',
    name: 'Topo Esférico 6mm',
    type: 'Topo esférico',
    diameter: '6mm',
    imageUrl: getImageUrl('https://drive.google.com/file/d/1edHsBB_VaL0_5dWBv074Z4VWJpFjcC9l/view?usp=sharing', 17),
    stock: 1,
    minStock: 2,
    material: 'HRC45',
    colletSize: 'ER20 6mm',
    hasCollet: true,
    specs: {
      rpm: 18000,
      feedRate: 3000,
      plungeRate: 1000,
      stepDown: 3.0,
      totalLength: 50,
      hardness: 'HRC45',
      geometry: '2F'
    },
    application: {
      materials: ['Madeira', 'Alumínio', 'Plásticos'],
      cutType: 'Usinagem 3D, relevos',
      advantage: 'Perfeita para relevos sem entupir'
    }
  },
  {
    id: '18',
    name: 'Topo Esférico 8mm',
    type: 'Topo esférico',
    diameter: '8mm',
    imageUrl: getImageUrl('https://drive.google.com/file/d/1x92LT9OwsoO9spifhY5P7zJDaHGZK8o8/view?usp=sharing', 18),
    stock: 1,
    minStock: 2,
    material: 'HRC45',
    colletSize: 'Sem pinça',
    hasCollet: false, // User likely needs specific collet
    specs: {
      rpm: 14000,
      feedRate: 4000,
      plungeRate: 1500,
      stepDown: 4.0,
      totalLength: 60,
      hardness: 'HRC45',
      geometry: '2F'
    },
    application: {
      materials: ['Madeira Maciça', 'MDF', 'Alumínio'],
      cutType: 'Desbaste 3D pesado',
      advantage: 'Remove muito material rapidamente'
    }
  },
  {
    id: '19',
    name: 'Topo Reto 3.175mm (1/8")',
    type: 'Topo reto',
    diameter: '3.175mm',
    imageUrl: getImageUrl('https://drive.google.com/file/d/16ZdESKOSUaGv-P8uxA6qN0YjPLdFthbL/view?usp=sharing', 19),
    stock: 2,
    minStock: 5,
    material: 'HRC45',
    colletSize: 'ER20 3.175mm',
    hasCollet: true,
    specs: {
      rpm: 18000,
      feedRate: 2500,
      plungeRate: 800,
      stepDown: 1.5,
      totalLength: 45,
      hardness: 'HRC45',
      geometry: '2F'
    },
    application: {
      materials: ['ACM', 'MDF', 'Acrílico', 'PVC'],
      cutType: 'Corte universal',
      advantage: 'Medida universal para CNC Router'
    }
  },
  {
    id: '20',
    name: 'V-Bit 20° 0.5mm',
    type: 'V-Bit',
    diameter: '0.5mm',
    imageUrl: getImageUrl('https://drive.google.com/file/d/11QMyVtp8k1_-Allypi6fajHlLMvbj-wn/view?usp=sharing', 20),
    stock: 1,
    minStock: 2,
    material: 'HRC55',
    colletSize: 'ER20 6mm',
    hasCollet: true,
    specs: {
      rpm: 20000,
      feedRate: 1500,
      plungeRate: 500,
      stepDown: 0.5,
      totalLength: 45,
      hardness: 'HRC55',
      geometry: 'V-Bit'
    },
    application: {
      materials: ['Diversos'],
      cutType: 'Gravação detalhada',
      advantage: 'Custo-benefício'
    }
  },
  {
    id: '21',
    name: 'V-Bit 20° 0.2mm',
    type: 'V-Bit',
    diameter: '0.2mm',
    imageUrl: getImageUrl('https://drive.google.com/file/d/17ub0gDNuMJTTOqXDQ_fbx0ZINsKC454Z/view?usp=sharing', 21),
    stock: 1,
    minStock: 2,
    material: 'HRC55',
    colletSize: 'ER20 6mm',
    hasCollet: true,
    specs: {
      rpm: 20000,
      feedRate: 1500,
      plungeRate: 500,
      stepDown: 0.2,
      totalLength: 45,
      hardness: 'HRC55',
      geometry: 'V-Bit'
    },
    application: {
      materials: ['Diversos'],
      cutType: 'Gravação ultra detalhada',
      advantage: 'Alta precisão'
    }
  },
  {
    id: '22',
    name: 'Espiral 1 Corte 3.175mm',
    type: 'Espiral-Helicoidal',
    diameter: '3.175mm',
    imageUrl: getImageUrl('https://drive.google.com/file/d/1pS0qtIT2Yvb3LRY6xW1UT5BFVON-kXdb/view?usp=sharing', 22),
    stock: 1,
    minStock: 3,
    material: 'HRC45',
    colletSize: 'ER20 3.175mm',
    hasCollet: true,
    specs: {
      rpm: 18000,
      feedRate: 3000,
      plungeRate: 1500,
      stepDown: 3.175,
      totalLength: 38,
      hardness: 'HRC45',
      geometry: '1F'
    },
    application: {
      materials: ['Acrílico', 'PVC', 'ACM', 'Alumínio'],
      cutType: 'Recorte passante rápido',
      advantage: '1 Faca evita derretimento de plásticos'
    }
  },
  {
    id: '23',
    name: 'Broca de Centro 3.15mm',
    type: 'Broca de centro',
    diameter: '3.15mm',
    imageUrl: getImageUrl('https://drive.google.com/file/d/1SBAe1gGv-KLp6szpU15wWwFlrd6invoR/view?usp=sharing', 23),
    stock: 1,
    minStock: 2,
    material: 'HSS',
    colletSize: 'ER20 8mm',
    hasCollet: false,
    specs: {
      rpm: 3000,
      feedRate: 200,
      plungeRate: 200,
      stepDown: 1.0,
      totalLength: 30,
      hardness: 'HSS',
      geometry: '2F'
    },
    application: {
      materials: ['Aços 1020/1045', 'Alumínio'],
      cutType: 'Furo de Centro / Guia',
      advantage: 'Impede que a broca grande escorregue'
    }
  }
];

export const mockCollets: Collet[] = [
  {
    id: 'collet-1',
    name: 'Pinça ER20 1/8"',
    size: '3.175mm',
    type: 'ER20',
    description: 'Padrão Spindle industrial',
    stock: 1,
    minStock: 1,
    isImperial: true,
  },
  {
    id: 'collet-2',
    name: 'Pinça ER20 6mm',
    size: '6mm',
    type: 'ER20',
    description: 'Padrão Spindle industrial',
    stock: 2,
    minStock: 1,
    isImperial: false,
  },
  {
    id: 'collet-3',
    name: 'Pinça ER20 4mm',
    size: '4mm',
    type: 'ER20',
    description: 'Para fresas de 4mm',
    stock: 0, // Out of stock to show alert
    minStock: 1,
    isImperial: false,
  }
];