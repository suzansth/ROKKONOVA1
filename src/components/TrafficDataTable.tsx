<ResponsiveContainer width="100%" height="100%">
  <LineChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis 
      dataKey="time" 
      tick={{ fontSize: 12 }}
      angle={-45}
      textAnchor="end"
      height={60}
    />
    <YAxis 
      yAxisId="left" 
      tick={{ fontSize: 12 }}
      label={{ value: '通過台数', angle: -90, position: 'insideLeft' }}
    />
    <YAxis 
      yAxisId="right" 
      orientation="right" 
      tick={{ fontSize: 12 }}
      label={{ value: '平均速度 (km/h)', angle: 90, position: 'insideRight' }}
    />
    <Tooltip 
      contentStyle={{ 
        backgroundColor: 'white', 
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}
      formatter={(value, name) => {
        if (name === '平均速度 (km/h)') {
          return [`${value} km/h`, name];
        }
        return [`${value}台`, name];
      }}
    />
    <Legend />

    {/* 通過台数（青） */}
    <Line
      yAxisId="left"
      type="monotone"
      dataKey="count"
      stroke="#3B82F6"
      strokeWidth={3}
      name="通過台数"
      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
      activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
    />

    {/* 平均速度（通常＝緑） */}
    <Line
      yAxisId="right"
      type="monotone"
      dataKey="speed"
      stroke="#10B981"
      strokeWidth={3}
      name="平均速度 (km/h)"
      dot={false}
      isAnimationActive={false}
      connectNulls
      data={timeSeriesData.map(d => (d.speed > 30 ? d : { ...d, speed: null }))}
    />

    {/* 渋滞（赤） */}
    <Line
      yAxisId="right"
      type="monotone"
      dataKey="speed"
      stroke="#EF4444"
      strokeWidth={3}
      name="渋滞 (30km/h以下)"
      dot={false}
      isAnimationActive={false}
      connectNulls
      data={timeSeriesData.map(d => (d.speed <= 30 ? d : { ...d, speed: null }))}
    />
  </LineChart>
</ResponsiveContainer>
