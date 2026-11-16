import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Button, Col, ConfigProvider, Row, Typography, message } from "antd";
import {
  CalendarOutlined,
  CheckCircleFilled,
  DollarCircleOutlined,
  EditOutlined,
  MailOutlined,
  UserOutlined,
} from "@ant-design/icons";
import Navbar from "../../components/Navbar/Navbar.compnent";
import SidebarDesktop from "../../components/Sidebar/Sidebar.component.desktop";
import { Drop, Sprout, Waves, Wheat } from "../../assets/Icons";
import "./MyProfile.css";

/* Tema de Ant Design (muévelo a tu App.jsx si quieres que aplique a toda la app) */
const theme = {
  token: {
    colorPrimary: "#4a6d2b",
    colorText: "#17332b",
    fontFamily: '"Nunito", system-ui, sans-serif',
    borderRadius: 12,
  },
  components: { Button: { fontWeight: 700 } },
};

/* ---------- Datos de ejemplo: reemplázalos con los de tu API ---------- */
const USER = {
  name: "Ricardo Hernández",
  email: "ricardo.hernandez@correo.com",
  photo: "", // URL de la foto; si está vacía se muestra la inicial
  createdAt: "2025-03-14",
  parcels: 3,
  hectares: 12.5,
  crops: 3,
  preference: "water", // "water" | "profit" | "soil"
};

const PREFERENCES = [
  {
    key: "water",
    title: "Ahorrar agua",
    text: "Recomendaciones para reducir el riego sin afectar tu cosecha.",
    icon: <Drop size={30} />,
    color: "#5b93df",
  },
  {
    key: "profit",
    title: "Incrementar ganancias",
    text: "Cultivos y decisiones enfocadas en mejorar tu ingreso estimado.",
    icon: <DollarCircleOutlined style={{ fontSize: 30 }} />,
    color: "#d9a21f",
  },
  {
    key: "soil",
    title: "Restaurar el suelo",
    text: "Prácticas que recuperan la salud y la fertilidad de tus parcelas.",
    icon: <Sprout size={30} />,
    color: "#4f7a34",
  },
];

const formatDate = (iso) =>
  new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(`${iso}T00:00:00`)
  );

/* ---------- Detecta pantalla móvil (<= 768px) ---------- */
function useIsMobile(breakpoint = 768) {
  const query = `(max-width: ${breakpoint}px)`;
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return isMobile;
}

