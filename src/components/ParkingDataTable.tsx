import React from 'react';
import { MapPin, Clock, ArrowUp, ArrowDown } from 'lucide-react';
import DataTable from './DataTable';
import { ParkingData } from '../types';

interface ParkingDataTableProps {
  data: ParkingData[];
  className?: string;
}

const ParkingDataTable: React.FC<ParkingDataTableProps> = ({ data, className }) => {
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
      key: 'vehicle_type',
      label: '車種',
      sortable: true,
      render: (value: string) => (
        <div className="text-center">
          <span className="font-medium">{value === 'car' ? '乗用車' : value}</span>
        </div>
      )
    },
    {
      key: 'direction',
      label: '方向',
      sortable: true,
      render: (value: string) => (
        <div className="text-center">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {value === 'in' ? '入庫' : '出庫'}
          </span>
        </div>
      )
    },
    {
      key: 'city',
      label: '地域',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'engine_size',
      label: 'engine size',
      sortable: true,
      render: (value: number) => (
        <div className="text-center">
          <span className="font-medium">{value}</span>
          <span className="text-sm text-gray-500 ml-1"></span>
        </div>
      )
    },
    {
      key: 'kana',
      label: 'かな',
      sortable: true,
      render: (value: string) => (
        <div className="text-center">
          <span className="font-medium text-lg">{value}</span>
        </div>
      )
    },
   
  ];

  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">駐車場データ詳細</h3>
        <p className="text-sm text-gray-600 mt-1">
          時系列順に並んだ駐車場データの詳細情報です。列ヘッダーをクリックしてソートできます。
        </p>
      </div>
      <DataTable data={data} columns={columns} itemsPerPage={15} />
    </div>
  );
};

export default ParkingDataTable;
