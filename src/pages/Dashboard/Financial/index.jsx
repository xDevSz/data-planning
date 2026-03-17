import React, { useState, useEffect } from 'react';
import Navbar from '../../../components/Navbar';
import { appService } from '../../../services/appService';
import { useAlert } from '../../../hooks/useAlert';
import { 
  DollarSign, TrendingUp, TrendingDown, Wallet, Activity, 
  Target, Plus, Trash2, ArrowUpRight, ArrowDownRight, PieChart as PieIcon, Layers
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import './index.css';

export default function Financial() {
  const alertHook = useAlert();
  const [transactions, setTransactions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Input da Planilha (Agora com Categoria)
  const [inputRow, setInputRow] = useState({ 
    category: 'Operacional', description: '', amount: '', type: 'expense' 
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await appService.getFullOverview(); 
      // Ordena transações da mais recente para a mais antiga na tabela
      setTransactions(data.transactions?.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)) || []);
      setProjects(data.projects || []);
    } catch (error) {
      console.error(error);
      alertHook.notifyError("Erro ao sincronizar dados financeiros.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async () => {
    if (!inputRow.description || !inputRow.amount) return alertHook.notifyError("Preencha a descrição e o valor.");
    
    try {
      // Salvamos a categoria no formato "[Categoria] Descrição" para manter a compatibilidade com o BD atual
      const formattedDescription = `[${inputRow.category}] ${inputRow.description}`;

      await appService.createTransaction({
        description: formattedDescription,
        amount: parseFloat(inputRow.amount),
        type: inputRow.type
      });
      
      setInputRow({ category: 'Operacional', description: '', amount: '', type: 'expense' });
      loadData();
      alertHook.notify("Lançamento processado com sucesso!", "success");
    } catch (error) {
      alertHook.notifyError("Erro ao salvar lançamento.");
    }
  };

  const handleDelete = async (id) => {
    if (await alertHook.confirm("Estornar lançamento?", "Isso recalculará todo o saldo do ecossistema.")) {
      await appService.deleteTransaction(id);
      loadData();
      alertHook.notify("Lançamento estornado.");
    }
  };

  const currency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  // --- CÁLCULOS E INTELIGÊNCIA FINANCEIRA ---
  const totalReceitas = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
  const totalDespesas = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
  const saldo = totalReceitas - totalDespesas;
  
  // Runway (Meses de Sobrevivência) - Cálculo simplificado: Saldo / Média de Gasto (Assumindo despesa total como proxy de queima mensal para protótipo)
  const burnRate = totalDespesas > 0 ? totalDespesas / (transactions.length || 1) * 10 : totalDespesas; // Fator multiplicador simulado
  const runway = saldo > 0 && burnRate > 0 ? (saldo / burnRate).toFixed(1) : 0;

  // --- DADOS PARA GRÁFICOS ---
  // 1. Gráfico de Rosca (Despesas vs Receitas)
  const pieData = [
    { name: 'Receitas', value: totalReceitas, color: 'var(--neon-green)' },
    { name: 'Despesas', value: totalDespesas, color: 'var(--alert-red)' }
  ];

  // 2. Gráfico de Fluxo de Caixa (Evolução do Saldo)
  // Precisamos inverter a ordem (mais antiga -> mais nova) para fazer sentido na linha do tempo
  let runningBalance = 0;
  const chartData = [...transactions].reverse().map((t, index) => {
    const val = Number(t.amount);
    runningBalance += t.type === 'income' ? val : -val;
    return {
      name: `Lanç. ${index + 1}`,
      Entrada: t.type === 'income' ? val : 0,
      Saída: t.type === 'expense' ? val : 0,
      Saldo: runningBalance
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-label">{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{color: p.color || p.stroke, margin: 0, fontWeight: 'bold'}}>
              {p.name}: {currency(p.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fin-wrapper">
      <Navbar />
      
      <main className="fin-content fade-in">
        
        {/* HEADER */}
        <header className="fin-header">
          <div className="header-info">
            <h1 className="page-title"><Wallet className="text-neon-green mr-2"/> Tesouraria & Resultados</h1>
            <p className="page-subtitle">Acompanhe o fluxo de caixa, queima de capital e a saúde orçamentária dos seus projetos.</p>
          </div>
        </header>

        {/* --- KPIs PRINCIPAIS --- */}
        <div className="fin-grid-top">
          <div className="fin-kpi-card border-green">
            <div className="kpi-icon-wrapper bg-green-glow"><ArrowUpRight size={24} className="text-neon-green"/></div>
            <div className="kpi-data">
              <span>Capital Entrante</span>
              <strong>{currency(totalReceitas)}</strong>
            </div>
          </div>
          
          <div className="fin-kpi-card border-red">
            <div className="kpi-icon-wrapper bg-red-glow"><ArrowDownRight size={24} className="text-alert-red"/></div>
            <div className="kpi-data">
              <span>Capital Queimado (Burn)</span>
              <strong>{currency(totalDespesas)}</strong>
            </div>
          </div>

          <div className={`fin-kpi-card ${saldo >= 0 ? 'border-purple' : 'border-red'}`}>
            <div className="kpi-icon-wrapper bg-purple-glow"><DollarSign size={24} className="text-neon-purple"/></div>
            <div className="kpi-data">
              <span>Saldo em Caixa</span>
              <strong className={saldo >= 0 ? 'text-white' : 'text-alert-red'}>{currency(saldo)}</strong>
            </div>
          </div>

          <div className="fin-kpi-card border-blue">
            <div className="kpi-icon-wrapper bg-blue-glow"><Activity size={24} className="text-cyber-blue"/></div>
            <div className="kpi-data">
              <span>Runway Projetado</span>
              <strong>{runway > 0 ? `${runway} Meses` : 'Crítico'}</strong>
            </div>
          </div>
        </div>

        <div className="fin-grid-main">
          
          {/* --- GRÁFICO: FLUXO DE CAIXA --- */}
          <div className="glass-card col-span-2">
            <div className="card-header">
              <h2 className="card-title"><TrendingUp size={18} className="text-cyber-blue"/> Evolução de Caixa (Cashflow)</h2>
            </div>
            <div className="chart-container" style={{height: '300px'}}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--neon-purple)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--neon-purple)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="name" tick={{fill:'#888', fontSize: 10}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fill:'#888', fontSize: 10}} axisLine={false} tickLine={false} tickFormatter={(value) => `R$${value}`} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="Saldo" stroke="var(--neon-purple)" strokeWidth={3} fillOpacity={1} fill="url(#colorSaldo)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-chart">Faltam dados para projeção.</div>
              )}
            </div>
          </div>

          {/* --- SAÚDE DOS PROJETOS (ORÇAMENTO) --- */}
          <div className="glass-card col-span-1">
            <div className="card-header">
              <h2 className="card-title"><Target size={18} className="text-alert-yellow"/> Controle de Orçamentos</h2>
            </div>
            <div className="budget-list custom-scrollbar">
              {projects.length === 0 ? <p className="empty-state">Nenhum projeto ativo.</p> : 
                projects.map(proj => {
                  const est = Number(proj.budget_estimated) || 0;
                  const spent = Number(proj.budget_spent) || 0;
                  const health = est > 0 ? (spent / est) * 100 : 0;
                  const isDanger = health > 90;
                  const isOver = health > 100;
                  
                  return (
                    <div key={proj.id} className="budget-item">
                      <div className="b-item-head">
                        <h4>{proj.title}</h4>
                        <span className={isOver ? 'text-alert-red' : 'text-neon-green'}>{Math.round(health)}%</span>
                      </div>
                      <div className="b-progress-bar">
                        <div className={`b-fill ${isOver ? 'bg-red' : isDanger ? 'bg-yellow' : 'bg-green'}`} style={{width: `${Math.min(health, 100)}%`}}></div>
                      </div>
                      <div className="b-item-foot">
                        <span>Gasto: {currency(spent)}</span>
                        <span>Teto: {currency(est)}</span>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </div>

          {/* --- LIVRO CAIXA E INPUT --- */}
          <div className="glass-card col-span-full">
            <div className="card-header">
              <h2 className="card-title"><Layers size={18} className="text-neon-green"/> Livro Caixa Estratégico</h2>
              <p className="card-desc">Registre aportes, editais de fomento e despesas operacionais da startup.</p>
            </div>
            
            <div className="table-scroll custom-scrollbar">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th style={{width:'20%'}}>Categoria</th>
                    <th style={{width:'35%'}}>Descrição da Operação</th>
                    <th style={{width:'15%'}}>Natureza</th>
                    <th style={{width:'20%'}}>Montante (R$)</th>
                    <th style={{width:'10%', textAlign:'center'}}>Lançar</th>
                  </tr>
                </thead>
                <tbody>
                  
                  {/* --- LINHA DE INSERÇÃO --- */}
                  <tr className="input-row-highlight">
                    <td>
                      <select className="table-input custom-select" value={inputRow.category} onChange={e => setInputRow({...inputRow, category: e.target.value})}>
                        <option value="Operacional">Operacional (SaaS/Cloud)</option>
                        <option value="Marketing">Marketing / CAC</option>
                        <option value="Pessoal">Pessoal / Devs</option>
                        <option value="Fomento">Fomento / Edital</option>
                        <option value="Vendas">Vendas / Receita</option>
                      </select>
                    </td>
                    <td>
                      <input className="table-input" placeholder="O que foi pago ou recebido?" value={inputRow.description} onChange={e => setInputRow({...inputRow, description: e.target.value})} />
                    </td>
                    <td>
                      <div className="type-toggle">
                        <button className={`toggle-btn ${inputRow.type === 'expense' ? 'expense active' : ''}`} onClick={() => setInputRow({...inputRow, type: 'expense'})}>Saída</button>
                        <button className={`toggle-btn ${inputRow.type === 'income' ? 'income active' : ''}`} onClick={() => setInputRow({...inputRow, type: 'income'})}>Entrada</button>
                      </div>
                    </td>
                    <td>
                      <input type="number" className="table-input font-bold" placeholder="0,00" value={inputRow.amount} onChange={e => setInputRow({...inputRow, amount: e.target.value})} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
                    </td>
                    <td style={{textAlign:'center'}}>
                      <button className="btn-save-row" onClick={handleSubmit} disabled={loading}><Plus size={18}/></button>
                    </td>
                  </tr>

                  {/* --- ESPAÇADOR --- */}
                  <tr className="spacer-row"><td colSpan="5"></td></tr>

                  {/* --- DADOS REAIS --- */}
                  {loading ? (
                      <tr><td colSpan="5" className="empty-state">Sincronizando livro caixa...</td></tr>
                  ) : transactions.length === 0 ? (
                      <tr><td colSpan="5" className="empty-state">Sem histórico financeiro. Lance o primeiro aporte!</td></tr>
                  ) : (
                      transactions.map(t => {
                        // Extraindo a categoria se estiver no formato "[Categoria] Descrição"
                        let cat = "Geral";
                        let desc = t.description;
                        const match = t.description.match(/^\[(.*?)\] (.*)$/);
                        if (match) {
                          cat = match[1];
                          desc = match[2];
                        }

                        return (
                          <tr key={t.id} className="data-row fade-in">
                            <td><span className="cat-badge">{cat}</span></td>
                            <td className="text-white font-bold">{desc}</td>
                            <td>
                              <span className={`type-badge ${t.type === 'income' ? 'bg-green text-black' : 'bg-red text-white'}`}>
                                {t.type === 'income' ? 'RECEITA' : 'DESPESA'}
                              </span>
                            </td>
                            <td className={`font-mono font-bold ${t.type === 'income' ? 'text-neon-green' : 'text-white'}`}>
                              {t.type === 'income' ? '+' : '-'}{currency(t.amount)}
                            </td>
                            <td style={{textAlign:'center'}}>
                                <button className="btn-delete-row" onClick={() => handleDelete(t.id)} title="Estornar"><Trash2 size={16}/></button>
                            </td>
                          </tr>
                        )
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}