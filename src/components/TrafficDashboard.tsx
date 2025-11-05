import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, LabelList } from "recharts";

// CSVデータ型
interface TrafficData {
  time: string;
  normal: number;
  slow: number;
  jam: number;
}

// CSVデータを直接ここで読み取る（例: public/data/traffic_data.csv）
const csvPath = "/data/traffic_data.csv";

const TrafficDashboard: React.FC = () => {
  const [data, setData] = useState<TrafficData[]>([]);

  useEffect(() => {
    fetch(csvPath)
      .then((response) => response.text())
      .then((csvText) => {
        const lines = csvText.split("\n").filter((line) => line.trim() !== "");
        const parsedData: TrafficData[] = lines.slice(1).map((line) => {
          const [time, normal, slow, jam] = line.split(",");
          return {
            time,
            normal: Number(normal),
            slow: Number(slow),
            jam: Number(jam),
          };
        });
        setData(parsedData);
      })
      .catch((error) => console.error("CSV読み込みエラー:", error));
  }, []);

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-700">交通状況グラフ</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 20, right: 30, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          {/* 通常（青） */}
          <Bar dataKey="normal" fill="#3b82f6">
            <LabelList dataKey="normal" position="inside" fill="#fff" />
          </Bar>
          {/* 混雑（オレンジ） */}
          <Bar dataKey="slow" fill="#f97316">
            <LabelList dataKey="slow" position="inside" fill="#fff" />
          </Bar>
          {/* 渋滞（赤） */}
          <Bar dataKey="jam" fill="#ef4444">
            <LabelList dataKey="jam" position="inside" fill="#fff" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrafficDashboard;
