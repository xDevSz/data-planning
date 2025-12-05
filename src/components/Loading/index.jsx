import React from 'react';
import './index.css';
// Importando a imagem (ajuste a extensão .png se a sua for diferente)
import logoImg from '../../assets/logo.png'; 

export default function Loading() {
  return (
    <div className="loading-container">
      {/* Exibe a imagem importada com a classe de animação */}
      <img src={logoImg} alt="Logo Startup" className="pulsing-logo" />
    </div>
  );
}