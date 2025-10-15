export interface TrafficData {
  timestamp: string;
  object_id: number;
  class_name: string;
  direction: string;
  speed_kmh: number;
}

export interface ParkingData {
  timestamp: string;
  object_id: number;
  vehicle_type: string;
  direction: string;
  city: string;
  engine_size: number;
  kana: string;
  'four-digit number': string;
}