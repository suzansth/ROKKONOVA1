import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LabelList,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTrafficData } from "../hooks/useTrafficData";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { TrafficDataTable } from "./TrafficDataTable";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface TrafficDashboardProps {
  selectedDate: Date | null;
  csvData: any[];
  isUsingCsv: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  isRangeMode?: boolean;
}

export const TrafficDashboard: React.FC<TrafficDashboardProps> = ({
  selectedDate,
  csvData,
  isUsingCsv,
  startDate,
  endDate,
  isRangeMode,
}) => {
  const { data, loading, error } = useTrafficData(
    selectedDate,
    csvData,
    isUsingCsv,
    startDate,
    endDate,
    isRangeMode
  );

  const [timeRange, setTimeRange] = useState("hourly");

  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <ErrorMessage message={`交通データの取得に失敗しました: ${error}`} />
    );
  if (!data || data.length === 0)
    return <ErrorMessage message="データがありません。" />;

  // 🧮 データ加工：平均速度などを追加
  const trafficStatusData = useMemo(() => {
    return data.map((item: any) => {
      const avgSpeed = item.avg_speed ?? item.speed_kmh ?? 0;
      let status = "";
      let color = "";

      if (avgSpeed >= 30) {
        status = "通常";
        color = "#10B981"; // 緑
      } else if (avgSpeed >= 10) {
        status = "混雑";
        color = "#F59E0B"; // 黄
      } else {
        status = "渋滞";
        color = "#EF4444"; // 赤
      }

      return {
        time: item.hour ? `${item.hour}時` : item.date,
        height: 100, // 棒の高さは固定（見た目用）
        avgSpeed,
        status,
        color,
      };
    });
  }, [data]);

  return (
    <div className="space-y-8">
      {/* 🚗 時間帯別交通状況 */}
      <Card>
        <CardHeader>
          <CardTitle>時間帯別交通状況</CardTitle>
        </CardHeader>

        <CardContent className="h-[400px]">
          {trafficStatusData && trafficStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={trafficStatusData}
                margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis hide />
                <Tooltip
                  formatter={(value: any, name: any) =>
                    name === "avgSpeed" ? `${value} km/h` : value
                  }
                />
                <Legend />

                <Bar dataKey="height" radius={[4, 4, 0, 0]}>
                  {trafficStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}

                  {/* ✅ 平均速度を棒の中央に表示 */}
                  <LabelList
                    dataKey="avgSpeed"
                    position="inside"
                    formatter={(value: number | undefined) =>
                      value !== undefined ? `${value} km/h` : ""
                    }
                    style={{
                      fill: "white",
                      fontSize: 12,
                      fontWeight: 600,
                      textAnchor: "middle",
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ErrorMessage message="交通状況データがありません。" />
          )}
        </CardContent>
      </Card>

      {/* 📊 折れ線グラフ：交通量・平均速度 */}
      <Card>
        <CardHeader>
          <CardTitle>交通量と平均速度の推移</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data.map((item) => ({
                time: item.hour ? `${item.hour}時` : item.date,
                traffic_volume: item.traffic_volume ?? 0,
                avg_speed: item.avg_speed ?? item.speed_kmh ?? 0,
              }))}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="traffic_volume"
                stroke="#3B82F6"
                name="交通量（台数）"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="avg_speed"
                stroke="#F59E0B"
                name="平均速度（km/h）"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 🥧 車種別構成（例） */}
      <Card>
        <CardHeader>
          <CardTitle>車種別構成比</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex justify-center items-center">
          <ResponsiveContainer width="60%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: "乗用車", value: 65 },
                  { name: "トラック", value: 25 },
                  { name: "バス", value: 10 },
                ]}
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(1)}%`
                }
                dataKey="value"
              >
                <Cell fill="#3B82F6" />
                <Cell fill="#F59E0B" />
                <Cell fill="#10B981" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 📋 データテーブル */}
      <TrafficDataTable data={data} className="mt-8" />
    </div>
  );
};
