import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  Empty,
  Input,
  Row,
  Segmented,
  Select,
  Spin,
  Tag,
  Typography,
} from "antd";
import {
  AppstoreOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import Navbar from "../../components/Navbar/Navbar.compnent";
import SidebarDesktop from "../../components/Sidebar/Sidebar.component.desktop";
import { Sprout, Waves, Wheat } from "../../assets/Icons";
import "./MyPercels.css";
import useWeatherLocation from "../../hooks/useWeatherLocation";
import { auth } from "../../services/firebase";
import { urlBackend } from "../../config/backend.config";
import { polygonAreaM2 } from "../../utils/geo";

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

const STATUS_LABELS = {
  FALLOW: "Fallow",
  ACTIVE: "Active",
  GROWING: "Growing",
  HARVEST: "Harvest",
  REVIEW: "Under review",
};
const statusLabel = (s) => STATUS_LABELS[s] ?? s ?? "—";
const statusTone = (s) => (s === "ACTIVE" ? "active" : "review");

const ringToHa = (ring) => {
  if (!Array.isArray(ring) || ring.length < 3) return 0;
  return polygonAreaM2(ring.map(([lng, lat]) => [lat, lng])) / 10000;
};

const parcelAreaHa = (parcel) =>
  ringToHa(parcel?.polygon?.coordinates?.[0] ?? []);

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
};

/* ---------- Mini polygon preview (projects GeoJSON ring to a 456x268 SVG) ---------- */
function MiniPolygonMap({ polygon, status, id }) {
  const pts = useMemo(() => {
    const ring = polygon?.coordinates?.[0] ?? [];
    if (ring.length < 3) return null;

    const lngs = ring.map(([lng]) => lng);
    const lats = ring.map(([, lat]) => lat);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const w = maxLng - minLng || 1e-6;
    const h = maxLat - minLat || 1e-6;

    const W = 456;
    const H = 268;
    const pad = 40;
    const scale = Math.min((W - pad * 2) / w, (H - pad * 2) / h);
    const cx = W / 2;
    const cy = H / 2;
    const mx = (minLng + maxLng) / 2;
    const my = (minLat + maxLat) / 2;

    return ring.map(([lng, lat]) => [
      cx + (lng - mx) * scale,
      cy - (lat - my) * scale,
    ]);
  }, [polygon]);

  const pid = `hatch-${id}`;
  const d = pts ? `M${pts.map((p) => p.join(" ")).join(" L")} Z` : null;

  return (
    <div className="parcel-map">
      <svg viewBox="0 0 456 268" role="img" aria-label="Parcel polygon">
        <defs>
          <pattern
            id={pid}
            width="12"
            height="12"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(32)"
          >
            <rect width="12" height="12" fill="#86b855" />
            <rect width="5" height="12" fill="#4a7a2e" opacity="0.7" />
          </pattern>
        </defs>
        <rect width="456" height="268" fill="#eef3e2" />
        {d ? (
          <>
            <path
              d={d}
              fill={`url(#${pid})`}
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {pts.map(([x, y], i) => (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="5"
                fill="#ffffff"
                stroke="#4a7a2e"
                strokeWidth="2"
              />
            ))}
          </>
        ) : (
          <text
            x="228"
            y="140"
            textAnchor="middle"
            fill="#5f7d4b"
            fontSize="16"
          >
            No polygon
          </text>
        )}
      </svg>

      <Tag bordered={false} className="status-pill">
        <i className={`status-dot status-dot--${statusTone(status)}`} />
        {statusLabel(status)}
      </Tag>
    </div>
  );
}

function ParcelCard({ parcel, onClick }) {
  const area = parcelAreaHa(parcel);

  return (
    <Card
      hoverable
      className="parcel-card"
      cover={
        <MiniPolygonMap
          polygon={parcel.polygon}
          status={parcel.status}
          id={parcel.id}
        />
      }
      onClick={onClick}
    >
      <div className="parcel-card__head">
        <span className="parcel-card__sprout">
          <Sprout size={22} />
        </span>
        <div className="parcel-card__titles">
          <h3>{parcel.name}</h3>
          <span>Created {formatDate(parcel.createdAt)}</span>
        </div>
        <strong>{area > 0 ? `${area.toFixed(2)} ha` : "—"}</strong>
      </div>
    </Card>
  );
}

/* ---------- Mobile detection (<= 768px) ---------- */
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

