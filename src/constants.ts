export const COLORS = {
  fluente: "#064e3b",       // Verde Escuro
  iniciante: "#84cc16",     // Verde Lima
  preLeitor4: "#eab308",    // Amarelo
  preLeitor3: "#f97316",    // Laranja
  preLeitor2: "#ea580c",    // Laranja Escuro
  preLeitor1: "#fecaca",    // Vermelho Suave/Bege
};

/**
 * Redundant constant removed. School data is now aggregated dynamically from class-level data
 * using aggregateMunicipalityData to ensure accurate volumetric weighting.
 */

/**
 * Redundant Pinda constant removed.
 */

/**
 * Aggregates class-level data into school-level data.
 * This ensures that school metrics are properly weighted by actual student counts (voulmetric logic).
 */
export const aggregateMunicipalityData = (classes: any[]) => {
  const aggregated: Record<string, any> = {};
  
  classes.forEach(c => {
    const name = c.escola;
    if (!aggregated[name]) {
      aggregated[name] = {
        previstos: 0,
        avaliados: 0,
        n1Count: 0, n2Count: 0, n3Count: 0, n4Count: 0,
        inicianteCount: 0, fluenteCount: 0
      };
    }
    
    const s = aggregated[name];
    s.previstos += c.previstos;
    s.avaliados += c.avaliados;
    
    // Weighted counts based on actual students (avaliados)
    s.n1Count += (c.n1 * c.avaliados) / 100;
    s.n2Count += (c.n2 * c.avaliados) / 100;
    s.n3Count += (c.n3 * c.avaliados) / 100;
    s.n4Count += (c.n4 * c.avaliados) / 100;
    s.inicianteCount += (c.iniciante * c.avaliados) / 100;
    s.fluenteCount += (c.fluente * c.avaliados) / 100;
  });
  
  const rawData: Record<string, number[]> = {};
  Object.entries(aggregated).forEach(([name, d]: [string, any]) => {
    const a = d.avaliados;
    if (a === 0) {
        rawData[name] = [d.previstos, 0, 0, 0, 0, 0, 0, 0, 0];
        return;
    }
    rawData[name] = [
      d.previstos,
      a,
      Math.round((a / d.previstos) * 100),
      Math.round((d.n1Count / a) * 100),
      Math.round((d.n2Count / a) * 100),
      Math.round((d.n3Count / a) * 100),
      Math.round((d.n4Count / a) * 100),
      Math.round((d.inicianteCount / a) * 100),
      Math.round((d.fluenteCount / a) * 100)
    ];
  });
  
  return rawData;
};

// Transform into expected structure for simpler frontend consumption
export const processSchoolsData = (rawData: Record<string, number[]>) => {
  return Object.entries(rawData).map(([name, values]) => {
    const [previstos, avaliados, participacao, n1, n2, n3, n4, iniciante, fluente] = values;
    
    // IFL Calculation: ((N1*0)+(N2*1)+(N3*2.5)+(N4*4)+(LI*6)+(LF*10))/100
    const iflValue = ((n1 * 0) + (n2 * 1) + (n3 * 2.5) + (n4 * 4) + (iniciante * 6) + (fluente * 10));
    
    return {
      name,
      previstos,
      avaliados,
      participacao,
      n1, n2, n3, n4,
      iniciante,
      fluente,
      leitores: iniciante + fluente,
      ifl: (iflValue / 100).toFixed(1), // Normalized 0-10 for the display
      iflRaw: iflValue / 100,
      detailedLevels: [
        { name: "Nível 1", value: n1 },
        { name: "Nível 2", value: n2 },
        { name: "Nível 3", value: n3 },
        { name: "Nível 4", value: n4 },
        { name: "Leitor Iniciante", value: iniciante },
        { name: "Leitor Fluente", value: fluente }
      ],
      levels: [
        { name: "Pré-leitor", value: n1 + n2 + n3 + n4 },
        { name: "Iniciante", value: iniciante },
        { name: "Fluente", value: fluente }
      ]
    };
  });
};

