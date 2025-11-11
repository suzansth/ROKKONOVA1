import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { useTrafficData } from '../hooks/useApi';
import { TrafficData } from '../types';

const COLORS = ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA'];

interface TrafficDashboardProps {
  selectedDate?: string;
  csvData: TrafficData[];
  isUsingCsv: boolean;
  startDate: string;
  endDate: string;
  isRangeMode: boolean;
}

const TrafficDashboard: React.FC<TrafficDashboardProps> = ({
  selectedDate,
  csvData,
  isUsingCsv,
  startDate,
  endDate,
  isRangeMode,
}) => {
  const { data, loading, error } = useTrafficData(
    isUsingCsv ? [] : csvData,
    selectedDate,
    startDate,
    endDate,
    isRangeMode
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  // データが空の場合のメッセージ
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500 mt-8">データがありません。</div>;
  }

  // 車種別構成比データ
  const carTypeCounts: Record<string, number> = {};
  data.forEach((d) => {
    carTypeCounts[d.class_name] = (carTypeCounts[d.class_name] || 0) + 1;
  });
  const carTypeData = Object.entries(carTypeCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8">
      {/* 折れ線グラフ（速度推移） */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">速度推移グラフ</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="speed_kmh" stroke="#2563EB" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 円グラフ（車種別構成比） */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">車種別構成比</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={carTypeData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label
              >
                {carTypeData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TrafficDashboard;
