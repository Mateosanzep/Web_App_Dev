const sw = require('star-wars-quotes');
const { randomSupervillain } = require('supervillains');
const { randomSuperhero } = require('superheroes');
const fs = require('fs');
const path = require('path');

console.log("Hello world");
console.log(sw());
console.log(randomSuperhero() + " vs " + randomSupervillain());
console.log(fs.readFileSync(path.join(__dirname, '/data/input.txt'), 'utf8'));


