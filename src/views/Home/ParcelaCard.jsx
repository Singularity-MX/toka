import React from "react";
import { Tag, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { C } from "./theme";

const { Text } = Typography;

const cardBase = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  textAlign: "left",
  background: C.surface,
  border: `1px solid ${C.line}`,
  borderRadius: 16,
  padding: 12,
  cursor: "pointer",
  font: "inherit",
  color: "inherit",
  transition: "border-color .2s, box-shadow .2s",
};

// Dibuja el polígono de la parcela. `puntos` va en una cuadrícula de 0 a 100.
const Poligono = ({ puntos, color }) => (
  <svg
    viewBox="0 0 100 100"
    role="img"
    aria-label="Forma de la parcela"
    style={{ width: "100%", height: "100%" }}
  >
    <polygon
      points={puntos.map((p) => p.join(",")).join(" ")}
      fill={color}
      fillOpacity="0.85"
      stroke={C.forest}
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    {puntos.map(([x, y], i) => (
      <circle
        key={i}
        cx={x}
        cy={y}
        r="2.2"
        fill="#fff"
        stroke={C.forest}
        strokeWidth="1.2"
      />
    ))}
  </svg>
);

export const ParcelaCard = ({ parcela, onClick }) => {
  const comparada = parcela.estado === "Comparada";
  return (
    <button
      type="button"
      className="toka-card"
      style={cardBase}
      onClick={onClick}
    >
      <div
        style={{
          aspectRatio: "4 / 3",
          background: "#eef0e8",
          borderRadius: 10,
          padding: 14,
        }}
      >
        <Poligono puntos={parcela.puntos} color={parcela.color} />
      </div>
      <div style={{ padding: "12px 4px 4px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 8,
          }}
        >
          <Text strong style={{ fontSize: 16, color: C.ink }}>
            {parcela.nombre}
          </Text>
          <Text style={{ color: C.inkSoft, fontSize: 13 }}>
            {parcela.hectareas} ha
          </Text>
        </div>
        <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
          <Tag
            bordered={false}
            style={{ background: "#eef0e8", color: C.forest, margin: 0 }}
          >
            {parcela.cultivo}
          </Tag>
          <Tag
            bordered={false}
            style={{
              margin: 0,
              background: comparada ? "#e3efe6" : "#f8efd4",
              color: comparada ? "#2d6a45" : "#8a6a12",
            }}
          >
            {parcela.estado}
          </Tag>
        </div>
      </div>
    </button>
  );
};

export const NuevaParcelaCard = ({ onClick }) => (
  <button
    type="button"
    className="toka-card"
    onClick={onClick}
    style={{
      ...cardBase,
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
      border: `1.5px dashed ${C.sage}`,
      background: "transparent",
      minHeight: 240,
    }}
  >
    <span
      style={{
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: C.forest,
        color: "#fff",
        display: "grid",
        placeItems: "center",
        fontSize: 22,
      }}
    >
      <PlusOutlined />
    </span>
    <span style={{ fontWeight: 600, color: C.forest }}>Marcar parcela</span>
    <Text style={{ color: C.inkSoft, fontSize: 13, maxWidth: 170 }}>
      Dibuja tu terreno sobre el mapa
    </Text>
  </button>
);
