import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar, LabelList
} from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  selectedDate, csvData, isUsingCsv, startDate, endDate, isRangeMode
}) => {
  // ====== ステート ======
  const [currentPage, setCurrentPage] = React.useState(0);

  const data = csvData || [];
  const loading = false;
  const error = undefined;

  // ====== 時間帯別データ（単日用） ======
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

  // ====== 期間選択時の日別データ ======
  const dailyTrafficData = React.useMemo(() => {
    const groupedByDate: Record<string, TrafficData[]> = {};
    data.forEach(item => {
      const date = item.timestamp.split(' ')[0];
      if (!groupedByDate[date]) groupedByDate[date] = [];
      groupedByDate[date].push(item);
    });

    return Object.entries(groupedByDate).map(([date, dayData]) => {
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
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  // ====== ページネーション ======
  const daysPerPage = 7;
  const totalPages = Math.ceil(dailyTrafficData.length / daysPerPage);
  const currentDays = dailyTrafficData.slice(currentPage * daysPerPage, (currentPage + 1) * daysPerPage);

  React.useEffect(() => {
    setCurrentPage(0);
  }, [startDate, endDate, isRangeMode]);

  // ====== 交通状況分類 ======
  const getTrafficStatus = (speed: number) => {
    if (speed >= 30) return { status: '普通', color: '#10B981' };
    if (speed >= 20) return { status: '混雑', color: '#F59E0B' };
    return { status: '渋滞', color: '#EF4444' };
  };

  const singleDayStatusData = hourlyData.map(item => ({
    ...item,
    ...getTrafficStatus(item.avgSpeed),
    height: 100
  }));

  // ====== 折れ線グラフ用 ======
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

  // ====== ローディング・エラーハンドリング ======
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={`交通データの取得に失敗しました: ${error}`} />;
  if (!data || data.length === 0)
    return (
      <ErrorMessage message={isRangeMode ? '選択した期間の交通データがありません' : '選択した日付の交通データがありません'} />
    );

  // ====== 描画 ======
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

      {/* ページネーションボタン */}
      {isRangeMode && totalPages > 1 && (
        <div className="flex items-center justify-end space-x-4">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-md"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> 前へ
          </button>
          <span className="text-sm text-gray-600">{currentPage + 1} / {totalPages}</span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-md"
          >
            次へ <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
        
      )}

      {/* 日別 or 単日グラフ */}
      {!isRangeMode ? (
  // --- 単日表示 ---
  <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">スマート交通判定</h3>
    <div className="h-32">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={singleDayStatusData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" tick={{ fontSize: 12 }} angle={0} textAnchor="end" height={60} />
          <Tooltip />
          <Bar dataKey="height" radius={[4, 4, 0, 0]}>
            {singleDayStatusData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
            <LabelList dataKey="avgSpeed" position="center" fill="#fff" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
) : (
  // --- 期間モード（複数日）---
  <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
    {/* ✅ タイトルはここに1回だけ表示 */}
    <h3 className="text-lg font-semibold text-gray-900 mb-6">スマート交通判定</h3>

    {/* ✅ グラフを縦1列で並べる */}
    <div className="flex flex-col space-y-6">
      {currentDays.map((dayData, i) => {
        const dayStatusData = dayData.hourlyData.map(item => ({
          ...item,
          ...getTrafficStatus(item.avgSpeed),
          height: 100,
        }));

        return (
          <div key={i} className="border rounded-lg p-4">
            {/* 各日付タイトルのみ個別に表示 */}
            <h4 className="text-md font-medium mb-3">{dayData.date}</h4>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" angle={-45} height={50} />
                  <Tooltip />
                  <Bar dataKey="height" radius={[3, 3, 0, 0]}>
                    {dayStatusData.map((entry, j) => (
                      <Cell key={j} fill={entry.color} />
                    ))}
                    <LabelList dataKey="avgSpeed" position="center" fill="#fff" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}

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

      {/* テーブル */}
      <TrafficDataTable data={data} className="mt-8" />
    </div>
  );
};

export default TrafficDashboard;
