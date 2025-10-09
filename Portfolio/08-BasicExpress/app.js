const express = require('express');
const app = express();
const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/BMI', (req, resp) => {
    const weight = req.body.weight;
    const height = req.body.height;
    resp.send(`<h1>Your BMI is ${(weight / (height * height))*10_000}</h1>`);
})