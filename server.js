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

-app.get('/api/weather', (req, res) => {
-  const { date, startDate, endDate } = req.query;
-  let filteredData = mockWeatherData;
-  
-  if (startDate && endDate) {
-    filteredData = mockWeatherData.filter(item => 
-      item.date >= startDate && item.date <= endDate
-    );
-  } else if (date) {
-    filteredData = mockWeatherData.filter(item => 
-      item.date === date
-    );
-  }
-  
-  res.json(filteredData);
-});
-
 app.listen(PORT, () => {