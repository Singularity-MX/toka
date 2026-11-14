import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  Input,
  Progress,
  Row,
  Segmented,
  Select,
  Tag,
  Typography,
} from "antd";
import {
  AppstoreOutlined,
  DollarCircleOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import Navbar from "../../components/Navbar/Navbar.compnent";
import SidebarDesktop from "../../components/Sidebar/Sidebar.component.desktop";
import { Drop, Sprout, Waves, Wheat } from "../../assets/Icons";
import "./MyPercels.css";

/* Tema de Ant Design (muévelo a tu App.jsx si quieres que aplique a toda la app) */
const theme = {
  token: {
    colorPrimary: "#4a6d2b",
    colorText: "#17332b",
    fontFamily: '"Nunito", system-ui, sans-serif',
    borderRadius: 12,
  },
  components: {
    Segmented: {
      trackBg: "#fbfbf6",
      trackPadding: 4,
      itemSelectedBg: "#17332b",
      itemSelectedColor: "#ffffff",
      itemColor: "#17332b",
      borderRadius: 999,
      borderRadiusSM: 999,
      borderRadiusLG: 999,
    },
    Button: { fontWeight: 700 },
  },
};

/* ---------- Datos de ejemplo (ilustrativos) ---------- */
const PARCELS = [
  {
    id: 1, name: "Parcela Norte", crop: "Maíz", area: 4.2, status: "active",
    water: 18, soil: 22, income: 15,
    map: {
      base: "#5f8240",
      patches: [
        ["M0 0 L185 0 L95 135 L0 150Z", "#7e9b56"],
        ["M350 0 L456 0 L456 95 L405 60Z", "#a1b362"],
        ["M0 170 L95 210 L115 268 L0 268Z", "#879f5c"],
        ["M385 150 L456 105 L456 268 L420 268Z", "#6a8a49"],
      ],
      light: "#86b855", dark: "#4a7a2e", angle: 32,
      polys: [[[100, 115], [197, 62], [330, 90], [381, 159], [291, 209], [163, 215]]],
    },
  },
  {
    id: 2, name: "Parcela Centro", crop: "Frijol", area: 3.8, status: "active",
    water: 12, soil: 20, income: 12,
    map: {
      base: "#7c9b57",
      patches: [
        ["M0 0 L135 0 L65 90 L0 115Z", "#5f8240"],
        ["M135 0 L265 0 L205 62Z", "#6a8a49"],
        ["M360 0 L456 0 L456 70Z", "#a0b25f"],
        ["M0 180 L60 268 L0 268Z", "#6a8a49"],
      ],
      river: "M0 224 C90 212 170 230 270 222 S410 212 456 218",
      light: "#8fbe55", dark: "#55843a", angle: 38,
      polys: [[[79, 152], [143, 77], [226, 72], [267, 112], [360, 93], [395, 165], [290, 212], [149, 218]]],
      dividers: [[[143, 77], [179, 214]], [[267, 112], [229, 212]]],
    },
  },
  {
    id: 3, name: "Parcela Sur", crop: "Sorgo", area: 4.5, status: "review",
    water: 10, soil: 17, income: 14,
    map: {
      base: "#8b9d5d",
      patches: [
        ["M0 0 L95 0 L45 75 L0 85Z", "#a9a463"],
        ["M385 0 L456 0 L456 125 L420 80Z", "#6d8d4a"],
        ["M0 195 L115 268 L0 268Z", "#adb25f"],
        ["M205 218 L456 205 L456 268 L260 268Z", "#7d9a52"],
      ],
      light: "#bccb55", dark: "#8c9f3c", angle: -50,
      polys: [[[88, 155], [138, 80], [287, 70], [378, 143], [328, 205], [150, 215]]],
    },
  },
];

const toPath = (pts) => `M${pts.map((p) => p.join(" ")).join(" L")} Z`;

/* ---------- Mapa ilustrado de la parcela (proporción apaisada 456x268) ---------- */
function ParcelMap({ id, map, status }) {
  const pid = `hatch-${id}`;
  return (
    <div className="parcel-map">
      <svg viewBox="0 0 456 268" role="img" aria-label="Polígono de la parcela">
        <defs>
          <pattern id={pid} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform={`rotate(${map.angle})`}>
            <rect width="12" height="12" fill={map.light} />
            <rect width="5" height="12" fill={map.dark} opacity="0.7" />
          </pattern>
        </defs>
        <rect width="456" height="268" fill={map.base} />
        {map.patches.map(([d, fill]) => (
          <path key={d} d={d} fill={fill} />
        ))}
        {map.river && <path d={map.river} fill="none" stroke="#c7a687" strokeWidth="6" strokeLinecap="round" />}
        {map.polys.map((pts) => (
          <path key={toPath(pts)} d={toPath(pts)} fill={`url(#${pid})`} stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
        ))}
        {map.dividers?.map(([a, b]) => (
          <line key={a.join()} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#fff" strokeWidth="2" opacity="0.9" />
        ))}
        {map.polys.flat().map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="6" fill="#fff" />
        ))}
      </svg>

      <Tag bordered={false} className="status-pill">
        <i className={`status-dot status-dot--${status}`} />
        {status === "active" ? "Activa" : "En revisión"}
      </Tag>
    </div>
  );
}

