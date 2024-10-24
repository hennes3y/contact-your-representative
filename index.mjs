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
    const { name, topic, level } = req.body;

    try {
        // Construct the prompt
        const prompt = `Write a letter to a government official at the ${level} level. The topic of advocacy is ${topic}. This letter is on behalf of ${name}, who is a constituent and deeply cares about this issue. The letter should be persuasive, respectful, and highlight the urgency of the issue.`;

        console.log('Generated Prompt:', prompt); // Log the generated prompt

        // Hugging Face API call with your access token and chosen model
        const response = await fetch('https://api-inference.huggingface.co/models/meta-llama/Llama-3.1-8B-Instruct', {
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

        const generatedMessage = data.generated_text || "Unable to generate a message.";
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
