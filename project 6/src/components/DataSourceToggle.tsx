import React from 'react';
import { Database, Upload, X } from 'lucide-react';

interface DataSourceToggleProps {
  isUsingCsv: boolean;
  onToggle: () => void;
  onClear: () => void;
  dataType: 'traffic' | 'parking' | 'weather';
  csvDataCount: number;
}

const DataSourceToggle: React.FC<DataSourceToggleProps> = ({ 
  isUsingCsv, 
  onToggle, 
  onClear, 
  dataType,
  csvDataCount 
}) => {
  const getDataTypeLabel = () => {
    const labels = {
      traffic: '交通データ',
      parking: '駐車場データ',
      weather: '天気データ'
    };
    return labels[dataType];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {isUsingCsv ? (
              <Upload className="h-5 w-5 text-green-600" />
            ) : (
              <Database className="h-5 w-5 text-blue-600" />
            )}
            <span className="text-sm font-medium text-gray-700">
              データソース: {isUsingCsv ? 'アップロードされたCSV' : 'サンプルデータ'}
            </span>
          </div>
          
          {isUsingCsv && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {csvDataCount}件のレコード
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {isUsingCsv && (
            <button
              onClick={onClear}
              className="flex items-center space-x-1 px-3 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
            >
              <X className="h-3 w-3" />
              <span>クリア</span>
            </button>
          )}
          
          <button
            onClick={onToggle}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              isUsingCsv
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            {isUsingCsv ? 'CSVデータ使用中' : 'サンプルデータ使用中'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataSourceToggle;