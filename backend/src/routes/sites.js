const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all sites
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM sites ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sites:', error);
    res.status(500).json({ error: 'Failed to fetch sites' });
  }
});

// Get a specific site by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM sites WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Site not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching site:', error);
    res.status(500).json({ error: 'Failed to fetch site' });
  }
});

// Create a new site
router.post('/', async (req, res) => {
  try {
    const { name, latitude, longitude, type, description, image_url } = req.body;
    
    const result = await db.query(
      'INSERT INTO sites (name, latitude, longitude, type, description, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, latitude, longitude, type, description, image_url]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating site:', error);
    res.status(500).json({ error: 'Failed to create site' });
  }
});

// Update a site
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, latitude, longitude, type, description, image_url } = req.body;
    
    const result = await db.query(
      'UPDATE sites SET name = $1, latitude = $2, longitude = $3, type = $4, description = $5, image_url = $6 WHERE id = $7 RETURNING *',
      [name, latitude, longitude, type, description, image_url, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Site not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating site:', error);
    res.status(500).json({ error: 'Failed to update site' });
  }
});

// Delete a site
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM sites WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Site not found' });
    }
    
    res.json({ message: 'Site deleted successfully' });
  } catch (error) {
    console.error('Error deleting site:', error);
    res.status(500).json({ error: 'Failed to delete site' });
  }
});

module.exports = router; 