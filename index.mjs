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
    const prompt = `Compose a formal, concise, and persuasive letter addressed to a government official at the ${level} level regarding ${topic}. This letter is written on behalf of ${name}, a concerned constituent who cares deeply about this issue. The letter should include:
- A brief introduction of ${name}.
- A brief explanation of the problem related to ${topic}.
- A respectful but urgent call-to-action, asking the official to support efforts related to ${topic}.
Keep the tone formal, respectful, and focused. Avoid extraneous details or unrelated commentary. The final letter should be clear, direct, and no longer than 250 words.`;

    console.log('Constructed prompt:', prompt);
    try {
        const response = await fetch('https://api-inference.huggingface.co/models/EleutherAI/gpt-neo-125M', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer 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`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inputs: prompt, parameters: { temperature: 0.65, max_new_tokens: 200 } })
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
