const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取所有充电站
router.get('/', async (req, res) => {
  try {
    // 尝试从数据库获取数据
    const result = await db.query('SELECT * FROM charging_stations ORDER BY id');
    
    if (result.rows && result.rows.length > 0) {
      // 如果有数据则返回
      console.log('从数据库获取到充电站数量:', result.rows.length);
      res.json(result.rows);
    } else {
      // 如果没有数据，返回提示信息
      console.log('数据库中没有充电站数据');
      res.json([]);
    }
  } catch (error) {
    console.error('获取充电站数据失败:', error);
    res.status(500).json({ error: '获取充电站数据失败', message: error.message });
  }
});

// 根据ID获取充电站
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // 从数据库中查询
    const result = await db.query('SELECT * FROM charging_stations WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '充电站不存在' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('获取充电站详情失败:', error);
    res.status(500).json({ error: '获取充电站详情失败', message: error.message });
  }
});

// 创建新充电站
router.post('/', async (req, res) => {
  try {
    const { name, latitude, longitude, type, address, phone } = req.body;
    
    const result = await db.query(
      'INSERT INTO charging_stations (name, latitude, longitude, type, address, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, latitude, longitude, type, address, phone]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('创建充电站失败:', error);
    res.status(500).json({ error: '创建充电站失败', message: error.message });
  }
});

// 更新充电站
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, latitude, longitude, type, address, phone } = req.body;
    
    const result = await db.query(
      'UPDATE charging_stations SET name = $1, latitude = $2, longitude = $3, type = $4, address = $5, phone = $6 WHERE id = $7 RETURNING *',
      [name, latitude, longitude, type, address, phone, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '充电站不存在' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('更新充电站失败:', error);
    res.status(500).json({ error: '更新充电站失败', message: error.message });
  }
});

// 删除充电站
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`尝试删除ID为 ${id} 的充电站`);
    
    // 查询要删除的充电站是否存在
    const checkResult = await db.query('SELECT * FROM charging_stations WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      console.log(`ID为 ${id} 的充电站不存在`);
      return res.status(404).json({ error: '充电站不存在' });
    }
    
    // 执行删除操作
    const result = await db.query('DELETE FROM charging_stations WHERE id = $1 RETURNING id', [id]);
    
    console.log(`成功删除ID为 ${id} 的充电站`);
    res.json({ message: '充电站删除成功', id });
  } catch (error) {
    console.error('删除充电站失败:', error);
    res.status(500).json({ error: '删除充电站失败', message: error.message });
  }
});

module.exports = router; 