function Metric({ icon, label, value, color }) {
  return (
    <div className="metric">
      <span className="metric__label">
        <span className="metric__icon" style={{ color }}>{icon}</span>
        <span className="metric__text">{label}</span>
      </span>
      <Progress
        percent={Math.min(value * 3.3, 100)}
        showInfo={false}
        strokeColor={color}
        trailColor="#e6e8da"
        size={["100%", 8]}
      />
      <span className="metric__value">+{value}%</span>
    </div>
  );
}

function ParcelCard({ parcel, onClick }) {
  return (
    <Card
      hoverable
      className="parcel-card"
      cover={<ParcelMap id={parcel.id} map={parcel.map} status={parcel.status} />}
      onClick={onClick}
    >
      <div className="parcel-card__head">
        <span className="parcel-card__sprout"><Sprout size={22} /></span>
        <div className="parcel-card__titles">
          <h3>{parcel.name}</h3>
          <span>{parcel.crop}</span>
        </div>
        <strong>{parcel.area} ha</strong>
      </div>

      <Metric icon={<Drop size={18} />} label="Ahorro de agua" value={parcel.water} color="#5b93df" />
      <Metric icon={<Sprout size={18} />} label="Salud del suelo" value={parcel.soil} color="#4f7a34" />
      <Metric icon={<DollarCircleOutlined style={{ fontSize: 18 }} />} label="Ingreso estimado" value={parcel.income} color="#d9a21f" />
    </Card>
  );
}

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

