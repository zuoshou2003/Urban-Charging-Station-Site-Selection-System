require('dotenv').config();
const db = require('./db');
const sitesRoutes = require('./routes/sites');
const recommendationsRoutes = require('./routes/recommendations');
const chargingStationsRoutes = require('./routes/charging-stations');
const parkingLotsRoutes = require('./routes/parking-lots');
const app = require('./app');

const PORT = process.env.PORT || 3000;

// Additional routes (should ideally be moved to routes/index.js)
app.use('/api/sites', sitesRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/charging-stations', chargingStationsRoutes);
app.use('/api/parking-lots', parkingLotsRoutes);

// 测试路由
app.get('/', (req, res) => {
  res.send('充电站智能选址系统API运行中');
});

// 数据库连接测试
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ success: true, timestamp: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 