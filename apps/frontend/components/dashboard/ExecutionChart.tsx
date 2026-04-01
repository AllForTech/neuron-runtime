import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export function ExecutionChart({ data }: { data: any[] }) {
    const chartData = data.map((d) => ({
        name: new Date(d.startedAt).toLocaleDateString(),
        value: 1,
    }));

    return (
        <div className="
      rounded-2xl border border-white/10
      bg-white/[0.02] p-4 h-[300px]
    ">
            <p className="text-sm text-white/60 mb-4">Execution Activity</p>

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