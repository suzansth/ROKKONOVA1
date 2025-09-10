import React from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Thermometer, Droplets } from 'lucide-react';
import { useWeatherData } from '../hooks/useApi';
import { WeatherData } from '../types';

interface WeatherWidgetProps {
  selectedDate?: string;
  csvData?: WeatherData[];
  isUsingCsv?: boolean;
  startDate?: string;
  endDate?: string;
  isRangeMode?: boolean;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ 
  selectedDate, 
  csvData, 
  isUsingCsv,
  startDate,
  endDate,
  isRangeMode 
}) => {
  const { data, loading, error } = useWeatherData(
    selectedDate, 
    csvData, 
    isUsingCsv,
    startDate,
    endDate,
    isRangeMode
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="text-right">
              <div className="h-6 bg-gray-200 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-12"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center space-x-3 text-red-600">
          <Cloud className="h-8 w-8" />
          <div>
            <p className="text-sm font-medium">天気データの取得に失敗しました</p>
            <p className="text-xs text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const weatherIcons: Record<string, React.ReactNode> = {
    sunny: <Sun className="h-8 w-8 text-yellow-500" />,
    cloudy: <Cloud className="h-8 w-8 text-gray-500" />,
    rainy: <CloudRain className="h-8 w-8 text-blue-500" />,
    snowy: <CloudSnow className="h-8 w-8 text-blue-200" />,
  };

  const todayWeather = data.find(item => item.date === selectedDate);
  
  // For range mode, show summary or first day's weather
  const displayWeather = isRangeMode ? data[0] : todayWeather;
  const displayDate = isRangeMode && startDate && endDate 
    ? `${startDate} ～ ${endDate}` 
    : selectedDate;

  if (!displayWeather) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center space-x-3 text-gray-500">
          <Cloud className="h-8 w-8" />
          <div>
            <p className="text-sm font-medium">
              {isRangeMode ? '選択した期間の天気データがありません' : '選択した日付の天気データがありません'}
            </p>
            <p className="text-xs">別の日付を選択してください</p>
          </div>
        </div>
      </div>
    );
  }

  const getWeatherLabel = (weather: string) => {
    const labels: Record<string, string> = {
      sunny: '晴れ',
      cloudy: '曇り',
      rainy: '雨',
      snowy: '雪'
    };
    return labels[weather] || weather;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          {weatherIcons[displayWeather.weather] || weatherIcons.sunny}
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {displayDate} の天気
            </p>
            <p className="text-sm text-gray-600 flex items-center space-x-1">
              <span>{getWeatherLabel(displayWeather.weather)}</span>
              {isRangeMode && data.length > 1 && (
                <span className="text-xs text-gray-500 ml-2">
                  （{data.length}日間のデータ）
                </span>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-6">
          <div className="flex items-center space-x-2">
            <Thermometer className="h-5 w-5 text-red-500" />
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {isRangeMode && data.length > 1 
                  ? `${Math.round(data.reduce((sum, item) => sum + item.temperature, 0) / data.length)}°C`
                  : `${displayWeather.temperature}°C`
                }
              </p>
              <p className="text-xs text-gray-500">
                {isRangeMode && data.length > 1 ? '平均気温' : '気温'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Droplets className="h-5 w-5 text-blue-500" />
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {isRangeMode && data.length > 1 
                  ? `${Math.round(data.reduce((sum, item) => sum + item.humidity, 0) / data.length)}%`
                  : `${displayWeather.humidity}%`
                }
              </p>
              <p className="text-xs text-gray-500">
                {isRangeMode && data.length > 1 ? '平均湿度' : '湿度'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;