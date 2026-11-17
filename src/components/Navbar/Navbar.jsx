import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Badge, Drawer, Input } from "antd";
import {
  BellOutlined,
  CloseOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { SunIcon, Sprout } from "@/components/icons/Icons";
import "./Navbar.css";

import { auth } from "@/services/firebase";
// Mismas opciones que el sidebar. Ajusta las rutas a las de tu router.
const NAV_ITEMS = [
  { key: "home", label: "Inicio", path: "/inicio", icon: <HomeOutlined /> },
  { key: "parcels", label: "Mis cultivos", path: "/parcels", icon: <Sprout size={22} /> },
  { key: "profile", label: "Mi cuenta", path: "/profile", icon: <UserOutlined /> },
];

/**
 * Navbar fijo (position: fixed). La página debe dejar padding-top: 76px (64px en móvil).
 *
 * @param {boolean}  isMobile             true => muestra hamburguesa + menú desplegable
 *                                        (la página NO debe renderizar el sidebar)
 * @param {"home"|"parcels"|"profile"} active  Opción activa del menú móvil
 * @param {Function} onLogout             Acción al cerrar sesión (menú móvil)
 * @param {string}   search
 * @param {Function} onSearchChange       (value) => void
 * @param {string}   location             Ej: "San Pedro, Gto."
 * @param {string}   temperature          Ej: "24 °C"
 * @param {boolean}  hasNotifications     Punto naranja en la campana
 * @param {string}   userInitial
 * @param {Function} onNotificationsClick
 * @param {Function} onAvatarClick
 */

export default function Navbar({
  isMobile = false,
  active,
  onLogout,
  search = "",
  onSearchChange,
  location = "Ubicación no disponible",
  temperature = "-- °C",
  condition = "",
  hasNotifications = false,
  userInitial = "R",
  onNotificationsClick,
  onAvatarClick,
}) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);
  
  const goTo = (path) => {
    closeMenu();
    navigate(path);
  };

  const handleLogout = () => {
    closeMenu();
    if (onLogout) onLogout();
    else navigate("/");
  };

 

  return (
    <>
      <header className={`navbar ${isMobile ? "navbar--mobile" : ""}`}>
        {/* ---------- Izquierda: hamburguesa (móvil) + marca ---------- */}
        <div className="navbar__left">
          {isMobile && (
            <button
              type="button"
              className="navbar__burger"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
            >
              <MenuOutlined />
            </button>
          )}

          <div className="navbar__brand">
            <span className="navbar__title">Toka</span>

          </div>
        </div>

        {/* ---------- Centro: buscador (solo escritorio) ---------- */}
        {!isMobile && (
          <Input
            className="navbar__search"
            variant="borderless"
            size="large"
            prefix={<SearchOutlined />}
            placeholder="Buscar parcela…"
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            allowClear
          />
        )}

        {/* ---------- Derecha ---------- */}
        <div className="navbar__info">
          {!isMobile && (
            <>
              <span className="navbar__chip navbar__chip--location">
                <EnvironmentOutlined />
                {location}
              </span>
              <span className="navbar__chip navbar__chip--weather">
                <SunIcon size={20} />
                {temperature}
              </span>
            </>
          )}

          <button
            type="button"
            className="navbar__bell"
            onClick={onNotificationsClick}
            aria-label="Notificaciones"
          >
            <Badge dot={hasNotifications} color="#f07a2a" offset={[-3, 4]}>
              <BellOutlined style={{ fontSize: 22, color: "#fff" }} />
            </Badge>
          </button>

          <Avatar
            className="navbar__avatar"
            size={isMobile ? 38 : 44}
            onClick={onAvatarClick}
            src={auth.currentUser?.photoURL}
            style={{ cursor: "pointer" }}
          >
            {userInitial}
          </Avatar>
        </div>
      </header>

      {/* ---------- Menú móvil (mismo estilo que el sidebar) ---------- */}
      {isMobile && (
        <Drawer
          open={menuOpen}
          onClose={closeMenu}
          placement="left"
          width={290}
          closable={false}
          rootClassName="navbar-drawer"
        >
          <div className="navbar-menu">
            <div className="navbar-menu__head">
              <div className="navbar-menu__brand">
                <strong>Toka</strong>
                <span>Cultiva decisiones inteligentes</span>
              </div>
              <button type="button" className="navbar-menu__close" onClick={closeMenu} aria-label="Cerrar menú">
                <CloseOutlined />
              </button>
            </div>

            <Input
              className="navbar-menu__search"
              size="large"
              prefix={<SearchOutlined />}
              placeholder="Buscar parcela…"
              value={search}
              onChange={(e) => onSearchChange?.(e.target.value)}
              allowClear
            />

            <span className="navbar-menu__divider" />

            <nav className="navbar-menu__nav" aria-label="Navegación principal">
              {NAV_ITEMS.map(({ key, label, path, icon }) => {
                const isActive = active === key;
                return (
                  <button
                    key={key}
                    type="button"
                    className={`navbar-menu__item ${isActive ? "is-active" : ""}`}
                    onClick={() => goTo(path)}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className="navbar-menu__icon">{icon}</span>
                    {label}
                  </button>
                );
              })}
            </nav>

            <div className="navbar-menu__foot">
              <div className="navbar-menu__meta">
                <span><EnvironmentOutlined /> {location}</span>
                <span><SunIcon size={18} /> {temperature}</span>
              </div>

              <span className="navbar-menu__divider" />

              <button type="button" className="navbar-menu__item" onClick={handleLogout}>
                <span className="navbar-menu__icon"><LogoutOutlined /></span>
                Cerrar sesión
              </button>
            </div>
          </div>
        </Drawer>
      )}
    </>
  );
}