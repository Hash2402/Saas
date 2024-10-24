const express = require('express');
const multer = require('multer');
const vision = require('@google-cloud/vision');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

// Create a client for Google Cloud Vision
const client = new vision.ImageAnnotatorClient();

// Set up multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Serve static files from the "css" directory
app.use('/css', express.static(path.join(__dirname, 'css')));

// Serve the HTML form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle image upload and send it to Google Cloud Vision
app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        const [result] = await client.labelDetection({ image: { content: req.file.buffer } });
        const labels = result.labelAnnotations.map(label => label.description);

        // Send back the labels and image URL (for frontend use)
        res.json({ labels, imageUrl: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` });
    } catch (error) {
        console.error('Error detecting labels:', error);
        res.status(500).json({ error: 'Failed to detect labels' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('Server is healthy!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
