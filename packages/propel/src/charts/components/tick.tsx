/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { TBarChartXAxisLabelVariant } from "@plane/types";

// Common classnames
const AXIS_TICK_CLASSNAME = "fill-custom-text-300 text-sm";

export const xAxisLabelVariants: Record<
  TBarChartXAxisLabelVariant,
  { angle: number; position: string; offset: number; className: string }
> = {
  DEFAULT: {
    angle: 0,
    position: "middle",
    offset: 16,
    className: AXIS_TICK_CLASSNAME,
  },
  ROTATE_90: {
    angle: 90,
    position: "bottom",
    offset: 3,
    className: "fill-custom-text-300 text-xs",
  },
};

export const CustomXAxisTick = React.memo<any>(
  ({
    x,
    y,
    payload,
    getLabel,
    variant = "DEFAULT",
  }: {
    x: number;
    y: number;
    payload: { value: string };
    getLabel: (value: string) => string;
    variant?: keyof typeof xAxisLabelVariants;
  }) => {
    const label = getLabel ? getLabel(payload.value) : payload.value;
    let truncatedLabel = label;
    if (label.length > 10) {
      truncatedLabel = label.slice(0, 10) + "...";
    }

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          dy={xAxisLabelVariants[variant].offset}
          textAnchor={xAxisLabelVariants[variant].position}
          className={AXIS_TICK_CLASSNAME}
          style={{ transform: `rotate(${xAxisLabelVariants[variant].angle}deg)` }}
        >
          {truncatedLabel}
          <title aria-label={label}>{label}</title>
        </text>
      </g>
    );
  }
);
CustomXAxisTick.displayName = "CustomXAxisTick";

export const CustomYAxisTick = React.memo<any>(({ x, y, payload }: any) => (
  <g transform={`translate(${x},${y})`}>
    <text dx={-10} textAnchor="middle" className={AXIS_TICK_CLASSNAME}>
      {payload.value}
    </text>
  </g>
));

CustomYAxisTick.displayName = "CustomYAxisTick";

export const CustomRadarAxisTick = React.memo<any>(({ x, y, payload, getLabel, cx, cy, offset = 16 }: any) => {
  // Calculate direction vector from center to tick
  const dx = x - cx;
  const dy = y - cy;
  // Normalize and apply offset
  const length = Math.sqrt(dx * dx + dy * dy);
  const normX = dx / length;
  const normY = dy / length;
  const labelX = x + normX * offset;
  const labelY = y + normY * offset;

  return (
    <g transform={`translate(${labelX},${labelY})`}>
      <text y={0} textAnchor="middle" className={AXIS_TICK_CLASSNAME}>
        {getLabel ? getLabel(payload.value) : payload.value}
      </text>
    </g>
  );
});
CustomRadarAxisTick.displayName = "CustomRadarAxisTick";
