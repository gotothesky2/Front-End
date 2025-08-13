const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 4000;

app.use(cors());

app.get('/api/questions', async (req, res) => {
  try {
    const response = await axios.get(
      'http://www.career.go.kr/inspct/openapi/test/questions?apikey=69611c6585da333774ecf91966fc17f0&q=21'
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

app.listen(port, () => {
  console.log(`Proxy server running on http://localhost:${port}`);
});
