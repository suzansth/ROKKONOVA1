import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import TrafficDataTable from './TrafficDataTable';
import { TrafficData } from '../types';

interface TrafficDashboardProps {
  selectedDate?: string;
  csvData?: TrafficData[];
  isUsingCsv?: boolean;
  startDate?: string;
  endDate?: string;
  isRangeMode?: boolean;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const TrafficDashboard: React.FC<TrafficDashboardProps> = ({
  csvData,
  isRangeMode,
  startDate,
  endDate
}) => {
  const data = csvData || [];
  const loading = false;
  const error = undefined;
  const [currentPage, setCurrentPage] = React.useState(0);

  // ==== 平均速度（時間ごと）====
  const hourlyData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    const grouped: Record<string, { totalSpeed: number; count: number }> = {};
    data.forEach(item => {
      const hour = item.timestamp.split(' ')[1].split(':')[0];
      const key = `${hour}時`;
      if (!grouped[key]) grouped[key] = { totalSpeed: 0, count: 0 };
      grouped[key].totalSpeed += item.speed_kmh;
      grouped[key].count += 1;
    });
    return Object.entries(grouped)
      .map(([hour, val]) => ({
        hour,
        avgSpeed: Math.round((val.totalSpeed / val.count) * 10) / 10
      }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
  }, [data]);

  // ==== 範囲モード用 ====
  const dailyTrafficData = React.useMemo(() => {
    if (!isRangeMode || !data || data.length === 0) return [];
    const groupedByDate: Record<string, TrafficData[]> = {};
    data.forEach(item => {
      const date = item.timestamp.split(' ')[0];
      if (!groupedByDate[date]) groupedByDate[date] = [];
      groupedByDate[date].push(item);
    });
    return Object.entries(groupedByDate)
      .map(([date, dayData]) => {
        const hourlyGrouped: Record<string, { totalSpeed: number; count: number }> = {};
        dayData.forEach(item => {
          const hour = item.timestamp.split(' ')[1].split(':')[0];
          const key = `${hour}時`;
          if (!hourlyGrouped[key]) hourlyGrouped[key] = { totalSpeed: 0, count: 0 };
          hourlyGrouped[key].totalSpeed += item.speed_kmh;
          hourlyGrouped[key].count += 1;
        });
        const hourlyData = Object.entries(hourlyGrouped)
          .map(([hour, val]) => ({
            hour,
            avgSpeed: Math.round((val.totalSpeed / val.count) * 10) / 10
          }))
          .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
        return { date, hourlyData };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [data, isRangeMode]);

  React.useEffect(() => {
    setCurrentPage(0);
  }, [startDate, endDate, isRangeMode]);

  const getTrafficStatus = (speed: number) => {
    if (speed >= 30) return { status: '普通', color: '#10B981' };
    if (speed >= 20) return { status: '混雑', color: '#F59E0B' };
    return { status: '渋滞', color: '#EF4444' };
  };

  // ==== 時間帯ごとのデータ ====
  const timeSeriesData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    const grouped: Record<string, { vehicleCount: number; totalSpeed: number; speedCount: number }> = {};
    data.forEach(item => {
      const hour = item.timestamp.split(' ')[1].split(':')[0];
      const timeKey = `${hour}:00`;
      if (!grouped[timeKey])
        grouped[timeKey] = { vehicleCount: 0, totalSpeed: 0, speedCount: 0 };
      grouped[timeKey].vehicleCount += 1;
      grouped[timeKey].totalSpeed += item.speed_kmh;
      grouped[timeKey].speedCount += 1;
    });
    return Object.entries(grouped)
      .map(([time, d]) => ({
        time,
        count: d.vehicleCount,
        speed: Math.round((d.totalSpeed / d.speedCount) * 10) / 10
      }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [data]);

  // ==== 車種別構成 ====
  const vehicleTypeData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    const result = data.reduce((acc, item) => {
      acc[item.class_name] = (acc[item.class_name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(result).map(([type, count]) => ({
      name: type,
      value: count
    }));
  }, [data]);

  // ==== 渋滞割合グラフ用データ ====
  const congestionData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    let normal = 0, busy = 0, jam = 0;
    data.forEach(item => {
      if (item.speed_kmh >= 30) normal++;
      else if (item.speed_kmh >= 20) busy++;
      else jam++;
    });
    const total = normal + busy + jam;
    return [
      { name: '普通', value: Math.round((normal / total) * 100) },
      { name: '混雑', value: Math.round((busy / total) * 100) },
      { name: '渋滞', value: Math.round((jam / total) * 100) },
    ];
  }, [data]);

  // ===== JSX =====
  return (
    <div className="space-y-8">
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={`交通データの取得に失敗しました: ${error}`} />}
      {!loading && !error && (!data || data.length === 0) && (
        <ErrorMessage
          message={isRangeMode ? '選択した期間の交通データがありません' : '選択した日付の交通データがありません'}
        />
      )}

      {!loading && !error && data.length > 0 && (
        <>
          {/* 折れ線グラフ */}
          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">交通量・平均速度の推移</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="count" stroke="#3B82F6" />
                  <Line yAxisId="right" type="monotone" dataKey="speed" stroke="#10B981" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 渋滞割合グラフ（棒グラフ） */}
          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">渋滞割合グラフ</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={congestionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis unit="%" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#F59E0B">
                    {congestionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.name === '普通'
                            ? '#10B981'
                            : entry.name === '混雑'
                            ? '#F59E0B'
                            : '#EF4444'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 円グラフ */}
          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">車種別構成比</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vehicleTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  >
                    {vehicleTypeData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <TrafficDataTable data={data} className="mt-8" />
        </>
      )}
    </div>
  );
};

export default TrafficDashboard;
