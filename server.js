const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.ANTHROPIC_API_KEY;

app.post('/generate', async (req, res) => {
  const { company, industry, pain, offer, sender, tone } = req.body;

  if (!company || !offer) {
    return res.status(400).json({ error: 'Company name and offer are required.' });
  }

  const prompt = `Expert cold email copywriter. Write a personalized cold email.
Prospect: ${company} | Industry: ${industry || 'not specified'} | Pain: ${pain || 'improving efficiency'}
Sender: ${sender || 'the sender'} | Offer: ${offer} | Tone: ${tone || 'professional and direct'}
Output format — first line: "SUBJECT: [subject]", then "---", then email body (max 120 words, no fluff, 1 CTA asking for 15-min call, sign off with sender name). Output ONLY this, nothing else.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'API error');
    res.json({ text: data.content?.[0]?.text || '' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Something went wrong.' });
  }
});

app.get('/', (req, res) => res.send('ColdCraft API is running.'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
