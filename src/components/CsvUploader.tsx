import React, { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';

interface CsvUploaderProps {
  onDataUploaded: (data: any[], type: 'traffic' | 'parking' | 'weather') => void;
  dataType: 'traffic' | 'parking' | 'weather';
}

const CsvUploader: React.FC<CsvUploaderProps> = ({ onDataUploaded, dataType }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const expectedColumns = {
    traffic: ['timestamp', 'vehicle_count', 'avg_speed', 'vehicle_type', 'usage_type'],
    parking: ['timestamp', 'plate_region', 'stay_duration', 'entry_count', 'exit_count', 'occupancy_rate'],
    weather: ['date', 'weather', 'temperature', 'humidity']
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadStatus('error');
      setErrorMessage('CSVファイルを選択してください');
      return;
    }

    setUploadStatus('uploading');
    setErrorMessage('');

    try {
      const text = await file.text();
      const lines = text.trim().split('\n');
      
      if (lines.length < 2) {
        throw new Error('CSVファイルにデータが含まれていません');
      }

      // Parse CSV
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const expectedCols = expectedColumns[dataType];
      
      // Validate headers
      const missingColumns = expectedCols.filter(col => !headers.includes(col));
      if (missingColumns.length > 0) {
        throw new Error(`必要な列が不足しています: ${missingColumns.join(', ')}`);
      }

      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        
        headers.forEach((header, index) => {
          let value: any = values[index];
          
          // Type conversion based on data type
          if (dataType === 'traffic') {
            if (header === 'vehicle_count') value = parseInt(value);
            if (header === 'avg_speed') value = parseFloat(value);
          } else if (dataType === 'parking') {
            if (['stay_duration', 'entry_count', 'exit_count'].includes(header)) {
              value = parseInt(value);
            }
            if (header === 'occupancy_rate') value = parseFloat(value);
          } else if (dataType === 'weather') {
            if (header === 'temperature') value = parseInt(value);
            if (header === 'humidity') value = parseInt(value);
          }
          
          row[header] = value;
        });
        
        return row;
      });

      setUploadStatus('success');
      onDataUploaded(data, dataType);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setUploadStatus('idle');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 3000);

    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'ファイルの処理中にエラーが発生しました');
    }
  };

  const getDataTypeLabel = () => {
    const labels = {
      traffic: '交通データ',
      parking: '駐車場データ',
      weather: '天気データ'
    };
    return labels[dataType];
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent" />;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-600" />;
      default:
        return <Upload className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusMessage = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'アップロード中...';
      case 'success':
        return 'アップロード完了！';
      case 'error':
        return errorMessage;
      default:
        return `${getDataTypeLabel()}のCSVファイルをドラッグ&ドロップまたはクリックして選択`;
    }
  };

  return (
    <div className="mb-6">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : uploadStatus === 'success'
            ? 'border-green-500 bg-green-50'
            : uploadStatus === 'error'
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="flex flex-col items-center space-y-3">
          {getStatusIcon()}
          
          <div>
            <p className={`text-sm font-medium ${
              uploadStatus === 'success' ? 'text-green-700' :
              uploadStatus === 'error' ? 'text-red-700' :
              'text-gray-700'
            }`}>
              {getStatusMessage()}
            </p>
            
            {uploadStatus === 'idle' && (
              <div className="mt-2 text-xs text-gray-500">
                <p>必要な列: {expectedColumns[dataType].join(', ')}</p>
                <p className="mt-1">ファイル形式: CSV (.csv)</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CsvUploader;