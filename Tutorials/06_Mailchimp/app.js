require('dotenv').config();
const express = require('express');
const https = require('https');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'signup.html'));
});

app.post('/', (req, res) => {
  const { fName, lName, email } = req.body;
  console.log('Received signup:', { fName, lName, email });

  if (!email) {
    return res.sendFile(path.join(__dirname, 'failure.html'));
  }

  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;
  const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;

  if (apiKey && listId && serverPrefix) {
    const data = {
      members: [
        {
          email_address: email,
          status: 'subscribed',
          merge_fields: { FNAME: fName || '', LNAME: lName || '' }
        }
      ]
    };

    const jsonData = JSON.stringify(data);
    const url = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${listId}`;
    const options = { method: 'POST', auth: `anystring:${apiKey}` };

    const request = https.request(url, options, (response) => {
      let body = '';
      console.log('Mailchimp status:', response.statusCode);
      response.on('data', (chunk) => (body += chunk));
      response.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (response.statusCode === 200 && (parsed.error_count === 0 || parsed.total_created > 0)) {
            return res.sendFile(path.join(__dirname, 'success.html'));
          }
          return res.sendFile(path.join(__dirname, 'failure.html'));
        } catch (err) {
          console.error('Failed to parse Mailchimp response', err, body);
          return response.statusCode === 200
            ? res.sendFile(path.join(__dirname, 'success.html'))
            : res.sendFile(path.join(__dirname, 'failure.html'));
        }
      });
    });

    request.on('error', (err) => {
      console.error('Request error:', err);
      res.sendFile(path.join(__dirname, 'failure.html'));
    });

    request.write(jsonData);
    request.end();
  } else {
    console.log('No Mailchimp credentials found — simulating success.');
    return res.sendFile(path.join(__dirname, 'success.html'));
  }
});

app.post('/failure', (req, res) => {
  res.redirect('/');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

