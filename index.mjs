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
    console.log('Updated /generate-message route is running.');
    const { name, topic, level } = req.body;
    const prompt = `Write a letter to a government official at the ${level} level. The topic of advocacy is ${topic}. This letter is on behalf of ${name}, who is a constituent and deeply cares about this issue. The letter should be persuasive, respectful, and highlight the urgency of the issue.`;
    console.log('Constructed prompt:', prompt);
    try {
        const response = await fetch('https://api-inference.huggingface.co/models/EleutherAI/gpt-neo-125M', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer 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`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inputs: prompt, parameters: { temperature: 0.7, max_new_tokens: 150 } })
        });        
                
        // Check if response is OK before parsing JSON
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response from Hugging Face:', errorText);
            throw new Error(`Hugging Face API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Hugging Face API response:', data);

        // Extract generated message
        let generatedMessage = "";
        if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
            generatedMessage = data[0].generated_text;
        } else if (data.generated_text) {
            generatedMessage = data.generated_text;
        }

        // Log the extracted message
        console.log("Extracted generated message:", generatedMessage);

        // Optionally, remove the prompt text if it is repeated at the beginning
        if (generatedMessage.startsWith(prompt)) {
            generatedMessage = generatedMessage.slice(prompt.length).trim();
        }

        // Fallback if nothing useful was generated
        if (!generatedMessage || generatedMessage.trim() === "") {
            generatedMessage = "Unable to generate a message.";
        }

        res.json({ message: generatedMessage });
    } catch (error) {
        console.error('Error during Hugging Face API call:', error);
        res.status(500).json({ error: 'Failed to generate message' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
