import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ConfigProvider, Layout, Menu, Avatar, Typography } from "antd";
import {
  HomeOutlined,
  EnvironmentOutlined,
  SwapOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { C, tokaTheme } from "./theme";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MENU = [
  { key: "/home", icon: <HomeOutlined />, label: "Inicio" },
  { key: "/parcelas", icon: <EnvironmentOutlined />, label: "Mis parcelas" },
  { key: "/rotaciones", icon: <SwapOutlined />, label: "Rotaciones" },
  { key: "/preferencias", icon: <SettingOutlined />, label: "Preferencias" },
];

const AppLayout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // TODO: reemplaza con tu contexto de autenticación
  const usuario = "ReplacedSpace17";
  const cerrarSesion = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const selected = MENU.find((m) => pathname.startsWith(m.key))?.key;

  return (
    <ConfigProvider theme={tokaTheme}>
      <Layout style={{ minHeight: "100vh" }}>
        <Header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: C.surface,
            borderBottom: `1px solid ${C.line}`,
            padding: "0 24px",
            height: 64,
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              aria-hidden
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: C.forest,
                display: "grid",
                placeItems: "center",
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  background: C.gold,
                  clipPath:
                    "polygon(10% 40%, 50% 0, 100% 35%, 80% 100%, 20% 90%)",
                }}
              />
            </span>
            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: C.forest,
              }}
            >
              Toka
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Text style={{ color: C.inkSoft }}>{usuario}</Text>
            <Avatar
              style={{ background: C.gold, color: C.forest }}
              icon={<UserOutlined />}
            />
          </div>
        </Header>

        <Layout>
          <Sider
            width={220}
            breakpoint="lg"
            collapsedWidth={72}
            theme="dark"
            style={{
              background: C.forest,
              position: "sticky",
              top: 64,
              height: "calc(100vh - 64px)",
              alignSelf: "flex-start",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                padding: "16px 8px",
              }}
            >
              <Menu
                mode="inline"
                selectedKeys={selected ? [selected] : []}
                onClick={({ key }) => navigate(key)}
                style={{ border: "none", flex: 1 }}
                items={MENU}
              />
              <Menu
                mode="inline"
                selectable={false}
                onClick={cerrarSesion}
                style={{
                  border: "none",
                  borderTop: "1px solid rgba(255,255,255,0.12)",
                  paddingTop: 8,
                }}
                items={[
                  {
                    key: "salir",
                    icon: <LogoutOutlined />,
                    label: "Cerrar sesión",
                  },
                ]}
              />
            </div>
          </Sider>

          <Content style={{ padding: "32px clamp(16px, 4vw, 48px)" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
              <Outlet />
            </div>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default AppLayout;
