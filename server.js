  { timestamp: '2024-01-15 15:15:27', object_id: 7, vehicle_type: 'car', direction: 'in', city: '世田谷', engine_size: 340, kana: 'な', 'four-digit number': '78-90' },
  { timestamp: '2024-01-15 15:22:41', object_id: 8, vehicle_type: 'car', direction: 'out', city: '品川', engine_size: 300, kana: 'は', 'four-digit number': '23-45' },
  { timestamp: '2024-01-15 15:29:15', object_id: 9, vehicle_type: 'car', direction: 'in', city: '横浜', engine_size: 360, kana: 'ま', 'four-digit number': '67-89' },
  { timestamp: '2024-01-15 15:35:52', object_id: 10, vehicle_type: 'car', direction: 'out', city: '川崎', engine_size: 275, kana: 'ら', 'four-digit number': '01-23' }
  { timestamp: '2024-01-15 07:59:23', object_id: 9, class_name: 'bus', direction: 'L', speed_kmh: 18.5 },
  { timestamp: '2024-01-15 08:14:07', object_id: 10, class_name: 'car', direction: 'L', speed_kmh: 32.9 }
@@ .. @@
   { timestamp: '2025-10-10 15:35:52', object_id: 10, vehicle_type: 'car', direction: 'out', city: '川崎', engine_size: 275, kana: 'ら', 'four-digit number': '01-23' }
 ];

-const mockWeatherData = [
-  { date: '2024-01-15', weather: 'sunny', temperature: 12, humidity: 45 },
-  { date: '2024-01-16', weather: 'cloudy', temperature: 8, humidity: 62 },
-  { date: '2024-01-17', weather: 'rainy', temperature: 6, humidity: 78 },
-  { date: '2024-01-18', weather: 'sunny', temperature: 14, humidity: 38 },
-  { date: '2024-01-19', weather: 'cloudy', temperature: 10, humidity: 55 }
-];
-
 // API Routes
 app.get('/api/traffic', (req, res) => {
@@ .. @@
   res.json(filteredData);
 });

  { timestamp: '2024-01-15 14:34:24', object_id: 1, vehicle_type: 'car', direction: 'in', city: '世田谷', engine_size: 310, kana: 'ふ', 'four-digit number': '70-50' },
  { timestamp: '2024-01-15 06:02:15', object_id: 1, class_name: 'car', direction: 'R', speed_kmh: 27.3 },
  { timestamp: '2024-01-15 14:40:34', object_id: 2, vehicle_type: 'car', direction: 'in', city: '横浜', engine_size: 331, kana: 'や', 'four-digit number': '28-50' },
-});
  { timestamp: '2024-01-15 14:45:12', object_id: 3, vehicle_type: 'car', direction: 'out', city: '世田谷', engine_size: 280, kana: 'あ', 'four-digit number': '12-34' },
  { timestamp: '2024-01-15 07:29:55', object_id: 7, class_name: 'car', direction: 'R', speed_kmh: 36.4 },
  { timestamp: '2024-01-15 14:52:18', object_id: 4, vehicle_type: 'car', direction: 'in', city: '品川', engine_size: 350, kana: 'か', 'four-digit number': '56-78' },
-
  { timestamp: '2024-01-15 15:01:45', object_id: 5, vehicle_type: 'car', direction: 'out', city: '横浜', engine_size: 290, kana: 'さ', 'four-digit number': '90-12' },
  { timestamp: '2024-01-15 07:44:38', object_id: 8, class_name: 'truck', direction: 'R', speed_kmh: 41.2 },
  { timestamp: '2024-01-15 15:08:33', object_id: 6, vehicle_type: 'car', direction: 'in', city: '川崎', engine_size: 320, kana: 'た', 'four-digit number': '34-56' },
 app.listen(PORT, () => {