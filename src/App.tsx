/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ReferenceLine 
} from 'recharts';
import { 
  LayoutDashboard, School, Trophy, Users, CheckCircle, ArrowRightCircle, 
  AlertTriangle, Search, Filter, Calendar, Layers, Activity, Lightbulb, FileText, Download, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MUNICIPALITY_CONFIG, COLORS, EVOLUTION_LEVELS, MOCK_STUDENTS_EVOLUTION } from './constants';

const LEVEL_TO_NUM: Record<string, number> = { "N1": 0, "N2": 1, "N3": 2, "N4": 3, "LI": 4, "LF": 5 };

const getEvolutionLabel = (start: string, end: string) => {
    const diff = LEVEL_TO_NUM[end] - LEVEL_TO_NUM[start];
    if (diff >= 3) return { label: "Avanço Excepcional", color: "bg-emerald-600" };
    if (diff === 2) return { label: "Avanço Expressivo", color: "bg-emerald-400" };
    if (diff === 1) return { label: "Avanço Pontual", color: "bg-blue-400" };
    if (diff === 0) return { label: "Manteve", color: "bg-amber-400" };
    return { label: "Regressão / Alerta", color: "bg-rose-500" };
};

const FilterBox = ({ label, icon: Icon, options, value, onChange }: { label: string, icon: any, options: string[], value: string, onChange: (v: string) => void }) => (
  <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
    <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider">
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </div>
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none font-semibold text-slate-700"
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const NavToggle = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: 'panorama' | 'perf' | 'turmas' | 'evolucao' | 'insights' | 'porte') => void }) => (
  <div className="flex bg-gray-200 p-2 rounded-2xl w-fit mx-auto shadow-inner">
    {[
      { id: 'panorama', label: 'Visão Geral' },
      { id: 'perf', label: 'Escolas' },
      { id: 'turmas', label: 'Análise por Turmas' },
      { id: 'evolucao', label: 'Evolução' },
      { id: 'insights', label: 'Insights' },
      { id: 'porte', label: 'Porte' },
    ].map((tab) => (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id as any)}
        className={`px-8 py-3 rounded-xl font-bold text-[18pt] transition-all duration-300 cursor-pointer ${
          activeTab === tab.id 
            ? 'bg-white text-green-950 shadow-sm border-2 border-green-800' 
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

const KPI = ({ icon: Icon, label, value, colorClass, subtitle }: { icon: any, label: string, value: string | number, colorClass: string, subtitle?: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 flex-1 min-w-[240px]">
    <div className={`p-5 rounded-2xl ${colorClass}`}>
      <Icon className="w-8 h-8 text-white" />
    </div>
    <div>
      <p className="text-gray-500 font-medium text-sm">{label}</p>
      <p className="text-3xl font-black text-slate-800">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-tight">{subtitle}</p>}
    </div>
  </div>
);

const truncateName = (name: string, limit: number = 15) => 
  name.length > limit ? name.substring(0, limit) + "..." : name;

const Footer = () => (
  <footer className="mt-20 py-10 border-t border-gray-200">
    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
      <div className="flex-shrink-0">
        <img src="/logoaltbit.jpeg" style={{ height: '50px' }} alt="Logo Altbit" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-slate-400 font-black text-sm tracking-widest uppercase">PIPA Voice AI • Inteligência Educacional</p>
        <div className="h-1 w-20 bg-green-600 rounded-full mb-2"></div>
        <p className="text-slate-500 font-bold text-xs">Desenvolvido por Henrique Morais • © 2026</p>
      </div>
    </div>
  </footer>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<'panorama' | 'perf' | 'turmas' | 'evolucao' | 'insights' | 'porte'>('panorama');
  const [evolucaoSubTab, setEvolucaoSubTab] = useState<'coleta' | 'mapa'>('mapa');
  
  // State for students map
  const [studentsData, setStudentsData] = useState(MOCK_STUDENTS_EVOLUTION);

  // Focused on Atibaia only as per user request
  const currentMunicipality = MUNICIPALITY_CONFIG["Atibaia"];
  const SCHOOLS_DATA = currentMunicipality.schools;
  const CLASSES_DATA = (currentMunicipality as any).classes || [];
  const MUNICIPAL_AVERAGE_DETAILED = currentMunicipality.avgDetailed;

  const [selectedSchool, setSelectedSchool] = useState(SCHOOLS_DATA[0].name);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedStudentForColeta, setSelectedStudentForColeta] = useState<string | null>(null);

  const handleStartColeta = (name: string) => {
    setSelectedStudentForColeta(name);
    // Simulate delay for detection
    setTimeout(() => {
        setShowModal(true);
    }, 1500);
  };
  const [turmaSearch, setTurmaSearch] = useState("");
  const [turmaSort, setTurmaSort] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'escola', direction: 'asc' });
  const [selectedGroup, setSelectedGroup] = useState<'Pequeno' | 'Médio' | 'Grande'>('Médio');

  // Refs for double scrollbar synchronization
  const topScrollRef = useRef<HTMLDivElement>(null);
  const bottomScrollRef = useRef<HTMLDivElement>(null);
  const [tableScrollWidth, setTableScrollWidth] = useState(0);

  const syncScroll = (source: React.RefObject<HTMLDivElement>, target: React.RefObject<HTMLDivElement>) => {
    if (source.current && target.current) {
      if (Math.abs(target.current.scrollLeft - source.current.scrollLeft) > 1) {
        target.current.scrollLeft = source.current.scrollLeft;
      }
    }
  };
  
  const [edition, setEdition] = useState("2026");
  const [period, setPeriod] = useState("Saída");
  const [network, setNetwork] = useState("Municipal");

  // Reset selected school when schools data changes (though it's only Atibaia now)
  React.useEffect(() => {
    if (SCHOOLS_DATA.length > 0) {
      setSelectedSchool(SCHOOLS_DATA[0].name);
    }
  }, [SCHOOLS_DATA]);

  const currentSchoolData = useMemo(() => 
    SCHOOLS_DATA.find(s => s.name === selectedSchool) || SCHOOLS_DATA[0]
  , [selectedSchool, SCHOOLS_DATA]);

  const municipalStats = useMemo(() => {
    const totalAvaliados = SCHOOLS_DATA.reduce((acc, s) => acc + s.avaliados, 0);
    const totalPrevistos = SCHOOLS_DATA.reduce((acc, s) => acc + s.previstos, 0);
    
    // Weighted IFL: Sum(school_ifl * school_avaliados) / total_avaliados
    const totalIFLWeighted = SCHOOLS_DATA.reduce((acc, s) => acc + (parseFloat(s.ifl) * s.avaliados), 0);
    const weightedIFL = totalAvaliados > 0 ? totalIFLWeighted / totalAvaliados : 0;
    
    // Weighted Leitores: Sum(school_leitores_perc * school_avaliados) / total_avaliados
    const totalLeitoresCount = SCHOOLS_DATA.reduce((acc, s) => acc + (s.leitores * s.avaliados / 100), 0);
    const weightedLeitoresPerc = totalAvaliados > 0 ? (totalLeitoresCount / totalAvaliados) * 100 : 0;

    return {
      totalAvaliados: totalAvaliados.toLocaleString('pt-BR'),
      totalPrevistos: totalPrevistos.toLocaleString('pt-BR'),
      participation: totalPrevistos > 0 ? ((totalAvaliados / totalPrevistos) * 100).toFixed(1) + "%" : "0%",
      ifl: weightedIFL.toFixed(1),
      leitores: weightedLeitoresPerc.toFixed(1) + "%"
    };
  }, [SCHOOLS_DATA]);

  const municipalDistribution = useMemo(() => {
    const totalAvaliados = SCHOOLS_DATA.reduce((acc, s) => acc + s.avaliados, 0);
    if (totalAvaliados === 0) return [];

    const getWeightedValue = (field: 'fluente' | 'iniciante' | 'n1' | 'n2' | 'n3' | 'n4') => {
      const totalCount = SCHOOLS_DATA.reduce((acc, s) => acc + (s[field] * s.avaliados / 100), 0);
      return (totalCount / totalAvaliados) * 100;
    };

    return [
      { name: "Fluentes", value: getWeightedValue('fluente'), color: COLORS.fluente },
      { name: "Iniciantes", value: getWeightedValue('iniciante'), color: COLORS.iniciante },
      { name: "Nível 1", value: getWeightedValue('n1'), color: COLORS.preLeitor1 },
      { name: "Nível 2", value: getWeightedValue('n2'), color: COLORS.preLeitor2 },
      { name: "Nível 3", value: getWeightedValue('n3'), color: COLORS.preLeitor3 },
      { name: "Nível 4", value: getWeightedValue('n4'), color: COLORS.preLeitor4 },
    ];
  }, [SCHOOLS_DATA]);

  const strategicInsights = useMemo(() => {
    const sortedByIFL = [...SCHOOLS_DATA].sort((a, b) => parseFloat(b.ifl) - parseFloat(a.ifl));
    const top5Excellence = sortedByIFL.slice(0, 5);
    const top5Priority = [...sortedByIFL].reverse().slice(0, 5);
    
    const absenteeismRanking = [...SCHOOLS_DATA]
      .map(s => ({ 
        ...s, 
        percAusencia: s.previstos > 0 ? ((s.previstos - s.avaliados) / s.previstos) * 100 : 0 
      }))
      .sort((a, b) => b.percAusencia - a.percAusencia)
      .slice(0, 5);

    const potentialReading = [...SCHOOLS_DATA]
      .map(s => ({ ...s, somaLeitura: s.iniciante + s.fluente }))
      .sort((a, b) => b.somaLeitura - a.somaLeitura)
      .slice(0, 5);

    return { top5Excellence, top5Priority, absenteeismRanking, potentialReading };
  }, [SCHOOLS_DATA]);

  const evolutionStats = useMemo(() => {
    const stats: any = {
      "Avanço Excepcional": 0,
      "Avanço Expressivo": 0,
      "Avanço Pontual": 0,
      "Manteve": 0,
      "Regressão / Alerta": 0,
    };
    
    studentsData.forEach(s => {
      const { label } = getEvolutionLabel(s.entrada, s.saida);
      stats[label]++;
    });
    
    return [
      { name: "Excepcional", value: stats["Avanço Excepcional"], color: "#059669" },
      { name: "Expressivo", value: stats["Avanço Expressivo"], color: "#34d399" },
      { name: "Pontual", value: stats["Avanço Pontual"], color: "#60a5fa" },
      { name: "Manteve", value: stats["Manteve"], color: "#fbbf24" },
      { name: "Regressão", value: stats["Regressão / Alerta"], color: "#f43f5e" },
    ];
  }, [studentsData]);

  const classesStats = useMemo(() => {
    if (!CLASSES_DATA.length) return null;
    
    // Injetando IFL oficial em cada turma
    const dataWithIFL = CLASSES_DATA.map(c => ({
      ...c,
      ifl: (((c.n1 * 0) + (c.n2 * 1) + (c.n3 * 2.5) + (c.n4 * 4) + (c.iniciante * 6) + (c.fluente * 10)) / 100).toFixed(1)
    }));
    
    const sortedFluente = [...dataWithIFL].sort((a, b) => b.fluente - a.fluente).slice(0, 3);
    const sortedIntervention = [...dataWithIFL].sort((a, b) => b.preTotal - a.preTotal).slice(0, 3);
    
    const filtered = dataWithIFL.filter(c => 
      c.escola.toLowerCase().includes(turmaSearch.toLowerCase()) || 
      c.turma.toLowerCase().includes(turmaSearch.toLowerCase())
    ).sort((a: any, b: any) => {
      // Se for a ordenação padrão (escola), adiciona secundária por turma
      if (turmaSort.key === 'escola') {
        const escolaComp = a.escola.localeCompare(b.escola);
        if (escolaComp !== 0) return turmaSort.direction === 'asc' ? escolaComp : -escolaComp;
        return a.turma.localeCompare(b.turma);
      }
      
      const valA = parseFloat(a[turmaSort.key]) || a[turmaSort.key];
      const valB = parseFloat(b[turmaSort.key]) || b[turmaSort.key];
      if (turmaSort.direction === 'asc') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    // Internal Disparity Analysis & School Averages
    const schoolsGrouped = dataWithIFL.reduce((acc: any, curr: any) => {
      if (!acc[curr.escola]) acc[curr.escola] = [];
      acc[curr.escola].push(curr);
      return acc;
    }, {});

    const schoolPerformances: any[] = [];
    const disparities: any[] = [];
    let totalIFLSum = 0;

    Object.entries(schoolsGrouped).forEach(([name, classes]: [string, any[]]) => {
      const schoolIFLAvg = classes.reduce((sum, c) => sum + parseFloat(c.ifl), 0) / classes.length;
      schoolPerformances.push({ name, ifl: parseFloat(schoolIFLAvg.toFixed(2)) });
      totalIFLSum += schoolIFLAvg;

      if (classes.length >= 2) {
        const fluentes = classes.map((c: any) => c.fluente);
        const preLeitores = classes.map((c: any) => c.preTotal);
        
        const maxFluente = Math.max(...fluentes);
        const minFluente = Math.min(...fluentes);
        const deltaFluente = maxFluente - minFluente;

        const maxPre = Math.max(...preLeitores);
        const minPre = Math.min(...preLeitores);
        const deltaPre = maxPre - minPre;

        disparities.push({
          name,
          deltaFluente: parseFloat(deltaFluente.toFixed(1)),
          minFluente,
          maxFluente,
          deltaPre: parseFloat(deltaPre.toFixed(1)),
          minPre,
          maxPre
        });
      }
    });

    const networkAvgIFL = parseFloat(
      (dataWithIFL.reduce((sum, c) => sum + (parseFloat(c.ifl) * c.avaliados), 0) / 
       dataWithIFL.reduce((sum, c) => sum + c.avaliados, 0)).toFixed(2)
    );
    const schoolPerformanceChart = schoolPerformances.sort((a, b) => b.ifl - a.ifl);

    const topDisparityFluente = [...disparities].sort((a, b) => b.deltaFluente - a.deltaFluente).slice(0, 3);
    const topDisparityPre = [...disparities].sort((a, b) => b.deltaPre - a.deltaPre).slice(0, 3);

    return { 
      sortedFluente, 
      sortedIntervention, 
      filtered, 
      topDisparityFluente, 
      topDisparityPre,
      schoolPerformanceChart,
      networkAvgIFL
    };
  }, [CLASSES_DATA, turmaSearch, turmaSort]);

  const schoolsByPorte = useMemo(() => {
    const config = currentMunicipality.porteConfig;
    return SCHOOLS_DATA.map(s => {
      let porte: 'Pequeno' | 'Médio' | 'Grande';
      if (s.previstos <= config.pequeno) porte = 'Pequeno';
      else if (s.previstos <= config.medio) porte = 'Médio';
      else porte = 'Grande';
      return { ...s, porte };
    });
  }, [SCHOOLS_DATA, currentMunicipality]);

  const porteSummary = useMemo(() => {
    const groups = ['Pequeno', 'Médio', 'Grande'] as const;
    return groups.map(g => {
      const schools = schoolsByPorte.filter(s => s.porte === g);
      if (schools.length === 0) return { porte: g, avgIFL: "0", avgPart: "0", count: 0 };
      
      const totalAvaliados = schools.reduce((acc, s) => acc + s.avaliados, 0);
      const totalPrevistos = schools.reduce((acc, s) => acc + s.previstos, 0);
      
      const weightedIFL = totalAvaliados > 0 
        ? schools.reduce((acc, s) => acc + (parseFloat(s.ifl) * s.avaliados), 0) / totalAvaliados
        : 0;
      const weightedPart = totalPrevistos > 0 ? (totalAvaliados / totalPrevistos) * 100 : 0;
      
      return { 
        porte: g, 
        avgIFL: weightedIFL.toFixed(1), 
        avgPart: weightedPart.toFixed(1), 
        count: schools.length 
      };
    });
  }, [schoolsByPorte]);

  const groupData = useMemo(() => {
    const schoolsInGroup = schoolsByPorte.filter(s => s.porte === selectedGroup);
    if (schoolsInGroup.length === 0) return null;

    const totalAvaliados = schoolsInGroup.reduce((acc, s) => acc + s.avaliados, 0);
    const avgIFL = totalAvaliados > 0 
      ? (schoolsInGroup.reduce((acc, s) => acc + (parseFloat(s.ifl) * s.avaliados), 0) / totalAvaliados).toFixed(1)
      : "0.0";
    
    // Aggregating detailed levels for spline chart - weighted
    const groupLevelsAvg = [
      { name: "Nível 1", value: totalAvaliados > 0 ? Math.round(schoolsInGroup.reduce((acc, s) => acc + (s.n1 * s.avaliados / 100), 0) / totalAvaliados * 100) : 0 },
      { name: "Nível 2", value: totalAvaliados > 0 ? Math.round(schoolsInGroup.reduce((acc, s) => acc + (s.n2 * s.avaliados / 100), 0) / totalAvaliados * 100) : 0 },
      { name: "Nível 3", value: totalAvaliados > 0 ? Math.round(schoolsInGroup.reduce((acc, s) => acc + (s.n3 * s.avaliados / 100), 0) / totalAvaliados * 100) : 0 },
      { name: "Nível 4", value: totalAvaliados > 0 ? Math.round(schoolsInGroup.reduce((acc, s) => acc + (s.n4 * s.avaliados / 100), 0) / totalAvaliados * 100) : 0 },
      { name: "Leitor Iniciante", value: totalAvaliados > 0 ? Math.round(schoolsInGroup.reduce((acc, s) => acc + (s.iniciante * s.avaliados / 100), 0) / totalAvaliados * 100) : 0 },
      { name: "Leitor Fluente", value: totalAvaliados > 0 ? Math.round(schoolsInGroup.reduce((acc, s) => acc + (s.fluente * s.avaliados / 100), 0) / totalAvaliados * 100) : 0 },
    ];

    const sortedSchools = [...schoolsInGroup].sort((a, b) => parseFloat(b.ifl) - parseFloat(a.ifl));

    return {
      avgIFL,
      groupLevelsAvg,
      sortedSchools,
      count: schoolsInGroup.length
    };
  }, [selectedGroup, schoolsByPorte]);

  // Structural Analysis for Insights as requested in JSON Format logic
  const pedagogicalAnalysis = useMemo(() => {
    // We use the first 6 elements of municipalDistribution which correspond to Fluente, Iniciante, N1, N2, N3, N4
    // but the order in distribution is Fluents, Iniciantes, N1, N2, N3, N4
    const mAvgFluents = municipalDistribution.find(d => d.name === "Fluentes")?.value || 0;
    const sFluents = currentSchoolData.fluente;
    const diff = sFluents - mAvgFluents;
    
    let pointer = "";
    if (diff > 0) {
      pointer = `A Unidade Escolar ${currentSchoolData.name} apresenta um índice de Leitores Fluentes ${diff.toFixed(1)}% acima da média da rede.`;
    } else {
      pointer = `A Unidade Escolar ${currentSchoolData.name} está ${Math.abs(diff).toFixed(1)}% abaixo da média municipal em Fluência. Foco em aceleração necessário.`;
    }

    const n1Val = currentSchoolData.n1;
    const n2Val = currentSchoolData.n2;
    const hasAlert = n1Val > 10 || n2Val > 15;

    // Participation Alert
    const participationAlert = currentSchoolData.avaliados < currentSchoolData.previstos 
      ? `A unidade ${currentSchoolData.name} possui ${currentSchoolData.previstos} alunos previstos, porém a análise baseia-se nos ${currentSchoolData.avaliados} efetivos (${currentSchoolData.participacao}% de participação real).`
      : null;

    return {
      selected_school: currentSchoolData.name,
      comparative_analysis: pointer,
      hasAlert,
      n1Val,
      n2Val,
      participationAlert,
      chart_data: {
        combinedValues: currentSchoolData.detailedLevels.map((dl, idx) => {
           // Mapping school levels to municipal distribution
           // School levels order: N1, N2, N3, N4, LI, LF
           // Distribution order: Fluentes, Iniciantes, N1, N2, N3, N4
           let mValue = 0;
           if (idx === 0) mValue = municipalDistribution.find(d => d.name === "Nível 1")?.value || 0;
           else if (idx === 1) mValue = municipalDistribution.find(d => d.name === "Nível 2")?.value || 0;
           else if (idx === 2) mValue = municipalDistribution.find(d => d.name === "Nível 3")?.value || 0;
           else if (idx === 3) mValue = municipalDistribution.find(d => d.name === "Nível 4")?.value || 0;
           else if (idx === 4) mValue = municipalDistribution.find(d => d.name === "Iniciantes")?.value || 0;
           else if (idx === 5) mValue = municipalDistribution.find(d => d.name === "Fluentes")?.value || 0;

           return {
             name: dl.name,
             school: dl.value,
             municipal: mValue
           };
        })
      }
    };
  }, [currentSchoolData, municipalDistribution]);

  useEffect(() => {
    const updateWidth = () => {
      if (bottomScrollRef.current) {
        setTableScrollWidth(bottomScrollRef.current.scrollWidth);
      }
    };

    if (activeTab === 'turmas' && bottomScrollRef.current) {
      updateWidth();
      const resizeObserver = new ResizeObserver(updateWidth);
      resizeObserver.observe(bottomScrollRef.current);
      
      // Also observe the table itself if possible, or just the container
      const table = bottomScrollRef.current.querySelector('table');
      if (table) resizeObserver.observe(table);

      return () => resizeObserver.disconnect();
    }
  }, [activeTab, classesStats]);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const found = SCHOOLS_DATA.find(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
      if (found) setSelectedSchool(found.name);
    }
  };

  const handleDownloadPDF = () => {
    alert("Gerando Relatório Pedagógico (PDF) para: " + selectedSchool);
  };

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto bg-slate-50/50 text-[16pt]">
      <header className="mb-10">
        {/* Institucional Header - Focused on Atibaia */}
        <div className="flex justify-between items-center gap-6" style={{ backgroundColor: '#ffffff', padding: '20px', borderBottom: '3px solid #2563eb', marginBottom: '25px', borderRadius: '8px' }}>
          <div className="flex-shrink-0">
              <img 
                alt="Brasão Atibaia" 
                src={currentMunicipality.brasao} 
                style={{ height: '100px' }} 
                referrerPolicy="no-referrer"
              />
          </div>
          
          <div style={{ flexGrow: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#1e293b', textTransform: 'uppercase', margin: 0, lineHeight: 1.2, letterSpacing: '1px' }}>
              PREFEITURA MUNICIPAL DE ATIBAIA
            </h1>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', margin: 0, lineHeight: 1.2 }}>
              Secretaria Municipal de Educação
            </h2>
            <p style={{ fontSize: '15px', fontWeight: 900, color: '#2563eb', textTransform: 'uppercase', marginTop: '8px', letterSpacing: '0.5px' }}>
              Dashboard de Intervenção Pedagógica — Ciclo Estratégico 2026
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <img 
              alt="Logo Empresa" 
              src="/logo_empresa.png" 
              style={{ height: '100px' }} 
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
          
        {/* Static Informative Badges */}
        <div className="flex flex-wrap gap-4 justify-end w-full mb-10 px-2">
          <div className="px-4 py-2 bg-slate-100 text-slate-500 rounded-lg font-bold text-[14px] border border-slate-200 cursor-not-allowed">
            Edição: 2026
          </div>
          <div className="px-4 py-2 bg-slate-100 text-slate-500 rounded-lg font-bold text-[14px] border border-slate-200 cursor-not-allowed">
            Período: Entrada
          </div>
          <div className="px-4 py-2 bg-slate-100 text-slate-500 rounded-lg font-bold text-[14px] border border-slate-200 cursor-not-allowed">
            Rede: Municipal
          </div>
        </div>
        
        <NavToggle activeTab={activeTab} setActiveTab={setActiveTab} />
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'panorama' ? (
          <motion.div
            key="panorama"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            <div className="flex flex-wrap gap-6">
              <KPI icon={Activity} label="IFL Municipal" value={municipalStats.ifl} colorClass="bg-orange-600" subtitle="Média Ponderada Atibaia" />
              <KPI icon={Users} label="Censo (Previstos)" value={municipalStats.totalPrevistos} colorClass="bg-indigo-700" subtitle="Alunos Previstos" />
              <KPI icon={CheckCircle} label="Participação" value={municipalStats.participation} colorClass="bg-blue-700" subtitle="Cobertura do Censo" />
              <KPI icon={Trophy} label="Média Leitores" value={municipalStats.leitores} colorClass="bg-green-700" subtitle="Iniciantes + Fluentes" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 h-[550px]">
                <h2 className="text-xl font-black mb-8 text-center text-slate-800">Distribuição Consolidada de Níveis</h2>
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={municipalDistribution}
                      cx="50%" cy="50%"
                      innerRadius={100} outerRadius={160}
                      paddingAngle={4} dataKey="value"
                    >
                      {municipalDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={40}/>
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-black fill-slate-800">
                      IFL {municipalStats.ifl}
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-[550px]">
                <h2 className="text-xl font-black mb-8 text-center text-slate-800 underline decoration-green-500 underline-offset-8">Tabela Mestre de Performance</h2>
                <div className="overflow-x-auto overflow-y-auto h-[400px] border border-gray-100 rounded-xl scrollbar-thin scrollbar-thumb-gray-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 sticky top-0 z-10 text-slate-500 font-black uppercase text-[10px]">
                      <tr>
                        <th className="px-4 py-3">Escola</th>
                        <th className="px-4 py-3 text-center">Avaliados</th>
                        <th className="px-4 py-3 text-center">IFL</th>
                        <th className="px-4 py-3 text-center text-red-400">N1</th>
                        <th className="px-4 py-3 text-center text-red-500">N2</th>
                        <th className="px-4 py-3 text-right">% Leitores</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {SCHOOLS_DATA.sort((a,b) => parseFloat(b.ifl) - parseFloat(a.ifl)).map((school) => (
                        <tr key={school.name} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-bold text-slate-700 truncate max-w-[180px]">{school.name}</td>
                          <td className="px-4 py-3 text-center font-medium">{school.avaliados}</td>
                          <td className={`px-4 py-3 text-center font-black ${parseFloat(school.ifl) >= 6.0 ? 'text-blue-600' : parseFloat(school.ifl) <= 4.0 ? 'text-red-500' : 'text-orange-600'}`}>
                            {school.ifl}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-red-300">{school.n1}%</td>
                          <td className="px-4 py-3 text-center font-bold text-red-400">{school.n2}%</td>
                          <td className="px-4 py-3 text-right font-black text-green-700">{school.leitores}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Módulo de Insights Estratégicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* TOP 5 - EXCELÊNCIA */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-green-600">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-green-600" />
                  <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Top 5 - Excelência</h3>
                </div>
                <div className="space-y-3">
                  {strategicInsights.top5Excellence.map((s, i) => (
                    <div key={s.name} className="flex justify-between items-center text-[11px]">
                      <span className="font-bold text-slate-600 truncate max-w-[120px]">{i+1}. {s.name}</span>
                      <span className="font-black text-green-700 bg-green-50 px-2 py-0.5 rounded text-[10px]">IFL {s.ifl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* TOP 5 - PRIORIDADE */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-red-600">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Top 5 - Prioridade</h3>
                </div>
                <div className="space-y-3">
                  {strategicInsights.top5Priority.map((s, i) => (
                    <div key={s.name} className="flex justify-between items-center text-[11px]">
                      <span className="font-bold text-slate-600 truncate max-w-[120px]">{i+1}. {s.name}</span>
                      <span className="font-black text-red-700 bg-red-50 px-2 py-0.5 rounded text-[10px]">IFL {s.ifl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RANKING DE ABSENTEÍSMO */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-orange-500">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-orange-500" />
                  <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Absenteísmo (% Ausência)</h3>
                </div>
                <div className="space-y-3">
                  {strategicInsights.absenteeismRanking.map((s, i) => (
                    <div key={s.name} className="flex justify-between items-center text-[11px]">
                      <span className="font-bold text-slate-600 truncate max-w-[120px]">{i+1}. {s.name}</span>
                      <span className="font-black text-orange-700">{s.percAusencia.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* TOP 5 - POTENCIAL DE LEITURA */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Potencial de Leitura</h3>
                </div>
                <div className="space-y-3 text-[11px]">
                  {strategicInsights.potentialReading.map((s, i) => (
                    <div key={s.name} className="flex justify-between items-center">
                      <span className="font-bold text-slate-600 truncate max-w-[120px]">{i+1}. {s.name}</span>
                      <span className="font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[10px]">{s.somaLeitura}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : activeTab === 'turmas' ? (
          <motion.div
            key="turmas"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            {/* Class KPIs */}
            {classesStats ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 border-l-8 border-l-green-600">
                    <div className="flex items-center gap-3 mb-6">
                      <Trophy className="w-6 h-6 text-green-600" />
                      <h3 className="font-black text-lg text-slate-800 uppercase tracking-wide">Top 3 Turmas em Fluência</h3>
                    </div>
                    <div className="space-y-4">
                      {classesStats.sortedFluente.map((t, i) => (
                        <div key={`${t.escola}-${t.turma}`} className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                          <div className="flex flex-col">
                            <span className="font-black text-green-950 text-sm truncate max-w-[300px]">{t.escola}</span>
                            <span className="text-xs font-bold text-green-700">{t.turma}</span>
                          </div>
                          <span className="bg-green-600 text-white px-3 py-1 rounded-lg font-black text-sm">{t.fluente}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 border-l-8 border-l-red-500">
                    <div className="flex items-center gap-3 mb-6">
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                      <h3 className="font-black text-lg text-slate-800 uppercase tracking-wide">Top 3 Turmas para Intervenção</h3>
                    </div>
                    <div className="space-y-4">
                      {classesStats.sortedIntervention.map((t, i) => (
                        <div key={`${t.escola}-${t.turma}`} className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                          <div className="flex flex-col">
                            <span className="font-black text-red-950 text-sm truncate max-w-[300px]">{t.escola}</span>
                            <span className="text-xs font-bold text-red-700">{t.turma}</span>
                          </div>
                          <span className="bg-red-500 text-white px-3 py-1 rounded-lg font-black text-sm">{t.preTotal}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Internal Disparity Alerts */}
                <div className="bg-orange-50 border-2 border-orange-200 rounded-3xl p-8 shadow-sm">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="bg-orange-500 p-3 rounded-2xl shadow-lg shadow-orange-200">
                      <AlertTriangle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-orange-950 italic leading-tight">Alerta de Disparidade Interna nas Escolas</h3>
                      <p className="text-sm font-bold text-orange-700 uppercase tracking-widest">Variação de Desempenho entre turmas da mesma unidade</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Panel 1: Fluentes Disparity */}
                    <div className="bg-white/60 p-6 rounded-2xl border border-orange-100">
                      <h4 className="flex items-center gap-2 text-lg font-black text-slate-800 mb-6 uppercase tracking-tighter">
                        <div className="w-2 h-6 bg-green-500 rounded-full" />
                        Maiores Disparidades em LEITORES FLUENTES
                      </h4>
                      <div className="space-y-4">
                        {classesStats.topDisparityFluente.map((item, i) => (
                          <div key={`dispar-flu-${i}`} className="p-4 bg-white rounded-xl shadow-sm border-l-4 border-green-500">
                            <p className="font-black text-slate-800 text-sm mb-1 leading-tight">{item.name}</p>
                            <p className="text-xs font-bold text-slate-500 italic">
                              Variação de <span className="text-green-600 underline decoration-2">{item.deltaFluente} pontos percentuais</span> em Leitores Fluentes entre turmas (de {item.minFluente}% a {item.maxFluente}%)
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Panel 2: Pre-Leitores Disparity */}
                    <div className="bg-white/60 p-6 rounded-2xl border border-orange-100">
                      <h4 className="flex items-center gap-2 text-lg font-black text-slate-800 mb-6 uppercase tracking-tighter">
                        <div className="w-2 h-6 bg-red-500 rounded-full" />
                        Maiores Disparidades em PRÉ-LEITORES
                      </h4>
                      <div className="space-y-4">
                        {classesStats.topDisparityPre.map((item, i) => (
                          <div key={`dispar-pre-${i}`} className="p-4 bg-white rounded-xl shadow-sm border-l-4 border-red-500">
                            <p className="font-black text-slate-800 text-sm mb-1 leading-tight">{item.name}</p>
                            <p className="text-xs font-bold text-slate-500 italic">
                              Variação de <span className="text-red-600 underline decoration-2">{item.deltaPre} pontos percentuais</span> em Pré-Leitores (de {item.minPre}% a {item.maxPre}%)
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white p-20 rounded-3xl text-center border-2 border-dashed border-gray-200">
                <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-xl font-bold text-gray-400">Dados por turma indisponíveis para este município.</p>
              </div>
            )}

            {classesStats && (
              <>
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-8 bg-slate-50 border-b border-gray-100 flex flex-wrap justify-between items-center gap-6">
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 italic">Análise de Proficiência por Turma</h2>
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Detalhamento dos Níveis de Alfabetização</p>
                    </div>
                    <div className="relative min-w-[350px]">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input 
                        type="text"
                        placeholder="Pesquisar escola ou turma..."
                        className="w-full pl-12 pr-6 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none font-bold text-slate-700 shadow-sm"
                        value={turmaSearch}
                        onChange={(e) => setTurmaSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Syncronized Top Scrollbar */}
                  <div 
                    ref={topScrollRef}
                    onScroll={() => syncScroll(topScrollRef, bottomScrollRef)}
                    className="overflow-x-auto overflow-y-hidden border-b border-gray-200 bg-slate-50 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent"
                    style={{ height: '14px' }}
                  >
                    <div style={{ width: `${tableScrollWidth}px`, height: '1px' }} />
                  </div>
                  
                  <div 
                    ref={bottomScrollRef}
                    onScroll={() => syncScroll(bottomScrollRef, topScrollRef)}
                    className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300"
                  >
                    <table className="w-full text-left text-sm whitespace-nowrap min-w-[1100px]">
                      <thead className="bg-white border-b border-gray-100 sticky top-0 z-10 text-[10px] uppercase font-black text-slate-400">
                        <tr>
                          <th className="px-6 py-5 cursor-pointer hover:text-slate-800 transition-colors" onClick={() => setTurmaSort({ key: 'escola', direction: turmaSort.direction === 'asc' ? 'desc' : 'asc' })}>Escola</th>
                          <th className="px-4 py-5 text-center cursor-pointer hover:text-slate-800 font-black" onClick={() => setTurmaSort({ key: 'turma', direction: turmaSort.direction === 'asc' ? 'desc' : 'asc' })}>Turma</th>
                          <th className="px-4 py-5 text-center cursor-pointer hover:text-blue-800 bg-blue-50/50" onClick={() => setTurmaSort({ key: 'ifl', direction: turmaSort.direction === 'asc' ? 'desc' : 'asc' })}>IFL (0-10)</th>
                          <th className="px-4 py-5 text-center cursor-pointer hover:text-slate-800" onClick={() => setTurmaSort({ key: 'previstos', direction: turmaSort.direction === 'asc' ? 'desc' : 'asc' })}>Prev.</th>
                          <th className="px-4 py-5 text-center cursor-pointer hover:text-slate-800" onClick={() => setTurmaSort({ key: 'avaliados', direction: turmaSort.direction === 'asc' ? 'desc' : 'asc' })}>Aval.</th>
                          <th className="px-4 py-5 text-center cursor-pointer hover:text-slate-800" onClick={() => setTurmaSort({ key: 'preTotal', direction: turmaSort.direction === 'asc' ? 'desc' : 'asc' })}>Pré-Leitor</th>
                          <th className="px-4 py-5 text-center">N1</th>
                          <th className="px-4 py-5 text-center">N2</th>
                          <th className="px-4 py-5 text-center">N3</th>
                          <th className="px-4 py-5 text-center">N4</th>
                          <th className="px-4 py-5 text-center cursor-pointer hover:text-slate-800" onClick={() => setTurmaSort({ key: 'iniciante', direction: turmaSort.direction === 'asc' ? 'desc' : 'asc' })}>Inic.</th>
                          <th className="px-6 py-5 text-right cursor-pointer hover:text-slate-800" onClick={() => setTurmaSort({ key: 'fluente', direction: turmaSort.direction === 'asc' ? 'desc' : 'asc' })}>Fluente</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {classesStats.filtered.map((t: any) => (
                          <tr key={`${t.escola}-${t.turma}`} className="hover:bg-slate-50 transition-all group">
                            <td className="px-6 py-4 font-black text-slate-700 text-[13px]">{t.escola}</td>
                            <td className="px-4 py-4 text-center font-bold text-slate-500">{t.turma}</td>
                            <td className="px-4 py-4 text-center font-black text-blue-600 bg-blue-50/20">{t.ifl}</td>
                            <td className="px-4 py-4 text-center font-bold text-slate-400">{t.previstos}</td>
                            <td className="px-4 py-4 text-center font-bold text-slate-400">{t.avaliados}</td>
                            <td className={`px-4 py-4 text-center font-black transition-colors ${t.preTotal >= ((currentMunicipality as any).thresholds?.preTotal || 60) ? 'bg-red-100 text-red-700' : 'text-slate-700'}`}>
                              {t.preTotal}%
                            </td>
                            <td className="px-4 py-4 text-center font-bold text-red-300">{t.n1}%</td>
                            <td className="px-4 py-4 text-center font-bold text-red-300">{t.n2}%</td>
                            <td className="px-4 py-4 text-center font-bold text-orange-300">{t.n3}%</td>
                            <td className="px-4 py-4 text-center font-bold text-yellow-500">{t.n4}%</td>
                            <td className="px-4 py-4 text-center font-bold text-green-500">{t.iniciante}%</td>
                            <td className={`px-6 py-4 text-right font-black transition-colors ${t.fluente >= ((currentMunicipality as any).thresholds?.fluente || 40) ? 'bg-green-100 text-green-800' : 'text-green-900'}`}>
                              {t.fluente}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* New Section: School Performance IFL Chart */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 italic">Desempenho Geral das Escolas (IFL)</h3>
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Média por unidade vs Média da Rede ({classesStats.networkAvgIFL})</p>
                    </div>
                  </div>
                  <div className="max-h-[600px] overflow-y-auto rounded-xl pr-2">
                    <div style={{ height: Math.max(600, classesStats.schoolPerformanceChart.length * 40), width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={classesStats.schoolPerformanceChart} 
                          layout="vertical" 
                          margin={{ left: 20, right: 60, top: 20, bottom: 20 }}
                        >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" domain={[0, 10]} hide />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          width={300} 
                          tick={{ fontSize: 10, fontWeight: 900, fill: '#475569' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          cursor={{ fill: '#f8fafc' }} 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white px-4 py-3 shadow-2xl border border-slate-100 rounded-2xl">
                                  <p className="font-black text-slate-800 text-sm mb-1">{payload[0].payload.name}</p>
                                  <p className="text-xs font-bold text-blue-600 uppercase tracking-tighter">IFL Médio: {payload[0].value}</p>
                                </div>
                              );
                            }
                            return null;
                          }} 
                        />
                        <Bar dataKey="ifl" radius={[0, 8, 8, 0]} barSize={24}>
                          {classesStats.schoolPerformanceChart.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.ifl >= classesStats.networkAvgIFL ? '#16a34a' : '#e11d48'} />
                          ))}
                        </Bar>
                        <ReferenceLine 
                          x={classesStats.networkAvgIFL} 
                          stroke="#64748b" 
                          strokeWidth={2}
                          strokeDasharray="8 4" 
                          label={{ 
                            position: 'top', 
                            value: `Média Rede: ${classesStats.networkAvgIFL}`, 
                            fill: '#475569', 
                            fontSize: 11, 
                            fontWeight: 900,
                            offset: 15
                          }} 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
        ) : activeTab === 'evolucao' ? (
          <motion.div
            key="evolucao"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            {/* IFL Evolution Highlight */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 border-b-8 border-b-green-600 flex flex-col justify-between">
                  <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-2">IFL Geral da Rede</p>
                  <div className="flex items-end gap-3">
                    <span className="text-5xl font-black text-slate-800">{municipalStats.ifl}</span>
                    <div className="flex items-center gap-1 text-green-600 font-black text-lg mb-1">
                       <TrendingUp className="w-5 h-5" />
                       <span>↑ 0.4</span>
                    </div>
                  </div>
                  <p className="text-slate-500 font-bold text-xs mt-4 italic">Meta Ciclo 2026: 7.5</p>
               </div>
               
               <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 md:col-span-2 flex items-center gap-6">
                  <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                     <Trophy className="w-8 h-8" />
                  </div>
                  <div>
                     <h3 className="text-slate-800 font-black text-lg uppercase">Indicador de Avanço Estratégico</h3>
                     <p className="text-slate-500 font-bold text-sm leading-relaxed">
                        A rede municipal de Atibaia apresentou um avanço de 6.2% no índice de fluência nos primeiros simulados de 2026.
                     </p>
                  </div>
               </div>
            </div>

            {/* Sub-navigation Headers */}
            <div className="flex justify-center gap-4 bg-slate-100 p-2 rounded-2xl w-fit mx-auto shadow-inner border border-gray-200">
              <button 
                onClick={() => setEvolucaoSubTab('coleta')}
                className={`flex items-center gap-3 px-8 py-3 rounded-xl font-black text-sm transition-all ${evolucaoSubTab === 'coleta' ? 'bg-white shadow-md text-green-700' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Activity className="w-5 h-5" /> Painel de Coleta
              </button>
              <button 
                onClick={() => setEvolucaoSubTab('mapa')}
                className={`flex items-center gap-3 px-8 py-3 rounded-xl font-black text-sm transition-all ${evolucaoSubTab === 'mapa' ? 'bg-white shadow-md text-green-700' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Layers className="w-5 h-5" /> Mapa de Evolução
              </button>
            </div>

            {evolucaoSubTab === 'mapa' ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Evolution Table */}
                  <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 bg-slate-50 border-b border-gray-100 flex justify-between items-center">
                      <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Mapa de Evolução Individual</h2>
                      <div className="flex items-center gap-3 bg-green-50 px-5 py-2 rounded-full text-green-800 border border-green-100 font-black text-xs">
                        {studentsData.length} Alunos Mapeados
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-white text-slate-400 font-black uppercase text-[10px] border-b">
                          <tr>
                            <th className="px-6 py-5">Aluno</th>
                            <th className="px-4 py-5 text-center">Entrada</th>
                            <th className="px-4 py-5 text-center">Simul. 1</th>
                            <th className="px-4 py-5 text-center">Evol. A</th>
                            <th className="px-4 py-5 text-center">Simul. 2</th>
                            <th className="px-4 py-5 text-center">Evol. B</th>
                            <th className="px-6 py-5 text-right">Saída</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {studentsData.map(student => {
                            const evolA = getEvolutionLabel(student.entrada, student.s1);
                            const evolB = getEvolutionLabel(student.s1, student.s2);
                            
                            return (
                              <tr key={student.id} className="hover:bg-slate-50 transition-all font-bold text-sm">
                                <td className="px-6 py-5 text-slate-700">{student.name}</td>
                                <td className="px-4 py-5 text-center">
                                  <select 
                                    value={student.entrada} 
                                    onChange={(e) => {
                                      const newData = [...studentsData];
                                      newData.find(s => s.id === student.id)!.entrada = e.target.value;
                                      setStudentsData(newData);
                                    }}
                                    className="bg-slate-100 border-none rounded-lg px-2 py-1 text-xs font-black"
                                  >
                                    {EVOLUTION_LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                                  </select>
                                </td>
                                <td className="px-4 py-5 text-center font-black text-slate-500">{student.s1}</td>
                                <td className="px-4 py-5 text-center">
                                  <span className={`px-2 py-1 rounded text-[10px] text-white font-black whitespace-nowrap ${evolA.color}`}>
                                    {evolA.label}
                                  </span>
                                </td>
                                <td className="px-4 py-5 text-center font-black text-slate-500">{student.s2}</td>
                                <td className="px-4 py-5 text-center">
                                  <span className={`px-2 py-1 rounded text-[10px] text-white font-black whitespace-nowrap ${evolB.color}`}>
                                    {evolB.label}
                                  </span>
                                </td>
                                <td className="px-6 py-5 text-right font-black">
                                  <select 
                                    value={student.saida} 
                                    onChange={(e) => {
                                      const newData = [...studentsData];
                                      newData.find(s => s.id === student.id)!.saida = e.target.value;
                                      setStudentsData(newData);
                                    }}
                                    className="bg-green-100 border-none rounded-lg px-2 py-1 text-xs font-black text-green-900"
                                  >
                                    {EVOLUTION_LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                                  </select>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Evolution Chart */}
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-black text-slate-800 mb-8 border-b pb-4 uppercase tracking-wider">Distribuição de Evolução</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={evolutionStats}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {evolutionStats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" align="center" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                      <div className="flex gap-3">
                        <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <p className="text-xs text-blue-900 font-bold leading-relaxed">
                          O "Avanço Excepcional" sinaliza alunos que saltaram 3+ níveis no protocoloco CAEd. Priorize reforço para casos em "Regressão".
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Internal Disparity Alerts */}
                <div className="bg-orange-50 border-2 border-orange-200 rounded-3xl p-8 shadow-sm">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="bg-orange-500 p-3 rounded-2xl shadow-lg shadow-orange-200">
                      <AlertTriangle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-orange-950 italic leading-tight">Alerta de Disparidade Interna nas Escolas</h3>
                      <p className="text-sm font-bold text-orange-700 uppercase tracking-widest">Variação de Desempenho entre turmas da mesma unidade</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Panel 1: Fluentes Disparity */}
                    <div className="bg-white/60 p-6 rounded-2xl border border-orange-100">
                      <h4 className="flex items-center gap-2 text-lg font-black text-slate-800 mb-6 uppercase tracking-tighter">
                        <div className="w-2 h-6 bg-green-500 rounded-full" />
                        Maiores Disparidades em LEITORES FLUENTES
                      </h4>
                      <div className="space-y-4">
                        {classesStats.topDisparityFluente.map((item, i) => (
                          <div key={`dispar-flu-${i}`} className="p-4 bg-white rounded-xl shadow-sm border-l-4 border-green-500">
                            <p className="font-black text-slate-800 text-sm mb-1 leading-tight">{item.name}</p>
                            <p className="text-xs font-bold text-slate-500 italic">
                              Variação de <span className="text-green-600 underline decoration-2">{item.deltaFluente} pontos percentuais</span> em Leitores Fluentes entre turmas (de {item.minFluente}% a {item.maxFluente}%)
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Panel 2: Pre-Leitores Disparity */}
                    <div className="bg-white/60 p-6 rounded-2xl border border-orange-100">
                      <h4 className="flex items-center gap-2 text-lg font-black text-slate-800 mb-6 uppercase tracking-tighter">
                        <div className="w-2 h-6 bg-red-500 rounded-full" />
                        Maiores Disparidades em PRÉ-LEITORES
                      </h4>
                      <div className="space-y-4">
                        {classesStats.topDisparityPre.map((item, i) => (
                          <div key={`dispar-pre-${i}`} className="p-4 bg-white rounded-xl shadow-sm border-l-4 border-red-500">
                            <p className="font-black text-slate-800 text-sm mb-1 leading-tight">{item.name}</p>
                            <p className="text-xs font-bold text-slate-500 italic">
                              Variação de <span className="text-red-600 underline decoration-2">{item.deltaPre} pontos percentuais</span> em Pré-Leitores (de {item.minPre}% a {item.maxPre}%)
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
                <div className="max-w-4xl mx-auto space-y-8">
                  <div className="bg-green-900 text-white p-10 rounded-3xl shadow-xl relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-800 rounded-full -mr-20 -mt-20 opacity-50"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-green-800 rounded-full -ml-10 -mb-10 opacity-30"></div>

                    <div className="relative z-10 flex flex-col items-center text-center">
                       <div className="p-4 bg-white/10 rounded-2xl mb-6 backdrop-blur-md">
                         <Activity className="w-12 h-12 text-white" />
                       </div>
                       <h2 className="text-3xl font-black mb-4">Painel de Coleta de Voz AI</h2>
                       <p className="text-green-100 font-bold max-w-lg">
                         Pronto para iniciar a coleta estratégica? O motor PIPA AI está configurado com Threshold reduzido para identificar sussurros e soletração.
                       </p>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10 w-full">
                          {studentsData.slice(0, 4).map(s => (
                            <button 
                              key={s.id}
                              onClick={() => handleStartColeta(s.name)}
                              className="bg-white/10 hover:bg-white/20 border border-white/20 p-6 rounded-2xl text-left transition-all group active:scale-95"
                            >
                               <div className="flex justify-between items-center">
                                 <div>
                                   <p className="text-green-300 text-xs font-black uppercase tracking-widest mb-1">Pendente</p>
                                   <p className="font-black text-sm">{s.name}</p>
                                 </div>
                                 <ArrowRightCircle className="w-6 h-6 text-white/40 group-hover:text-white transition-all" />
                               </div>
                            </button>
                          ))}
                       </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                     <h3 className="font-black text-slate-800 mb-6 flex items-center gap-3">
                        <Filter className="w-5 h-5 text-green-600" />
                        Configurações Técnicas do Motor
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 bg-slate-50 rounded-xl">
                           <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Sensibilidade</p>
                           <p className="font-black text-green-700">Threshold: Baixo (Alta Precisão)</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl">
                           <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Repetição</p>
                           <p className="font-black text-green-700">Janela de 2s (Debounce On)</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl">
                           <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Autocorreção</p>
                           <p className="font-black text-green-700">Ativa (Último Registro)</p>
                        </div>
                     </div>
                  </div>
                </div>
            )}
          </motion.div>
        ) : activeTab === 'porte' ? (
          <motion.div
            key="porte"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Group Selector */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex gap-4">
                {['Pequeno', 'Médio', 'Grande'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGroup(g as any)}
                    className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${
                      selectedGroup === g 
                        ? 'bg-green-900 text-white shadow-lg' 
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    Porte {g}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 bg-green-50 px-5 py-3 rounded-2xl border border-green-100 text-green-900">
                <Users className="w-5 h-5" />
                <span className="font-black text-sm uppercase">Total de Unidades: {groupData?.count}</span>
              </div>
            </div>

            {groupData && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Gráfico A: Ranking por IFL (0-10) */}
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-[18pt] font-black text-slate-800 mb-8 border-b pb-4 italic underline decoration-blue-400">
                      Ranking por IFL (0-10)
                    </h2>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={groupData.sortedSchools} layout="vertical" margin={{ left: 50, right: 30 }}>
                          <XAxis type="number" domain={[0, 10]} hide />
                          <YAxis 
                            type="category" 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tickFormatter={(val) => truncateName(val, 12)}
                            tick={{ fontSize: 13, fill: '#475569', fontWeight: 'bold' }} 
                            width={100}
                          />
                          <Tooltip 
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            formatter={(value: any) => [`${value}`, 'IFL']}
                            labelFormatter={(name) => `Escola: ${name}`}
                          />
                          <Bar dataKey="iflRaw" fill="#64748b" radius={[0, 8, 8, 0]} barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Gráfico B: Ranking por % de Leitores */}
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-[18pt] font-black text-slate-800 mb-8 border-b pb-4 italic underline decoration-green-600">
                      Ranking por % de Leitores
                    </h2>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={groupData.sortedSchools} layout="vertical" margin={{ left: 50, right: 30 }}>
                          <XAxis type="number" domain={[0, 100]} hide />
                          <YAxis 
                            type="category" 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tickFormatter={(val) => truncateName(val, 12)}
                            tick={{ fontSize: 13, fill: '#475569', fontWeight: 'bold' }} 
                            width={100}
                          />
                          <Tooltip 
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            formatter={(value: any) => [`${value}%`, 'Leitores']}
                            labelFormatter={(name) => `Escola: ${name}`}
                          />
                          <Bar dataKey="leitores" fill={COLORS.fluente} radius={[0, 8, 8, 0]} barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Gráfico de Benchmarking - Largura Total */}
                <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
                  <h2 className="text-[18pt] font-black text-slate-800 mb-8 border-b pb-4 italic text-center underline decoration-orange-500">
                    Benchmarking de Curva (Spline): Escola vs. Média do Porte
                  </h2>
                  <div className="h-[450px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart 
                        data={groupData.groupLevelsAvg.map((ga, i) => ({
                          name: ga.name,
                          grupo: ga.value,
                          escola: currentSchoolData.detailedLevels[i].value
                        }))}
                        margin={{ top: 20, right: 40, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b', fontWeight: 'bold' }} />
                        <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 14, fill: '#94a3b8' }} tickFormatter={(v) => `${v}%`} />
                        <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', padding: '20px' }} />
                        <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '30px' }} />
                        <Area 
                          type="monotone" 
                          dataKey="grupo" 
                          name={`Média Porte ${selectedGroup}`} 
                          stroke="#94a3b8" 
                          strokeWidth={3} 
                          fill="#f8fafc" 
                          fillOpacity={0.6} 
                          strokeDasharray="5 5" 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="escola" 
                          name={`Unidade: ${currentSchoolData.name}`} 
                          stroke={COLORS.fluente} 
                          strokeWidth={5} 
                          fill={COLORS.fluente} 
                          fillOpacity={0.1}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}

            {/* Tabela de Resumo por Porte */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 bg-slate-50 border-b border-gray-200">
                <h2 className="text-[18pt] font-black text-green-950">Consolidado por Porte Escola</h2>
                <p className="text-[16pt] text-gray-500 font-bold uppercase mt-1">Comparativo de Eficiência entre Grupos A, B e C</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white text-slate-400 font-black uppercase text-[10px] border-b">
                    <tr>
                      <th className="px-8 py-5">Grupo / Porte</th>
                      <th className="px-8 py-5 text-center">Unidades</th>
                      <th className="px-8 py-5 text-center">Média IFL</th>
                      <th className="px-8 py-5 text-right">Média Participação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {porteSummary.map((ps) => (
                      <tr key={ps.porte} className="hover:bg-slate-50 transition-all">
                        <td className="px-8 py-5 font-black text-slate-800">Porte {ps.porte}</td>
                        <td className="px-8 py-5 text-center font-bold text-slate-500">{ps.count} Unidades</td>
                        <td className="px-8 py-5 text-center">
                          <span className="bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full font-black text-sm shadow-sm">
                            {ps.avgIFL}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right font-black text-green-700 text-lg">{ps.avgPart}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : activeTab === 'perf' ? (
          <motion.div
            key="perf"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Control Bar */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-wrap items-center gap-6">
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text"
                  placeholder="Nome da escola... (Tecle Enter)"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-green-100 outline-none font-bold text-slate-700 placeholder-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearch}
                />
              </div>
              <div className="relative min-w-[300px]">
                <School className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600 w-5 h-5 pointer-events-none" />
                <select
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-green-100 appearance-none font-black text-slate-700"
                >
                  <option value="">Filtrar por Unidade Escolar</option>
                  {SCHOOLS_DATA.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <button 
                onClick={handleDownloadPDF}
                className="flex items-center gap-3 bg-green-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-green-800 transition-all shadow-lg active:scale-95"
              >
                <Download className="w-5 h-5" />
                Gerar Relatório Pedagógico (PDF)
              </button>
            </div>

            {/* Insight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border-l-8 border-l-blue-600 border border-gray-100 flex items-start gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><TrendingUp className="w-6 h-6" /></div>
                <div>
                  <h3 className="text-blue-900 font-black text-lg mb-1 italic">Apontamento Principal</h3>
                  <p className="text-slate-600 font-bold leading-relaxed">{pedagogicalAnalysis.comparative_analysis}</p>
                </div>
              </div>
              
              {pedagogicalAnalysis.hasAlert && (
                <div className="bg-white p-8 rounded-3xl shadow-sm border-l-8 border-l-red-500 border border-gray-100 flex items-start gap-4 animate-pulse">
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl"><AlertTriangle className="w-6 h-6" /></div>
                  <div>
                    <h3 className="text-red-900 font-black text-lg mb-1 italic">Nível de Alerta</h3>
                    <p className="text-slate-600 font-bold">Resgate Necessário: Concentração crítica nos Níveis 1 ({pedagogicalAnalysis.n1Val}%) e 2 ({pedagogicalAnalysis.n2Val}%).</p>
                  </div>
                </div>
              )}

              {pedagogicalAnalysis.participationAlert && (
                <div className="bg-white p-8 rounded-3xl shadow-sm border-l-8 border-l-orange-500 border border-gray-100 flex items-start gap-4">
                  <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Users className="w-6 h-6" /></div>
                  <div>
                    <h3 className="text-orange-900 font-black text-lg mb-1 italic">Alerta de Abstenção</h3>
                    <p className="text-slate-600 font-bold leading-relaxed">{pedagogicalAnalysis.participationAlert}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Performance Chart */}
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-black text-slate-800 mb-10 border-b border-gray-100 pb-4">Perfil de Performance: {selectedSchool}</h2>
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={pedagogicalAnalysis.chart_data.combinedValues} margin={{ top: 20, right: 40, left: 20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorSchool" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#166534" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#166534" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b', fontWeight: 'bold' }} dy={15} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 14, fill: '#94a3b8' }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', padding: '20px' }} />
                    <Legend verticalAlign="top" align="right" height={50} />
                    <Area 
                      type="monotone" dataKey="school" name={`Unidade: ${selectedSchool}`} 
                      stroke="#166534" strokeWidth={5} fillOpacity={1} fill="url(#colorSchool)"
                      dot={{ r: 8, fill: '#166534', strokeWidth: 3, stroke: '#fff' }}
                    />
                    <Line 
                      type="monotone" dataKey="municipal" name="Média da Rede Municipal" 
                      stroke="#94a3b8" strokeWidth={3} strokeDasharray="10 10" dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Specialized Ranking Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-8 bg-slate-50 border-b border-gray-200 flex justify-between items-center">
                <h2 className="title-bold text-2xl font-black text-green-950">Ranking Pedagógico de Eficiência</h2>
                <span className="text-xs font-black bg-green-200 text-green-900 px-4 py-2 rounded-full uppercase tracking-widest">Base Atibaia 2026</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead className="bg-white text-slate-400 font-black uppercase text-[11px] border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-5">Escola</th>
                      <th className="px-4 py-5 text-center">Prev.</th>
                      <th className="px-4 py-5 text-center">Aval.</th>
                      <th className="px-4 py-5 text-center">% Part.</th>
                      <th className="px-4 py-5 text-center">N1</th>
                      <th className="px-4 py-5 text-center">N2</th>
                      <th className="px-4 py-5 text-center">N3</th>
                      <th className="px-4 py-5 text-center">N4</th>
                      <th className="px-4 py-5 text-center">Inic.</th>
                      <th className="px-4 py-5 text-center">Fluen.</th>
                      <th className="px-6 py-5 text-right">IFL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {SCHOOLS_DATA.sort((a,b) => parseFloat(b.ifl) - parseFloat(a.ifl)).map((school) => (
                      <tr key={school.name} className={`hover:bg-green-50 transition-all ${school.name === selectedSchool ? 'bg-green-100/50' : ''}`}>
                        <td className="px-6 py-4 font-black text-slate-800 text-sm">{school.name}</td>
                        <td className="px-4 py-4 text-center font-bold text-slate-500">{school.previstos}</td>
                        <td className="px-4 py-4 text-center font-bold text-slate-500">{school.avaliados}</td>
                        <td className="px-4 py-4 text-center">
                          <div className={`text-xs inline-flex font-black px-2 py-1 rounded-lg ${school.participacao >= 95 ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
                            {school.participacao}%
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center font-bold text-red-500">{school.n1}%</td>
                        <td className="px-4 py-4 text-center font-bold text-red-400">{school.n2}%</td>
                        <td className="px-4 py-4 text-center font-bold text-orange-400">{school.n3}%</td>
                        <td className="px-4 py-4 text-center font-bold text-yellow-500">{school.n4}%</td>
                        <td className="px-4 py-4 text-center font-bold text-green-500">{school.iniciante}%</td>
                        <td className="px-4 py-4 text-center font-bold text-green-800">{school.fluente}%</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`px-4 py-2 rounded-xl text-lg font-black ${
                            parseFloat(school.ifl) >= 6.0 
                              ? 'bg-blue-600 text-white shadow-md' 
                              : parseFloat(school.ifl) <= 4.0 
                                ? 'bg-red-500 text-white shadow-md border-2 border-red-200' 
                                : 'bg-orange-100 text-orange-700'
                          }`}>
                            {school.ifl}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-yellow-100 rounded-xl"><Lightbulb className="text-yellow-600 w-8 h-8" /></div>
                <h2 className="text-2xl font-black text-slate-800 font-bold">Unidades de Alto IFL (&gt; 6.0)</h2>
              </div>
              <div className="space-y-4">
                {SCHOOLS_DATA.filter(s => parseFloat(s.ifl) >= 6.0).map((school) => (
                  <div key={school.name} className="flex items-center justify-between p-5 bg-green-50 rounded-2xl border border-green-100">
                    <span className="font-bold text-green-900 text-lg">{school.name}</span>
                    <div className="bg-green-800 text-white px-4 py-1 rounded-full font-black">IFL {school.ifl}</div>
                  </div>
                ))}
                {SCHOOLS_DATA.filter(s => parseFloat(s.ifl) >= 6.0).length === 0 && (
                  <p className="text-gray-400 font-medium italic">Nenhuma escola atingiu IFL &gt; 6.0 nesta edição.</p>
                )}
              </div>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 border-t-8 border-t-red-500">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-red-100 rounded-xl"><AlertTriangle className="text-red-600 w-8 h-8" /></div>
                <h2 className="text-2xl font-black text-slate-800 font-bold">Resgate Prioritário (N1 ou N2 Elevados)</h2>
              </div>
              <div className="space-y-4 h-[400px] overflow-y-auto pr-2">
                {SCHOOLS_DATA.filter(s => s.n1 > 10 || s.n2 > 15).sort((a,b) => b.n1 - a.n1).map((school) => (
                  <div key={school.name} className="flex items-center justify-between p-5 bg-red-50 rounded-2xl border border-red-100 transition-all hover:bg-red-100">
                    <span className="font-bold text-red-950 text-base">{school.name}</span>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-black text-red-400">N1: {school.n1}% | N2: {school.n2}%</p>
                      <p className="text-xl font-black text-red-700">Crítico</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 text-center"
            >
              <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-4 uppercase">Padrão Detectado!</h2>
              <p className="text-slate-600 font-bold mb-8 leading-relaxed">
                O sistema identificou um padrão de <span className="text-orange-600">Soletração/Silabação</span> para o aluno <b>{selectedStudentForColeta}</b>.
              </p>
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Confirmação Pedagógica CAEd</p>
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-full bg-orange-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-orange-700 transition-all"
                >
                  Confirmar Nível 2 (Silbação)
                </button>
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-full bg-slate-100 text-slate-600 font-black py-4 rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Descartar Coleta
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
}
