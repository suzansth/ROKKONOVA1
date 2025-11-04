import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrafficData } from '../types';
import { useTrafficData } from '../hooks/useApi';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import TrafficDataTable from './TrafficDataTable';

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
  isRangeMode 
}) => {
  const { data: apiData, loading, error } = useTrafficData(selectedDate, startDate, endDate, isRangeMode);
  
  // Use CSV data if available, otherwise use API data
  const data = isUsingCsv ? csvData : (apiData || []);

  // 時間別集計データの生成
  const hourlyData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const hourlyMap = new Map<string, { hour: string; count: number; avgSpeed: number; totalSpeed: number; speedCount: number }>();
    
    data.forEach(item => {
      const hour = new Date(item.timestamp).getHours().toString().padStart(2, '0') + ':00';
      const existing = hourlyMap.get(hour) || { hour, count: 0, avgSpeed: 0, totalSpeed: 0, speedCount: 0 };
      
      existing.count += 1;
      if (item.speed_kmh && item.speed_kmh > 0) {
        existing.totalSpeed += item.speed_kmh;
        existing.speedCount += 1;
        existing.avgSpeed = existing.totalSpeed / existing.speedCount;
      }
      
      hourlyMap.set(hour, existing);
    });
    
    return Array.from(hourlyMap.values()).sort((a, b) => a.hour.localeCompare(b.hour));
  }, [data]);

  // 日別集計データの生成
  const dailyData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const dailyMap = new Map<string, { date: string; count: number; avgSpeed: number; totalSpeed: number; speedCount: number }>();
    
    data.forEach(item => {
      const date = new Date(item.timestamp).toISOString().split('T')[0];
      const existing = dailyMap.get(date) || { date, count: 0, avgSpeed: 0, totalSpeed: 0, speedCount: 0 };
      
      existing.count += 1;
      if (item.speed_kmh && item.speed_kmh > 0) {
        existing.totalSpeed += item.speed_kmh;
        existing.speedCount += 1;
        existing.avgSpeed = existing.totalSpeed / existing.speedCount;
      }
      
      dailyMap.set(date, existing);
    });
    
    return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  // 車種別データの生成
  const vehicleTypeData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const typeMap = new Map<string, number>();
    
    data.forEach(item => {
      const type = item.class_name || '不明';
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });
    
    return Array.from(typeMap.entries()).map(([name, value]) => ({ name, value }));
  }, [data]);

  // 方向別データの生成
  const directionData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const directionMap = new Map<string, number>();
    
    data.forEach(item => {
      const direction = item.direction === 'R' ? '右' : item.direction === 'L' ? '左' : item.direction || '不明';
      directionMap.set(direction, (directionMap.get(direction) || 0) + 1);
    });
    
    return Array.from(directionMap.entries()).map(([name, value]) => ({ name, value }));
  }, [data]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">交通量ダッシュボード</h2>
        <p className="text-gray-500">データがありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">交通量ダッシュボード</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800">総通過台数</h3>
            <p className="text-2xl font-bold text-blue-900">{data.length}台</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-800">平均速度</h3>
            <p className="text-2xl font-bold text-green-900">
              {data.filter(d => d.speed_kmh && d.speed_kmh > 0).length > 0
                ? Math.round(data.filter(d => d.speed_kmh && d.speed_kmh > 0).reduce((sum, d) => sum + (d.speed_kmh || 0), 0) / data.filter(d => d.speed_kmh && d.speed_kmh > 0).length)
                : 0} km/h
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-800">最高速度</h3>
            <p className="text-2xl font-bold text-yellow-900">
              {Math.max(...data.map(d => d.speed_kmh || 0))} km/h
            </p>
          </div>
        </div>
      </div>

      {/* 時間別交通量グラフ */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">時間別交通量と平均速度</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 12 }}
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
                  if (name === '平均速度') {
                    return [`${Math.round(Number(value))} km/h`, name];
                  }
                  return [`${value}台`, name];
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="count" fill="#3B82F6" name="通過台数" />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgSpeed"
                stroke="#10B981"
                strokeWidth={3}
                name="平均速度"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 日別交通量グラフ */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">日別交通量</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ value: '通過台数', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [`${value}台`, '通過台数']}
              />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 車種別構成 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">車種別構成</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vehicleTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {vehicleTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}台`, '台数']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 方向別構成 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">方向別構成</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={directionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {directionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}台`, '台数']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* データテーブル */}
      <TrafficDataTable data={data} />
    </div>
  );
};

export default TrafficDashboard;