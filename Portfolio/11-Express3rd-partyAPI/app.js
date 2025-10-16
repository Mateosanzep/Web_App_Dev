const express = require('express');
const https = require('https');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('static'));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));

app.post('/city', (req, res) => {
  const city = (req.body.city || '').toString().trim();
  if (!city) return res.status(400).send('City is required');

  const apiKey = '4a4beb30a9a14941292b0d4ce3a64f59';
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
  https.get(url, (answ) => {
    let body = '';
    answ.on('data', (chunk) => (body += chunk));

    answ.on('end', () => {
      if (answ.statusCode !== 200) {
        const errInfo = safeParse(body);
        const msg = errInfo && errInfo.message ? errInfo.message : `status ${answ.statusCode}`;
        return sendErrorPage(res, 502, `API error: ${msg}`);
      }

      const data = safeParse(body);
      if (!data) return sendErrorPage(res, 500, 'Invalid JSON from weather API');

      const temp = data.main && data.main.temp;
      const weather = Array.isArray(data.weather) && data.weather[0];
      const description = weather && weather.description;
      const icon = weather && weather.icon;
      const iconUrl = icon ? `http://openweathermap.org/img/wn/${icon}@2x.png` : '';

      return res.type('html').send(renderWeatherHtml(city, temp, description, iconUrl));
    });

    answ.on('error', (err) => {
      console.error('API response error', err);
      sendErrorPage(res, 502, 'Error receiving data from weather API');
    });
  }).on('error', (err) => {
    console.error('Error calling OpenWeatherMap:', err);
    sendErrorPage(res, 502, 'Failed to call weather service');
  });
});

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

function sendErrorPage(res, status, message) {
  res.status(status).type('html').send(`<!doctype html><html><body><p>${escapeHtml(message)}</p><p><a href="/">Back</a></p></body></html>`);
}

function renderWeatherHtml(city, temp, description, iconUrl) {
  return `<!doctype html><html><head><meta charset="utf-8"/><title>Weather for ${escapeHtml(city)}</title><style>body{font-family:Arial,Helvetica,sans-serif;padding:20px}</style></head><body><h1>Weather for ${escapeHtml(city)}</h1><p><strong>Temperature:</strong> ${temp !== undefined ? escapeHtml(String(temp)) + ' °C' : 'N/A'}</p><p><strong>Description:</strong> ${description ? escapeHtml(description) : 'N/A'}</p>${iconUrl ? `<p><img src="${iconUrl}" alt="${escapeHtml(description || '')}"></p>` : ''}<p><a href="/">Back</a></p></body></html>`;
}