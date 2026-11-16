import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import L from "leaflet";
import { MapContainer, Polygon, TileLayer, Marker, useMap } from "react-leaflet";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  EnvironmentOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import {
  Button,
  ConfigProvider,
  Descriptions,
  Modal,
  Progress,
  Radio,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";

import "leaflet/dist/leaflet.css";
import "./ViewPercel.css";

import { auth } from "../../services/firebase";
import { urlBackend } from "../../config/backend.config";

/* ---------- Theme ---------- */
const theme = {
  token: {
    colorPrimary: "#4a6d2b",
    colorText: "#17332b",
    fontFamily: '"Nunito", system-ui, sans-serif',
    borderRadius: 12,
  },
  components: { Button: { fontWeight: 700 } },
};

const TILES = {
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
  },
};

/* =========================================================
   RECOMMENDATION SYSTEM DATA
   ---------------------------------------------------------
   For now this is sample (illustrative) data. When your backend
   delivers it, set USE_MOCK = false and adjust the endpoint.
   Expected response shape:
   {
     conditions: { soilMoisture, landTemp, ndvi, rain30d },
     recommendations: [...],
     currentCalendar: [...],
     strategies: [...]
   }
   Calendar: from/to are months (1 = Jan ... 13 = end of Dec, "to" is exclusive).
   type: "bare" | "crop" | "cover"
   ========================================================= */
const USE_MOCK = true;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const MOCK_RECO = {
  conditions: {
    soilMoisture: { value: "0.21", unit: "m³/m³", note: "Below the seasonal average" },
    landTemp: { value: "31", unit: "°C", note: "Heat stress: low" },
    ndvi: { value: "0.18", unit: "", note: "Soil mostly bare" },
    rain30d: { value: "18", unit: "mm", note: "Last 30 days" },
  },
  recommendations: [
    {
      id: "r1",
      priority: "high",
      tag: "High priority",
      tagColor: "green",
      title: "Cover the soil during the period without a crop",
      text: "Your plot usually sits bare from November to March. An oat cover crop reduces erosion and evaporation.",
      evidence: "Evidence: MODIS NDVI · GPM rainfall",
    },
    {
      id: "r2",
      priority: "normal",
      tag: "Water",
      tagColor: "blue",
      title: "Include a crop with lower water demand",
      text: "Soil moisture has dropped compared to the average. Beans or barley use less water than continuous corn.",
      evidence: "Evidence: SMAP · evapotranspiration",
    },
    {
      id: "r3",
      priority: "normal",
      tag: "Nitrogen",
      tagColor: "orange",
      title: "Add a legume to the rotation",
      text: "Alfalfa or beans fix nitrogen and improve organic matter for the next crop.",
      evidence: "Evidence: local soil · crop characteristics",
    },
  ],
  currentCalendar: [
    { label: "Bare soil", type: "bare", from: 1, to: 4 },
    { label: "Corn", type: "crop", from: 4, to: 11 },
    { label: "Bare", type: "bare", from: 11, to: 13 },
  ],
  strategies: [
    {
      id: "current",
      name: "Current rotation",
      recommended: false,
      rotation: ["Corn", "Corn", "Corn"],
      scores: { water: 35, soil: 30, market: 80 },
      why: "It is the baseline the others are compared against.",
      risk: "Monoculture: higher pest pressure and lower organic matter.",
      calendar: [
        { label: "Bare soil", type: "bare", from: 1, to: 4 },
        { label: "Corn", type: "crop", from: 4, to: 11 },
        { label: "Bare", type: "bare", from: 11, to: 13 },
      ],
    },
    {
      id: "A",
      name: "Strategy A",
      recommended: true,
      rotation: ["Corn", "Beans", "Wheat"],
      scores: { water: 75, soil: 85, market: 70 },
      why: "Beans add nitrogen and break the pest cycle of corn.",
      risk: "Check with your technician: seed availability and the local price of beans.",
      calendar: [
        { label: "Oats (cover crop)", type: "cover", from: 1, to: 4 },
        { label: "Beans", type: "crop", from: 4, to: 10 },
        { label: "Cover crop", type: "cover", from: 10, to: 13 },
      ],
    },
    {
      id: "B",
      name: "Strategy B",
      recommended: false,
      rotation: ["Corn", "Alfalfa", "Barley"],
      scores: { water: 55, soil: 90, market: 60 },
      why: "Better forage value and deep roots that improve infiltration.",
      risk: "Information gap: alfalfa demands more water and irrigation availability data is missing.",
      calendar: [{ label: "Alfalfa", type: "crop", from: 1, to: 13 }],
    },
  ],
};