/* ---------- View ---------- */
const MyParcels = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [view, setView] = useState("grid");

  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const weather = useWeatherLocation();

  useEffect(() => {
    let cancelled = false;

    const loadParcels = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = await auth.currentUser?.getIdToken();
        if (!token) throw new Error("No active session");

        const res = await fetch(`${urlBackend}/parcels/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        if (!cancelled) setParcels(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load parcels");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadParcels();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return parcels.filter(
      (p) =>
        (!q || p.name?.toLowerCase().includes(q)) &&
        (status === "all" || p.status === status)
    );
  }, [parcels, search, status]);

  const totalArea = useMemo(
    () => parcels.reduce((sum, p) => sum + parcelAreaHa(p), 0),
    [parcels]
  );

  const fallowCount = useMemo(
    () => parcels.filter((p) => p.status === "FALLOW").length,
    [parcels]
  );

  const statusOptions = useMemo(() => {
    const unique = Array.from(
      new Set(parcels.map((p) => p.status).filter(Boolean))
    );
    return [
      { value: "all", label: "All statuses" },
      ...unique.map((s) => ({ value: s, label: statusLabel(s) })),
    ];
  }, [parcels]);

  return (
    <ConfigProvider theme={theme}>
      <div className="my-percels">
        <Navbar
          isMobile={false}
          active="home"
          location={weather.location}
          temperature={weather.temperature}
          condition={weather.condition}
        />

        {!isMobile && <SidebarDesktop active="parcels" />}

        <main className="my-percels__main">
          {/* ---------- Hero ---------- */}
          <section className="hero">
            <svg
              className="hero__art"
              viewBox="0 0 560 300"
              preserveAspectRatio="xMaxYMax slice"
              aria-hidden="true"
            >
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
                My Parcels <Sprout size={34} />
              </Typography.Title>
              <p>Manage your parcels and discover what to grow next.</p>
            </div>
          </section>

          {/* ---------- Summary ---------- */}
          <section className="summary">
            <div className="summary__stats">
              <div className="summary__stat">
                <span className="summary__icon summary__icon--green">
                  <Waves size={26} />
                </span>
                <div>
                  <strong>{parcels.length}</strong>
                  <span>Parcels</span>
                </div>
              </div>
              <div className="summary__stat">
                <span className="summary__icon summary__icon--green">
                  <Sprout size={26} />
                </span>
                <div>
                  <strong>{totalArea.toFixed(1)} ha</strong>
                  <span>Total area</span>
                </div>
              </div>
              <div className="summary__stat">
                <span className="summary__icon summary__icon--gold">
                  <Wheat size={26} />
                </span>
                <div>
                  <strong>{fallowCount}</strong>
                  <span>Fallow</span>
                </div>
              </div>
            </div>

            <Button
              type="primary"
              shape="round"
              size="large"
              icon={<PlusOutlined />}
              className="summary__cta"
              onClick={() => navigate("/parcels/add")}
            >
              New parcel
            </Button>
          </section>

          {/* ---------- Filters ---------- */}
          <section className="filters">
            <Input
              className="filters__search"
              size="large"
              prefix={<SearchOutlined />}
              placeholder="Search by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />

            <div className="filters__select">
              <Waves size={18} />
              <Select
                value={status}
                onChange={setStatus}
                variant="borderless"
                size="large"
                popupMatchSelectWidth={false}
                options={statusOptions}
              />
            </div>

            <Segmented
              className="filters__toggle"
              size="large"
              value={view}
              onChange={setView}
              options={[
                { value: "grid", icon: <AppstoreOutlined />, "aria-label": "Grid" },
                { value: "map", icon: <EnvironmentOutlined />, "aria-label": "Map" },
              ]}
            />
          </section>

          {/* ---------- Cards ---------- */}
          {loading ? (
            <div style={{ padding: 48, textAlign: "center" }}>
              <Spin size="large" />
            </div>
          ) : error ? (
            <div style={{ padding: 24 }}>
              <Empty description={`We couldn't load your parcels: ${error}`} />
            </div>
          ) : (
            <Row gutter={[24, 24]} className="cards">
              <Col xs={24} md={12} xl={6}>
                <button
                  type="button"
                  className="new-card"
                  onClick={() => navigate("/parcels/add")}
                >
                  <span className="new-card__plus">
                    <PlusOutlined />
                  </span>
                  <h3>Mark a new parcel</h3>
                  <p>
                    Draw on the map or upload
                    <br />a polygon
                  </p>
                  <svg
                    viewBox="0 0 300 90"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M0 45 C60 5 140 22 190 48 C230 66 270 44 300 32 L300 90 L0 90Z"
                      fill="#c6dbb0"
                    />
                    <path
                      d="M0 68 C80 46 170 76 300 56 L300 90 L0 90Z"
                      fill="#a8c68a"
                    />
                  </svg>
                </button>
              </Col>

              {filtered.length === 0 && parcels.length > 0 && (
                <Col span={24}>
                  <Empty description="No parcels match the current filters" />
                </Col>
              )}

              {filtered.length === 0 && parcels.length === 0 && (
                <Col span={24}>
                  <Empty description="You don't have any parcels yet" />
                </Col>
              )}

              {filtered.map((p) => (
                <Col key={p.id} xs={24} md={12} xl={6}>
                  <ParcelCard
                    parcel={p}
                    onClick={() => navigate(`/parcels/${p.id}`)}
                  />
                </Col>
              ))}
            </Row>
          )}
        </main>
      </div>
    </ConfigProvider>
  );
};

export default MyParcels;