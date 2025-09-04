const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Airtable configuration from environment variables
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;

if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME) {
    console.error('Missing required environment variables!');
    console.error('Required: AIRTABLE_TOKEN, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME');
    process.exit(1);
}

const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

// Headers for Airtable requests
const getAirtableHeaders = () => ({
    'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
    'Content-Type': 'application/json'
});

// API Routes

// GET - Fetch all records
app.get('/api/airtable/records', async (req, res) => {
    try {
        const response = await fetch(AIRTABLE_API_URL, {
            method: 'GET',
            headers: getAirtableHeaders()
        });

        if (!response.ok) {
            throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching records:', error);
        res.status(500).json({ 
            error: 'Failed to fetch records',
            details: error.message 
        });
    }
});

// POST - Create new record
app.post('/api/airtable/records', async (req, res) => {
    try {
        const { fields } = req.body;
        
        if (!fields) {
            return res.status(400).json({ error: 'Fields are required' });
        }

        const response = await fetch(AIRTABLE_API_URL, {
            method: 'POST',
            headers: getAirtableHeaders(),
            body: JSON.stringify({ fields })
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Airtable API error: ${response.status} ${response.statusText} - ${errorData}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error creating record:', error);
        res.status(500).json({ 
            error: 'Failed to create record',
            details: error.message 
        });
    }
});

// DELETE - Delete record
app.delete('/api/airtable/records/:id', async (req, res) => {
    try {
        const recordId = req.params.id;
        
        if (!recordId) {
            return res.status(400).json({ error: 'Record ID is required' });
        }

        const response = await fetch(`${AIRTABLE_API_URL}/${recordId}`, {
            method: 'DELETE',
            headers: getAirtableHeaders()
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Airtable API error: ${response.status} ${response.statusText} - ${errorData}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error deleting record:', error);
        res.status(500).json({ 
            error: 'Failed to delete record',
            details: error.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        environment: {
            hasToken: !!AIRTABLE_TOKEN,
            hasBaseId: !!AIRTABLE_BASE_ID,
            hasTableName: !!AIRTABLE_TABLE_NAME
        }
    });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`CloudConnect server running on port ${PORT}`);
    console.log(`Environment configured for Airtable integration`);
    console.log(`Base ID: ${AIRTABLE_BASE_ID}`);
    console.log(`Table: ${AIRTABLE_TABLE_NAME}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});