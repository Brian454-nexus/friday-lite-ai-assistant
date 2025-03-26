const express = require('express');
const { GoogleAuth } = require('google-auth-library');
const fetch = require('node-fetch'); // Install with `npm install node-fetch@2` for Node < 18
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors()); // Allow frontend requests
app.use(express.json()); // Parse JSON bodies

// Path to your downloaded service account key
const auth = new GoogleAuth({
    keyFile: 'friday-lite-6205c6e4ca4a.json', // Replace with your JSON file path
    scopes: ['https://www.googleapis.com/auth/dialogflow']
});

// Endpoint to handle messages
app.post('/send-message', async (req, res) => {
    try {
        const message = req.body.message;
        const client = await auth.getClient();
        const token = await client.getAccessToken();

        const response = await fetch(
            `https://dialogflow.googleapis.com/v2/projects/<project-id>/agent/sessions/12345:detectIntent`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    queryInput: {
                        text: {
                            text: message,
                            languageCode: 'en'
                        }
                    }
                })
            }
        );

        const data = await response.json();
        const reply = data.queryResult.fulfillmentText;
        res.json({ reply });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});