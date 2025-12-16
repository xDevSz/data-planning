import React from 'react';
import './index.css';
import logoImg from '../../assets/logo.png'; // Verifique se é a logo certa

export default function Loading() {
  return (
    <div className="sys-loading-overlay">
      <div className="sys-loading-content">
        <img src={logoImg} alt="Carregando..." className="sys-loading-logo" />
        <div className="sys-loading-text"></div>
      </div>
    </div>
  );
}