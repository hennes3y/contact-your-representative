import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());  // Enable CORS for all origins

// Route to handle message generation
app.post('/generate-message', async (req, res) => {
    console.log('Request Body:', req.body); // Log the incoming request body

    const { prompt } = req.body;

    if (!prompt) {
        console.error('No prompt found in request body');
        return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('Received Prompt:', prompt); // Log the received prompt

    try {
        // Hugging Face API call with your access token and chosen model
        const response = await fetch('https://api-inference.huggingface.co/models/openai-community/gpt2', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer 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`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inputs: prompt })
        });

        const data = await response.json();
        console.log('Response from Hugging Face:', data); // Log the response from Hugging Face

        if (data.error) {
            console.error('Error from Hugging Face:', data.error); // Log the error if there is one
            return res.status(500).json({ error: data.error });
        }

        // Handle different response formats
        let generatedMessage = "Unable to generate a message.";
        if (data.generated_text) {
            generatedMessage = data.generated_text;
        } else if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
            generatedMessage = data[0].generated_text;
        } else {
            console.error('Unexpected response format from Hugging Face:', data); // Log unexpected format
        }

        res.json({ message: generatedMessage });
    } catch (error) {
        console.error('Error during message generation:', error);
        res.status(500).json({ error: 'Failed to generate message' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
