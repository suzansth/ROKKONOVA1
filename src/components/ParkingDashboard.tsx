import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import { useParkingData } from '../hooks/useApi';
import { ParkingData } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import ParkingDataTable from './ParkingDataTable';

interface TrafficDashboardProps {
  selectedDate?: string;
  csvData?: ParkingData[];
  isUsingCsv?: boolean;
  startDate?: string;
  endDate?: string;
  isRangeMode?: boolean;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const ParkingDashboard: React.FC<TrafficDashboardProps> = ({ 
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

  // Process data for charts
  const timeSeriesData = data.map(item => ({
    time: isRangeMode ? item.timestamp.split(' ')[0] : item.timestamp.split(' ')[1], // Show date for range mode
    entry: item.entry_count,
    exit: item.exit_count,
    occupancy: item.occupancy_rate * 100, // Convert to percentage
  }));

  // Get usage type data from traffic data (passed via props or context)
  // For now, we'll create sample usage data based on parking patterns
  const usageTypeData = data.reduce((acc, item) => {
    // Simulate usage type based on stay duration and region
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

  const regionData = data.reduce((acc, item) => {
    acc[item.plate_region] = (acc[item.plate_region] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const regionPieData = Object.entries(regionData).map(([region, count]) => ({
    name: region,
    value: count,
  }));

  // Group by hour for stay duration
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
        <div className={`${timeSeriesData.length > 50 ? 'h-96' : 'h-80'}`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
                interval={timeSeriesData.length > 50 ? Math.floor(timeSeriesData.length / 10) : 0}
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
                strokeWidth={timeSeriesData.length > 50 ? 2 : 3}
                name="入庫数"
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="exit"
                stroke="#10B981"
                strokeWidth={timeSeriesData.length > 50 ? 2 : 3}
                name="出庫数"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="occupancy"
                stroke="#F59E0B"
                strokeWidth={timeSeriesData.length > 50 ? 2 : 3}
                name="満車率 (%)"
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">

        {/* Usage Type Distribution */}
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">用途別構成比</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Pie
                  data={usagePieData}
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
                  {usagePieData.map((entry, index) => (
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

        {/* Regional Distribution */}
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">ナンバープレート地域別構成</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Pie
                  data={regionPieData}
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
                  {regionPieData.map((entry, index) => (
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

        {/* Average Stay Duration */}
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">時間帯別平均滞在時間</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stayDurationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  label={{ value: '滞在時間 (分)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value) => [`${value}分`, '平均滞在時間']}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="avgDuration" 
                  fill="#3B82F6" 
                  radius={[4, 4, 0, 0]}
                  stroke="#2563EB"
                  strokeWidth={1}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* データテーブル */}
      <ParkingDataTable data={data} className="mt-8" />
    </div>
  );
};

export default ParkingDashboard;