export interface TrafficData {
  timestamp: string;
  vehicle_count: number;
  avg_speed: number;
  vehicle_type: string;
  usage_type: string;
}

export interface ParkingData {
  timestamp: string;
  plate_region: string;
  stay_duration: number;
  entry_count: number;
  exit_count: number;
  occupancy_rate: number;
  usage_type?: string;
}

export interface WeatherData {
  date: string;
  weather: string;
  temperature: number;
  humidity: number;
}