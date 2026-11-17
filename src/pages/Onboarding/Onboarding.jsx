import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AutoComplete, Button, Col, ConfigProvider, Form, Input, Row, Typography, Upload, message } from "antd";
import {
  ArrowRightOutlined,
  CheckCircleFilled,
  DeleteOutlined,
  ExperimentOutlined,
  InboxOutlined,
  PlusOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { auth } from "@/services/firebase";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import Loader from "@/components/Loader/Loader";
import { Drop, Sprout, Waves, Wheat } from "@/components/icons/Icons";
import "./Onboarding.css";
import { urlBackend } from '@/config/backend.config'

/* ---------- Theme (same as MyProfile) ---------- */
const theme = {
  token: {
    colorPrimary: "#4a6d2b",
    colorText: "#17332b",
    fontFamily: '"Nunito", system-ui, sans-serif',
    borderRadius: 12,
  },
  components: { Button: { fontWeight: 700 } },
};

/* ---------- Available priorities ----------
   `key` is what travels to the backend; `title` is what the user sees. */
const PRIORITIES = [
  { key: "water_reduction", title: "Reduced water use", icon: <Drop size={28} />, color: "#5b93df" },
  { key: "nitrogen_availability", title: "Improved nitrogen availability", icon: <ExperimentOutlined style={{ fontSize: 28 }} />, color: "#7a5bb5" },
  { key: "forage_value", title: "Forage value", icon: <Wheat size={28} />, color: "#d9a21f" },
  { key: "erosion_reduction", title: "Reduced erosion", icon: <Waves size={28} />, color: "#3f8f8a" },
  { key: "organic_matter", title: "Improved organic matter", icon: <Sprout size={28} />, color: "#4f7a34" },
  { key: "market_suitability", title: "Market suitability", icon: <ShopOutlined style={{ fontSize: 28 }} />, color: "#c2662d" },
];

/* ---------- Rotation: each row has 3 stages ----------
   AutoComplete is used: it suggests crops but lets you type any other. */
const CROP_OPTIONS = [
  "Maíz", "Frijol", "Sorgo", "Trigo", "Cebada", "Avena", "Alfalfa", "Garbanzo",
  "Jitomate", "Chile", "Cebolla", "Papa", "Brócoli", "Barbecho",
].map((c) => ({ value: c }));

const ROTATION_STEPS = [
  { name: "previousCrop", label: "Before", hint: "What was grown" },
  { name: "currentCrop", label: "Today", hint: "What you grow now" },
  { name: "nextCrop", label: "After", hint: "What you plan to grow" },
];

const filterCrops = (input, option) =>
  option.value.toLowerCase().includes(input.toLowerCase());

const MAX_FILE_MB = 10;
const ACCEPTED_FILES = ".pdf,.csv,.xls,.xlsx,.png,.jpg,.jpeg";

/* ---------- Multi-select card picker (compatible with Form.Item) ---------- */
function PriorityPicker({ value = [], onChange }) {
  const toggle = (key) => {
    const next = value.includes(key) ? value.filter((k) => k !== key) : [...value, key];
    onChange?.(next);
  };

  return (
    <div className="priority-grid" role="group" aria-label="Priorities">
      {PRIORITIES.map(({ key, title, icon, color }) => {
        const selected = value.includes(key);
        return (
          <button
            key={key}
            type="button"
            role="checkbox"
            aria-checked={selected}
            className={`priority-card ${selected ? "is-selected" : ""}`}
            onClick={() => toggle(key)}
          >
            <span className="priority-card__icon" style={{ color }}>{icon}</span>
            <strong>{title}</strong>
            {selected && <CheckCircleFilled className="priority-card__check" />}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- View ---------- */
const NewUserConfig = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [User, setUser] = useLocalStorage("user", null);


  useEffect(() => {
    if (!User || !User.isNewUser) navigate("/home");
  }, [User, navigate]);


  // Simulates initial load (replace it with your API call)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  /* Validates size before accepting the file */
  const beforeUpload = (file) => {
    if (file.size / 1024 / 1024 > MAX_FILE_MB) {
      messageApi.error(`The file must not be larger than ${MAX_FILE_MB} MB`);
      return Upload.LIST_IGNORE;
    }
    return false; // no auto-upload; it is sent with the form
  };

  const normFile = (e) => (Array.isArray(e) ? e : e?.fileList);

  const handleFinish = async (values) => {
    const file = values.rotationPlan?.[0]?.originFileObj ?? null

    // ⚠️ The backend (for now) only accepts JSON, not multipart.
    // If the user uploaded a file, we store its metadata in rotationPlan
    // (the file itself is pending for a second iteration with multer).
    const rotationPlanMeta = file
      ? { fileName: file.name, mimeType: file.type, sizeBytes: file.size }
      : null

    const payload = {
      // 👇 NO userId: the backend gets it from the token
      priorities: values.priorities,          // ["water_reduction", ...]
      rotations: (values.rotations ?? []).map((r) => ({
        parcel: r.parcel?.trim() || '',
        previousCrop: r.previousCrop.trim(),
        currentCrop: r.currentCrop.trim(),
        nextCrop: r.nextCrop.trim(),
      })),
      rotationPlan: rotationPlanMeta,          // object or null
      completedAt: new Date().toISOString(),
    }

    try {
      setSubmitting(true)
      //console.log('Payload to send:', payload)

      // 🔑 Fresh Firebase token (NOT from localStorage)
      const token = await auth.currentUser?.getIdToken()
      if (!token) throw new Error('No active session')

      const res = await fetch(`${urlBackend}/user/config`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',   // 👈 JSON, not multipart
        },
        body: JSON.stringify(payload),          // 👈 JSON.stringify, not FormData
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        const msg = Array.isArray(err.message)
          ? err.message.join(', ')
          : err.message || `HTTP ${res.status}`
        throw new Error(msg)
      }

      const data = await res.json()
      //console.log('✅ Config saved:', data)

      setUser({ ...User, isNewUser: false })
      messageApi.success('Configuration saved')
      navigate('/home')
    } catch (err) {
      //console.error('❌ Error saving config:', err)
      messageApi.error(err.message || 'We could not save your configuration.')
    } finally {
      setSubmitting(false)
    }
  }
  if (loading) return <Loader fullScreen />;

  return (
    <ConfigProvider theme={theme}>
      {contextHolder}
      <div className="user-config">
        <main className="user-config__main">
          {/* ---------- Hero ---------- */}
          <section className="uc-hero">
            <svg className="uc-hero__art" viewBox="0 0 560 300" preserveAspectRatio="xMaxYMax slice" aria-hidden="true">
              <circle cx="400" cy="90" r="82" fill="#efd58a" opacity="0.45" />
              <circle cx="400" cy="90" r="52" fill="#e6c565" />
              <path d="M170 300 L300 120 L400 180 L470 100 L560 160 L560 300Z" fill="#b6c99a" />
              <path d="M90 300 C190 200 400 200 560 225 L560 300Z" fill="#6f9a62" />
              <circle cx="190" cy="215" r="15" fill="#3e6b46" />
              <circle cx="528" cy="190" r="24" fill="#3e6b46" />
              <circle cx="506" cy="205" r="19" fill="#2f5c3b" />
            </svg>
            <div className="uc-hero__text">
              <Typography.Title level={1} className="uc-hero__title">
                Welcome to Toka{User?.nombre ? `, ${User.nombre}` : ""}
              </Typography.Title>
              <p>Tell us what matters to you so we can tailor our recommendations to your land.</p>
            </div>
          </section>

          {/* ---------- Form ---------- */}
          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            initialValues={{ priorities: [], rotations: [], rotationPlan: [] }}
            onFinish={handleFinish}
            className="uc-form"
          >
            <section className="uc-section">
              <div className="uc-section__head">
                <h2>Your priorities</h2>
                <p>Choose one or more. Toka will use them to rank its recommendations.</p>
              </div>

              <Form.Item
                name="priorities"
                rules={[
                  {
                    validator: (_, v) =>
                      v && v.length > 0
                        ? Promise.resolve()
                        : Promise.reject(new Error("Select at least one priority")),
                  },
                ]}
              >
                <PriorityPicker />
              </Form.Item>
            </section>

            <section className="uc-section">
              <div className="uc-section__head">
                <h2>Crop rotation <span className="uc-optional">(optional)</span></h2>
                <p>Indicate what was grown before, what you grow today, and what comes next. You can add one rotation per parcel.</p>
              </div>

              <Form.List name="rotations">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...rest }, index) => (
                      <div className="rotation-row" key={key}>
                        <div className="rotation-row__top">
                          <Form.Item
                            {...rest}
                            name={[name, "parcel"]}
                            className="rotation-row__parcel"
                          >
                            <Input placeholder={`Parcel or plot (optional), e.g. Parcel ${index + 1}`} />
                          </Form.Item>
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            aria-label="Remove rotation"
                            onClick={() => remove(name)}
                          />
                        </div>

                        <Row gutter={[8, 0]} align="top" wrap>
                          {ROTATION_STEPS.map((step, i) => (
                            <React.Fragment key={step.name}>
                              <Col xs={24} md={7}>
                                <Form.Item
                                  {...rest}
                                  name={[name, step.name]}
                                  label={<span className="rotation-label">{step.label}</span>}
                                  extra={step.hint}
                                  rules={[{ required: true, whitespace: true, message: "Indicate the crop" }]}
                                >
                                  <AutoComplete
                                    options={CROP_OPTIONS}
                                    filterOption={filterCrops}
                                    placeholder="e.g. Corn"
                                  />
                                </Form.Item>
                              </Col>
                              {i < ROTATION_STEPS.length - 1 && (
                                <Col xs={24} md={1} className="rotation-arrow">
                                  <ArrowRightOutlined />
                                </Col>
                              )}
                            </React.Fragment>
                          ))}
                        </Row>
                      </div>
                    ))}

                    <Button
                      type="dashed"
                      shape="round"
                      icon={<PlusOutlined />}
                      onClick={() => add()}
                      className="rotation-add"
                    >
                      {fields.length === 0 ? "Add rotation" : "Add another rotation"}
                    </Button>
                  </>
                )}
              </Form.List>
            </section>

            <div className="uc-actions">
              <Button
                type="primary"
                htmlType="submit"
                shape="round"
                size="large"
                loading={submitting}
                className="uc-actions__save"
              >
                Save and continue
              </Button>
            </div>
          </Form>
        </main>
      </div>
    </ConfigProvider>
  );
};

export default NewUserConfig;