function StatCard({ icon, tone, value, label }) {
  return (
    <div className="stat-card">
      <span className={`stat-card__icon stat-card__icon--${tone}`}>{icon}</span>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

/* ---------- Vista ---------- */
const MyProfile = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [preference, setPreference] = useState(USER.preference);
  const [saved, setSaved] = useState(USER.preference);
  const [messageApi, contextHolder] = message.useMessage();

  const memberSince = useMemo(() => formatDate(USER.createdAt), []);
  const hasChanges = preference !== saved;

  const handleSave = () => {
    // TODO: guarda la preferencia en tu API
    setSaved(preference);
    messageApi.success("Preferencia guardada");
  };

  return (
    <ConfigProvider theme={theme}>
      {contextHolder}
      <div className="my-profile">
        <Navbar
          isMobile={isMobile}
          active="profile"
          search={search}
          onSearchChange={setSearch}
          location="San Pedro, Gto."
          temperature="24 °C"
          hasNotifications
          userInitial={USER.name.charAt(0)}
          onAvatarClick={() => navigate("/mi-cuenta")}
        />
        

        {/* Escritorio: sidebar fijo, centrado verticalmente. Móvil: el menú vive en el Navbar. */}
        {!isMobile && <SidebarDesktop active="profile" />}

        <main className="my-profile__main">
          {/* ---------- Hero ---------- */}
          <section className="hero">
            <svg className="hero__art" viewBox="0 0 560 300" preserveAspectRatio="xMaxYMax slice" aria-hidden="true">
              <circle cx="400" cy="90" r="82" fill="#efd58a" opacity="0.45" />
              <circle cx="400" cy="90" r="52" fill="#e6c565" />
              <path d="M170 300 L300 120 L400 180 L470 100 L560 160 L560 300Z" fill="#b6c99a" />
              <path d="M90 300 C190 200 400 200 560 225 L560 300Z" fill="#6f9a62" />
              <circle cx="190" cy="215" r="15" fill="#3e6b46" />
              <circle cx="528" cy="190" r="24" fill="#3e6b46" />
              <circle cx="506" cy="205" r="19" fill="#2f5c3b" />
            </svg>

            <div className="hero__text">
              <Typography.Title level={1} className="hero__title">
                Mi cuenta <UserOutlined />
              </Typography.Title>
              <p>Consulta tus datos y elige qué quieres priorizar en tus cultivos.</p>
            </div>
          </section>

          {/* ---------- Tarjeta de perfil (encima de la ilustración) ---------- */}
          <section className="profile-card">
            <Avatar
              className="profile-card__avatar"
              size={112}
              src={USER.photo || undefined}
              alt={USER.name}
            >
              {USER.name.charAt(0)}
            </Avatar>

            <div className="profile-card__info">
              <h2>{USER.name}</h2>
              <p><MailOutlined /> {USER.email}</p>
              <p><CalendarOutlined /> Miembro desde el {memberSince}</p>
            </div>

            <Button
              shape="round"
              size="large"
              icon={<EditOutlined />}
              className="profile-card__btn"
              onClick={() => navigate("/mi-cuenta/editar")}
            >
              Editar perfil
            </Button>
          </section>

          {/* ---------- Estadísticas ---------- */}
          <Row gutter={[24, 24]} className="stats">
            <Col xs={24} md={8}>
              <StatCard icon={<Waves size={28} />} tone="green" value={USER.parcels} label="Parcelas" />
            </Col>
            <Col xs={24} md={8}>
              <StatCard icon={<Sprout size={28} />} tone="green" value={`${USER.hectares} ha`} label="Superficie total" />
            </Col>
            <Col xs={24} md={8}>
              <StatCard icon={<Wheat size={28} />} tone="gold" value={USER.crops} label="Cultivos activos" />
            </Col>
          </Row>

          {/* ---------- Preferencias ---------- */}
          <section className="prefs">
            <div className="prefs__head">
              <h2>Mis preferencias</h2>
              <p>Elige tu prioridad principal; Toka adaptará sus recomendaciones a ella.</p>
            </div>

            <div className="prefs__grid" role="radiogroup" aria-label="Preferencia principal">
              {PREFERENCES.map(({ key, title, text, icon, color }) => {
                const selected = preference === key;
                return (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={`pref-card ${selected ? "is-selected" : ""}`}
                    onClick={() => setPreference(key)}
                  >
                    <span className="pref-card__icon" style={{ color }}>{icon}</span>
                    <strong>{title}</strong>
                    <span className="pref-card__text">{text}</span>
                    {selected && <CheckCircleFilled className="pref-card__check" />}
                  </button>
                );
              })}
            </div>

            <div className="prefs__actions">
              <Button
                type="primary"
                shape="round"
                size="large"
                disabled={!hasChanges}
                className="prefs__save"
                onClick={handleSave}
              >
                Guardar cambios
              </Button>
            </div>
          </section>

          {/* ---------- Aviso ---------- */}
          <section className="notice">
            <span className="notice__icon"><Sprout size={26} /></span>
            <div className="notice__text">
              <strong>Toka te acompaña en cada decisión</strong>
              <p>Toka es una herramienta de apoyo. No reemplaza tu criterio ni el de tu técnico agrícola. Los valores de esta pantalla son ilustrativos.</p>
            </div>
          </section>
        </main>
      </div>
    </ConfigProvider>
  );
};

export default MyProfile;
