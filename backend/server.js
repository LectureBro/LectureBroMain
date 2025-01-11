const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5001;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/transcription/start', (req, res) => {
  res.json({ message: 'Transcription started', sessionId: '12345' });
});

app.post('/api/transcription/process', (req, res) => {
  const text = 'This is a sample transcribed text.';
  res.json({ message: 'Audio processed', text });
});

app.post('/api/transcription/end', (req, res) => {
  res.json({ message: 'Transcription ended', transcriptId: '67890' });
});


// Start serwera
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
