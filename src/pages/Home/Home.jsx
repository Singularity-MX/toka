import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Col, ConfigProvider, Progress, Row, Segmented, Tag, Timeline, Typography } from "antd";
import {
  ArrowRightOutlined,
  ArrowUpOutlined,
  BulbOutlined,
  CloudOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import Navbar from "@/components/Navbar/Navbar";
import { useIsMobile } from "@/hooks/useIsMobile";
import SidebarDesktop from "@/components/Sidebar/SidebarDesktop";
import { Drop, Sprout, SunIcon, Waves } from "@/components/icons/Icons";
import "./Home.css";
import { auth } from "@/services/firebase";
/* Ant Design theme (move it to your App.jsx if you want it to apply to the whole app) */
const theme = {
  token: {
    colorPrimary: "#4a6d2b",
    colorText: "#17332b",
    fontFamily: '"Nunito", system-ui, sans-serif',
    borderRadius: 12,
  },
  components: {
    Segmented: {
      trackBg: "#f1f3e6",
      trackPadding: 4,
      itemSelectedBg: "#17332b",
      itemSelectedColor: "#ffffff",
      itemColor: "#17332b",
      borderRadius: 999,
      borderRadiusSM: 999,
    },
    Button: { fontWeight: 700 },
  },
};

/* ---------- Made-up data: replace it with data from your API ---------- */
const USER_NAME = auth.currentUser?.displayName || "Singularity";

const KPIS = [
  { key: "water", icon: <Drop size={26} />, tone: "blue", label: "Water savings", value: "+16%", delta: "+3.2 pts vs. last month" },
  { key: "soil", icon: <Sprout size={26} />, tone: "green", label: "Soil health", value: "78/100", delta: "+5 pts vs. last month" },
  { key: "income", icon: <DollarCircleOutlined style={{ fontSize: 26 }} />, tone: "gold", label: "Estimated income", value: "$48,200", delta: "+12% vs. last cycle" },
  { key: "parcels", icon: <Waves size={26} />, tone: "green", label: "Active plots", value: "2 of 3", delta: "1 under review" },
];

const WATER_SERIES = {
  "7d": { labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], values: [11, 13, 12, 15, 14, 17, 16] },
  "30d": { labels: ["Wk 1", "Wk 2", "Wk 3", "Wk 4"], values: [9, 12, 14, 16] },
  "90d": { labels: ["Aug", "Sep", "Oct", "Nov"], values: [6, 10, 13, 16] },
};

const CROPS = [
  { name: "Corn", ha: 4.2, color: "#4a6d2b" },
  { name: "Beans", ha: 3.8, color: "#d9a21f" },
  { name: "Sorghum", ha: 4.5, color: "#8fbe55" },
];

const PARCELS = [
  { id: 1, name: "North Plot", crop: "Corn", ha: 4.2, status: "active", health: 82 },
  { id: 2, name: "Central Plot", crop: "Beans", ha: 3.8, status: "active", health: 76 },
  { id: 3, name: "South Plot", crop: "Sorghum", ha: 4.5, status: "review", health: 61 },
];

const ACTIVITIES = [
  { color: "#5b93df", title: "Scheduled irrigation", where: "North Plot", when: "Today · 6:00 pm" },
  { color: "#f07a2a", title: "Technical review", where: "South Plot", when: "Tomorrow · 9:30 am" },
  { color: "#4a6d2b", title: "Apply compost", where: "Central Plot", when: "Wed Nov 18" },
  { color: "#d9a21f", title: "Estimated harvest", where: "North Plot", when: "Dec 2" },
];

const FORECAST = [
  { day: "Today", icon: "sun", temp: "24°", rain: 0 },
  { day: "Sun", icon: "sun", temp: "25°", rain: 5 },
  { day: "Mon", icon: "cloud", temp: "22°", rain: 30 },
  { day: "Tue", icon: "rain", temp: "20°", rain: 70 },
  { day: "Wed", icon: "cloud", temp: "21°", rain: 25 },
];

