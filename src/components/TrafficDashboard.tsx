import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useTrafficData } from '../hooks/useApi';
import { TrafficData } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import TrafficDataTable from './TrafficDataTable';

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
  const { data, loading, error } = useTrafficData(
    selectedDate, 
    csvData, 
    isUsingCsv,
    startDate,
    endDate,
    isRangeMode
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={`交通データの取得に失敗しました: ${error}`} />;
  if (!data || data.length === 0) {
    return <ErrorMessage message={
      isRangeMode ? "選択した期間の交通データがありません" : "選択した日付の交通データがありません"
    } />;
  }

  // ★ 追加: 1日ごとに集計する関数
  const aggregateDailyData = (data: TrafficData[]) => {
    const grouped: Record<string, { totalCount: number; totalSpeed: number; records: number }> = {};

    data.forEach(item => {
      const date = item.timestamp.split(' ')[0]; // 日付部分
      if (!grouped[date]) {
        grouped[date] = { totalCount: 0, totalSpeed: 0, records: 0 };
      }
      grouped[date].totalCount += item.vehicle_count;
      grouped[date].totalSpeed += item.avg_speed;
      grouped[date].records += 1;
    });

    return Object.entries(grouped).map(([date, { totalCount, totalSpeed, records }]) => ({
      time: date,
      count: Math.round(totalCount / records), // 1日の平均台数
      speed: Math.round(totalSpeed / records), // 1日の平均速度
    }));
  };

  // ---- Process data for charts ----
  let timeSeriesData = data.map(item => ({
    time: isRangeMode ? item.timestamp.split(' ')[0] : item.timestamp.split(' ')[1], // 範囲モードなら日付、それ以外は時刻
    count: item.vehicle_count,
    speed: item.avg_speed,
  }));

  // ★ 期間モードかつ 3日以上の範囲なら日ごとに集計
  // 1時間ごとにデータを集計する関数
  const aggregateHourlyData = (data: TrafficData[]) => {
    const grouped: Record<string, { totalCount: number; totalSpeed: number; entryCount: number }> = {};

    data.forEach(item => {
      const hour = item.timestamp.split(' ')[1].split(':')[0] + ':00'; // HH:00 形式
      if (!grouped[hour]) {
        grouped[hour] = { totalCount: 0, totalSpeed: 0, entryCount: 0 };
      }
      grouped[hour].totalCount += item.vehicle_count;
      grouped[hour].totalSpeed += item.avg_speed;
      grouped[hour].entryCount += 1;
    });

    return Object.entries(grouped)
      .map(([hour, values]) => ({
        time: hour,
        count: values.totalCount,
        speed: Math.round(values.totalSpeed / values.entryCount * 10) / 10, // 小数点1桁
      }))
      .sort((a, b) => a.time.localeCompare(b.time)); // 時間順にソート
  };

  // 日ごとにデータを集計する関数
  const aggregateDailyData = (data: TrafficData[]) => {
    const grouped: Record<string, { totalCount: number; totalSpeed: number; entryCount: number }> = {};

    // --- 単日表示: 1時間ごとに集計 ---
    timeSeriesData = aggregateHourlyData(data);
  }

  const vehicleTypeData = data.reduce((acc, item) => {
    acc[item.vehicle_type] = (acc[item.vehicle_type] || 0) + item.vehicle_count;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(vehicleTypeData).map(([type, count]) => ({
    name: type === 'car' ? '乗用車' : type === 'truck' ? 'トラック' : type === 'motorcycle' ? 'バイク' : type,
    value: count,
  }));


  return (
    <div className="space-y-8">
      {/* Traffic Flow Chart */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          交通量・平均速度の推移
          {isRangeMode && startDate && endDate && (
            <span className="text-sm font-normal text-gray-600 ml-2">
              ({startDate} ～ {endDate})
            </span>
          )}
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                yAxisId="left" 
                tick={{ fontSize: 12 }}
                label={{ value: '通過台数', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tick={{ fontSize: 12 }}
                label={{ value: '平均速度 (km/h)', angle: 90, position: 'insideRight' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => {
                  if (name === '平均速度 (km/h)') {
                    return [`${value} km/h`, name];
                  }
                  return [`${value}台`, name];
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="count"
                stroke="#3B82F6"
                strokeWidth={3}
                name="通過台数"
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="speed"
                stroke="#10B981"
                strokeWidth={3}
                name="平均速度 (km/h)"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vehicle Type Distribution */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">車種別構成比</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}\n${(percent * 100).toFixed(1)}%`}
                outerRadius="80%"
                innerRadius="40%"
                fill="#8884d8"
                dataKey="value"
                stroke="#fff"
                strokeWidth={2}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* データテーブル */}
      <TrafficDataTable data={data} className="mt-8" />
    </div>
  );
};

export default TrafficDashboard;
