import React from 'react';
import { MapPin, Clock, ArrowUp, ArrowDown } from 'lucide-react';
import DataTable from './DataTable';
import { ParkingData } from '../types';

interface ParkingDataTableProps {
  data: ParkingData[];
  className?: string;
}

const ParkingDataTable: React.FC<ParkingDataTableProps> = ({ data, className }) => {
  const getOccupancyBadge = (rate: number) => {
    const percentage = Math.round(rate * 100);
    let colorClass = '';
    
    if (percentage >= 90) {
      colorClass = 'bg-red-100 text-red-800';
    } else if (percentage >= 70) {
      colorClass = 'bg-orange-100 text-orange-800';
    } else if (percentage >= 50) {
      colorClass = 'bg-yellow-100 text-yellow-800';
    } else {
      colorClass = 'bg-green-100 text-green-800';
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {percentage}%
      </span>
    );
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}時間${mins > 0 ? `${mins}分` : ''}`;
    }
    return `${mins}分`;
  };

  const getUsageTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      private: '自家用',
      commercial: '商用',
      rental: 'レンタカー'
    };
    return labels[type] || type;
  };

  const getUsageTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      private: 'bg-blue-100 text-blue-800',
      commercial: 'bg-green-100 text-green-800',
      rental: 'bg-orange-100 text-orange-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        styles[type] || 'bg-gray-100 text-gray-800'
      }`}>
        {getUsageTypeLabel(type)}
      </span>
    );
  };

  // Add usage_type to data based on parking patterns
  const dataWithUsage = data.map(item => {
    let usageType = 'private';
    if (item.stay_duration > 180) {
      usageType = 'commercial';
    } else if (item.plate_region === 'Osaka' && item.stay_duration < 120) {
      usageType = 'rental';
    }
    return { ...item, usage_type: usageType };
  });

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
      key: 'plate_region',
      label: 'ナンバー地域',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'stay_duration',
      label: '滞在時間',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="font-medium">{formatDuration(value)}</span>
        </div>
      )
    },
    {
      key: 'entry_count',
      label: '入庫数',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center justify-center space-x-1">
          <ArrowUp className="w-4 h-4 text-green-600" />
          <span className="text-lg font-semibold text-green-700">{value}</span>
          <span className="text-sm text-gray-500">台</span>
        </div>
      )
    },
    {
      key: 'exit_count',
      label: '出庫数',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center justify-center space-x-1">
          <ArrowDown className="w-4 h-4 text-red-600" />
          <span className="text-lg font-semibold text-red-700">{value}</span>
          <span className="text-sm text-gray-500">台</span>
        </div>
      )
    },
    {
      key: 'usage_type',
      label: '用途',
      sortable: true,
      render: (value: string) => getUsageTypeBadge(value)
    },
    {
      key: 'occupancy_rate',
      label: '満車率',
      sortable: true,
      render: (value: number) => (
        <div className="text-center">
          {getOccupancyBadge(value)}
        </div>
      )
    }
  ];

  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">駐車場データ詳細</h3>
        <p className="text-sm text-gray-600 mt-1">
          時系列順に並んだ駐車場データの詳細情報です。列ヘッダーをクリックしてソートできます。
        </p>
      </div>
      <DataTable data={dataWithUsage} columns={columns} itemsPerPage={15} />
    </div>
  );
};

export default ParkingDataTable;