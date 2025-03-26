const express = require('express');
const { GoogleAuth } = require('google-auth-library');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const auth = new GoogleAuth({
    keyFile: './friday-lite-6205c6e4ca4a.json',
    scopes: ['https://www.googleapis.com/auth/dialogflow']
});

app.post('/send-message', async (req, res) => {
    try {
        const message = req.body.message;
        const client = await auth.getClient();
        const token = await client.getAccessToken();
        console.log('Token:', token.token); // Debug token

        const response = await fetch(
            `https://dialogflow.googleapis.com/v2/projects/friday-lite/agent/sessions/12345:detectIntent`,
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
        console.log('Dialogflow Response:', JSON.stringify(data, null, 2)); // Debug full response
        const reply = data.queryResult.fulfillmentText || 'Sorry, I didn’t get that. Try again!';
        res.json({ reply });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Oops, something went wrong!' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});