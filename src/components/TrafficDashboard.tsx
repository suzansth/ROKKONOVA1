import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TrafficDataTable from './TrafficDataTable';
import { TrafficData } from '../types';

interface TrafficDashboardProps {
  data?: TrafficData[]; // ← optional にして安全化
}

const TrafficDashboard: React.FC<TrafficDashboardProps> = ({ data = [] }) => {
  // data が undefined の場合でも安全に処理
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // 1時間ごとの平均速度を計算（例）
    const hourlyData: Record<string, { totalSpeed: number; count: number }> = {};

    data.forEach((item) => {
      const hour = item.timestamp.split(' ')[1]?.split(':')[0]; // 時間部分だけ取得
      if (!hourlyData[hour]) {
        hourlyData[hour] = { totalSpeed: 0, count: 0 };
      }
      hourlyData[hour].totalSpeed += item.speed_kmh;
      hourlyData[hour].count += 1;
    });

    // 平均速度を算出
    return Object.keys(hourlyData).map((hour) => ({
      hour: `${hour}:00`,
      avgSpeed: hourlyData[hour].totalSpeed / hourlyData[hour].count,
    }));
  }, [data]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-2">交通量・平均速度の推移</h2>
        <p className="text-sm text-gray-600 mb-4">
          平均速度が <span className="text-red-600 font-semibold">30km/h以下</span> の時間帯は
          <span className="text-red-600 font-semibold">赤色</span> で表示されます。
        </p>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis domain={[0, 'auto']} label={{ value: '平均速度 (km/h)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            {/* 平均速度30km以下は赤、それ以外は青 */}
            <Line
              type="monotone"
              dataKey="avgSpeed"
              stroke="#2563eb"
              strokeWidth={2}
              dot={({ cx, cy, payload }) => {
                const isCongested = payload.avgSpeed <= 30;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill={isCongested ? '#ef4444' : '#2563eb'} // 赤 or 青
                    stroke="#fff"
                    strokeWidth={1.5}
                  />
                );
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* データテーブル */}
      <TrafficDataTable data={data} />
    </div>
  );
};

export default TrafficDashboard;
