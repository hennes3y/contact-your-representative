import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

app.post('/generate-message', async (req, res) => {
    console.log('Updated /generate-message route is running.');
    const { name, topic, level } = req.body;
    const prompt = `Write a letter to a government official at the ${level} level. The topic of advocacy is ${topic}. This letter is on behalf of ${name}, who is a constituent and deeply cares about this issue. The letter should be persuasive, respectful, and highlight the urgency of the issue.`;
    console.log('Constructed prompt:', prompt);
    try {
        const response = await fetch('https://api-inference.huggingface.co/models/openai-community/gpt2', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer YOUR_HUGGINGFACE_TOKEN`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inputs: prompt })
        });
        const data = await response.json();
        console.log('Hugging Face API response:', data);

        // Check if the API returned an error.
        if (data.error) {
            return res.status(500).json({ error: data.error });
        }

        // Extract generated message from response
        let generatedMessage;
        if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
            generatedMessage = data[0].generated_text;
        } else if (data.generated_text) {
            generatedMessage = data.generated_text;
        } else {
            generatedMessage = "Unable to generate a message.";
        }

        res.json({ message: generatedMessage });
    } catch (error) {
        console.error('Error during Hugging Face API call:', error);
        res.status(500).json({ error: 'Failed to generate message' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
