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
        const reply = data.queryResult.fulfillmentText || 'I didn’t understand that.';
        res.json({ reply });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});