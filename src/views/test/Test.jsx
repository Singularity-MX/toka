import React from "react";
import SidebarDesktop from "../../components/Sidebar/Sidebar.component.desktop.jsx";

const Test = () => {
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