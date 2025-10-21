import React from 'react';
import { Car, Truck, Bus } from 'lucide-react';
import DataTable from './DataTable';
import { TrafficData } from '../types';

interface TrafficDataTableProps {
  data: TrafficData[];
  className?: string;
}

const TrafficDataTable: React.FC<TrafficDataTableProps> = ({ data, className }) => {
  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'car':
        return <Car className="w-4 h-4 text-blue-600" />;
      case 'truck':
        return <Truck className="w-4 h-4 text-green-600" />;
      case 'bus':
        return <Bus className="w-4 h-4 text-orange-600" />;
      default:
        return <Car className="w-4 h-4 text-gray-600" />;
    }
  };

  const getVehicleTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      car: '乗用車',
      truck: 'トラック',
      bus: 'バス'
    };
    return labels[type] || type;
  };

  const columns = [
    {
      key: 'timestamp',
      label: '時刻',
      sortable: true,
      render: (value: string) => (
        <div className="font-medium">
          <div className="text-gray-900">{value.split(' ')[1]}</div>
          <div className="text-xs text-gray-500">{value.split(' ')[0]}</div>
        </div>
      )
    },
    {
      key: 'object_id',
      label: 'ID',
      sortable: true,
      render: (value: number) => (
        <div className="text-center">
          <span className="text-sm font-medium text-gray-900">#{value}</span>
        </div>
      )
    },
    {
      key: 'class_name',
      label: '車種',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          {getVehicleIcon(value)}
          <span className="font-medium">{getVehicleTypeLabel(value)}</span>
        </div>
      )
    },
    {
      key: 'direction',
      label: '方向',
      sortable: true,
      render: (value: string) => (
        <div className="text-center">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              value === 'R'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {value === 'R' ? '右' : '左'}
          </span>
        </div>
      )
    },
    {
      key: 'speed_kmh',
      label: '通過速度',
      sortable: true,
      render: (value: number) => (
        <div
          className={`text-center ${
            value <= 30 ? 'text-red-600 font-bold' : 'text-gray-900'
          }`}
        >
          <span className="text-lg">{value.toFixed(1)}</span>
          <span className="text-sm text-gray-500 ml-1">km/h</span>
          {value <= 30 && (
            <div className="text-xs text-red-500 mt-1">渋滞中</div>
          )}
        </div>
      )
    }
  ];

  // 速度が30km/h以下の行に薄い赤色背景を付ける
  const highlightedData = data.map((item) => ({
    ...item,
    rowClass: item.speed_kmh <= 30 ? 'bg-red-50' : ''
  }));

  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">交通量データ詳細</h3>
        <p className="text-sm text-gray-600 mt-1">
          1時間ごとに集計された交通量データの詳細情報です。列ヘッダーをクリックしてソートできます。
          <br />
          <span className="text-red-500 font-semibold">※赤色の行は渋滞状態（平均速度30km/h以下）</span>
        </p>
      </div>
      <DataTable data={highlightedData} columns={columns} itemsPerPage={15} />
    </div>
  );
};

export default TrafficDataTable;
