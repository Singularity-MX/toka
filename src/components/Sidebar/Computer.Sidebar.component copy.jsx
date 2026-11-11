import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  EnvironmentOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { C } from "../../views/Home/theme";

const ITEMS = [
  { path: "/home", label: "Inicio", icon: <HomeOutlined /> },
  { path: "/parcelas", label: "Mis parcelas", icon: <EnvironmentOutlined /> },
  { path: "/preferencias", label: "Preferencias", icon: <SettingOutlined /> },
];

export default function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    if (onLogout) return onLogout();
    localStorage.removeItem("token"); // TODO: conecta con tu auth
    navigate("/login");
  };

  return (
    <>
      <style>{`
        .toka-dock-item {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 44px;
          padding: 0 16px;
          border: none;
          border-radius: 999px;
          background: transparent;
          color: ${C.inkSoft};
          font: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: background .2s, color .2s;
        }
        .toka-dock-item .anticon { font-size: 18px; }
        .toka-dock-item:hover { background: #eef0e8; color: ${C.forest}; }
        .toka-dock-item:focus-visible { outline: 3px solid ${C.gold}; outline-offset: 2px; }
        .toka-dock-item[aria-current="page"] { background: ${C.forest}; color: #fff; }
        .toka-dock-item[aria-current="page"] .anticon { color: ${C.gold}; }
        .toka-dock-logout:hover { background: #f6e6df; color: #a4452a; }
        @media (max-width: 575px) {
          .toka-dock-item { padding: 0 12px; }
          .toka-dock-item:not([aria-current="page"]) .toka-dock-label { display: none; }
        }
        @media (prefers-reduced-motion: reduce) { .toka-dock-item { transition: none; } }
      `}</style>

      <nav
        aria-label="Navegación principal"
        style={{
          position: "fixed",
          left: "50%",
          bottom: "max(20px, env(safe-area-inset-bottom))",
          transform: "translateX(-50%)",
          zIndex: 30,
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: 6,
          background: C.surface,
          border: `1px solid ${C.line}`,
          borderRadius: 999,
          boxShadow: "0 10px 30px rgba(18, 38, 30, 0.14)",
        }}
      >
        {ITEMS.map((item) => {
          const active = pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              type="button"
              className="toka-dock-item"
              aria-current={active ? "page" : undefined}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span className="toka-dock-label">{item.label}</span>
            </button>
          );
        })}

        <span
          aria-hidden
          style={{ width: 1, height: 24, background: C.line, margin: "0 4px" }}
        />

        <button
          type="button"
          className="toka-dock-item toka-dock-logout"
          onClick={handleLogout}
          aria-label="Cerrar sesión"
        >
          <LogoutOutlined />
          <span className="toka-dock-label">Salir</span>
        </button>
      </nav>
    </>
  );
}