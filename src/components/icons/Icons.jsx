import React from "react";

const Svg = ({ size = 20, children, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...rest}
  >
    {children}
  </svg>
);

export const Sprout = (p) => (
  <Svg {...p}>
    <path d="M12 21v-9" />
    <path d="M12 12c0-4-3-6-8-6 0 4 3 6 8 6z" />
    <path d="M12 14c0-3.5 2.5-6 8-6 0 4-3 6-8 6z" />
  </Svg>
);

export const Drop = (p) => (
  <Svg {...p}>
    <path d="M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z" />
  </Svg>
);

export const Waves = (p) => (
  <Svg {...p}>
    <path d="M3 8c3 0 3-2 6-2s3 2 6 2 3-2 6-2M3 13c3 0 3-2 6-2s3 2 6 2 3-2 6-2M3 18c3 0 3-2 6-2s3 2 6 2 3-2 6-2" />
  </Svg>
);

export const Wheat = (p) => (
  <Svg {...p}>
    <path d="M12 22V8M12 8c-2-1-3-3-3-5 2 1 3 3 3 5zM12 8c2-1 3-3 3-5-2 1-3 3-3 5zM12 14c-2-1-3-3-3-5 2 1 3 3 3 5zM12 14c2-1 3-3 3-5-2 1-3 3-3 5z" />
  </Svg>
);

export const SunIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Svg>
);
