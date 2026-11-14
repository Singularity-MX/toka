import React from "react";
import { useNavigate } from "react-router-dom";
import "./style/SidebarDesktop.css";
//icons
import homeIcon from "./assets/icons/home.svg";
import parcelsIcon from "./assets/icons/parcels.svg";
import myProfileIcon from "./assets/icons/profile.svg";
import logoutIcon from "./assets/icons/logout.svg";

import homeIconActive from "./assets/icons/homeActive.svg";
import parcelsIconActive from "./assets/icons/parcelsActive.svg";
import myProfileIconActive from "./assets/icons/profileActive.svg";

import logo from "./assets/logo/logo.svg";

// Ajusta las rutas a las de tu router
const NAV_ITEMS = [
  { key: "home", label: "Inicio", path: "/home", icon: homeIcon, iconActive: homeIconActive },
  { key: "parcels", label: "Mis cultivos", path: "/percels", icon: parcelsIcon, iconActive: parcelsIconActive },
  { key: "profile", label: "Mi cuenta", path: "/profile", icon: myProfileIcon, iconActive: myProfileIconActive },
];

/**
 * @param {"home" | "parcels" | "profile"} active  Opción que se muestra activa (usa su ícono "Active")
 * @param {Function} onLogout                       Acción al cerrar sesión
 */
export default function SidebarDesktop({ active, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) onLogout();
    else navigate("/login");
  };

  return (
    <aside className="sidebar-desktop">
      <nav className="sidebar-desktop__nav" aria-label="Navegación principal">
        <img src={logo} alt="Logo" className="sidebar-desktop__logo" />
        <span className="sidebar-desktop__divider" />

        {NAV_ITEMS.map(({ key, label, path, icon, iconActive }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              type="button"
              className={`sidebar-desktop__item ${isActive ? "is-active" : ""}`}
              onClick={() => navigate(path)}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              data-tooltip={label}
            >
              <img
                src={isActive ? iconActive : icon}
                alt=""
                className="sidebar-desktop__icon"
              />
            </button>
          );
        })}

        <button
          type="button"
          className="sidebar-desktop__item"
          onClick={handleLogout}
          aria-label="Cerrar sesión"
          data-tooltip="Cerrar sesión"
        >
          <img src={logoutIcon} alt="" className="sidebar-desktop__icon" />
        </button>
      </nav>
    </aside>
  );
}