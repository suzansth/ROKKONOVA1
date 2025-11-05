import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
} from "recharts";

interface TrafficData {
  time: string;
  speed: number;
  status: string;
}

export const TrafficDashboard: React.FC = () => {
  const [data, setData] = useState<TrafficData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/data/traffic.csv"); // CSVファイルのパス
        if (!res.ok) throw new Error("Failed to fetch CSV file");
        const text = await res.text();

        const rows = text
          .split("\n")
          .slice(1)
          .filter((line) => line.trim() !== "")
          .map((row) => row.split(","));

        const parsedData = rows.map(([time, speed, status]) => ({
          time,
          speed: parseFloat(speed),
          status,
        }));

        setData(parsedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-center mt-10 text-gray-500">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">
        時間帯別交通状況（平均速度付き）
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 30, right: 20, left: 20, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" label={{ value: "時間帯", position: "insideBottom", dy: 20 }} />
          <YAxis label={{ value: "速度 (km/h)", angle: -90, position: "insideLeft" }} />
          <Tooltip
            formatter={(value: number) => `${value} km/h`}
            labelFormatter={(label) => `時間帯: ${label}`}
          />
          <Bar dataKey="speed" fill="#8884d8" radius={[10, 10, 0, 0]}>
            <LabelList
              dataKey="speed"
              position="center"
              formatter={(value: number) => `${value.toFixed(1)} km/h`}
              style={{ fill: "white", fontSize: 12, fontWeight: "bold" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
