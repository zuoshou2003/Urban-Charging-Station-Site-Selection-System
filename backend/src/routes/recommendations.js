const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all recommendations
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM recommendations ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Get a specific recommendation by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM recommendations WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching recommendation:', error);
    res.status(500).json({ error: 'Failed to fetch recommendation' });
  }
});

// Create a new recommendation
router.post('/', async (req, res) => {
  try {
    const { name, latitude, longitude, score, factors, notes } = req.body;
    
    const result = await db.query(
      'INSERT INTO recommendations (name, latitude, longitude, score, factors, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, latitude, longitude, score, factors, notes]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating recommendation:', error);
    res.status(500).json({ error: 'Failed to create recommendation' });
  }
});

// Update a recommendation
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, latitude, longitude, score, factors, notes } = req.body;
    
    const result = await db.query(
      'UPDATE recommendations SET name = $1, latitude = $2, longitude = $3, score = $4, factors = $5, notes = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
      [name, latitude, longitude, score, factors, notes, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating recommendation:', error);
    res.status(500).json({ error: 'Failed to update recommendation' });
  }
});

// Delete a recommendation
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Attempting to delete recommendation with ID ${id}`);
    
    // Check if recommendation exists
    const checkResult = await db.query('SELECT * FROM recommendations WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      console.log(`Recommendation with ID ${id} not found`);
      return res.status(404).json({ error: 'Recommendation not found' });
    }
    
    // Perform deletion
    await db.query('DELETE FROM recommendations WHERE id = $1', [id]);
    
    console.log(`Successfully deleted recommendation with ID ${id}`);
    res.json({ message: 'Recommendation deleted successfully', id });
  } catch (error) {
    console.error('Error deleting recommendation:', error);
    res.status(500).json({ error: 'Failed to delete recommendation' });
  }
});

module.exports = router; 