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

  // ====== ステート・フックは常に最上部 ======
  const [currentPage, setCurrentPage] = React.useState(0);

  React.useEffect(() => {
    setCurrentPage(0);
  }, [startDate, endDate, isRangeMode]);

  // ====== 時間帯ごとの平均速度 ======
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

  // ====== 期間集計 ======
  const dailyTrafficData = React.useMemo(() => {
    if (!isRangeMode || !data.length) return [];
    const groupedByDate: Record<string, TrafficData[]> = {};
    data.forEach(item => {
      const date = item.timestamp.split(' ')[0];
      if (!groupedByDate[date]) groupedByDate[date] = [];
      groupedByDate[date].push(item);
    });
    return Object.entries(groupedByDate)
      .map(([date, dayData]) => {
        const grouped: Record<string, { totalSpeed: number; count: number }> = {};
        dayData.forEach(d => {
          const hour = d.timestamp.split(' ')[1].split(':')[0];
          const key = `${hour}時`;
          if (!grouped[key]) grouped[key] = { totalSpeed: 0, count: 0 };
          grouped[key].totalSpeed += d.speed_kmh;
          grouped[key].count += 1;
        });
        const hourlyData = Object.entries(grouped)
          .map(([hour, val]) => ({
            hour,
            avgSpeed: Math.round((val.totalSpeed / val.count) * 10) / 10
          }))
          .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
        return { date, hourlyData };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [data, isRangeMode]);

  // ====== その他の関数 ======
  const getTrafficStatus = (speed: number) => {
    if (speed >= 30) return { status: '普通', color: '#10B981' };
    if (speed >= 20) return { status: '混雑', color: '#F59E0B' };
    return { status: '渋滞', color: '#EF4444' };
  };

  const aggregateHourlyData = (data: TrafficData[]) => {
    const grouped: Record<string, { vehicleCount: number; totalSpeed: number; speedCount: number }> = {};
    data.forEach(item => {
      const hour = item.timestamp.split(' ')[1].split(':')[0];
      const key = `${hour}:00`;
      if (!grouped[key]) grouped[key] = { vehicleCount: 0, totalSpeed: 0, speedCount: 0 };
      grouped[key].vehicleCount += 1;
      grouped[key].totalSpeed += item.speed_kmh;
      grouped[key].speedCount += 1;
    });
    return Object.entries(grouped)
      .map(([time, val]) => ({
        time,
        count: val.vehicleCount,
        speed: Math.round((val.totalSpeed / val.speedCount) * 10) / 10
      }))
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const timeSeriesData = aggregateHourlyData(data);
  const vehicleTypeData = data.reduce((acc, item) => {
    acc[item.class_name] = (acc[item.class_name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const pieData = Object.entries(vehicleTypeData).map(([name, value]) => ({ name, value }));

  // ====== ページネーション ======
  const daysPerPage = 3;
  const totalPages = Math.ceil(dailyTrafficData.length / daysPerPage);
  const currentDays = dailyTrafficData.slice(currentPage * daysPerPage, (currentPage + 1) * daysPerPage);

  // ====== ここで「内容」を変数にまとめる ======
  let content;
  if (loading) {
    content = <LoadingSpinner />;
  } else if (error) {
    content = <ErrorMessage message={`交通データの取得に失敗しました: ${error}`} />;
  } else if (!data.length) {
    content = (
      <ErrorMessage
        message={isRangeMode ? '選択した期間の交通データがありません' : '選択した日付の交通データがありません'}
      />
    );
  } else {
    content = (
      <>
        {/* 折れ線グラフ、棒グラフ、円グラフなど — 元のJSX全部ここに残す */}
        {/* ...（あなたの元のJSXをそのまま貼り戻してOK） */}
      </>
    );
  }

  return <div className="space-y-8">{content}</div>;
};

export default TrafficDashboard;
