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
  if (error) return <ErrorMessage message={`駐車場データの取得に失敗しました: ${error}`} />;
  if (!data || data.length === 0) {
    return <ErrorMessage message={
      isRangeMode ? "選択した期間の駐車場データがありません" : "選択した日付の駐車場データがありません"
    } />;
  }

  // --------------------------
  // 日ごと平均にまとめる関数
  // --------------------------
  const aggregateDailyData = (data: ParkingData[]) => {
    const grouped = data.reduce((acc, item) => {
      const [date] = item.timestamp.split(" "); // YYYY-MM-DD
      if (!acc[date]) {
        acc[date] = { entry: 0, exit: 0, occupancy: 0, count: 0 };
      }
      acc[date].entry += item.entry_count;
      acc[date].exit += item.exit_count;
      acc[date].occupancy += item.occupancy_rate * 100; // %
      acc[date].count += 1;
      return acc;
    }, {} as Record<string, { entry: number; exit: number; occupancy: number; count: number }>);

    return Object.entries(grouped).map(([date, values]) => ({
      time: date,
      entry: Math.round(values.entry / values.count),
      exit: Math.round(values.exit / values.count),
      occupancy: +(values.occupancy / values.count).toFixed(1),
    }));
  };

  // --------------------------
  // timeSeriesData の生成
  // --------------------------
  let timeSeriesData;

  if (isRangeMode && startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays >= 3) {
      // 3日間以上 → 日ごと平均
      timeSeriesData = aggregateDailyData(data);
    } else {
      // 3日未満 → 時間ごと
      timeSeriesData = data.map(item => ({
        time: item.timestamp.split(' ')[1], // HH:mm:ss
        entry: item.entry_count,
        exit: item.exit_count,
        occupancy: item.occupancy_rate * 100,
      }));
    }
  } else {
    // 単日モード → 時間ごと
    timeSeriesData = data.map(item => ({
      time: item.timestamp.split(' ')[1],
      entry: item.entry_count,
      exit: item.exit_count,
      occupancy: item.occupancy_rate * 100,
    }));
  }

  // --------------------------
  // 用途別データ
  // --------------------------
  const usageTypeData = data.reduce((acc, item) => {
    let usageType = 'private';
    if (item.stay_duration > 180) {
      usageType = 'commercial';
    } else if (item.plate_region === 'Osaka' && item.stay_duration < 120) {
      usageType = 'rental';
    }
    acc[usageType] = (acc[usageType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const usagePieData = Object.entries(usageTypeData).map(([type, count]) => ({
    name: type === 'private' ? '自家用' : type === 'commercial' ? '商用' : type === 'rental' ? 'レンタカー' : type,
    value: count,
  }));

  // --------------------------
  // 地域別データ
  // --------------------------
  const regionData = data.reduce((acc, item) => {
    acc[item.plate_region] = (acc[item.plate_region] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const regionPieData = Object.entries(regionData).map(([region, count]) => ({
    name: region,
    value: count,
  }));

  // --------------------------
  // 時間帯別滞在時間
  // --------------------------
  const hourlyStayData = data.reduce((acc, item) => {
    const hour = item.timestamp.split(' ')[1].split(':')[0];
    if (!acc[hour]) acc[hour] = { hour, totalDuration: 0, count: 0 };
    acc[hour].totalDuration += item.stay_duration;
    acc[hour].count += 1;
    return acc;
  }, {} as Record<string, { hour: string; totalDuration: number; count: number }>);

  const stayDurationData = Object.values(hourlyStayData).map(item => ({
    hour: `${item.hour}:00`,
    avgDuration: Math.round(item.totalDuration / item.count),
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

      {/* 以下は元のまま（用途別・地域別・滞在時間・テーブル） */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Usage Type Distribution */}
        {/* ... 省略（元のコードのまま） ... */}
      </div>

      <ParkingDataTable data={data} className="mt-8" />
    </div>
  );
};

export default ParkingDashboard;
