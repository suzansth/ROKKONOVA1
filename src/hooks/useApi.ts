import { useState, useEffect } from 'react';
import { TrafficData, ParkingData } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

// Helper function to filter data by date range
const filterDataByDateRange = (data: any[], startDate?: string, endDate?: string, isRangeMode?: boolean, singleDate?: string) => {
  // Ensure data is an array
  if (!Array.isArray(data)) {
    return [];
  }
  
  if (isRangeMode && startDate && endDate) {
    return data.filter(item => {
      const itemDate = item.timestamp ? item.timestamp.split(' ')[0] : item.date;
      return itemDate >= startDate && itemDate <= endDate;
    });
  } else if (!isRangeMode && singleDate) {
    return data.filter(item => {
      const itemDate = item.timestamp ? item.timestamp.split(' ')[0] : item.date;
      return itemDate === singleDate;
    });
  }
  return data;
};

export const useTrafficData = (
  date?: string, 
  csvData?: TrafficData[], 
  isUsingCsv?: boolean,
  startDate?: string,
  endDate?: string,
  isRangeMode?: boolean
) => {
  const [data, setData] = useState<TrafficData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isUsingCsv && csvData) {
      setLoading(true);
      const filteredData = filterDataByDateRange(csvData, startDate, endDate, isRangeMode, date);
      setData(filteredData);
      setError(null);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        let url = `${API_BASE_URL}/traffic`;
        if (isRangeMode && startDate && endDate) {
          url += `?startDate=${startDate}&endDate=${endDate}`;
        } else if (!isRangeMode && date) {
          url += `?date=${date}`;
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch traffic data');
        const result = await response.json();
        const filteredData = filterDataByDateRange(result, startDate, endDate, isRangeMode, date);
        setData(filteredData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データの取得中にエラーが発生しました');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date, csvData, isUsingCsv, startDate, endDate, isRangeMode]);

  return { data, loading, error };
};

export const useParkingData = (
  date?: string, 
  csvData?: ParkingData[], 
  isUsingCsv?: boolean,
  startDate?: string,
  endDate?: string,
  isRangeMode?: boolean
) => {
  const [data, setData] = useState<ParkingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isUsingCsv && csvData) {
      setLoading(true);
      const filteredData = filterDataByDateRange(csvData, startDate, endDate, isRangeMode, date);
      setData(filteredData);
      setError(null);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        let url = `${API_BASE_URL}/parking`;
        if (isRangeMode && startDate && endDate) {
          url += `?startDate=${startDate}&endDate=${endDate}`;
        } else if (!isRangeMode && date) {
          url += `?date=${date}`;
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch parking data');
        const result = await response.json();
        const filteredData = filterDataByDateRange(result, startDate, endDate, isRangeMode, date);
        setData(filteredData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データの取得中にエラーが発生しました');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date, csvData, isUsingCsv, startDate, endDate, isRangeMode]);

  return { data, loading, error };
};