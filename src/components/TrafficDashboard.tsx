import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, BarChart, Bar, LabelList 
} from 'recharts';
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

  // === 日別集計 ===
  const aggregateDailyData = (data: TrafficData[]) => {
    const grouped: Record<string, { vehicleCount: number; totalSpeed: number; speedCount: number }> = {};
    
    data.forEach(item => {
      const date = item.timestamp.split(' ')[0];
      if (!grouped[date]) grouped[date] = { vehicleCount: 0, totalSpeed: 0, speedCount: 0 };
      grouped[date].vehicleCount += 1;
      grouped[date].totalSpeed += item.speed_kmh;
      grouped[date].speedCount += 1;
    });
    
    return Object.entries(grouped).map(([time, data]) => ({
      time,
      count: data.vehicleCount,
      speed: Math.round((data.totalSpeed / data.speedCount) * 10) / 10
    })).sort((a, b) => a.time.localeCompare(b.time));
  };

  // === 時間帯別集計 ===
  const aggregateHourlyData = (data: TrafficData[]) => {
    const grouped: Record<string, { vehicleCount: number; totalSpeed: number; speedCount: number }> = {};
    
    data.forEach(item => {
      const hour = item.timestamp.split(' ')[1].split(':')[0];
      const timeKey = `${hour.toString().padStart(2, '0')}:00`;
      if (!grouped[timeKey]) grouped[timeKey] = { vehicleCount: 0, totalSpeed: 0, speedCount: 0 };
      grouped[timeKey].vehicleCount += 1;
      grouped[timeKey].totalSpeed += item.speed_kmh;
      grouped[timeKey].speedCount += 1;
    });
    
    return Object.entries(grouped).map(([time, data]) => ({
      time,
      count: data.vehicleCount,
      speed: Math.round((data.totalSpeed / data.speedCount) * 10) / 10
    })).sort((a, b) => a.time.localeCompare(b.time));
  };

  // === データ取得 ===
  const { data, loading, error } = useTrafficData(
    selectedDate, csvData, isUsingCsv, startDate, endDate, isRangeMode
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={`交通データの取得に失敗しました: ${error}`} />;
  if (!data || data.length === 0)
    return <ErrorMessage message={isRangeMode ? "選択した期間の交通データがありません" : "選択した日付の交通データがありません"} />;

  // === 時間帯別平均速度 ===
  const hourlyData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    if (isRangeMode && startDate && endDate) {
      const hourlyGroups: Record<string, { totalSpeed: number; count: number }> = {};
      data.forEach(item => {
        const hour = item.timestamp.split(' ')[1].split(':')[0];
        const hourKey = `${hour}時`;
        const speed = item.avg_speed ?? item.speed_kmh;
        if (!hourlyGroups[hourKey]) hourlyGroups[hourKey] = { totalSpeed: 0, count: 0 };
        hourlyGroups[hourKey].totalSpeed += speed;
        hourlyGroups[hourKey].count += 1;
      });
      return Object.entries(hourlyGroups).map(([hour, values]) => ({
        hour,
        avgSpeed: Math.round((values.totalSpeed / values.count) * 10) / 10
      })).sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
    } else {
      return data.map(item => ({
        hour: `${item.timestamp.split(' ')[1].split(':')[0]}時`,
        avgSpeed: item.avg_speed ?? item.speed_kmh
      }));
    }
  }, [data, isRangeMode, startDate, endDate]);

  // === 交通状況 ===
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

  // === 折れ線グラフ用データ ===
  let timeSeriesData;
  if (isRangeMode && startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    timeSeriesData = daysDiff >= 3 ? aggregateDailyData(data) : aggregateHourlyData(data);
  } else {
    timeSeriesData = aggregateHourlyData(data);
  }

  // === 車種構成データ ===
  const vehicleTypeData = data.reduce((acc, item) => {
    acc[item.class_name] = (acc[item.class_name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(vehicleTypeData).map(([type, count]) => ({
    name: type === 'car' ? '乗用車' : type === 'truck' ? 'トラック' : type === 'bus' ? 'バス' : type,
    value: count,
  }));

  // === JSX ===
  return (
    <div className="space-y-8">
      {/* 折れ線グラフ */}
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
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" label={{ value: '通過台数', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: '平均速度 (km/h)', angle: 90, position: 'insideRight' }} />
              <Tooltip formatter={(value, name) => name === '平均速度 (km/h)' ? [`${value} km/h`, name] : [`${value}台`, name]} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={3} name="通過台数" />
              <Line yAxisId="right" type="monotone" dataKey="speed" stroke="#10B981" strokeWidth={3} name="平均速度 (km/h)" />
            </LineChart>
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
                innerRadius="40%"
                dataKey="value"
                stroke="#fff"
                strokeWidth={2}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 棒グラフ（時間帯別交通状況） */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          時間帯別交通状況
          {isRangeMode && startDate && endDate && (
            <span className="text-sm font-normal text-gray-600 ml-2">
              ({startDate} ～ {endDate} の平均)
            </span>
          )}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trafficStatusData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
              <Tooltip
                formatter={(value, name, props) => {
                  const speed = props.payload.avgSpeed;
                  const status = props.payload.status;
                  return [`${speed} km/h (${status})`, '平均速度'];
                }}
                labelFormatter={(label) => `時間帯: ${label}`}
              />
              <Bar dataKey="height" radius={[4, 4, 0, 0]} stroke="#fff" strokeWidth={1}>
                {trafficStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}

                {/* ✅ 棒の中央に平均速度を表示 */}
                <LabelList
                  dataKey="avgSpeed"
                  position="inside"
                  formatter={(value: number) => `${value} km/h`}
                  style={{
                    fill: 'white',
                    fontSize: 12,
                    fontWeight: 600,
                    textAnchor: 'middle',
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 凡例 */}
        <div className="mt-4 flex justify-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-700">普通 (30km/h以上)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-sm text-gray-700">混雑 (20–30km/h)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-700">渋滞 (20km/h未満)</span>
          </div>
        </div>
      </div>

      {/* テーブル */}
      <TrafficDataTable data={data} className="mt-8" />
    </div>
  );
};

export default TrafficDashboard;
