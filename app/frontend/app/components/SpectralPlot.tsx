'use client';

import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface SpectralPlotProps {
  hasData: boolean;
  spectrumData: number[] | null;
  isHighProtein?: boolean | null;
}

interface TooltipPayloadEntry {
  value: number;
  payload: { wavelength: number };
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-[10px] text-slate-400 font-mono">{`λ = ${payload[0].payload.wavelength} nm`}</p>
        <p className="text-[11px] text-blue-400 font-mono font-bold">{`A = ${payload[0].value.toFixed(4)}`}</p>
      </div>
    );
  }
  return null;
};

export function SpectralPlot({ hasData, spectrumData, isHighProtein }: SpectralPlotProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  const gridStroke = isDark ? '#334155' : '#e2e8f0';

  const lineColor =
    isHighProtein === true ? '#22c55e' :
    isHighProtein === false ? '#f97316' :
    '#3b82f6';

  const gradientDark =
    isHighProtein === true ? '#22c55e' :
    isHighProtein === false ? '#f97316' :
    '#3b82f6';

  const chartData = spectrumData
    ? spectrumData.map((absorbance, i) => ({
        wavelength: 1100 + i * 2,
        absorbance: parseFloat(absorbance.toFixed(4)),
      }))
    : null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Spectral Input
        </h3>
        <span className="text-[10px] text-slate-300 dark:text-slate-600 font-mono tracking-wide">
          1100 - 2498 nm
        </span>
      </div>

      {chartData ? (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 55, bottom: 25 }}
            >
              <defs>
                <linearGradient id="spectralGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={gradientDark} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={gradientDark} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={gridStroke}
                vertical={false}
              />
              <XAxis
                dataKey="wavelength"
                type="number"
                domain={[1100, 2498]}
                ticks={[1100, 1400, 1700, 2000, 2300, 2498]}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={{ stroke: '#475569' }}
                axisLine={{ stroke: '#475569' }}
                label={{
                  value: 'Wavelength (nm)',
                  position: 'insideBottom',
                  offset: -25,
                  fontSize: 11,
                  fill: '#94a3b8',
                }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={{ stroke: '#475569' }}
                axisLine={{ stroke: '#475569' }}
                tickFormatter={(v: number) => v.toFixed(3)}
                width={50}
                label={{
                  value: 'Absorbance',
                  angle: -90,
                  position: 'insideLeft',
                  offset: -40,
                  fontSize: 11,
                  fill: '#94a3b8',
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="absorbance"
                stroke={lineColor}
                strokeWidth={2}
                fill="url(#spectralGradient)"
                dot={false}
                activeDot={{ r: 4, fill: lineColor, stroke: lineColor, strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: lineColor }}
            />
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Raw NIR Spectrum — 700 wavelength channels (1100–2498 nm at 2 nm intervals) — Savitzky-Golay smoothing applied before classification
            </p>
          </div>
        </>
      ) : (
        <div className="flex-1 min-h-[200px] rounded-lg bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-300 dark:text-slate-600">
            <svg className="w-14 h-8" viewBox="0 0 120 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M0 32 Q15 8 30 24 Q45 38 60 14 Q75 -4 90 20 Q105 38 120 16" />
            </svg>
            <span className="text-[11px] text-center leading-relaxed">
              Upload a <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded text-slate-400 dark:text-slate-500">.csv</code> file to visualize the spectrum
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

