import express from 'express';
import cors from 'cors';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Mock CSV data for demonstration
const mockTrafficData = [
  { timestamp: '2024-01-15 09:00', vehicle_count: 45, avg_speed: 35.2, vehicle_type: 'car', usage_type: 'private' },
  { timestamp: '2024-01-15 09:10', vehicle_count: 52, avg_speed: 32.8, vehicle_type: 'truck', usage_type: 'commercial' },
  { timestamp: '2024-01-15 09:20', vehicle_count: 38, avg_speed: 37.5, vehicle_type: 'car', usage_type: 'rental' },
  { timestamp: '2024-01-15 09:30', vehicle_count: 61, avg_speed: 29.3, vehicle_type: 'motorcycle', usage_type: 'private' },
  { timestamp: '2024-01-15 09:40', vehicle_count: 44, avg_speed: 34.7, vehicle_type: 'car', usage_type: 'private' },
  { timestamp: '2024-01-15 09:50', vehicle_count: 49, avg_speed: 33.1, vehicle_type: 'truck', usage_type: 'commercial' },
  { timestamp: '2024-01-15 10:00', vehicle_count: 56, avg_speed: 31.8, vehicle_type: 'car', usage_type: 'rental' },
  { timestamp: '2024-01-15 10:10', vehicle_count: 42, avg_speed: 36.4, vehicle_type: 'motorcycle', usage_type: 'private' },
  { timestamp: '2024-01-15 10:20', vehicle_count: 48, avg_speed: 34.2, vehicle_type: 'car', usage_type: 'private' },
  { timestamp: '2024-01-15 10:30', vehicle_count: 53, avg_speed: 32.5, vehicle_type: 'truck', usage_type: 'commercial' }
];

const mockParkingData = [
  { timestamp: '2024-01-15 09:00', plate_region: 'Osaka', stay_duration: 120, entry_count: 8, exit_count: 5, occupancy_rate: 0.65 },
  { timestamp: '2024-01-15 09:10', plate_region: 'Kobe', stay_duration: 95, entry_count: 12, exit_count: 7, occupancy_rate: 0.70 },
  { timestamp: '2024-01-15 09:20', plate_region: 'Kyoto', stay_duration: 150, entry_count: 6, exit_count: 9, occupancy_rate: 0.67 },
  { timestamp: '2024-01-15 09:30', plate_region: 'Nara', stay_duration: 180, entry_count: 10, exit_count: 8, occupancy_rate: 0.69 },
  { timestamp: '2024-01-15 09:40', plate_region: 'Osaka', stay_duration: 110, entry_count: 9, exit_count: 11, occupancy_rate: 0.67 },
  { timestamp: '2024-01-15 09:50', plate_region: 'Kobe', stay_duration: 135, entry_count: 7, exit_count: 6, occupancy_rate: 0.68 },
  { timestamp: '2024-01-15 10:00', plate_region: 'Kyoto', stay_duration: 165, entry_count: 11, exit_count: 8, occupancy_rate: 0.71 },
  { timestamp: '2024-01-15 10:10', plate_region: 'Wakayama', stay_duration: 90, entry_count: 5, exit_count: 7, occupancy_rate: 0.69 },
  { timestamp: '2024-01-15 10:20', plate_region: 'Osaka', stay_duration: 125, entry_count: 8, exit_count: 10, occupancy_rate: 0.67 },
  { timestamp: '2024-01-15 10:30', plate_region: 'Kobe', stay_duration: 140, entry_count: 9, exit_count: 6, occupancy_rate: 0.70 }
];

const mockWeatherData = [
  { date: '2024-01-15', weather: 'sunny', temperature: 12, humidity: 45 },
  { date: '2024-01-16', weather: 'cloudy', temperature: 8, humidity: 62 },
  { date: '2024-01-17', weather: 'rainy', temperature: 6, humidity: 78 },
  { date: '2024-01-18', weather: 'sunny', temperature: 14, humidity: 38 },
  { date: '2024-01-19', weather: 'cloudy', temperature: 10, humidity: 55 }
];

// API Routes
app.get('/api/traffic', (req, res) => {
  const { date, startDate, endDate } = req.query;
  let filteredData = mockTrafficData;
  
  if (startDate && endDate) {
    filteredData = mockTrafficData.filter(item => {
      const itemDate = item.timestamp.split(' ')[0];
      return itemDate >= startDate && itemDate <= endDate;
    });
  } else if (date) {
    filteredData = mockTrafficData.filter(item => 
      item.timestamp.startsWith(date)
    );
  }
  
  res.json(filteredData);
});

app.get('/api/parking', (req, res) => {
  const { date, startDate, endDate } = req.query;
  let filteredData = mockParkingData;
  
  if (startDate && endDate) {
    filteredData = mockParkingData.filter(item => {
      const itemDate = item.timestamp.split(' ')[0];
      return itemDate >= startDate && itemDate <= endDate;
    });
  } else if (date) {
    filteredData = mockParkingData.filter(item => 
      item.timestamp.startsWith(date)
    );
  }
  
  res.json(filteredData);
});

app.get('/api/weather', (req, res) => {
  const { date, startDate, endDate } = req.query;
  let filteredData = mockWeatherData;
  
  if (startDate && endDate) {
    filteredData = mockWeatherData.filter(item => 
      item.date >= startDate && item.date <= endDate
    );
  } else if (date) {
    filteredData = mockWeatherData.filter(item => 
      item.date === date
    );
  }
  
  res.json(filteredData);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});