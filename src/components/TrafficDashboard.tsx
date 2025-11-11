import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  LabelList
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
  selectedDate,
  csvData,
  isUsingCsv,
  startDate,
  endDate,
  isRangeMode
}) => {
  // ---- データソース ----
  const data = csvData || [];
  const loading = false;
  const error = undefined;

  // ====== 1時間ごとに集計 ======
  const aggregateHourlyData = (data: TrafficData[]) => {
    const grouped: Record<string, { vehicleCount: number; totalSpeed: number; speedCount: number }> = {};
    data.forEach(item => {
      const hour = item.timestamp.split(' ')[1].split(':')[0];
      const timeKey = `${hour}:00`;
      if (!grouped[timeKey]) grouped[timeKey] = { vehicleCount: 0, totalSpeed: 0, speedCount: 0 };
      grouped[timeKey].vehicleCount += 1;
      grouped[timeKey].totalSpeed += item.speed_kmh;
      grouped[timeKey].speedCount += 1;
    });
    return Object.entries(grouped)
      .map(([time, data]) => ({
        time,
        count: data.vehicleCount,
        speed: Math.round((data.totalSpeed / data.speedCount) * 10) / 10
      }))
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  // ====== 日ごとに集計 ======
  const aggregateDailyData = (data: TrafficData[]) => {
    const grouped: Record<string, { vehicleCount: number; totalSpeed: number; speedCount: number }> = {};
    data.forEach(item => {
      const date = item.timestamp.split(' ')[0];
      if (!grouped[date]) grouped[date] = { vehicleCount: 0, totalSpeed: 0, speedCount: 0 };
      grouped[date].vehicleCount += 1;
      grouped[date].totalSpeed += item.speed_kmh;
      grouped[date].speedCount += 1;
    });
    return Object.entries(grouped)
      .map(([time, data]) => ({
        time,
        count: data.vehicleCount,
        speed: Math.round((data.totalSpeed / data.speedCount) * 10) / 10
      }))
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  if (loading) return <LoadingSpinner />;
  if (error)
    return <ErrorMessage message={`交通データの取得に失敗しました: ${error}`} />;
  if (!data || data.length === 0)
    return (
      <ErrorMessage
        message={isRangeMode ? '選択した期間の交通データがありません' : '選択した日付の交通データがありません'}
      />
    );

  // ====== 時間帯別データ ======
  const hourlyData = React.useMemo(() => {
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

  // ====== 状況分類 ======
  const getTrafficStatus = (speed: number) => {
    if (speed >= 30) return { status: '普通', color: '#10B981' };
    if (speed >= 20) return { status: '混雑', color: '#F59E0B' };
    return { status: '渋滞', color: '#EF4444' };
  };

  const trafficStatusData = hourlyData.map(item => ({
    ...item,
    ...getTrafficStatus(item.avgSpeed),
    height: 100
  }));

  // ====== 折れ線グラフ用 ======
  const timeSeriesData = aggregateHourlyData(data);

  // ====== 円グラフ用 ======
  const vehicleTypeData = data.reduce((acc, item) => {
    acc[item.class_name] = (acc[item.class_name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const pieData = Object.entries(vehicleTypeData).map(([type, count]) => ({
    name: type,
    value: count
  }));

  return (
    <div className="space-y-8">
      {/* 折れ線グラフ */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">交通量・平均速度の推移</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" label={{ value: '台数', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'km/h', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="count" stroke="#3B82F6" name="通過台数" />
              <Line yAxisId="right" type="monotone" dataKey="speed" stroke="#10B981" name="平均速度" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

       {/* 棒グラフ（棒の中に平均速度を表示） */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">時間帯別交通状況</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trafficStatusData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
              <Tooltip
                formatter={(value, _, props) => {
                  const speed = props.payload.avgSpeed;
                  const status = props.payload.status;
                  return [`${speed} km/h (${status})`, '平均速度'];
                }}
              />
              <Bar dataKey="height" radius={[4, 4, 0, 0]}>
                {trafficStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="avgSpeed"
                  position="center"
                  formatter={(val: number) => `${val} km/h`}
                  fill="#fff"
                  style={{ fontSize: 12, fontWeight: 'bold' }}
                />
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
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius="80%"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

     
      <TrafficDataTable data={data} className="mt-8" />
    </div>
  );
};

export default TrafficDashboard;