export const RAW_CLASSES_ATIBAIA = [
  {
    "escola": "EM ANDRE FRANCO MONTORO",
    "turma": "2º ANO A INTEGRAL ANUAL",
    "previstos": 28,
    "avaliados": 26,
    "participacao": 93,
    "preTotal": 58,
    "n1": 12,
    "n2": 4,
    "n3": 0,
    "n4": 42,
    "iniciante": 35,
    "fluente": 8
  },
  {
    "escola": "EM ARMANDO TAMASSIA PADRE",
    "turma": "2º ANO A MANHA ANUAL",
    "previstos": 27,
    "avaliados": 27,
    "participacao": 100,
    "preTotal": 48,
    "n1": 0,
    "n2": 26,
    "n3": 4,
    "n4": 19,
    "iniciante": 48,
    "fluente": 4
  },
  {
    "escola": "EM ARMANDO TAMASSIA PADRE",
    "turma": "2º ANO B MANHA ANUAL",
    "previstos": 27,
    "avaliados": 27,
    "participacao": 100,
    "preTotal": 41,
    "n1": 11,
    "n2": 15,
    "n3": 7,
    "n4": 7,
    "iniciante": 59,
    "fluente": 0
  },
  {
    "escola": "EM ARMANDO TAMASSIA PADRE",
    "turma": "2º ANO C TARDE ANUAL",
    "previstos": 30,
    "avaliados": 29,
    "participacao": 97,
    "preTotal": 76,
    "n1": 3,
    "n2": 14,
    "n3": 10,
    "n4": 48,
    "iniciante": 21,
    "fluente": 3
  },
  {
    "escola": "EM CATARINA MARIA DOS REIS",
    "turma": "2º ANO A INTEGRAL ANUAL",
    "previstos": 16,
    "avaliados": 15,
    "participacao": 94,
    "preTotal": 53,
    "n1": 20,
    "n2": 7,
    "n3": 0,
    "n4": 27,
    "iniciante": 33,
    "fluente": 13
  },
  {
    "escola": "EM CIEM I PROFESSORA ELIZETE RODRIGUES",
    "turma": "2º ANO A MANHA ANUAL",
    "previstos": 29,
    "avaliados": 29,
    "participacao": 100,
    "preTotal": 38,
    "n1": 7,
    "n2": 0,
    "n3": 10,
    "n4": 21,
    "iniciante": 59,
    "fluente": 3
  },
  {
    "escola": "EM CIEM I PROFESSORA ELIZETE RODRIGUES",
    "turma": "2º ANO B MANHA ANUAL",
    "previstos": 27,
    "avaliados": 26,
    "participacao": 96,
    "preTotal": 38,
    "n1": 0,
    "n2": 8,
    "n3": 12,
    "n4": 19,
    "iniciante": 58,
    "fluente": 4
  },
  {
    "escola": "EM CIEM I PROFESSORA ELIZETE RODRIGUES",
    "turma": "2º ANO C TARDE ANUAL",
    "previstos": 26,
    "avaliados": 25,
    "participacao": 96,
    "preTotal": 36,
    "n1": 4,
    "n2": 0,
    "n3": 4,
    "n4": 28,
    "iniciante": 40,
    "fluente": 24
  },
  {
    "escola": "EM CIEM I PROFESSORA ELIZETE RODRIGUES",
    "turma": "2º ANO D TARDE ANUAL",
    "previstos": 28,
    "avaliados": 26,
    "participacao": 93,
    "preTotal": 46,
    "n1": 0,
    "n2": 4,
    "n3": 0,
    "n4": 42,
    "iniciante": 46,
    "fluente": 8
  },
  {
    "escola": "EM CIEM II PROFESSOR DOUTOR ORLANDO GIGLIOTTI",
    "turma": "2º ANO A INTEGRAL ANUAL",
    "previstos": 27,
    "avaliados": 26,
    "participacao": 96,
    "preTotal": 54,
    "n1": 12,
    "n2": 8,
    "n3": 0,
    "n4": 35,
    "iniciante": 38,
    "fluente": 8
  },
  {
    "escola": "EM CIEM III PROFESSORA ESPERANCA APARECIDA GIACOMIN MAEDA",
    "turma": "2º ANO A INTEGRAL ANUAL",
    "previstos": 31,
    "avaliados": 30,
    "participacao": 97,
    "preTotal": 83,
    "n1": 23,
    "n2": 13,
    "n3": 3,
    "n4": 43,
    "iniciante": 17,
    "fluente": 0
  },
  {
    "escola": "EM CIEM III PROFESSORA ESPERANCA APARECIDA GIACOMIN MAEDA",
    "turma": "2º ANO B INTEGRAL ANUAL",
    "previstos": 30,
    "avaliados": 27,
    "participacao": 90,
    "preTotal": 63,
    "n1": 4,
    "n2": 15,
    "n3": 11,
    "n4": 33,
    "iniciante": 33,
    "fluente": 4
  },
  {
    "escola": "EM EVA CORDULLA HAUER VALLEJO",
    "turma": "2º ANO A INTEGRAL ANUAL",
    "previstos": 28,
    "avaliados": 28,
    "participacao": 100,
    "preTotal": 71,
    "n1": 11,
    "n2": 18,
    "n3": 0,
    "n4": 43,
    "iniciante": 25,
    "fluente": 4
  },
  {
    "escola": "EM EVA CORDULLA HAUER VALLEJO",
    "turma": "2º ANO B INTEGRAL ANUAL",
    "previstos": 28,
    "avaliados": 27,
    "participacao": 96,
    "preTotal": 63,
    "n1": 7,
    "n2": 19,
    "n3": 4,
    "n4": 33,
    "iniciante": 37,
    "fluente": 0
  },
  {
    "escola": "EM FRANCISCO SILVEIRA BUENO PROF",
    "turma": "2º ANO A MANHA ANUAL",
    "previstos": 25,
    "avaliados": 25,
    "participacao": 100,
    "preTotal": 40,
    "n1": 0,
    "n2": 12,
    "n3": 4,
    "n4": 24,
    "iniciante": 56,
    "fluente": 4
  },
  {
    "escola": "EM FRANCISCO SILVEIRA BUENO PROF",
    "turma": "2º ANO B MANHA ANUAL",
    "previstos": 27,
    "avaliados": 27,
    "participacao": 100,
    "preTotal": 48,
    "n1": 15,
    "n2": 7,
    "n3": 0,
    "n4": 26,
    "iniciante": 37,
    "fluente": 15
  },
  {
    "escola": "EM FRANCISCO SILVEIRA BUENO PROF",
    "turma": "2º ANO C TARDE ANUAL",
    "previstos": 29,
    "avaliados": 29,
    "participacao": 100,
    "preTotal": 45,
    "n1": 0,
    "n2": 10,
    "n3": 14,
    "n4": 21,
    "iniciante": 48,
    "fluente": 7
  },
  {
    "escola": "EM FRANCISCO SILVEIRA BUENO PROF",
    "turma": "2º ANO D TARDE ANUAL",
    "previstos": 29,
    "avaliados": 29,
    "participacao": 100,
    "preTotal": 31,
    "n1": 0,
    "n2": 14,
    "n3": 3,
    "n4": 14,
    "iniciante": 45,
    "fluente": 24
  },
  {
    "escola": "EM GUILHERME PILEGGI CONTESINI PROF",
    "turma": "2º ANO A MANHA ANUAL",
    "previstos": 30,
    "avaliados": 30,
    "participacao": 100,
    "preTotal": 40,
    "n1": 7,
    "n2": 0,
    "n3": 7,
    "n4": 27,
    "iniciante": 43,
    "fluente": 17
  },
  {
    "escola": "EM GUILHERME PILEGGI CONTESINI PROF",
    "turma": "2º ANO B TARDE ANUAL",
    "previstos": 29,
    "avaliados": 28,
    "participacao": 97,
    "preTotal": 54,
    "n1": 4,
    "n2": 4,
    "n3": 11,
    "n4": 36,
    "iniciante": 36,
    "fluente": 11
  },
  {
    "escola": "EM GUILHERME PILEGGI CONTESINI PROF",
    "turma": "2º ANO C TARDE ANUAL",
    "previstos": 27,
    "avaliados": 26,
    "participacao": 96,
    "preTotal": 23,
    "n1": 4,
    "n2": 0,
    "n3": 0,
    "n4": 19,
    "iniciante": 62,
    "fluente": 15
  },
  {
    "escola": "EM IGNACIO BORGES",
    "turma": "2º ANO A INTEGRAL ANUAL",
    "previstos": 17,
    "avaliados": 17,
    "participacao": 100,
    "preTotal": 71,
    "n1": 18,
    "n2": 6,
    "n3": 0,
    "n4": 47,
    "iniciante": 29,
    "fluente": 0
  },
  {
    "escola": "EM JOSE APARECIDO FERREIRA FRANCO",
    "turma": "2º ANO A MANHA ANUAL",
    "previstos": 28,
    "avaliados": 28,
    "participacao": 100,
    "preTotal": 46,
    "n1": 4,
    "n2": 0,
    "n3": 0,
    "n4": 43,
    "iniciante": 50,
    "fluente": 4
  },
  {
    "escola": "EM JOSE APARECIDO FERREIRA FRANCO",
    "turma": "2º ANO B MANHA ANUAL",
    "previstos": 28,
    "avaliados": 28,
    "participacao": 100,
    "preTotal": 50,
    "n1": 11,
    "n2": 11,
    "n3": 7,
    "n4": 21,
    "iniciante": 32,
    "fluente": 18
  },
  {
    "escola": "EM JOSE APARECIDO FERREIRA FRANCO",
    "turma": "2º ANO C TARDE ANUAL",
    "previstos": 28,
    "avaliados": 27,
    "participacao": 96,
    "preTotal": 37,
    "n1": 0,
    "n2": 7,
    "n3": 4,
    "n4": 26,
    "iniciante": 52,
    "fluente": 11
  },
  {
    "escola": "EM JOSE APARECIDO FERREIRA FRANCO",
    "turma": "2º ANO D TARDE ANUAL",
    "previstos": 25,
    "avaliados": 25,
    "participacao": 100,
    "preTotal": 36,
    "n1": 8,
    "n2": 4,
    "n3": 12,
    "n4": 12,
    "iniciante": 48,
    "fluente": 16
  },
  {
    "escola": "EM MARIA CECILIA DE LIMA",
    "turma": "2º ANO A INTEGRAL ANUAL",
    "previstos": 23,
    "avaliados": 22,
    "participacao": 96,
    "preTotal": 68,
    "n1": 5,
    "n2": 32,
    "n3": 0,
    "n4": 32,
    "iniciante": 27,
    "fluente": 5
  },
  {
    "escola": "EM MARIA HELENA FARIA FERRAZ PROFA",
    "turma": "2º ANO A MANHA ANUAL",
    "previstos": 31,
    "avaliados": 31,
    "participacao": 100,
    "preTotal": 13,
    "n1": 0,
    "n2": 3,
    "n3": 0,
    "n4": 10,
    "iniciante": 71,
    "fluente": 16
  },
  {
    "escola": "EM MARIA HELENA FARIA FERRAZ PROFA",
    "turma": "2º ANO B TARDE ANUAL",
    "previstos": 31,
    "avaliados": 31,
    "participacao": 100,
    "preTotal": 10,
    "n1": 0,
    "n2": 0,
    "n3": 3,
    "n4": 6,
    "iniciante": 61,
    "fluente": 29
  },
  {
    "escola": "EM MARIA HELENA FARIA FERRAZ PROFA",
    "turma": "2º ANO C TARDE ANUAL",
    "previstos": 29,
    "avaliados": 29,
    "participacao": 100,
    "preTotal": 38,
    "n1": 10,
    "n2": 3,
    "n3": 3,
    "n4": 21,
    "iniciante": 45,
    "fluente": 17
  },
  {
    "escola": "EM MARIA JOSE CINTRA DOS SANTOS PROFA",
    "turma": "2º ANO A MANHA ANUAL",
    "previstos": 27,
    "avaliados": 27,
    "participacao": 100,
    "preTotal": 19,
    "n1": 0,
    "n2": 0,
    "n3": 4,
    "n4": 15,
    "iniciante": 63,
    "fluente": 19
  },
  {
    "escola": "EM MARIA JOSE CINTRA DOS SANTOS PROFA",
    "turma": "2º ANO B TARDE ANUAL",
    "previstos": 26,
    "avaliados": 26,
    "participacao": 100,
    "preTotal": 46,
    "n1": 4,
    "n2": 8,
    "n3": 8,
    "n4": 27,
    "iniciante": 31,
    "fluente": 23
  },
  {
    "escola": "EM MARIA JOSE CINTRA DOS SANTOS PROFA",
    "turma": "2º ANO C TARDE ANUAL",
    "previstos": 26,
    "avaliados": 26,
    "participacao": 100,
    "preTotal": 54,
    "n1": 15,
    "n2": 4,
    "n3": 8,
    "n4": 27,
    "iniciante": 42,
    "fluente": 4
  },
  {
    "escola": "EM MARIA KAZUKO HIGASHIOKA",
    "turma": "2º ANO A MANHA ANUAL",
    "previstos": 26,
    "avaliados": 26,
    "participacao": 100,
    "preTotal": 65,
    "n1": 4,
    "n2": 0,
    "n3": 12,
    "n4": 50,
    "iniciante": 31,
    "fluente": 4
  },
  {
    "escola": "EM MARIA KAZUKO HIGASHIOKA",
    "turma": "2º ANO B MANHA ANUAL",
    "previstos": 28,
    "avaliados": 28,
    "participacao": 100,
    "preTotal": 50,
    "n1": 11,
    "n2": 7,
    "n3": 4,
    "n4": 29,
    "iniciante": 46,
    "fluente": 4
  },
  {
    "escola": "EM MARIA KAZUKO HIGASHIOKA",
    "turma": "2º ANO C TARDE ANUAL",
    "previstos": 28,
    "avaliados": 28,
    "participacao": 100,
    "preTotal": 29,
    "n1": 4,
    "n2": 4,
    "n3": 4,
    "n4": 18,
    "iniciante": 57,
    "fluente": 14
  },
  {
    "escola": "EM MARIA KAZUKO HIGASHIOKA",
    "turma": "2º ANO D TARDE ANUAL",
    "previstos": 28,
    "avaliados": 26,
    "participacao": 93,
    "preTotal": 54,
    "n1": 4,
    "n2": 8,
    "n3": 4,
    "n4": 38,
    "iniciante": 35,
    "fluente": 12
  },
  {
    "escola": "EM NELSON JOSE PEDROSO ESTUDANTE",
    "turma": "2º ANO A MANHA ANUAL",
    "previstos": 31,
    "avaliados": 31,
    "participacao": 100,
    "preTotal": 35,
    "n1": 10,
    "n2": 0,
    "n3": 3,
    "n4": 23,
    "iniciante": 55,
    "fluente": 10
  },
  {
    "escola": "EM NELSON JOSE PEDROSO ESTUDANTE",
    "turma": "2º ANO B TARDE ANUAL",
    "previstos": 21,
    "avaliados": 21,
    "participacao": 100,
    "preTotal": 67,
    "n1": 5,
    "n2": 29,
    "n3": 10,
    "n4": 24,
    "iniciante": 19,
    "fluente": 14
  },
  {
    "escola": "EM NELSON JOSE PEDROSO ESTUDANTE",
    "turma": "2º ANO C TARDE ANUAL",
    "previstos": 25,
    "avaliados": 25,
    "participacao": 100,
    "preTotal": 36,
    "n1": 0,
    "n2": 4,
    "n3": 4,
    "n4": 28,
    "iniciante": 56,
    "fluente": 8
  },
  {
    "escola": "EM NIZE DE SOUZA B PACCINI",
    "turma": "2º ANO A INTEGRAL ANUAL",
    "previstos": 19,
    "avaliados": 19,
    "participacao": 100,
    "preTotal": 37,
    "n1": 5,
    "n2": 16,
    "n3": 0,
    "n4": 16,
    "iniciante": 58,
    "fluente": 5
  },
  {
    "escola": "EM PAULO FREIRE EDUCADOR",
    "turma": "2º ANO A INTEGRAL ANUAL",
    "previstos": 27,
    "avaliados": 26,
    "participacao": 96,
    "preTotal": 73,
    "n1": 4,
    "n2": 31,
    "n3": 15,
    "n4": 23,
    "iniciante": 19,
    "fluente": 8
  },
  {
    "escola": "EM PAULO FREIRE EDUCADOR",
    "turma": "2º ANO B INTEGRAL ANUAL",
    "previstos": 25,
    "avaliados": 25,
    "participacao": 100,
    "preTotal": 52,
    "n1": 4,
    "n2": 8,
    "n3": 4,
    "n4": 36,
    "iniciante": 36,
    "fluente": 12
  },
  {
    "escola": "EM PAULO FREIRE EDUCADOR",
    "turma": "2º ANO C INTEGRAL ANUAL",
    "previstos": 21,
    "avaliados": 21,
    "participacao": 100,
    "preTotal": 67,
    "n1": 14,
    "n2": 5,
    "n3": 10,
    "n4": 38,
    "iniciante": 33,
    "fluente": 0
  },
  {
    "escola": "EM PEDRO DE ALCANTARA DOS SANTOS SILVA",
    "turma": "2º ANO A INTEGRAL ANUAL",
    "previstos": 28,
    "avaliados": 28,
    "participacao": 100,
    "preTotal": 46,
    "n1": 0,
    "n2": 0,
    "n3": 11,
    "n4": 36,
    "iniciante": 46,
    "fluente": 7
  },
  {
    "escola": "EM RITA LOURDES CARDOSO DE ALMEIDA ALVIM PROFA",
    "turma": "2º ANO A INTEGRAL ANUAL",
    "previstos": 33,
    "avaliados": 32,
    "participacao": 97,
    "preTotal": 66,
    "n1": 6,
    "n2": 9,
    "n3": 3,
    "n4": 47,
    "iniciante": 31,
    "fluente": 3
  },
  {
    "escola": "EM ROSIRIS MARIA ANDREUCCI STOPA",
    "turma": "2º ANO A INTEGRAL ANUAL",
    "previstos": 27,
    "avaliados": 27,
    "participacao": 100,
    "preTotal": 41,
    "n1": 0,
    "n2": 0,
    "n3": 0,
    "n4": 41,
    "iniciante": 26,
    "fluente": 33
  },
  {
    "escola": "EM SERAFINA LUCA CHERFEN PROFA",
    "turma": "2º ANO A INTEGRAL ANUAL",
    "previstos": 34,
    "avaliados": 34,
    "participacao": 100,
    "preTotal": 32,
    "n1": 0,
    "n2": 0,
    "n3": 3,
    "n4": 29,
    "iniciante": 53,
    "fluente": 15
  },
  {
    "escola": "EM TAKAO ONO PREFEITO",
    "turma": "2º ANO A MANHA ANUAL",
    "previstos": 28,
    "avaliados": 28,
    "participacao": 100,
    "preTotal": 61,
    "n1": 4,
    "n2": 4,
    "n3": 11,
    "n4": 43,
    "iniciante": 29,
    "fluente": 11
  },
  {
    "escola": "EM TAKAO ONO PREFEITO",
    "turma": "2º ANO B MANHA ANUAL",
    "previstos": 28,
    "avaliados": 28,
    "participacao": 100,
    "preTotal": 36,
    "n1": 4,
    "n2": 0,
    "n3": 4,
    "n4": 29,
    "iniciante": 46,
    "fluente": 18
  },
  {
    "escola": "EM TAKAO ONO PREFEITO",
    "turma": "2º ANO C MANHA ANUAL",
    "previstos": 28,
    "avaliados": 28,
    "participacao": 100,
    "preTotal": 43,
    "n1": 18,
    "n2": 0,
    "n3": 0,
    "n4": 25,
    "iniciante": 54,
    "fluente": 4
  },
  {
    "escola": "EM TAKAO ONO PREFEITO",
    "turma": "2º ANO D TARDE ANUAL",
    "previstos": 29,
    "avaliados": 28,
    "participacao": 97,
    "preTotal": 86,
    "n1": 7,
    "n2": 25,
    "n3": 11,
    "n4": 43,
    "iniciante": 14,
    "fluente": 0
  },
  {
    "escola": "EM TAKAO ONO PREFEITO",
    "turma": "2º ANO E TARDE ANUAL",
    "previstos": 29,
    "avaliados": 29,
    "participacao": 100,
    "preTotal": 66,
    "n1": 7,
    "n2": 24,
    "n3": 3,
    "n4": 31,
    "iniciante": 34,
    "fluente": 0
  },
  {
    "escola": "EM THEREZINHA DO MENINO JESUS SILVEIRA CAMPOS SIRERA",
    "turma": "2º ANO A MANHA ANUAL",
    "previstos": 31,
    "avaliados": 28,
    "participacao": 90,
    "preTotal": 36,
    "n1": 4,
    "n2": 7,
    "n3": 0,
    "n4": 25,
    "iniciante": 61,
    "fluente": 4
  },
  {
    "escola": "EM THEREZINHA DO MENINO JESUS SILVEIRA CAMPOS SIRERA",
    "turma": "2º ANO B TARDE ANUAL",
    "previstos": 27,
    "avaliados": 26,
    "participacao": 96,
    "preTotal": 54,
    "n1": 15,
    "n2": 15,
    "n3": 12,
    "n4": 12,
    "iniciante": 46,
    "fluente": 0
  },
  {
    "escola": "EM THEREZINHA DO MENINO JESUS SILVEIRA CAMPOS SIRERA",
    "turma": "2º ANO C TARDE ANUAL",
    "previstos": 30,
    "avaliados": 29,
    "participacao": 97,
    "preTotal": 38,
    "n1": 10,
    "n2": 14,
    "n3": 3,
    "n4": 10,
    "iniciante": 55,
    "fluente": 7
  },
  {
    "escola": "EM WALDA PAOLINETTI LOZASSO",
    "turma": "2º ANO A INTEGRAL ANUAL",
    "previstos": 26,
    "avaliados": 26,
    "participacao": 100,
    "preTotal": 69,
    "n1": 15,
    "n2": 0,
    "n3": 12,
    "n4": 42,
    "iniciante": 31,
    "fluente": 0
  },
  {
    "escola": "EM WALDEMAR BASTOS BUHLER",
    "turma": "2º ANO A MANHA ANUAL",
    "previstos": 30,
    "avaliados": 30,
    "participacao": 100,
    "preTotal": 60,
    "n1": 10,
    "n2": 7,
    "n3": 10,
    "n4": 33,
    "iniciante": 33,
    "fluente": 7
  },
  {
    "escola": "EM WALDEMAR BASTOS BUHLER",
    "turma": "2º ANO B MANHA ANUAL",
    "previstos": 29,
    "avaliados": 28,
    "participacao": 97,
    "preTotal": 46,
    "n1": 4,
    "n2": 18,
    "n3": 11,
    "n4": 14,
    "iniciante": 46,
    "fluente": 7
  },
  {
    "escola": "EM WALDEMAR BASTOS BUHLER",
    "turma": "2º ANO C MANHA ANUAL",
    "previstos": 31,
    "avaliados": 31,
    "participacao": 100,
    "preTotal": 52,
    "n1": 16,
    "n2": 23,
    "n3": 3,
    "n4": 10,
    "iniciante": 42,
    "fluente": 6
  },
  {
    "escola": "EM WALDEMAR BASTOS BUHLER",
    "turma": "2º ANO D TARDE ANUAL",
    "previstos": 31,
    "avaliados": 31,
    "participacao": 100,
    "preTotal": 68,
    "n1": 19,
    "n2": 29,
    "n3": 6,
    "n4": 13,
    "iniciante": 23,
    "fluente": 10
  },
  {
    "escola": "EM WALDEMAR BASTOS BUHLER",
    "turma": "2º ANO E TARDE ANUAL",
    "previstos": 32,
    "avaliados": 30,
    "participacao": 94,
    "preTotal": 73,
    "n1": 7,
    "n2": 23,
    "n3": 10,
    "n4": 33,
    "iniciante": 27,
    "fluente": 0
  },
  {
    "escola": "EM WALTER ENGRACIA DE OLIVEIRA PREFEITO",
    "turma": "2º ANO A INTEGRAL ANUAL",
    "previstos": 23,
    "avaliados": 23,
    "participacao": 100,
    "preTotal": 61,
    "n1": 4,
    "n2": 13,
    "n3": 17,
    "n4": 26,
    "iniciante": 30,
    "fluente": 9
  },
  {
    "escola": "EM WALTER ENGRACIA DE OLIVEIRA PREFEITO",
    "turma": "2º ANO B INTEGRAL ANUAL",
    "previstos": 25,
    "avaliados": 25,
    "participacao": 100,
    "preTotal": 44,
    "n1": 8,
    "n2": 4,
    "n3": 0,
    "n4": 32,
    "iniciante": 44,
    "fluente": 12
  },
  {
    "escola": "EM WALTER ENGRACIA DE OLIVEIRA PREFEITO",
    "turma": "2º ANO C INTEGRAL ANUAL",
    "previstos": 15,
    "avaliados": 15,
    "participacao": 100,
    "preTotal": 100,
    "n1": 20,
    "n2": 33,
    "n3": 0,
    "n4": 47,
    "iniciante": 0,
    "fluente": 0
  }
];

