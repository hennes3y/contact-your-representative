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
    const { name, topic, level } = req.body;

    try {
        // Construct the prompt
        const prompt = `Write a letter to a government official at the ${level} level. The topic of advocacy is ${topic}. This letter is on behalf of ${name}, who is a constituent and deeply cares about this issue. The letter should be persuasive, respectful, and highlight the urgency of the issue.`;

        // Log the prompt for debugging
        console.log('Prompt:', prompt);

        // Hugging Face API call
        const response = await fetch('https://api-inference.huggingface.co/models/openai-community/gpt2', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer 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`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inputs: prompt })
        });

        const data = await response.json();

        // Log the entire response from Hugging Face
        console.log('Response from Hugging Face:', data);

        if (data.error) {
            // Log the error received from Hugging Face
            console.error('Error from Hugging Face:', data.error);
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
