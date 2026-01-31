const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API Key
const API_KEY = 'RADT6bblcmzSG6CvMBtaPoCDtMfs4MP5';

// Route to serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to check plagiarism
app.post('/check-plagiarism', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        // Assuming the API endpoint based on common patterns
        // This might need adjustment based on actual API documentation
        const response = await axios.post('https://api.plagiarismchecker.org/check', {
            text: text,
            api_key: API_KEY
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Process the response
        const result = response.data;

        // Format the response for our frontend
        const formattedResult = {
            plagiarism_percentage: result.plagiarism_percentage || result.percentage,
            sources: result.sources || [],
            details: result.details || 'Plagiarism check completed'
        };

        res.json(formattedResult);

    } catch (error) {
        console.error('Error checking plagiarism:', error);

        // Handle different types of errors
        if (error.response) {
            // API returned an error
            res.status(error.response.status).json({
                error: error.response.data.message || 'API error'
            });
        } else if (error.request) {
            // Network error
            res.status(500).json({
                error: 'Network error - unable to reach plagiarism checker service'
            });
        } else {
            // Other error
            res.status(500).json({
                error: 'Internal server error'
            });
        }
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});