export const EVOLUTION_LEVELS = ["N1", "N2", "N3", "N4", "LI", "LF"];

export const MOCK_STUDENTS_EVOLUTION = [
  { id: 1, name: "Ana Beatriz Silva", entrada: "N1", s1: "N2", s2: "N3", saida: "N4" },
  { id: 2, name: "Bruno Oliveira", entrada: "N2", s1: "N3", s2: "N4", saida: "LI" },
  { id: 3, name: "Carla Souza", entrada: "N1", s1: "N1", s2: "N2", saida: "N2" },
  { id: 4, name: "Daniel Rocha", entrada: "N3", s1: "N4", s2: "LI", saida: "LF" },
  { id: 5, name: "Elisa Mendonça", entrada: "N4", s1: "LI", s2: "LI", saida: "LF" },
  { id: 6, name: "Fabio Santos", entrada: "N2", s1: "N2", s2: "N1", saida: "N2" },
  { id: 7, name: "Giovanna Lima", entrada: "N1", s1: "N3", s2: "N4", saida: "LF" },
  { id: 8, name: "Heitor Almeida", entrada: "N1", s1: "N4", s2: "LF", saida: "LF" },
  { id: 9, name: "Isabela Costa", entrada: "LI", s1: "LF", s2: "LF", saida: "LF" },
  { id: 10, name: "João Vitor", entrada: "N4", s1: "N4", s2: "N4", saida: "N4" },
];

export const MUNICIPALITY_CONFIG = {
  "Atibaia": {
    brasao: "/brasao_atibaia.png",
    ifl_rede: 4.7,
    fluencia_rede: 9,
    participation_rede: 98,
    schools: processSchoolsData(aggregateMunicipalityData(RAW_CLASSES_ATIBAIA)),
    classes: RAW_CLASSES_ATIBAIA,
    thresholds: { fluente: 20, preTotal: 60 },
    avgDetailed: [
      { name: "Nível 1", value: 6.9 },
      { name: "Nível 2", value: 9.5 },
      { name: "Nível 3", value: 5.5 },
      { name: "Nível 4", value: 28.0 },
      { name: "Leitor Iniciante", value: 41.2 },
      { name: "Leitor Fluente", value: 9.1 }
    ],
    porteConfig: { pequeno: 40, medio: 90 }
  }
};

export const SCHOOLS_DATA = MUNICIPALITY_CONFIG["Atibaia"].schools;
export const MUNICIPAL_AVERAGE_DETAILED = MUNICIPALITY_CONFIG["Atibaia"].avgDetailed;
