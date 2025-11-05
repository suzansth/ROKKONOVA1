import React, { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, LabelList,
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
  const { data, loading, error } = useTrafficData(selectedDate, csvData, isUsingCsv, startDate, endDate, isRangeMode);
  const [timeRange, setTimeRange] = useState("hourly");

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={`交通データの取得に失敗しました: ${error}`} />;
  if (!data || data.length === 0) return <ErrorMessage message="データがありません。" />;

  // 平均速度のデータ加工
  const trafficStatusData = useMemo(() => {
    return data.map((item: any) => {
      const avgSpeed = item.avg_speed ?? item.speed_kmh ?? 0;
      let status = "";
      let color = "";
      if (avgSpeed >= 30) { status = "通常"; color = "#10B981"; }
      else if (avgSpeed >= 10) { status = "混雑"; color = "#F59E0B"; }
      else { status = "渋滞"; color = "#EF4444"; }

      return {
        time: item.hour ? `${item.hour}時` : item.date,
        height: 100, // 仮の棒の高さ
        avgSpeed,
        status,
        color,
      };
    });
  }, [data]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>時間帯別交通状況</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          {trafficStatusData && trafficStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficStatusData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis hide />
                <Tooltip formatter={(value: any, name: any) => name === "avgSpeed" ? `${value} km/h` : value} />
                <Legend />
                <Bar dataKey="height" radius={[4, 4, 0, 0]}>
                  {trafficStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  {/* 平均速度ラベル（中央） */}
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

      {/* 既存テーブル */}
      <TrafficDataTable data={data} className="mt-8" />
    </div>
  );
};
