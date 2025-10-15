import { useState } from 'react';
import { TrafficData, ParkingData } from '../types';

interface CsvDataState {
  traffic: TrafficData[];
  parking: ParkingData[];
}

export const useCsvData = () => {
  const [csvData, setCsvData] = useState<CsvDataState>({
    traffic: [],
    parking: []
  });

  const [isUsingCsvData, setIsUsingCsvData] = useState({
    traffic: false,
    parking: false
  });

  const uploadCsvData = (data: any[], type: 'traffic' | 'parking') => {
    setCsvData(prev => ({
      ...prev,
      [type]: data
    }));
    
    setIsUsingCsvData(prev => ({
      ...prev,
      [type]: true
    }));
  };

  const clearCsvData = (type: 'traffic' | 'parking') => {
    setCsvData(prev => ({
      ...prev,
      [type]: []
    }));
    
    setIsUsingCsvData(prev => ({
      ...prev,
      [type]: false
    }));
  };

  const getCsvData = (
    type: 'traffic' | 'parking', 
    selectedDate?: string,
    startDate?: string,
    endDate?: string,
    isRangeMode?: boolean
  ) => {
    const data = csvData[type];
    
    if (!selectedDate && !isRangeMode) return data;
    
    // Filter by date range or single date
    if (isRangeMode && startDate && endDate) {
      return data.filter(item => {
        const itemDate = (item as TrafficData | ParkingData).timestamp.split(' ')[0];
        return itemDate >= startDate && itemDate <= endDate;
      });
    } else if (!isRangeMode && selectedDate) {
      return data.filter(item => {
        const itemDate = (item as TrafficData | ParkingData).timestamp.split(' ')[0];
        return itemDate === selectedDate;
      });
    }
    
    return data;
  };

  return {
    csvData,
    isUsingCsvData,
    uploadCsvData,
    clearCsvData,
    getCsvData
  };
};