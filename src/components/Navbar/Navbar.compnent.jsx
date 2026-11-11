import React from "react";
import { Avatar, Badge, Input, Typography } from "antd";
import {
  BellOutlined,
  EnvironmentOutlined,
  SearchOutlined,
  CloudOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { C } from "../../views/Home/theme";

const { Text } = Typography;

export default function Navbar({
  usuario = "ReplacedSpace17",
  rol = "Agricultor",
  ubicacion = "Guanajuato, MX",
  clima = "24 °C · Parcialmente nublado",
  notificaciones = 3,
}) {
  const inicial = usuario.charAt(0).toUpperCase();

  return (
    <>
      <style>{`
        .toka-nav-search .ant-input-affix-wrapper {
          background: #eef0e8;
          border-color: transparent;
          border-radius: 999px;
          padding: 7px 16px;
        }
        .toka-nav-search .ant-input-affix-wrapper:hover,
        .toka-nav-search .ant-input-affix-wrapper-focused {
          background: #fff;
          border-color: ${C.forest};
        }
        .toka-nav-search .ant-input { background: transparent; }
        .toka-nav-bell:hover, .toka-nav-user:hover { background: #eef0e8; }
        .toka-nav-bell:focus-visible, .toka-nav-user:focus-visible {
          outline: 3px solid ${C.gold};
          outline-offset: 2px;
        }
        @media (max-width: 991px) { .toka-nav-chip { display: none !important; } }
        @media (max-width: 767px) {
          .toka-nav-search { display: none !important; }
          .toka-nav-userinfo { display: none !important; }
        }
      `}</style>

      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          padding: "0 24px",
          background: C.surface,
          borderBottom: `1px solid ${C.line}`,
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            minWidth: 150,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: C.forest,
              display: "grid",
              placeItems: "center",
            }}
          >
            <span
              style={{
                width: 15,
                height: 15,
                background: C.gold,
                clipPath:
                  "polygon(10% 40%, 50% 0, 100% 35%, 80% 100%, 20% 90%)",
              }}
            />
          </span>
          <span
            style={{
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: C.forest,
              lineHeight: 1,
            }}
          >
            Toka
          </span>
        </div>

        {/* Buscador */}
        <div
          className="toka-nav-search"
          style={{ flex: 1, maxWidth: 460 }}
        >
          <Input
            allowClear
            aria-label="Buscar"
            prefix={<SearchOutlined style={{ color: C.inkSoft }} />}
            placeholder="Buscar parcelas, cultivos o rotaciones"
          />
        </div>

        {/* Zona derecha */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            minWidth: 150,
            justifyContent: "flex-end",
          }}
        >
          {/* Ubicación y clima */}
          <div
            className="toka-nav-chip"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "6px 14px",
              borderRadius: 999,
              background: "#eef0e8",
              fontSize: 13,
              color: C.forest,
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <EnvironmentOutlined style={{ color: C.earth }} />
              {ubicacion}
            </span>
            <span
              aria-hidden
              style={{ width: 1, height: 14, background: "#cfd5c8" }}
            />
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <CloudOutlined style={{ color: C.water }} />
              {clima}
            </span>
          </div>

          {/* Notificaciones */}
          <button
            type="button"
            className="toka-nav-bell"
            aria-label={`Notificaciones: ${notificaciones} nuevas`}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
              transition: "background .2s",
            }}
          >
            <Badge count={notificaciones} size="small" color={C.gold}>
              <BellOutlined style={{ fontSize: 19, color: C.forest }} />
            </Badge>
          </button>

          {/* Usuario */}
          <button
            type="button"
            className="toka-nav-user"
            aria-label="Cuenta"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "4px 10px 4px 4px",
              borderRadius: 999,
              border: `1px solid ${C.line}`,
              background: "transparent",
              cursor: "pointer",
              transition: "background .2s",
            }}
          >
            <Avatar
              size={32}
              style={{ background: C.gold, color: C.forest, fontWeight: 700 }}
            >
              {inicial}
            </Avatar>
            <span
              className="toka-nav-userinfo"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                lineHeight: 1.2,
              }}
            >
              <Text strong style={{ fontSize: 13, color: C.ink }}>
                {usuario}
              </Text>
              <Text style={{ fontSize: 11, color: C.inkSoft }}>{rol}</Text>
            </span>
            <DownOutlined style={{ fontSize: 10, color: C.inkSoft }} />
          </button>
        </div>
      </header>
    </>
  );
}