/* ---------- Utilities ---------- */
function greeting(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 19) return "Good afternoon";
  return "Good evening";
}

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------- Area chart (SVG, no libraries) ---------- */
function AreaChart({ labels, values }) {
  const [hover, setHover] = useState(null);

  const W = 640, H = 270;
  const pad = { top: 24, right: 20, bottom: 36, left: 44 };
  const max = Math.max(24, Math.ceil(Math.max(...values) / 4) * 4);
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const pts = values.map((v, i) => [
    pad.left + (values.length === 1 ? innerW / 2 : (i / (values.length - 1)) * innerW),
    pad.top + innerH - (v / max) * innerH,
  ]);

  const line = pts.reduce((d, [x, y], i) => {
    if (i === 0) return `M${x} ${y}`;
    const [px, py] = pts[i - 1];
    const mx = (px + x) / 2;
    return `${d} C${mx} ${py} ${mx} ${y} ${x} ${y}`;
  }, "");
  const area = `${line} L${pts[pts.length - 1][0]} ${pad.top + innerH} L${pts[0][0]} ${pad.top + innerH} Z`;

  const ticks = [0, 1, 2, 3, 4].map((i) => (max / 4) * i);
  const active = hover ?? values.length - 1;
  const [ax, ay] = pts[active];
  const boxW = 96;
  const boxX = Math.min(Math.max(ax - boxW / 2, pad.left), W - pad.right - boxW);

  return (
    <svg className="area-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Water savings chart">
      <defs>
        <linearGradient id="waterFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5b93df" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#5b93df" stopOpacity="0" />
        </linearGradient>
      </defs>

      {ticks.map((t) => {
        const y = pad.top + innerH - (t / max) * innerH;
        return (
          <g key={t}>
            <line x1={pad.left} x2={W - pad.right} y1={y} y2={y} stroke="#e6e8da" strokeDasharray="4 6" />
            <text x={pad.left - 12} y={y + 4} textAnchor="end" className="chart-axis">{t}%</text>
          </g>
        );
      })}

      <path d={area} fill="url(#waterFill)" />
      <path d={line} fill="none" stroke="#5b93df" strokeWidth="3.5" strokeLinecap="round" />

      <line x1={ax} x2={ax} y1={pad.top} y2={pad.top + innerH} stroke="#5b93df" strokeOpacity="0.35" strokeDasharray="3 5" />

      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === active ? 7 : 4.5} fill="#fff" stroke="#5b93df" strokeWidth={i === active ? 4 : 3} />
      ))}

      {labels.map((l, i) => (
        <text key={l} x={pts[i][0]} y={H - 10} textAnchor="middle" className="chart-axis">{l}</text>
      ))}

      <g transform={`translate(${boxX} ${Math.max(ay - 50, 2)})`} className="chart-tip">
        <rect width={boxW} height="34" rx="10" fill="#17332b" />
        <text x={boxW / 2} y="22" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="800">
          +{values[active]}% water
        </text>
      </g>

      {/* Mouse / touch sensitive areas */}
      {pts.map(([x], i) => (
        <rect
          key={`hit-${i}`}
          x={x - innerW / values.length / 2}
          y={0}
          width={innerW / values.length}
          height={H}
          fill="transparent"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
          onTouchStart={() => setHover(i)}
        />
      ))}
    </svg>
  );
}

/* ---------- Crops donut ---------- */
function Donut({ data }) {
  const total = data.reduce((s, d) => s + d.ha, 0);
  const r = 70;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg className="donut" viewBox="0 0 200 200" role="img" aria-label="Crop distribution by hectare">
      <circle cx="100" cy="100" r={r} fill="none" stroke="#eef0e2" strokeWidth="26" />
      {data.map((d) => {
        const len = (d.ha / total) * c;
        const el = (
          <circle
            key={d.name}
            cx="100"
            cy="100"
            r={r}
            fill="none"
            stroke={d.color}
            strokeWidth="26"
            strokeDasharray={`${len - 3} ${c - len + 3}`}
            strokeDashoffset={-offset}
            transform="rotate(-90 100 100)"
            strokeLinecap="butt"
          />
        );
        offset += len;
        return el;
      })}
      <text x="100" y="98" textAnchor="middle" className="donut__value">{total.toFixed(1)}</text>
      <text x="100" y="120" textAnchor="middle" className="donut__label">hectares</text>
    </svg>
  );
}

function ForecastIcon({ type }) {
  if (type === "sun") return <SunIcon size={28} style={{ color: "#e0a923" }} />;
  return <CloudOutlined style={{ fontSize: 28, color: type === "rain" ? "#5b93df" : "#8aa09a" }} />;
}