/* ---------- Utilities ---------- */
const toRad = (d) => (d * Math.PI) / 180;

function polygonAreaM2(pts) {
  const n = pts.length;
  if (n < 3) return 0;
  const R = 6378137;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const [lat1, lng1] = pts[i];
    const [lat2, lng2] = pts[(i + 1) % n];
    sum += toRad(lng2 - lng1) * (2 + Math.sin(toRad(lat1)) + Math.sin(toRad(lat2)));
  }
  return Math.abs((sum * R * R) / 2);
}

const fmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

/* GeoJSON Polygon [lng,lat] → Leaflet [[lat,lng], ...] */
function geojsonToLeafletPositions(polygon) {
  if (!polygon?.coordinates?.[0]) return [];
  return polygon.coordinates[0].map(([lng, lat]) => [lat, lng]);
}

/* ---------- Fit the map to the polygon ---------- */
function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length >= 3) {
      map.fitBounds(positions, { padding: [40, 40] });
    }
  }, [positions, map]);
  return null;
}

/* ---------- Vertex icon ---------- */
const vertexIcon = (index) =>
  L.divIcon({
    className: `vp-vertex ${index === 0 ? "vp-vertex--first" : ""}`,
    html: `<span>${index + 1}</span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });

/* ---------- Before → Now → After sequence ---------- */
function Sequence({ crops }) {
  return (
    <div className="vp-seq">
      {crops.map((c, i) => (
        <React.Fragment key={`${c}-${i}`}>
          <span className="vp-seq__crop">{c}</span>
          {i < crops.length - 1 && <ArrowRightOutlined className="vp-seq__arrow" />}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ---------- Score bar ---------- */
function Score({ label, value }) {
  return (
    <div className="vp-score">
      <div className="vp-score__head">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <Progress percent={value} showInfo={false} size="small" strokeColor="#4a6d2b" trailColor="#e8efd6" />
    </div>
  );
}

/* ---------- Calendar row ---------- */
function CalendarRow({ label, segments }) {
  return (
    <>
      <span className="vp-cal__row-label">{label}</span>
      {segments.map((s, i) => (
        <span
          key={`${s.label}-${i}`}
          className={`vp-cal__seg vp-cal__seg--${s.type}`}
          style={{ gridColumn: `${s.from + 1} / ${s.to + 1}` }}
        >
          {s.label}
        </span>
      ))}
    </>
  );
}

/* ---------- View ---------- */
const ViewParcel = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [messageApi, contextHolder] = message.useMessage();

  // If we came from the "create" flow, the payload is already in state → render immediately
  // If we arrive through a direct URL or F5, we fetch by ID
  const [parcel, setParcel] = useState(location.state?.parcel ?? null);
  const [loading, setLoading] = useState(!location.state?.parcel);

  // Recommendations
  const [reco, setReco] = useState(USE_MOCK ? MOCK_RECO : null);

  // Selected strategy + "Start cultivation" modal
  const [selectedId, setSelectedId] = useState("A");
  const [modalOpen, setModalOpen] = useState(false);
  const [starting, setStarting] = useState(false);

  /* ----- Load plot ----- */
  useEffect(() => {
    if (parcel) {
      setLoading(false);
      return;
    }
    if (!id) return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const token = await auth.currentUser?.getIdToken();
        if (!token) throw new Error("Your session expired. Please sign in again.");

        const res = await fetch(`${urlBackend}/parcels/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || `HTTP error ${res.status}`);
        }

        const data = await res.json();
        if (!cancelled) setParcel(data);
      } catch (err) {
        console.error("❌ Error loading plot:", err);
        if (!cancelled) messageApi.error(err.message || "We couldn’t load the plot.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* ----- REQUEST TO THE RECOMMENDATION SYSTEM ----- */
  useEffect(() => {
    if (USE_MOCK || !parcel?.id) return;

    let cancelled = false;

    (async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) return;

        // TODO: adjust the endpoint to your recommendation system
        const res = await fetch(`${urlBackend}/parcels/${parcel.id}/recommendations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);

        const data = await res.json();
        if (!cancelled) {
          setReco(data);
          const rec = data.strategies?.find((s) => s.recommended);
          if (rec) setSelectedId(rec.id);
        }
      } catch (err) {
        console.error("❌ Error loading recommendations:", err);
        if (!cancelled) messageApi.error("We couldn’t load the recommendations.");
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parcel?.id]);

  /* ----- Start cultivation ----- */
  const handleStartCultivation = async () => {
    try {
      setStarting(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Your session expired. Please sign in again.");

      // TODO: adjust the endpoint and body to your backend
      const res = await fetch(`${urlBackend}/parcels/${parcel.id}/start-cultivation`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ strategyId: selectedId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP error ${res.status}`);
      }

      setParcel((prev) => ({ ...prev, status: "growing", strategyId: selectedId }));
      setModalOpen(false);
      messageApi.success("Cultivation started!");
    } catch (err) {
      console.error("❌ Error starting cultivation:", err);
      messageApi.error(err.message || "We couldn’t start the cultivation.");
    } finally {
      setStarting(false);
    }
  };

  /* ----- Derived values ----- */
  const positions = useMemo(
    () => (parcel?.polygon ? geojsonToLeafletPositions(parcel.polygon) : []),
    [parcel]
  );

  const areaHa = useMemo(() => {
    if (!positions.length) return null;
    return polygonAreaM2(positions) / 10000;
  }, [positions]);

  const center = positions.length
    ? positions.reduce(
        (acc, [lat, lng]) => [acc[0] + lat / positions.length, acc[1] + lng / positions.length],
        [0, 0]
      )
    : [20.73, -101.95];

  const isGrowing = parcel?.status === "growing"; // "growing" | "fallow"
  const strategies = reco?.strategies ?? [];
  const selected = strategies.find((s) => s.id === selectedId) ?? strategies[0];

  /* ----- Loading ----- */
  if (loading) {
    return (
      <ConfigProvider theme={theme}>
        {contextHolder}
        <div className="view-parcel view-parcel--loading">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
          <p>Loading plot…</p>
        </div>
      </ConfigProvider>
    );
  }

  /* ----- Not found ----- */
  if (!parcel) {
    return (
      <ConfigProvider theme={theme}>
        {contextHolder}
        <div className="view-parcel view-parcel--empty">
          <EnvironmentOutlined style={{ fontSize: 48, color: "#a5b5a8" }} />
          <h2>Plot not found</h2>
          <p>It may have been deleted or the link may be incorrect.</p>
          <Button type="primary" shape="round" icon={<ArrowLeftOutlined />} onClick={() => navigate("/parcels")}>
            Back to my plots
          </Button>
        </div>
      </ConfigProvider>
    );
  }

  /* ----- Normal view ----- */
  return (
    <ConfigProvider theme={theme}>
      {contextHolder}
      <div className="view-parcel">
        <main className="view-parcel__main">
          {/* ---------- Hero ---------- */}
          <section className="vp-hero">
            <Button
              type="text"
              shape="round"
              icon={<ArrowLeftOutlined />}
              className="vp-back"
              onClick={() => navigate("/parcels")}
            >
              Back
            </Button>

            <div className="vp-hero__row">
              <div className="vp-hero__text">
                <Tag color="green" className="vp-tag">Plot</Tag>
                <Typography.Title level={1} className="vp-hero__title">
                  {parcel.name}
                </Typography.Title>
                <p className="vp-hero__subtitle">
                  <EnvironmentOutlined />{" "}
                  {areaHa != null ? `${fmt.format(areaHa)} ha` : "Area not available"} ·{" "}
                  {positions.length} vertices
                </p>
              </div>

              <div className="vp-hero__status">
                <span className={`vp-status ${isGrowing ? "is-growing" : "is-fallow"}`}>
                  ● {isGrowing ? "Growing" : "Not planted"}
                </span>
                <Button
                  type="primary"
                  shape="round"
                  size="large"
                  className="vp-start"
                  disabled={isGrowing}
                  onClick={() => setModalOpen(true)}
                >
                  {isGrowing ? "Cultivation in progress" : "Start cultivation"}
                </Button>
              </div>
            </div>
          </section>

          {/* ---------- Map + conditions ---------- */}
          <section className="vp-top">
            <div className="vp-map-wrap">
              <MapContainer center={center} zoom={16} maxZoom={19} className="vp-map">
                <TileLayer url={TILES.satellite.url} attribution={TILES.satellite.attribution} maxZoom={19} />
                <FitBounds positions={positions} />

                {positions.length >= 3 && (
                  <Polygon
                    positions={positions}
                    pathOptions={{ color: "#ffd75e", weight: 3, fillColor: "#6fbf4a", fillOpacity: 0.35 }}
                  />
                )}

                {positions.map((p, i) => (
                  <Marker key={i} position={p} icon={vertexIcon(i)} interactive={false} />
                ))}
              </MapContainer>
            </div>

            {reco && (
              <aside className="vp-card vp-conditions">
                <div>
                  <h2>Current conditions</h2>
                  <p className="vp-card__sub" style={{ marginBottom: 0 }}>NASA satellite observations</p>
                </div>

                <div className="vp-cond vp-cond--soil">
                  <span className="vp-cond__label">Soil moisture · SMAP</span>
                  <strong>{reco.conditions.soilMoisture.value} <small>{reco.conditions.soilMoisture.unit}</small></strong>
                  <span className="vp-cond__note">{reco.conditions.soilMoisture.note}</span>
                </div>

                <div className="vp-cond vp-cond--temp">
                  <span className="vp-cond__label">Surface temperature · ECOSTRESS</span>
                  <strong>{reco.conditions.landTemp.value} <small>{reco.conditions.landTemp.unit}</small></strong>
                  <span className="vp-cond__note">{reco.conditions.landTemp.note}</span>
                </div>

                <div className="vp-cond vp-cond--ndvi">
                  <span className="vp-cond__label">Vegetation · MODIS NDVI</span>
                  <strong>{reco.conditions.ndvi.value}</strong>
                  <span className="vp-cond__note">{reco.conditions.ndvi.note}</span>
                </div>

                <div className="vp-cond vp-cond--rain">
                  <span className="vp-cond__label">Rainfall · GPM</span>
                  <strong>{reco.conditions.rain30d.value} <small>{reco.conditions.rain30d.unit}</small></strong>
                  <span className="vp-cond__note">{reco.conditions.rain30d.note}</span>
                </div>
              </aside>
            )}
          </section>

          {reco && (
            <>
              {/* ---------- Recommendations ---------- */}
              <section className="vp-card">
                <h2>Recommendations for your plot</h2>
                <p className="vp-card__sub">Sorted by the priorities you chose when setting up your account.</p>
                <div className="vp-grid">
                  {reco.recommendations.map((r) => (
                    <article key={r.id} className={`vp-rec ${r.priority === "high" ? "is-high" : ""}`}>
                      <Tag color={r.tagColor}>{r.tag}</Tag>
                      <h3>{r.title}</h3>
                      <p>{r.text}</p>
                      <span className="vp-rec__evidence">{r.evidence}</span>
                    </article>
                  ))}
                </div>
              </section>

              {/* ---------- Strategies ---------- */}
              <section className="vp-card">
                <h2>Compare rotation strategies</h2>
                <p className="vp-card__sub">Before → Now → After. Includes your current rotation as a baseline.</p>
                <div className="vp-grid">
                  {strategies.map((s) => {
                    const isSel = s.id === selectedId;
                    return (
                      <article
                        key={s.id}
                        className={`vp-strategy ${s.recommended ? "is-recommended" : ""} ${isSel ? "is-selected" : ""}`}
                      >
                        <div>
                          <Tag color={s.recommended ? "green" : s.id === "current" ? "default" : "blue"}>
                            {s.recommended ? `Recommended · ${s.name}` : s.name}
                          </Tag>
                        </div>

                        <Sequence crops={s.rotation} />

                        <Score label="Water savings" value={s.scores.water} />
                        <Score label="Soil health" value={s.scores.soil} />
                        <Score label="Market" value={s.scores.market} />

                        <p className="vp-strategy__note"><b>Why:</b> {s.why}</p>
                        <p className="vp-strategy__note"><b>Risk / to review:</b> {s.risk}</p>

                        <Button
                          shape="round"
                          type={isSel ? "primary" : "default"}
                          icon={isSel ? <CheckCircleFilled /> : undefined}
                          onClick={() => setSelectedId(s.id)}
                        >
                          {isSel ? "Selected" : "Choose this one"}
                        </Button>
                      </article>
                    );
                  })}
                </div>
              </section>

              {/* ---------- Calendar ---------- */}
              <section className="vp-card">
                <h2>Crop plan for the year</h2>
                <p className="vp-card__sub">
                  Compare when the soil is left bare in your current cycle and in “{selected?.name}”.
                </p>
                <div className="vp-cal-scroll">
                  <div className="vp-cal">
                    <span />
                    {MONTHS.map((m) => (
                      <span key={m} className="vp-cal__month">{m}</span>
                    ))}
                    <CalendarRow label="Current cycle" segments={reco.currentCalendar} />
                    {selected && <CalendarRow label={selected.name} segments={selected.calendar} />}
                  </div>
                </div>
              </section>
            </>
          )}

          {/* ---------- Details ---------- */}
          <section className="vp-details">
            <Descriptions bordered column={1} size="middle" labelStyle={{ width: 180, fontWeight: 700 }}>
              <Descriptions.Item label="ID">
                <code className="vp-code">{parcel.id}</code>
              </Descriptions.Item>
              <Descriptions.Item label="Status">{isGrowing ? "Growing" : "Not planted"}</Descriptions.Item>
              <Descriptions.Item label="Area">{areaHa != null ? `${fmt.format(areaHa)} ha` : "—"}</Descriptions.Item>
              <Descriptions.Item label="Vertices">{positions.length}</Descriptions.Item>
              <Descriptions.Item label="Created">
                <CalendarOutlined /> {new Date(parcel.createdAt).toLocaleString("en-US")}
              </Descriptions.Item>
              <Descriptions.Item label="Last updated">
                {new Date(parcel.updatedAt).toLocaleString("en-US")}
              </Descriptions.Item>
            </Descriptions>
          </section>

          {/* ---------- Notice ---------- */}
          <section className="vp-notice">
            <strong>Toka supports you in every decision</strong>
            <p>
              Toka is a support tool. It does not replace your judgment or that of your agricultural technician.
              {USE_MOCK && " The values on this screen are illustrative."}
            </p>
          </section>
        </main>
      </div>

      {/* ---------- Modal: start cultivation ---------- */}
      <Modal
        open={modalOpen}
        title="Start cultivation"
        okText="Start cultivation"
        cancelText="Cancel"
        confirmLoading={starting}
        onOk={handleStartCultivation}
        onCancel={() => setModalOpen(false)}
        okButtonProps={{ shape: "round" }}
        cancelButtonProps={{ shape: "round" }}
      >
        <p>Choose the rotation strategy you want to start with on “{parcel.name}”.</p>
        <Radio.Group
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="vp-modal-options"
        >
          {strategies.map((s) => (
            <Radio key={s.id} value={s.id} className="vp-modal-option">
              <strong>{s.recommended ? `${s.name} (recommended)` : s.name}</strong>
              <div className="vp-modal-option__seq">{s.rotation.join(" → ")}</div>
            </Radio>
          ))}
        </Radio.Group>
        {selected && <p className="vp-modal-why"><b>Why:</b> {selected.why}</p>}
      </Modal>
    </ConfigProvider>
  );
};

export default ViewParcel;