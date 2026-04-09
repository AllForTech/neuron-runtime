import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Execution } from '@/types';

export function ExecutionChart({ data }: { data: Execution[] }) {
  const chartData = data.map((d) => ({
    name: new Date(d.startedAt).toLocaleDateString(),
    value: 1,
  }));

  return (
    <div className="transition-200 bg-muted/50 h-[300px] rounded-2xl border border-white/10 p-4 hover:bg-white/[0.05]">
      <p className="mb-4 text-sm text-white/60">Execution Activity</p>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis dataKey="name" stroke="#888" />
          <YAxis stroke="#888" />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#ffffff"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
