import React, { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Polygon,
  Polyline,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import {
  Button,
  ConfigProvider,
  Form,
  Input,
  Segmented,
  Steps,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  AimOutlined,
  ClearOutlined,
  EnvironmentOutlined,
  SaveOutlined,
  SearchOutlined,
  UndoOutlined,
} from "@ant-design/icons";

import "leaflet/dist/leaflet.css";
import "./AddParcel.css";

import { useNavigate } from "react-router-dom";
import { auth } from "@/services/firebase";
import { urlBackend } from "@/config/backend.config";

import {
  polygonAreaM2,
  toGeoJSONPolygon,
  fmt,
  vertexIcon,
  TILES,
} from "@/utils/geo";

const theme = {
  token: {
    colorPrimary: "#4a6d2b",
    colorText: "#17332b",
    fontFamily: '"Nunito", system-ui, sans-serif',
    borderRadius: 12,
  },
  components: { Button: { fontWeight: 700 } },
};

const DEFAULT_CENTER = [20.73, -101.95];
const DEFAULT_ZOOM = 12;

function ClickToAdd({ onAdd }) {
  useMapEvents({
    click(e) {
      onAdd([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target.center, target.zoom ?? 17, { duration: 1.2 });
  }, [target, map]);
  return null;
}

const AddParcels = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const [points, setPoints] = useState([]);
  const [basemap, setBasemap] = useState("satellite");
  const [flyTarget, setFlyTarget] = useState(null);
  const [located, setLocated] = useState(false);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  const name = Form.useWatch("name", form) ?? "";
  const canSave = points.length >= 3;
  const area = useMemo(() => polygonAreaM2(points), [points]);

  const addPoint = (p) => setPoints((prev) => [...prev, p]);
  const movePoint = (i, p) =>
    setPoints((prev) => prev.map((x, idx) => (idx === i ? p : x)));
  const removePoint = (i) => setPoints((prev) => prev.filter((_, idx) => idx !== i));
  const undo = () => setPoints((prev) => prev.slice(0, -1));
  const clearAll = () => setPoints([]);

  const handleSearch = async (value) => {
    const q = value?.trim();
    if (!q) return;
    try {
      setSearching(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=en&q=${encodeURIComponent(q)}`
      );
      const data = await res.json();
      if (!data.length) {
        messageApi.warning("We couldn't find that place. Try another name.");
        return;
      }
      setFlyTarget({ center: [Number(data[0].lat), Number(data[0].lon)], zoom: 16 });
      setLocated(true);
    } catch {
      messageApi.error("We couldn't search for the place. Check your connection.");
    } finally {
      setSearching(false);
    }
  };

  const handleLocate = () => {
    if (!navigator.geolocation) {
      messageApi.warning("Your browser doesn't allow getting your location.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setFlyTarget({ center: [coords.latitude, coords.longitude], zoom: 17 });
        setLocated(true);
      },
      () => messageApi.warning("We couldn't get your location. Check your permissions."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleFinish = async (values) => {
    if (!canSave) {
      messageApi.warning("Mark at least 3 points to form the parcel.");
      return;
    }

    const payload = {
      name: values.name.trim(),
      polygon: toGeoJSONPolygon(points),
      status: "FALLOW",
    };

    try {
      setSaving(true);

      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Your session expired. Please sign in again.");

      const res = await fetch(`${urlBackend}/parcels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = Array.isArray(err.message)
          ? err.message.join(", ")
          : err.message || `HTTP error ${res.status}`;
        throw new Error(msg);
      }

      const created = await res.json();

      messageApi.success({
        content: `Parcel "${created.name}" registered successfully`,
        duration: 2,
      });

      form.resetFields();
      setPoints([]);

      navigate(`/parcels/${created.id}`, { state: { parcel: created } });
    } catch (err) {
      console.error("❌ Error saving parcel:", err);
      messageApi.error(err.message || "We couldn't save the parcel. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const currentStep = !name.trim()
    ? 0
    : !located && points.length === 0
      ? 1
      : points.length < 3
        ? 2
        : 3;

  return (
    <ConfigProvider theme={theme}>
      {contextHolder}
      <div className="add-parcel">
        <main className="add-parcel__main">
          <section className="ap-hero">
            <svg
              className="ap-hero__art"
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
            <div className="ap-hero__text">
              <Typography.Title level={1} className="ap-hero__title">
                Add parcel <EnvironmentOutlined />
              </Typography.Title>
              <p>Give it a name and draw its outline on the map.</p>
            </div>
          </section>

          <section className="ap-steps">
            <Steps
              size="small"
              current={currentStep}
              responsive={false}
              items={[{ title: "Name" }, { title: "Locate" }, { title: "Draw" }]}
            />
          </section>

          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            onFinish={handleFinish}
            className="ap-layout"
          >
            <aside className="ap-panel">
              <div className="ap-card">
                <h2>
                  <span className="ap-badge">1</span> Parcel name
                </h2>
                <Form.Item
                  name="name"
                  rules={[
                    { required: true, whitespace: true, message: "Enter a name for your parcel" },
                    { max: 60, message: "Maximum 60 characters" },
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <Input size="large" placeholder="e.g. La Joya, North Parcel…" maxLength={60} />
                </Form.Item>
              </div>

              <div className="ap-card">
                <h2>
                  <span className="ap-badge">2</span> Find your land
                </h2>
                <Input.Search
                  size="large"
                  placeholder="Town, city or address"
                  enterButton={<SearchOutlined />}
                  loading={searching}
                  onSearch={handleSearch}
                />
                <Button
                  block
                  shape="round"
                  icon={<AimOutlined />}
                  onClick={handleLocate}
                  className="ap-locate"
                >
                  Use my location
                </Button>
              </div>

              <div className="ap-card">
                <h2>
                  <span className="ap-badge">3</span> Draw the outline
                </h2>
                <p className="ap-help">
                  Tap the map at each corner of your parcel. You can drag the points to
                  adjust them or right-click (long-press on mobile) to remove one.
                </p>

                <div className="ap-tools">
                  <Button
                    shape="round"
                    icon={<UndoOutlined />}
                    onClick={undo}
                    disabled={!points.length}
                  >
                    Undo
                  </Button>
                  <Button
                    shape="round"
                    danger
                    icon={<ClearOutlined />}
                    onClick={clearAll}
                    disabled={!points.length}
                  >
                    Clear all
                  </Button>
                </div>

                <div className="ap-stats">
                  <div>
                    <strong>{points.length}</strong>
                    <span>Points</span>
                  </div>
                  <div>
                    <strong>{canSave ? fmt.format(area / 10000) : "—"}</strong>
                    <span>Hectares</span>
                  </div>
                </div>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                shape="round"
                size="large"
                block
                icon={<SaveOutlined />}
                loading={saving}
                disabled={!canSave}
                className="ap-save"
              >
                Save parcel
              </Button>
              {!canSave && (
                <p className="ap-save-hint">Mark at least 3 points to save.</p>
              )}
            </aside>

            <section className="ap-map-wrap">
              <MapContainer
                center={DEFAULT_CENTER}
                zoom={DEFAULT_ZOOM}
                maxZoom={19}
                className="ap-map"
              >
                <TileLayer
                  key={basemap}
                  url={TILES[basemap].url}
                  attribution={TILES[basemap].attribution}
                  maxZoom={19}
                />
                <FlyTo target={flyTarget} />
                <ClickToAdd onAdd={addPoint} />

                {points.length >= 3 && (
                  <Polygon
                    positions={points}
                    interactive={false}
                    pathOptions={{
                      color: "#ffd75e",
                      weight: 3,
                      fillColor: "#6fbf4a",
                      fillOpacity: 0.35,
                    }}
                  />
                )}
                {points.length === 2 && (
                  <Polyline
                    positions={points}
                    interactive={false}
                    pathOptions={{ color: "#ffd75e", weight: 3, dashArray: "6 6" }}
                  />
                )}

                {points.map((p, i) => (
                  <Marker
                    key={i}
                    position={p}
                    draggable
                    icon={vertexIcon(i)}
                    eventHandlers={{
                      dragend: (e) => {
                        const { lat, lng } = e.target.getLatLng();
                        movePoint(i, [lat, lng]);
                      },
                      contextmenu: () => removePoint(i),
                    }}
                  />
                ))}
              </MapContainer>

              <div className="ap-basemap">
                <Segmented
                  value={basemap}
                  onChange={setBasemap}
                  options={[
                    { label: "Satellite", value: "satellite" },
                    { label: "Map", value: "map" },
                  ]}
                />
              </div>

              {points.length === 0 && (
                <div className="ap-hint">
                  <EnvironmentOutlined /> Tap the map to mark the first corner
                </div>
              )}
              {points.length > 0 && points.length < 3 && (
                <div className="ap-hint">
                  Keep marking corners ({3 - points.length} more to go)
                </div>
              )}
              {canSave && (
                <Tooltip title="Approximate, calculated on the map">
                  <div className="ap-area">{fmt.format(area / 10000)} ha</div>
                </Tooltip>
              )}
            </section>
          </Form>
        </main>
      </div>
    </ConfigProvider>
  );
};

export default AddParcels;