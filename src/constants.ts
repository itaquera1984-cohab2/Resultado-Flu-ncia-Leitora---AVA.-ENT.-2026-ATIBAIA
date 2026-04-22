export const COLORS = {
  fluente: "#064e3b",       // Verde Escuro
  iniciante: "#84cc16",     // Verde Lima
  preLeitor4: "#eab308",    // Amarelo
  preLeitor3: "#f97316",    // Laranja
  preLeitor2: "#ea580c",    // Laranja Escuro
  preLeitor1: "#fecaca",    // Vermelho Suave/Bege
};

export const RAW_DATA_ATIBAIA = {
  "ANDRE FRANCO MONTORO E M": [28, 26, 93, 12, 4, 0, 42, 35, 8],
  "ARMANDO TAMASSIA PADRE EM": [84, 83, 99, 5, 18, 7, 25, 42, 2],
  "CATARINA MARIA DOS REIS EMEFR": [16, 15, 94, 20, 7, 0, 27, 33, 13],
  "CIEM I PROFESSORA ELIZETE RODRIGUES": [110, 106, 96, 3, 3, 7, 27, 51, 9],
  "CIEM II PROFESSOR DOUTOR ORLANDO GIGLIOTTI": [27, 26, 96, 12, 8, 0, 35, 38, 8],
  "CIEM III PROFESSORA ESPERANÇA MAEDA": [61, 57, 93, 14, 14, 7, 39, 25, 2],
  "EVA CORDULLA HAUER VALLEJO EMEIF": [56, 55, 98, 9, 18, 2, 38, 31, 2],
  "FRANCISCO SILVEIRA BUENO PROF EM": [110, 110, 100, 4, 11, 5, 21, 46, 13],
  "GUILHERME PILEGGI CONTESINI PROF EM": [86, 84, 98, 5, 1, 6, 27, 46, 14],
  "IGNACIO BORGES EM": [17, 17, 100, 18, 6, 0, 47, 29, 0],
  "JOSE APARECIDO FERREIRA FRANCO EM": [109, 108, 99, 6, 6, 6, 26, 45, 12],
  "MARIA CECILIA DE LIMA EM": [23, 22, 96, 5, 32, 0, 32, 27, 5],
  "MARIA HELENA FARIA FERRAZ PROFA EM": [91, 91, 100, 3, 2, 2, 12, 59, 21],
  "MARIA JOSE CINTRA DOS SANTOS PROFA EMEF": [79, 79, 100, 6, 4, 6, 23, 46, 15],
  "MARIA KAZUKO HIGASHIOKA EM": [110, 108, 98, 6, 5, 6, 33, 43, 8],
  "NELSON JOSE PEDROSO ESTUDANTE EMEF": [77, 77, 100, 5, 9, 5, 25, 45, 10],
  "NIZE DE SOUZA B PACCINI EM": [19, 19, 100, 5, 16, 0, 16, 58, 5],
  "PAULO FREIRE EDUCADOR EM": [73, 72, 99, 7, 15, 10, 32, 29, 7],
  "PEDRO DE ALCANTARA DOS SANTOS EMEIEF": [28, 28, 100, 0, 0, 11, 36, 46, 7],
  "RITA LOURDES CARDOSO DE ALMEIDA ALVIM PROFA EM": [33, 32, 97, 6, 9, 3, 47, 31, 3],
  "ROSIRIS MARIA ANDREUCCI STOPA EM": [27, 27, 100, 0, 0, 0, 41, 26, 33],
  "SERAFINA LUCA CHERFEN PROFA EM": [34, 34, 100, 0, 0, 3, 29, 53, 15],
  "TAKAO ONO PREFEITO EMEIEF": [142, 141, 99, 8, 11, 6, 34, 35, 6],
  "THEREZINHA DO MENINO JESUS SILVEIRA CAMPOS SIRERA EMEF": [88, 83, 94, 10, 12, 5, 16, 54, 4],
  "WALDA PAOLINETTI LOZASSO EM": [26, 26, 100, 15, 0, 12, 42, 31, 0],
  "WALDEMAR BASTOS BUHLER EM": [153, 150, 98, 11, 20, 8, 21, 34, 6],
  "WALTER ENGRACIA DE OLIVEIRA PREFEITO EMEF": [63, 63, 100, 10, 14, 6, 33, 29, 8]
};

// Transform into expected structure for simpler frontend consumption
export const SCHOOLS_DATA = Object.entries(RAW_DATA_ATIBAIA).map(([name, values]) => {
  const [previstos, avaliados, participacao, n1, n2, n3, n4, iniciante, fluente] = values;
  
  // IFL Calculation: ((N1*0)+(N2*1)+(N3*2)+(N4*4)+(Iniciante*7)+(Fluente*10))/10
  const iflValue = ((n1 * 0) + (n2 * 1) + (n3 * 2) + (n4 * 4) + (iniciante * 7) + (fluente * 10)) / 10;
  
  return {
    name,
    previstos,
    avaliados,
    participacao,
    n1, n2, n3, n4,
    iniciante,
    fluente,
    leitores: iniciante + fluente,
    ifl: (iflValue / 10).toFixed(1), // Normalized 0-10 for the display
    iflRaw: iflValue / 10,
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

export const MUNICIPAL_AVERAGE_DETAILED = [
  { name: "Nível 1", value: 6.4 },
  { name: "Nível 2", value: 9.3 },
  { name: "Nível 3", value: 4.8 },
  { name: "Nível 4", value: 29.3 },
  { name: "Leitor Iniciante", value: 39.8 },
  { name: "Leitor Fluente", value: 10.4 }
];
