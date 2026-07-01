import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { PricePoint } from '../types';

interface SparklineProps {
  data: PricePoint[];
  color: string;
  height?: number;
}

export function Sparkline({ data, color, height = 40 }: SparklineProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <Line
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-bg-card2 border border-border-color rounded-lg px-3 py-2 text-xs shadow-xl">
        <div className="text-text-secondary mb-1">{label}</div>
        <div className="font-bold text-text-primary">🌽 {payload[0].value.toLocaleString()}개</div>
      </div>
    );
  }
  return null;
}

interface PriceChartProps {
  data: PricePoint[];
  ipoPrice: number;
  isGain: boolean;
}

export function PriceChart({ data, ipoPrice, isGain }: PriceChartProps) {
  const color = isGain ? '#00c785' : '#ff4757';
  const minPrice = Math.min(...data.map(d => d.price));
  const maxPrice = Math.max(...data.map(d => d.price));
  const padding = (maxPrice - minPrice) * 0.15 || maxPrice * 0.1;

  // Show last 14 data points
  const displayData = data.slice(-14);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#8b949e', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval={Math.floor(displayData.length / 4)}
        />
        <YAxis
          tick={{ fill: '#8b949e', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={60}
          domain={[minPrice - padding, maxPrice + padding]}
          tickFormatter={(v) => v.toLocaleString()}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={ipoPrice} stroke="#484f58" strokeDasharray="4 4" />
        <Line
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: color, stroke: '#0d1117', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface IndexChartProps {
  data: Array<{ date: string; value: number }>;
}

export function IndexChart({ data }: IndexChartProps) {
  const last = data[data.length - 1]?.value ?? 0;
  const first = data[0]?.value ?? last;
  const isGain = last >= first;
  const color = isGain ? '#00c785' : '#ff4757';
  const displayData = data.slice(-14);

  return (
    <ResponsiveContainer width="100%" height={60}>
      <LineChart data={displayData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