/* ---------- Vista ---------- */
const MyPercels = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile(); // <= 768px
  const [search, setSearch] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [crop, setCrop] = useState("all");
  const [status, setStatus] = useState("all");
  const [view, setView] = useState("grid");

  const filtered = useMemo(() => {
    const q = (nameFilter || search).toLowerCase();
    return PARCELS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) &&
        (crop === "all" || p.crop === crop) &&
        (status === "all" || p.status === status)
    );
  }, [search, nameFilter, crop, status]);

  const totalArea = PARCELS.reduce((sum, p) => sum + p.area, 0);

  return (
    <ConfigProvider theme={theme}>
      <div className="my-percels">
        <Navbar
          isMobile={isMobile}
          active="parcels"
          search={search}
          onSearchChange={setSearch}
          location="San Pedro, Gto."
          temperature="24 °C"
          hasNotifications
          userInitial="R"
          onAvatarClick={() => navigate("/mi-cuenta")}
        />

        {/* Escritorio: barra lateral fija, centrada verticalmente.
            Móvil: no se muestra, el menú vive en el Navbar (hamburguesa). */}
        {!isMobile && <SidebarDesktop active="parcels" />}

        <main className="my-percels__main">
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
                Mis cultivos <Sprout size={34} />
              </Typography.Title>
              <p>Gestiona tus parcelas y descubre qué cultivar después.</p>
            </div>
          </section>

          {/* ---------- Resumen ---------- */}
          <section className="summary">
            <div className="summary__stats">
              <div className="summary__stat">
                <span className="summary__icon summary__icon--green"><Waves size={26} /></span>
                <div><strong>{PARCELS.length}</strong><span>Parcelas</span></div>
              </div>
              <div className="summary__stat">
                <span className="summary__icon summary__icon--green"><Sprout size={26} /></span>
                <div><strong>{totalArea.toFixed(1)} ha</strong><span>Superficie total</span></div>
              </div>
              <div className="summary__stat">
                <span className="summary__icon summary__icon--gold"><Wheat size={26} /></span>
                <div><strong>{PARCELS.length}</strong><span>Cultivos activos</span></div>
              </div>
            </div>

            <Button
              type="primary"
              shape="round"
              size="large"
              icon={<PlusOutlined />}
              className="summary__cta"
              onClick={() => navigate("/mis-cultivos/nueva")}
            >
              Nueva parcela
            </Button>
          </section>

          {/* ---------- Filtros ---------- */}
          <section className="filters">
            <Input
              className="filters__search"
              size="large"
              prefix={<SearchOutlined />}
              placeholder="Buscar por nombre…"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              allowClear
            />

            <div className="filters__select">
              <Sprout size={18} />
              <Select
                value={crop}
                onChange={setCrop}
                variant="borderless"
                size="large"
                popupMatchSelectWidth={false}
                options={[
                  { value: "all", label: "Todos los cultivos" },
                  { value: "Maíz", label: "Maíz" },
                  { value: "Frijol", label: "Frijol" },
                  { value: "Sorgo", label: "Sorgo" },
                ]}
              />
            </div>

            <div className="filters__select">
              <Waves size={18} />
              <Select
                value={status}
                onChange={setStatus}
                variant="borderless"
                size="large"
                popupMatchSelectWidth={false}
                options={[
                  { value: "all", label: "Todos los estados" },
                  { value: "active", label: "Activa" },
                  { value: "review", label: "En revisión" },
                ]}
              />
            </div>

            <Segmented
              className="filters__toggle"
              size="large"
              value={view}
              onChange={setView}
              options={[
                { value: "grid", icon: <AppstoreOutlined />, "aria-label": "Cuadrícula" },
                { value: "map", icon: <EnvironmentOutlined />, "aria-label": "Mapa" },
              ]}
            />
          </section>

          {/* ---------- Tarjetas ---------- */}
          <Row gutter={[24, 24]} className="cards">
            <Col xs={24} md={12} xl={6}>
              <button type="button" className="new-card" onClick={() => navigate("/mis-cultivos/nueva")}>
                <span className="new-card__plus"><PlusOutlined /></span>
                <h3>Marcar nueva parcela</h3>
                <p>Dibuja en el mapa o carga<br />un polígono</p>
                <svg viewBox="0 0 300 90" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M0 45 C60 5 140 22 190 48 C230 66 270 44 300 32 L300 90 L0 90Z" fill="#c6dbb0" />
                  <path d="M0 68 C80 46 170 76 300 56 L300 90 L0 90Z" fill="#a8c68a" />
                </svg>
              </button>
            </Col>

            {filtered.map((p) => (
              <Col key={p.id} xs={24} md={12} xl={6}>
                <ParcelCard parcel={p} onClick={() => navigate(`/mis-cultivos/${p.id}`)} />
              </Col>
            ))}
          </Row>

          {/* ---------- Aviso ---------- */}
          <section className="notice">
            <span className="notice__icon"><Sprout size={26} /></span>
            <div className="notice__text">
              <strong>Toka te acompaña en cada decisión</strong>
              <p>Toka es una herramienta de apoyo. No reemplaza tu criterio ni el de tu técnico agrícola. Los valores de esta pantalla son ilustrativos.</p>
            </div>
            <Button shape="round" size="large" className="notice__btn">
              Conocer más ↗
            </Button>
          </section>
        </main>
      </div>
    </ConfigProvider>
  );
};

export default MyPercels;