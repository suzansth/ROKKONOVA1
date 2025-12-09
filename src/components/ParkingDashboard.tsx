import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
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

/* ===========================================================
   円グラフのカスタムラベル（円の外側にラベルを描画）
   =========================================================== */
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name
}) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 20; 
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#333"
      fontSize={12}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${name} ${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

const ParkingDashboard: React.FC<ParkingDashboardProps> = ({
  selectedDate,
  csvData,
  isUsingCsv,
  startDate,
  endDate,
  isRangeMode,
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
  if (error)
    return <ErrorMessage message={`駐車場データの取得に失敗しました: ${error}`} />;

  if (!data || data.length === 0) {
    return (
      <ErrorMessage
        message={
          isRangeMode
            ? '選択した期間の駐車場データがありません'
            : '選択した日付の駐車場データがありません'
        }
      />
    );
  }

  /* === 1時間ごとの集計 === */
  const aggregateHourlyData = (data: ParkingData[]) => {
    const grouped: Record<string, { entry: number; exit: number; total: number }> = {};
    data.forEach((item) => {
      const hour = item.timestamp.split(' ')[1].split(':')[0] + ':00';
      if (!grouped[hour]) grouped[hour] = { entry: 0, exit: 0, total: 0 };

      if (item.direction === 'in') grouped[hour].entry++;
      if (item.direction === 'out') grouped[hour].exit++;
      grouped[hour].total++;
    });

    return Object.entries(grouped)
      .map(([hour, val]) => ({
        time: hour,
        entry: val.entry,
        exit: val.exit,
        occupancy:
          val.total > 0
            ? Math.round(((val.entry - val.exit) / val.total) * 100)
            : 0,
      }))
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  /* === 日ごとの集計 === */
  const aggregateDailyData = (data: ParkingData[]) => {
    const grouped: Record<string, { entry: number; exit: number; total: number }> = {};
    data.forEach((item) => {
      const date = item.timestamp.split(' ')[0];
      if (!grouped[date]) grouped[date] = { entry: 0, exit: 0, total: 0 };

      if (item.direction === 'in') grouped[date].entry++;
      if (item.direction === 'out') grouped[date].exit++;
      grouped[date].total++;
    });

    return Object.entries(grouped)
      .map(([date, val]) => ({
        time: date,
        entry: val.entry,
        exit: val.exit,
        occupancy:
          val.total > 0
            ? Math.round(((val.entry - val.exit) / val.total) * 100)
            : 0,
      }))
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  /* === 時系列データ === */
  let timeSeriesData;
  if (isRangeMode && startDate && endDate) {
    const diff =
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
      (1000 * 60 * 60 * 24);

    timeSeriesData = diff >= 3 ? aggregateDailyData(data) : aggregateHourlyData(data);
  } else {
    timeSeriesData = aggregateHourlyData(data);
  }

  /* === かな分類 === */
  const commercialKana = ['あ','い','う','え','お','か','き','く','け','こ'];
  const privateKana = [
    'さ','し','す','せ','そ','た','ち','つ','て','と',
    'な','に','ぬ','ね','の','は','ひ','ふ','へ','ほ',
    'ま','み','む','め','も','や','ゆ','よ','ら','り','る','れ','ろ'
  ];
  const rentalKana = ['わ','れ'];
  const militaryKana = ['よ'];
  const militaryAlpha = ['E','H','K','M','T','Y'];

  const usageDataMap = {
    private: 0,
    commercial: 0,
    rental: 0,
    military: 0
  };

  data.forEach((item) => {
    const kana = item.kana;
    let type = 'private';

    if (!kana) return;

    if (militaryAlpha.includes(kana.toUpperCase())) type = 'military';
    else if (militaryKana.includes(kana)) type = 'military';
    else if (rentalKana.includes(kana)) type = 'rental';
    else if (commercialKana.includes(kana)) type = 'commercial';
    else type = 'private';

    usageDataMap[type]++;
  });

  const usagePieData = [
    { name: '自家用車', value: usageDataMap.private },
    { name: '商用車', value: usageDataMap.commercial },
    { name: 'レンタカー', value: usageDataMap.rental },
    { name: 'その他', value: usageDataMap.military },
  ];

  /* === 地域集計 === */
  const regionCount: Record<string, number> = {};
  data.forEach((item) => {
    const region = item.city || '不明';
    if (!regionCount[region]) regionCount[region] = 0;
    regionCount[region]++;
  });

  const regionPieData = Object.entries(regionCount).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-8">

      {/* === 入庫・出庫・満車率グラフ === */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          入庫・出庫数および満車率の推移
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="entry" stroke="#3B82F6" strokeWidth={3} name="入庫数" />
              <Line yAxisId="left" type="monotone" dataKey="exit" stroke="#10B981" strokeWidth={3} name="出庫数" />
              <Line yAxisId="right" type="monotone" dataKey="occupancy" stroke="#F59E0B" strokeWidth={3} name="満車率 (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* === 用途別構成比 === */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">用途別構成比</h3>

        <div className="flex justify-center">
          <div className="w-[320px] h-[320px]">
            <PieChart width={320} height={320}>
              <Pie
                data={usagePieData}
                cx="50%"
                cy="50%"
                outerRadius="80%"
                innerRadius="40%"
                labelLine
                label={renderCustomizedLabel}
                dataKey="value"
                stroke="#fff"
                strokeWidth={2}
              >
                {usagePieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>
      </div>

      {/* === ナンバープレート地域別構成 === */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">ナンバープレート地域別構成</h3>

        <div className="flex justify-center">
          <div className="w-[550px] h-[440px]">
            <PieChart width={320} height={320}>
              <Pie
                data={regionPieData}
                cx="50%"
                cy="50%"
                outerRadius="80%"
                innerRadius="40%"
                labelLine
                label={renderCustomizedLabel}
                dataKey="value"
                stroke="#fff"
                strokeWidth={2}
              >
                {regionPieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
            </PieChart>
          </div>
        </div>
      </div>

      {/* === テーブル === */}
      <ParkingDataTable data={data} className="mt-8" />

    </div>
  );
};

export default ParkingDashboard;
