import React, { useEffect, useState } from "react";
import SidebarDesktop from "../../components/Sidebar/Sidebar.component.desktop.jsx";
import Loader from "../../components/Loader/Loader.jsx";

const Test = () => {
  const [loading, setLoading] = useState(true);

  // Simula una carga de 3 segundos (reemplázalo con tu llamada a la API)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 7000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Mis cultivos</h1>
      </header>

      <SidebarDesktop active="home" />

      <main className="page__content">{/* Contenido de la página */}</main>
    </div>
  );
};

export default Test;