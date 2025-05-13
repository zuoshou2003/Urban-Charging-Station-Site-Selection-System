require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// 创建数据库连接池
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function initDb() {
  try {
    console.log('正在初始化数据库...');
    
    // 读取SQL脚本
    const sqlPath = path.join(__dirname, 'init-db.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // 执行SQL脚本
    await pool.query(sql);
    
    console.log('数据库初始化完成！');
    
    // 验证数据
    const chargingStationsResult = await pool.query('SELECT COUNT(*) FROM charging_stations');
    console.log(`充电站表有 ${chargingStationsResult.rows[0].count} 条记录`);
    
    const recommendationsResult = await pool.query('SELECT COUNT(*) FROM recommendations');
    console.log(`推荐表有 ${recommendationsResult.rows[0].count} 条记录`);
    
  } catch (error) {
    console.error('数据库初始化失败:', error);
  } finally {
    // 关闭连接池
    await pool.end();
  }
}

// 运行初始化
initDb(); 