/* ---------- View ---------- */
const Home = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [range, setRange] = useState("7d");

  const now = useMemo(() => new Date(), []);
  const dateText = useMemo(
    () => capitalize(new Intl.DateTimeFormat("en-US", { weekday: "long", day: "numeric", month: "long" }).format(now)),
    [now]
  );
  const series = WATER_SERIES[range];

  return (
    <ConfigProvider theme={theme}>
      <div className="home">
        <Navbar
          isMobile={isMobile}
          active="home"
          search={search}
          onSearchChange={setSearch}
          location="San Pedro, Gto."
          temperature="24 °C"
          hasNotifications
          userInitial={USER_NAME.charAt(0)}
          onAvatarClick={() => navigate("/profile")}
        />

        {/* Desktop: fixed sidebar, vertically centered. Mobile: the menu lives in the Navbar. */}
        {!isMobile && <SidebarDesktop active="home" />}

        <main className="home__main">
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
              <span className="hero__date">{dateText}</span>
              <Typography.Title level={1} className="hero__title">
                {greeting(now.getHours())}, {USER_NAME}
              </Typography.Title>
              <p>Here’s how your crops are doing today. No rain in the next 48 hours: a good time to irrigate.</p>
            </div>
          </section>

          {/* ---------- KPIs (on top of the illustration) ---------- */}
          <section className="kpis">
            {KPIS.map(({ key, icon, tone, label, value, delta }) => (
              <div className="kpi" key={key}>
                <span className={`kpi__icon kpi__icon--${tone}`}>{icon}</span>
                <div className="kpi__body">
                  <span className="kpi__label">{label}</span>
                  <strong>{value}</strong>
                  <span className="kpi__delta"><ArrowUpOutlined /> {delta}</span>
                </div>
              </div>
            ))}
          </section>

          {/* ---------- Charts ---------- */}
          <Row gutter={[24, 24]} className="block">
            <Col xs={24} xl={16}>
              <article className="panel">
                <header className="panel__head">
                  <div>
                    <h2>Water savings</h2>
                    <p>Compared with traditional irrigation</p>
                  </div>
                  <Segmented
                    value={range}
                    onChange={setRange}
                    options={[
                      { value: "7d", label: "7 days" },
                      { value: "30d", label: "30 days" },
                      { value: "90d", label: "90 days" },
                    ]}
                  />
                </header>
                <AreaChart labels={series.labels} values={series.values} />
              </article>
            </Col>

            <Col xs={24} xl={8}>
              <article className="panel">
                <header className="panel__head">
                  <div>
                    <h2>My crops</h2>
                    <p>Area per crop</p>
                  </div>
                </header>
                <div className="crops">
                  <Donut data={CROPS} />
                  <ul className="crops__legend">
                    {CROPS.map((c) => (
                      <li key={c.name}>
                        <i style={{ background: c.color }} />
                        <span>{c.name}</span>
                        <strong>{c.ha} ha</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Col>
          </Row>

          {/* ---------- Plots, activities and recommendation ---------- */}
          <Row gutter={[24, 24]} className="block">
            <Col xs={24} xl={10}>
              <article className="panel">
                <header className="panel__head">
                  <div>
                    <h2>Status of my plots</h2>
                    <p>Overall soil and crop health</p>
                  </div>
                  <Button type="link" className="link-btn" onClick={() => navigate("/parcels")}>
                    View all <ArrowRightOutlined />
                  </Button>
                </header>

                <ul className="plots">
                  {PARCELS.map((p) => (
                    <li key={p.id} className="plot" onClick={() => navigate(`/parcels/${p.id}`)}>
                      <span className="plot__icon"><Sprout size={22} /></span>
                      <div className="plot__info">
                        <div className="plot__top">
                          <strong>{p.name}</strong>
                          <Tag bordered={false} className={`tag tag--${p.status}`}>
                            {p.status === "active" ? "Active" : "Under review"}
                          </Tag>
                        </div>
                        <span className="plot__sub">{p.crop} · {p.ha} ha</span>
                        <Progress
                          percent={p.health}
                          showInfo={false}
                          strokeColor={p.health >= 75 ? "#4f7a34" : "#d9a21f"}
                          trailColor="#e6e8da"
                          size={["100%", 8]}
                        />
                      </div>
                      <span className="plot__score">{p.health}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Col>

            <Col xs={24} md={12} xl={8}>
              <article className="panel">
                <header className="panel__head">
                  <div>
                    <h2>Upcoming activities</h2>
                    <p>What’s coming up on your plots</p>
                  </div>
                </header>

                <Timeline
                  className="activities"
                  items={ACTIVITIES.map((a) => ({
                    color: a.color,
                    children: (
                      <div className="activity">
                        <strong>{a.title}</strong>
                        <span>{a.where}</span>
                        <em>{a.when}</em>
                      </div>
                    ),
                  }))}
                />
              </article>
            </Col>

            <Col xs={24} md={12} xl={6}>
              <article className="tip">
                <span className="tip__icon"><BulbOutlined /></span>
                <h2>Toka recommends</h2>
                <p>
                  After harvesting the corn on the <b>North Plot</b>, plant <b>beans</b>: they fix nitrogen
                  in the soil and can save you up to 12% of water.
                </p>
                <Button shape="round" size="large" className="tip__btn" onClick={() => navigate("/parcels")}>
                  See recommendation <ArrowRightOutlined />
                </Button>
              </article>
            </Col>
          </Row>

          {/* ---------- Forecast ---------- */}
          <section className="panel forecast">
            <header className="panel__head">
              <div>
                <h2>Weekly forecast</h2>
                <p>San Pedro, Gto.</p>
              </div>
            </header>
            <div className="forecast__grid">
              {FORECAST.map((f) => (
                <div className="day" key={f.day}>
                  <span className="day__name">{f.day}</span>
                  <ForecastIcon type={f.icon} />
                  <strong>{f.temp}</strong>
                  <span className="day__rain"><Drop size={14} /> {f.rain}%</span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </ConfigProvider>
  );
};

export default Home;