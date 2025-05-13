const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取所有停车场
router.get('/', async (req, res) => {
  try {
    // 尝试从数据库获取数据
    const result = await db.query('SELECT * FROM parking_lots ORDER BY id');
    
    if (result.rows && result.rows.length > 0) {
      // 如果有数据则返回
      console.log('从数据库获取到停车场数量:', result.rows.length);
      res.json(result.rows);
    } else {
      // 如果没有数据，返回示例数据
      console.log('数据库中没有停车场数据，返回示例数据');
      const mockData = [
        {
          id: 1,
          name: '示例停车场1',
          latitude: 32.058,
          longitude: 118.796,
          capacity: 100,
          available_spaces: 35,
          address: '南京市玄武区中山路100号',
          phone: '025-12345678'
        },
        {
          id: 2,
          name: '示例停车场2',
          latitude: 32.040,
          longitude: 118.780,
          capacity: 80,
          available_spaces: 20,
          address: '南京市鼓楼区汉中路45号',
          phone: '025-87654321'
        },
        {
          id: 3,
          name: '示例停车场3',
          latitude: 32.070,
          longitude: 118.802,
          capacity: 120,
          available_spaces: 50,
          address: '南京市栖霞区仙林大道163号',
          phone: '025-98765432'
        }
      ];
      res.json(mockData);
    }
  } catch (error) {
    console.error('获取停车场数据失败:', error);
    res.status(500).json({ error: '获取停车场数据失败', message: error.message });
  }
});

// 根据ID获取停车场
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // 从数据库中查询
    const result = await db.query('SELECT * FROM parking_lots WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '停车场不存在' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('获取停车场详情失败:', error);
    res.status(500).json({ error: '获取停车场详情失败', message: error.message });
  }
});

// 创建新停车场
router.post('/', async (req, res) => {
  try {
    const { name, latitude, longitude, capacity, available_spaces, type, address, phone } = req.body;
    
    const result = await db.query(
      'INSERT INTO parking_lots (name, latitude, longitude, capacity, available_spaces, type, address, phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [name, latitude, longitude, capacity, available_spaces, type, address, phone]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('创建停车场失败:', error);
    res.status(500).json({ error: '创建停车场失败', message: error.message });
  }
});

// 更新停车场
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, latitude, longitude, capacity, available_spaces, type, address, phone } = req.body;
    
    const result = await db.query(
      'UPDATE parking_lots SET name = $1, latitude = $2, longitude = $3, capacity = $4, available_spaces = $5, type = $6, address = $7, phone = $8 WHERE id = $9 RETURNING *',
      [name, latitude, longitude, capacity, available_spaces, type, address, phone, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '停车场不存在' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('更新停车场失败:', error);
    res.status(500).json({ error: '更新停车场失败', message: error.message });
  }
});

// 删除停车场
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`尝试删除ID为 ${id} 的停车场`);
    
    // 查询要删除的停车场是否存在
    const checkResult = await db.query('SELECT * FROM parking_lots WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      console.log(`ID为 ${id} 的停车场不存在`);
      return res.status(404).json({ error: '停车场不存在' });
    }
    
    // 执行删除操作
    const result = await db.query('DELETE FROM parking_lots WHERE id = $1 RETURNING id', [id]);
    
    console.log(`成功删除ID为 ${id} 的停车场`);
    res.json({ message: '停车场删除成功', id });
  } catch (error) {
    console.error('删除停车场失败:', error);
    res.status(500).json({ error: '删除停车场失败', message: error.message });
  }
});

module.exports = router; 