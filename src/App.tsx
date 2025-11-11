import React, { useState } from 'react';
import Header from './components/Header';
import DateFilter from './components/DateFilter';
import TrafficDashboard from './components/TrafficDashboard';
import ParkingDashboard from './components/ParkingDashboard';
import CsvUploader from './components/CsvUploader';
import DataSourceToggle from './components/DataSourceToggle';
import { useCsvData } from './hooks/useCsvData';

function App() {
  const [activeTab, setActiveTab] = useState<'traffic' | 'parking'>('traffic');
  const [selectedDate, setSelectedDate] = useState('2025-08-16');
  const [startDate, setStartDate] = useState('2025-08-16');
  const [endDate, setEndDate] = useState('2025-08-16');
  const [isRangeMode, setIsRangeMode] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  
  const { csvData, isUsingCsvData, uploadCsvData, clearCsvData, getCsvData } = useCsvData();

  const handleToggleMode = () => {
    setIsRangeMode(!isRangeMode);
    // 範囲モード切替時に日付をリセット
    if (!isRangeMode) {
      setStartDate(selectedDate);
      setEndDate(selectedDate);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            六甲山・摩耶山 交通調査システム
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Jetson Nanoで収集されたデータの可視化ダッシュボード
          </p>
        </div>

        {/* 日付フィルター */}
        <DateFilter 
          selectedDate={selectedDate} 
          onDateChange={setSelectedDate}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          isRangeMode={isRangeMode}
          onToggleMode={handleToggleMode}
        />
        
        {/* CSV アップロードセクション */}
        <div className="mb-6">
          <button
            onClick={() => setShowUploader(!showUploader)}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span>{showUploader ? 'アップローダーを閉じる' : 'CSVデータをアップロード'}</span>
          </button>
          
          {showUploader && (
            <div className="space-y-4">
              <CsvUploader 
                dataType="traffic" 
                onDataUploaded={uploadCsvData}
              />
              <CsvUploader 
                dataType="parking" 
                onDataUploaded={uploadCsvData}
              />
            </div>
          )}
        </div>

        {/* ====== タブ切り替えエラー修正版 ====== */}
        <div className="space-y-8">
          {/* 交通データタブ */}
          <div className={activeTab === 'traffic' ? 'block' : 'hidden'}>
            <DataSourceToggle
              isUsingCsv={isUsingCsvData.traffic}
              onToggle={() => {}}
              onClear={() => clearCsvData('traffic')}
              dataType="traffic"
              csvDataCount={csvData.traffic.length}
            />
            <TrafficDashboard 
              selectedDate={isRangeMode ? undefined : selectedDate}
              csvData={getCsvData('traffic', selectedDate, startDate, endDate, isRangeMode)}
              isUsingCsv={isUsingCsvData.traffic}
              startDate={startDate}
              endDate={endDate}
              isRangeMode={isRangeMode}
            />
          </div>

          {/* 駐車データタブ */}
          <div className={activeTab === 'parking' ? 'block' : 'hidden'}>
            <DataSourceToggle
              isUsingCsv={isUsingCsvData.parking}
              onToggle={() => {}}
              onClear={() => clearCsvData('parking')}
              dataType="parking"
              csvDataCount={csvData.parking.length}
            />
            <ParkingDashboard 
              selectedDate={isRangeMode ? undefined : selectedDate}
              csvData={getCsvData('parking', selectedDate, startDate, endDate, isRangeMode)}
              isUsingCsv={isUsingCsvData.parking}
              startDate={startDate}
              endDate={endDate}
              isRangeMode={isRangeMode}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
