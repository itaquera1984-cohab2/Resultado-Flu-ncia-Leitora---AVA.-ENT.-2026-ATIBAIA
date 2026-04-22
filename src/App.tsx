/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ReferenceLine 
} from 'recharts';
import { 
  LayoutDashboard, School, Trophy, Users, CheckCircle, ArrowRightCircle, 
  AlertTriangle, Search, Filter, Calendar, Layers, Activity, Lightbulb, FileText, Download, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SCHOOLS_DATA, COLORS, MUNICIPAL_AVERAGE_DETAILED } from './constants';

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

const NavToggle = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: 'panorama' | 'perf' | 'insights' | 'porte') => void }) => (
  <div className="flex bg-gray-200 p-2 rounded-2xl w-fit mx-auto shadow-inner">
    {[
      { id: 'panorama', label: 'Visão Geral' },
      { id: 'perf', label: 'Performance por Escola' },
      { id: 'insights', label: 'Insights' },
      { id: 'porte', label: 'Análise por Porte Escolar' },
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
  const [activeTab, setActiveTab] = useState<'panorama' | 'perf' | 'insights' | 'porte'>('panorama');
  const [selectedSchool, setSelectedSchool] = useState(SCHOOLS_DATA[0].name);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<'Pequeno' | 'Médio' | 'Grande'>('Médio');
  
  const [edition, setEdition] = useState("2026");
  const [period, setPeriod] = useState("Saída");
  const [network, setNetwork] = useState("Municipal");

  const currentSchoolData = useMemo(() => 
    SCHOOLS_DATA.find(s => s.name === selectedSchool) || SCHOOLS_DATA[0]
  , [selectedSchool]);

  const municipalStats = useMemo(() => {
    const totalAvaliados = SCHOOLS_DATA.reduce((acc, s) => acc + s.avaliados, 0);
    const avgIFL = SCHOOLS_DATA.reduce((acc, s) => acc + parseFloat(s.ifl), 0) / SCHOOLS_DATA.length;
    return {
      totalAvaliados: totalAvaliados.toLocaleString('pt-BR'),
      ifl: avgIFL.toFixed(1),
      leitores: (SCHOOLS_DATA.reduce((acc, s) => acc + s.leitores, 0) / SCHOOLS_DATA.length).toFixed(1) + "%"
    };
  }, []);

  const municipalDistribution = useMemo(() => [
    { name: "Fluentes", value: SCHOOLS_DATA.reduce((acc, s) => acc + s.fluente, 0) / SCHOOLS_DATA.length, color: COLORS.fluente },
    { name: "Iniciantes", value: SCHOOLS_DATA.reduce((acc, s) => acc + s.iniciante, 0) / SCHOOLS_DATA.length, color: COLORS.iniciante },
    { name: "Pré-leitores", value: SCHOOLS_DATA.reduce((acc, s) => acc + (s.n1 + s.n2 + s.n3 + s.n4), 0) / SCHOOLS_DATA.length, color: COLORS.preLeitor4 },
  ], []);

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
  }, []);

  const schoolsByPorte = useMemo(() => {
    return SCHOOLS_DATA.map(s => {
      let porte: 'Pequeno' | 'Médio' | 'Grande';
      if (s.previstos <= 40) porte = 'Pequeno';
      else if (s.previstos <= 90) porte = 'Médio';
      else porte = 'Grande';
      return { ...s, porte };
    });
  }, []);

  const porteSummary = useMemo(() => {
    const groups = ['Pequeno', 'Médio', 'Grande'] as const;
    return groups.map(g => {
      const schools = schoolsByPorte.filter(s => s.porte === g);
      const avgIFLValue = schools.reduce((acc, s) => acc + parseFloat(s.ifl), 0) / schools.length;
      const avgPartValue = schools.reduce((acc, s) => acc + s.participacao, 0) / schools.length;
      return { porte: g, avgIFL: avgIFLValue.toFixed(1), avgPart: avgPartValue.toFixed(1), count: schools.length };
    });
  }, [schoolsByPorte]);

  const groupData = useMemo(() => {
    const schoolsInGroup = schoolsByPorte.filter(s => s.porte === selectedGroup);
    if (schoolsInGroup.length === 0) return null;

    const avgIFL = (schoolsInGroup.reduce((acc, s) => acc + parseFloat(s.ifl), 0) / schoolsInGroup.length).toFixed(1);
    
    // Aggregating detailed levels for spline chart
    const levelsSum = [0, 0, 0, 0, 0, 0];
    schoolsInGroup.forEach(s => {
      s.detailedLevels.forEach((dl, i) => {
        levelsSum[i] += dl.value;
      });
    });
    const groupLevelsAvg = levelsSum.map((val, i) => ({
      name: schoolsInGroup[0].detailedLevels[i].name,
      value: Math.round(val / schoolsInGroup.length)
    }));

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
    const mAvgFluents = MUNICIPAL_AVERAGE_DETAILED.find(d => d.name === "Leitor Fluente")?.value || 0;
    const sFluents = currentSchoolData.fluente;
    const diff = sFluents - mAvgFluents;
    
    let pointer = "";
    if (diff > 0) {
      pointer = `A Unidade Escolar ${currentSchoolData.name} apresenta um índice de Leitores Fluentes ${diff.toFixed(1)}% acima da média da rede.`;
    } else {
      pointer = `A Unidade Escolar ${currentSchoolData.name} está ${Math.abs(diff).toFixed(1)}% abaixo da média municipal em Fluência. Foco em aceleração necessário.`;
    }

    const preReadersAll = currentSchoolData.n1 + currentSchoolData.n2;
    const hasAlert = preReadersAll > 15;

    return {
      selected_school: currentSchoolData.name,
      comparative_analysis: pointer,
      hasAlert,
      preReadersAll,
      chart_data: {
        combinedValues: currentSchoolData.detailedLevels.map((dl, idx) => ({
          name: dl.name,
          school: dl.value,
          municipal: MUNICIPAL_AVERAGE_DETAILED[idx].value
        }))
      }
    };
  }, [currentSchoolData]);

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
        {/* Institucional Header - High-End Design */}
        <div className="flex justify-between items-center gap-6" style={{ backgroundColor: '#ffffff', padding: '20px', borderBottom: '3px solid #2563eb', marginBottom: '25px', borderRadius: '8px' }}>
          <div className="flex-shrink-0">
            <img 
              alt="Brasão Atibaia" 
              src="/brasao%20atibaia.png" 
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
              src="/LOGO%20EMPRESA.png" 
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
              <KPI icon={Activity} label="IFL Municipal" value={municipalStats.ifl} colorClass="bg-orange-600" subtitle="Referência Atibaia" />
              <KPI icon={Users} label="Alunos Avaliados" value={municipalStats.totalAvaliados} colorClass="bg-blue-700" subtitle="Rede Total" />
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
                <div className="overflow-y-auto h-[400px] border border-gray-100 rounded-xl scrollbar-thin scrollbar-thumb-gray-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 sticky top-0 z-10 text-slate-500 font-black uppercase text-[10px]">
                      <tr>
                        <th className="px-4 py-3">Escola</th>
                        <th className="px-4 py-3 text-center">Avaliados</th>
                        <th className="px-4 py-3 text-center">IFL</th>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <p className="text-slate-600 font-bold">Resgate Necessário: Concentração alta de alunos nos Níveis 1 e 2 ({pedagogicalAnalysis.preReadersAll}%).</p>
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
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white text-slate-400 font-black uppercase text-[11px] border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-5">Escola</th>
                      <th className="px-4 py-5 text-center">Prev.</th>
                      <th className="px-4 py-5 text-center">Aval.</th>
                      <th className="px-4 py-5 text-center">% Part.</th>
                      <th className="px-4 py-5 text-center">N1+2</th>
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
                        <td className="px-4 py-4 text-center font-bold text-red-400">{school.n1 + school.n2}%</td>
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
                <h2 className="text-2xl font-black text-slate-800 font-bold">Resgate Necessário (N1+N2 &gt; 15%)</h2>
              </div>
              <div className="space-y-4 h-[400px] overflow-y-auto pr-2">
                {SCHOOLS_DATA.filter(s => (s.n1 + s.n2) > 15).sort((a,b) => (b.n1 + b.n2) - (a.n1 + a.n2)).map((school) => (
                  <div key={school.name} className="flex items-center justify-between p-5 bg-red-50 rounded-2xl border border-red-100 transition-all hover:bg-red-100">
                    <span className="font-bold text-red-950 text-base">{school.name}</span>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-black text-red-400">Soletrando/Não lido</p>
                      <p className="text-xl font-black text-red-700">{school.n1 + school.n2}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
}
