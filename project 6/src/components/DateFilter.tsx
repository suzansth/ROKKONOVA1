import React from 'react';
import { Calendar, CalendarRange } from 'lucide-react';

interface DateFilterProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  isRangeMode: boolean;
  onToggleMode: () => void;
}

const DateFilter: React.FC<DateFilterProps> = ({ 
  selectedDate, 
  onDateChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  isRangeMode,
  onToggleMode
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-6">
      <div className="space-y-4">
        {/* Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <h3 className="text-lg font-semibold text-gray-900">データ期間設定</h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleMode}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                !isRangeMode
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">単一日付</span>
            </button>
            <button
              onClick={onToggleMode}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                isRangeMode
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <CalendarRange className="h-4 w-4" />
              <span className="text-sm font-medium">期間選択</span>
            </button>
          </div>
        </div>

        {/* Date Inputs */}
        {!isRangeMode ? (
          /* Single Date Mode */
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Calendar className="h-5 w-5 text-gray-500" />
            <label htmlFor="single-date" className="text-sm font-medium text-gray-700 sm:whitespace-nowrap">
              データ日付
            </label>
            <input
              type="date"
              id="single-date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="block w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
            />
          </div>
        ) : (
          /* Date Range Mode */
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <CalendarRange className="h-5 w-5 text-gray-500" />
              <label htmlFor="start-date" className="text-sm font-medium text-gray-700 sm:whitespace-nowrap">
                開始日
              </label>
              <input
                type="date"
                id="start-date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="block w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="h-5 w-5" /> {/* Spacer for alignment */}
              <label htmlFor="end-date" className="text-sm font-medium text-gray-700 sm:whitespace-nowrap">
                終了日
              </label>
              <input
                type="date"
                id="end-date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                min={startDate} // Prevent selecting end date before start date
                className="block w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
              />
            </div>

            {/* Date Range Summary */}
            {startDate && endDate && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <CalendarRange className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    選択期間: {startDate} ～ {endDate}
                    {(() => {
                      const start = new Date(startDate);
                      const end = new Date(endDate);
                      const diffTime = Math.abs(end.getTime() - start.getTime());
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                      return ` (${diffDays}日間)`;
                    })()}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DateFilter;