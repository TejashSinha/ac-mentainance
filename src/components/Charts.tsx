import { useState, useMemo } from 'react';

// Bar Chart Component
export function BarChart({ data, height = 240 }: {
  data: { label: string; collected: number; pending: number; overdue: number }[];
  height?: number;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const maxVal = useMemo(() => {
    const max = Math.max(...data.map((d) => d.collected + d.pending + d.overdue), 1);
    return Math.ceil(max / 100000) * 100000;
  }, [data]);

  const chartHeight = height - 40;
  const barWidth = data.length > 10 ? 16 : data.length > 6 ? 24 : 36;
  const gap = data.length > 10 ? 8 : 16;

  return (
    <div className="relative" style={{ height }}>
      {/* Tooltip */}
      {hoverIdx !== null && (
        <div
          className="absolute z-10 bg-slate-900 text-white text-xs rounded-lg px-3 py-2 pointer-events-none whitespace-nowrap shadow-lg"
          style={{
            left: `${hoverIdx * (barWidth + gap) + barWidth / 2}px`,
            top: 0,
            transform: 'translateX(-50%)',
          }}
        >
          <p className="font-semibold mb-1">{data[hoverIdx].label}</p>
          <p className="text-emerald-400">Collected: ₹{data[hoverIdx].collected.toLocaleString('en-IN')}</p>
          <p className="text-orange-400">Pending: ₹{data[hoverIdx].pending.toLocaleString('en-IN')}</p>
          <p className="text-red-400">Overdue: ₹{data[hoverIdx].overdue.toLocaleString('en-IN')}</p>
        </div>
      )}

      <div className="flex items-end gap-4 h-full pb-8 relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-[10px] text-slate-400">
          <span>{(maxVal / 100000).toFixed(0)}L</span>
          <span>{(maxVal / 200000).toFixed(1)}L</span>
          <span>0</span>
        </div>

        {/* Bars */}
        <div className="flex items-end gap-4 ml-14 overflow-x-auto pb-8" style={{ height: chartHeight }}>
          {data.map((d, i) => {
            const total = d.collected + d.pending + d.overdue;
            const totalH = (total / maxVal) * chartHeight;
            const collectedH = (d.collected / maxVal) * chartHeight;
            const pendingH = (d.pending / maxVal) * chartHeight;
            const overdueH = (d.overdue / maxVal) * chartHeight;
            return (
              <div
                key={i}
                className="flex flex-col items-center flex-shrink-0 cursor-pointer"
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
              >
                <div className="relative flex flex-col justify-end" style={{ height: chartHeight, width: barWidth }}>
                  <div
                    className="w-full rounded-t-sm bg-red-400 transition-all"
                    style={{ height: `${overdueH}px`, opacity: hoverIdx === null || hoverIdx === i ? 1 : 0.5 }}
                  />
                  <div
                    className="w-full bg-orange-400 transition-all"
                    style={{ height: `${pendingH}px`, opacity: hoverIdx === null || hoverIdx === i ? 1 : 0.5 }}
                  />
                  <div
                    className="w-full bg-emerald-500 transition-all"
                    style={{ height: `${collectedH}px`, opacity: hoverIdx === null || hoverIdx === i ? 1 : 0.5 }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1.5 whitespace-nowrap">{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Donut Chart Component
export function DonutChart({ data, size = 200 }: {
  data: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = size / 2 - 20;
  const innerRadius = radius - 28;
  const center = size / 2;
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  let cumAngle = -Math.PI / 2;

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {data.map((d, i) => {
            const angle = (d.value / total) * 2 * Math.PI;
            const startAngle = cumAngle;
            const endAngle = cumAngle + angle;
            cumAngle = endAngle;

            const x1 = center + radius * Math.cos(startAngle);
            const y1 = center + radius * Math.sin(startAngle);
            const x2 = center + radius * Math.cos(endAngle);
            const y2 = center + radius * Math.sin(endAngle);
            const x3 = center + innerRadius * Math.cos(endAngle);
            const y3 = center + innerRadius * Math.sin(endAngle);
            const x4 = center + innerRadius * Math.cos(startAngle);
            const y4 = center + innerRadius * Math.sin(startAngle);

            const largeArc = angle > Math.PI ? 1 : 0;
            const path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;

            return (
              <path
                key={i}
                d={path}
                fill={d.color}
                opacity={hoverIdx === null || hoverIdx === i ? 1 : 0.4}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                className="transition-opacity cursor-pointer"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-slate-800">{total}</span>
          <span className="text-xs text-slate-400">Total</span>
        </div>
      </div>
      <div className="space-y-2 flex-1 min-w-[140px]">
        {data.map((d, i) => (
          <div
            key={i}
            className="flex items-center gap-2 text-sm cursor-pointer"
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
          >
            <span className="w-3 h-3 rounded-sm" style={{ background: d.color, opacity: hoverIdx === null || hoverIdx === i ? 1 : 0.4 }} />
            <span className="text-slate-600 flex-1">{d.label}</span>
            <span className="font-semibold text-slate-800">{d.value}</span>
            <span className="text-xs text-slate-400">({((d.value / total) * 100).toFixed(0)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Line Chart Component
export function LineChart({ data, height = 200, color = '#3b82f6' }: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const minVal = Math.min(...data.map((d) => d.value), 0);
  const range = maxVal - minVal || 1;
  const chartHeight = height - 40;
  const width = 100;
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * width;
    const y = chartHeight - ((d.value - minVal) / range) * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = pathD + ` L ${width} ${chartHeight} L 0 ${chartHeight} Z`;

  return (
    <div className="relative" style={{ height }}>
      <svg viewBox={`0 0 ${width} ${chartHeight}`} preserveAspectRatio="none" className="w-full" style={{ height: chartHeight }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#lineGrad)" />
        <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={hoverIdx === i ? 2 : 1}
            fill={color}
            vectorEffect="non-scaling-stroke"
            className="cursor-pointer transition-all"
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
          />
        ))}
      </svg>
      {hoverIdx !== null && (
        <div
          className="absolute z-10 bg-slate-900 text-white text-xs rounded-lg px-3 py-2 pointer-events-none whitespace-nowrap shadow-lg"
          style={{
            left: `${(hoverIdx / (data.length - 1 || 1)) * 100}%`,
            top: 0,
            transform: 'translateX(-50%)',
          }}
        >
          <p className="font-semibold">{data[hoverIdx].label}</p>
          <p style={{ color }}>{data[hoverIdx].value}%</p>
        </div>
      )}
      <div className="flex justify-between mt-2 text-[10px] text-slate-400">
        {data.map((d, i) => (
          <span key={i} className={i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2) ? '' : 'hidden'}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

// Funnel Chart Component
export function FunnelChart({ stages }: {
  stages: { label: string; value: number; color: string }[];
}) {
  const maxVal = Math.max(...stages.map((s) => s.value), 1);

  return (
    <div className="space-y-3">
      {stages.map((stage, i) => {
        const widthPct = (stage.value / maxVal) * 100;
        const conversionRate = i > 0 ? ((stage.value / stages[i - 1].value) * 100).toFixed(1) : '100';
        return (
          <div key={i} className="flex items-center gap-3">
            <div className="w-32 text-sm font-medium text-slate-600 text-right flex-shrink-0">{stage.label}</div>
            <div className="flex-1 relative">
              <div
                className="h-10 rounded-lg flex items-center justify-between px-4 transition-all duration-500"
                style={{ width: `${widthPct}%`, background: stage.color }}
              >
                <span className="text-white font-semibold text-sm">{stage.value.toLocaleString()}</span>
              </div>
            </div>
            {i > 0 && (
              <span className="text-xs text-slate-400 w-16 flex-shrink-0">{conversionRate}%</span>
            )}
            {i === 0 && <span className="w-16 flex-shrink-0" />}
          </div>
        );
      })}
    </div>
  );
}

// Horizontal Progress Bar
export function ProgressBar({ value, max, color = 'bg-blue-500', height = 'h-2' }: {
  value: number;
  max: number;
  color?: string;
  height?: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className={`w-full ${height} bg-slate-100 rounded-full overflow-hidden`}>
      <div
        className={`h-full ${color} rounded-full transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
