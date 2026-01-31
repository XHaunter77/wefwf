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

        // Try different possible API endpoints and formats
        const endpoints = [
            'https://api.plagiarismchecker.org/check',
            'https://www.plagiarismchecker.org/api/check',
            'https://plagiarismchecker.org/api/v1/check'
        ];

        let result = null;
        let lastError = null;

        for (const endpoint of endpoints) {
            try {
                console.log(`Trying endpoint: ${endpoint}`);

                // Try different request formats
                const requestFormats = [
                    { text: text, api_key: API_KEY },
                    { text: text, key: API_KEY },
                    { content: text, api_key: API_KEY },
                    { content: text, key: API_KEY }
                ];

                for (const format of requestFormats) {
                    try {
                        const response = await axios.post(endpoint, format, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${API_KEY}`,
                                'X-API-Key': API_KEY
                            },
                            timeout: 10000
                        });

                        result = response.data;
                        console.log('Success with format:', format);
                        break;
                    } catch (formatError) {
                        console.log(`Format failed:`, formatError.message);
                        lastError = formatError;
                    }
                }

                if (result) break;

            } catch (endpointError) {
                console.log(`Endpoint ${endpoint} failed:`, endpointError.message);
                lastError = endpointError;
            }
        }

        if (!result) {
            throw lastError || new Error('All API endpoints failed');
        }

        // Format the response for our frontend
        const formattedResult = {
            plagiarism_percentage: result.plagiarism_percentage || result.percentage || result.score || 0,
            sources: result.sources || result.matches || [],
            details: result.details || result.message || 'Plagiarism check completed'
        };

        res.json(formattedResult);

    } catch (error) {
        console.error('Error checking plagiarism:', error);

        // Handle different types of errors
        if (error.response) {
            // API returned an error
            res.status(error.response.status).json({
                error: error.response.data.message || error.response.data.error || 'API error'
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