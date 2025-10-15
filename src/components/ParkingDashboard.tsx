import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { useParkingData } from '../hooks/useApi';
import { ParkingData } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import ParkingDataTable from './ParkingDataTable';

interface ParkingDashboardProps {
  selectedDate?: string;
  csvData?: ParkingData[];
  isUsingCsv?: boolean;
  startDate?: string;
  endDate?: string;
  isRangeMode?: boolean;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const ParkingDashboard: React.FC<ParkingDashboardProps> = ({ 
  selectedDate, 
  csvData, 
  isUsingCsv,
  startDate,
  endDate,
  isRangeMode 
}) => {
  const { data, loading, error } = useParkingData(
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
      isRangeMode ? "選択した期間の駐車場データがありません" : "選択した日付の駐車場データがありません"
    } />;
  }

  // 1時間ごとにデータを集計する関数
  const aggregateHourlyData = (data: ParkingData[]) => {
    const grouped: Record<string, { entry: number; exit: number; total: number }> = {};

    data.forEach(item => {
      const hour = item.timestamp.split(' ')[1].split(':')[0] + ':00'; // HH:00 形式
      if (!grouped[hour]) {
        grouped[hour] = { entry: 0, exit: 0, total: 0 };
      }
      
      if (item.direction === 'in') {
        grouped[hour].entry += 1;
      } else if (item.direction === 'out') {
        grouped[hour].exit += 1;
      }
      grouped[hour].total += 1;
    });

    return Object.entries(grouped)
      .map(([hour, values]) => ({
        time: hour,
        entry: values.entry,
        exit: values.exit,
        occupancy: values.total > 0 ? Math.round((values.entry - values.exit) / values.total * 100) : 0,
      }))
      .sort((a, b) => a.time.localeCompare(b.time)); // 時間順にソート
  };

  // 日ごとにデータを集計する関数
  const aggregateDailyData = (data: ParkingData[]) => {
    const grouped: Record<string, { entry: number; exit: number; total: number }> = {};

    data.forEach(item => {
      const date = item.timestamp.split(' ')[0];
      if (!grouped[date]) {
        grouped[date] = { entry: 0, exit: 0, total: 0 };
      }
      
      if (item.direction === 'in') {
        grouped[date].entry += 1;
      } else if (item.direction === 'out') {
        grouped[date].exit += 1;
      }
      grouped[date].total += 1;
    });

    return Object.entries(grouped)
      .map(([date, values]) => ({
        time: date,
        entry: values.entry,
        exit: values.exit,
        occupancy: values.total > 0 ? Math.round((values.entry - values.exit) / values.total * 100) : 0,
      }))
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  // 時系列データの処理
  let timeSeriesData;

  if (isRangeMode && startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays >= 3) {
      // 3日以上 → 日ごとに集計
      timeSeriesData = aggregateDailyData(data);
    } else {
      // 3日未満 → 1時間ごとに集計
      timeSeriesData = aggregateHourlyData(data);
    }
  } else {
    // 単日モード → 1時間ごとに集計
    timeSeriesData = aggregateHourlyData(data);
  }

  const cityData = data.reduce((acc, item) => {
    acc[item.city] = (acc[item.city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const cityPieData = Object.entries(cityData).map(([city, count]) => ({
    name: city,
    value: count,
  }));

  // --------------------------
  // 地域別データ
  // --------------------------

  // --------------------------
  // 時間帯別滞在時間
  // --------------------------
  const vehicleTypeData = data.reduce((acc, item) => {
    acc[item.vehicle_type] = (acc[item.vehicle_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const vehicleTypePieData = Object.entries(vehicleTypeData).map(([type, count]) => ({
    name: type === 'car' ? '乗用車' : type,
    value: count,
  }));

  // Group by hour for engine size
  const hourlyEngineData = data.reduce((acc, item) => {
    const hour = item.timestamp.split(' ')[1].split(':')[0];
    if (!acc[hour]) acc[hour] = { hour, totalEngineSize: 0, count: 0 };
    acc[hour].totalEngineSize += item.engine_size;
    acc[hour].count += 1;
    return acc;
  }, {} as Record<string, { hour: string; totalEngineSize: number; count: number }>);

  const engineSizeData = Object.values(hourlyEngineData).map(item => ({
    hour: `${item.hour}:00`,
    avgEngineSize: Math.round(item.totalEngineSize / item.count),
  }));

  return (
    <div className="space-y-8">
      {/* Parking Flow Chart */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          入庫・出庫数および満車率の推移
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
                label={{ value: '台数', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tick={{ fontSize: 12 }}
                label={{ value: '満車率 (%)', angle: 90, position: 'insideRight' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              formatter={(value, name) => {
                if (name === '満車率 (%)') {
                  return [`${value}%`, name];
                }
                return [`${value}台`, name];
              }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="entry"
                stroke="#3B82F6"
                strokeWidth={3}
                name="入庫数"
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="exit"
                stroke="#10B981"
                strokeWidth={3}
                name="出庫数"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="occupancy"
                stroke="#F59E0B"
                strokeWidth={3}
                name="満車率 (%)"
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">

       
      <ParkingDataTable data={data} className="mt-8" />
    </div>
  );
};

export default ParkingDashboard;