import React from 'react';
import './index.css';
// Importando a imagem
import logoImg from '../../assets/logo.png'; 

export default function Loading() {
  return (
    <div className="loading-container">
      {/* Exibe a imagem importada com a classe de animação */}
      <img src={logoImg} alt="Carregando..." className="pulsing-logo" />
      
      {/* Novo texto de feedback visual */}
      <span className="loading-text">Carregando sistema...</span>
    </div>
  );
}