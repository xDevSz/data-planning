import React, { useState, useEffect } from 'react';
import Navbar from '../../../components/Navbar';
import { appService } from '../../../services/appService';
import './index.css'; // Vamos criar esse CSS abaixo

export default function Financial() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Input da Planilha
  const [inputRow, setInputRow] = useState({ description: '', amount: '', type: 'expense' });

  const loadData = async () => {
    try {
      setLoading(true);
      // Reutiliza o getFullOverview para pegar transações, ou cria um getTransactions específico
      const data = await appService.getFullOverview(); 
      setTransactions(data.transactions);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async () => {
    if (!inputRow.description || !inputRow.amount) return alert("Preencha os dados.");
    try {
      await appService.createTransaction({
        description: inputRow.description,
        amount: parseFloat(inputRow.amount),
        type: inputRow.type
      });
      setInputRow({ description: '', amount: '', type: 'expense' });
      loadData();
    } catch (error) {
      alert("Erro ao salvar: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apagar registro?")) {
      await appService.deleteTransaction(id);
      loadData();
    }
  };

  const currency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Cálculos Rápidos para o Header da Página
  const totalReceitas = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalDespesas = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const saldo = totalReceitas - totalDespesas;

  return (
    <div className="financial-container">
      <Navbar />
      
      <div className="financial-content">
        <div className="financial-header">
          <div>
            <h1>Controle Financeiro</h1>
            <p>Livro Caixa & Demonstração de Resultados</p>
          </div>
          <div className="mini-kpis">
            <div className="mini-kpi income">
              <span>Entradas</span>
              <strong>{currency(totalReceitas)}</strong>
            </div>
            <div className="mini-kpi expense">
              <span>Saídas</span>
              <strong>{currency(totalDespesas)}</strong>
            </div>
            <div className={`mini-kpi ${saldo >= 0 ? 'positive' : 'negative'}`}>
              <span>Saldo</span>
              <strong>{currency(saldo)}</strong>
            </div>
          </div>
        </div>

        <div className="spreadsheet-wrapper">
          <table className="spreadsheet-table">
            <thead>
              <tr>
                <th style={{width:'50%'}}>Descrição</th>
                <th style={{width:'15%'}}>Tipo</th>
                <th style={{width:'20%'}}>Valor</th>
                <th style={{width:'15%'}}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {/* LINHA DE INPUT (Inserção Rápida) */}
              <tr className="input-row">
                <td>
                  <input 
                    className="sheet-input" 
                    placeholder="Nova transação..." 
                    value={inputRow.description}
                    onChange={e => setInputRow({...inputRow, description: e.target.value})}
                    autoFocus
                  />
                </td>
                <td>
                  <select 
                    className="sheet-select"
                    value={inputRow.type}
                    onChange={e => setInputRow({...inputRow, type: e.target.value})}
                  >
                    <option value="expense">Despesa 🔻</option>
                    <option value="income">Receita 💹</option>
                  </select>
                </td>
                <td>
                  <input 
                    type="number" 
                    className="sheet-input" 
                    placeholder="0.00" 
                    value={inputRow.amount}
                    onChange={e => setInputRow({...inputRow, amount: e.target.value})}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  />
                </td>
                <td style={{textAlign:'center'}}>
                  <button className="btn-sheet-add" onClick={handleSubmit}>💾 Salvar</button>
                </td>
              </tr>

              {/* LISTA DE DADOS */}
              {transactions.map(t => (
                <tr key={t.id} className="data-row">
                  <td>{t.description}</td>
                  <td style={{color: t.type === 'income' ? 'var(--neon-green)' : '#ff0055'}}>
                    {t.type === 'income' ? 'RECEITA' : 'DESPESA'}
                  </td>
                  <td>{currency(t.amount)}</td>
                  <td style={{textAlign:'center'}}>
                    <button className="btn-sheet-delete" onClick={() => handleDelete(t.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}