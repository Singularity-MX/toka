import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Select, Segmented, Button, Typography, Empty } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { ParcelaCard, NuevaParcelaCard } from "./ParcelaCard";
import { C } from "./theme";

const { Title, Text } = Typography;

// TODO: reemplaza con la llamada a tu API
const PARCELAS = [
  {
    id: 1,
    nombre: "El Mezquite",
    hectareas: 4.2,
    cultivo: "Maíz",
    color: C.gold,
    estado: "Comparada",
    puntos: [[8, 40], [45, 8], [62, 36], [88, 28], [95, 62], [30, 85]],
  },
  {
    id: 2,
    nombre: "Loma Alta",
    hectareas: 2.8,
    cultivo: "Sorgo",
    color: C.sage,
    estado: "Comparada",
    puntos: [[12, 62], [78, 14], [94, 40], [28, 88]],
  },
  {
    id: 3,
    nombre: "La Presa",
    hectareas: 6.1,
    cultivo: "Frijol",
    color: C.water,
    estado: "Pendiente",
    puntos: [[10, 18], [28, 28], [50, 12], [90, 28], [86, 62], [48, 52], [38, 90], [18, 52]],
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [cultivo, setCultivo] = useState("todos");
  const [estado, setEstado] = useState("Todas");

  const cultivos = useMemo(() => [...new Set(PARCELAS.map((p) => p.cultivo))], []);

  const filtradas = useMemo(
    () =>
      PARCELAS.filter(
        (p) =>
          p.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
          (cultivo === "todos" || p.cultivo === cultivo) &&
          (estado === "Todas" || p.estado === estado)
      ),
    [busqueda, cultivo, estado]
  );

  const limpiarFiltros = () => {
    setBusqueda("");
    setCultivo("todos");
    setEstado("Todas");
  };

  return (
    <>
      <style>{`
        .toka-card:hover { border-color: ${C.forest}; box-shadow: 0 6px 20px rgba(18,38,30,.08); }
        .toka-card:focus-visible { outline: 3px solid ${C.gold}; outline-offset: 2px; }
        .toka-grid { display: grid; gap: 20px; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); }
        @media (prefers-reduced-motion: reduce) { .toka-card { transition: none; } }
      `}</style>

      <Title level={2} style={{ margin: 0, letterSpacing: "-0.02em", fontWeight: 800 }}>
        Mis parcelas
      </Title>
      <Text style={{ color: C.inkSoft, fontSize: 15 }}>
        Elige una parcela para ver qué rotación le conviene.
      </Text>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, margin: "24px 0" }}>
        <Input
          allowClear
          prefix={<SearchOutlined style={{ color: C.inkSoft }} />}
          placeholder="Buscar por nombre"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ width: 240 }}
        />
        <Select
          value={cultivo}
          onChange={setCultivo}
          style={{ width: 180 }}
          options={[
            { value: "todos", label: "Todos los cultivos" },
            ...cultivos.map((c) => ({ value: c, label: c })),
          ]}
        />
        <Segmented
          value={estado}
          onChange={setEstado}
          options={["Todas", "Comparada", "Pendiente"]}
        />
      </div>

      <div className="toka-grid">
        <NuevaParcelaCard onClick={() => navigate("/parcelas/nueva")} />
        {filtradas.map((p) => (
          <ParcelaCard
            key={p.id}
            parcela={p}
            onClick={() => navigate(`/parcelas/${p.id}`)}
          />
        ))}
      </div>

      {filtradas.length === 0 && (
        <Empty
          style={{ marginTop: 48 }}
          description="Ninguna parcela coincide con estos filtros"
        >
          <Button onClick={limpiarFiltros}>Quitar filtros</Button>
        </Empty>
      )}
    </>
  );
};

export default Home;