/*
    Prime Factorization - Have the user enter a number and find
    all Prime Factors (if there are any) and display them.
*/
var getPrimeFactors = function (n) {
  "use strict";
  n = document.getElementById("num").value;
  // Input validation
  if (n === "" || isNaN(n) || n < 2) {
    document.getElementById("pf").innerText = "Please enter a valid number greater than 1";
    return;
  }
  function isPrime(n) {
    var i;

    for (i = 2; i <= Math.sqrt(n); i++) {
      if (n % i === 0) {
        return false;
      }
    }
    return true;
  }

  var i,
    sequence = [];

  if (isPrime(n)) {
    document.getElementById("pf").innerText = n + " is a prime number";
  }
  else {
    while (n % 2 === 0) {
      sequence.push(2);
      n = n / 2;
    }
    for (i = 3; i <= n; i += 2){
      while (n % i === 0) {
        sequence.push(i);
        n = n / i;
      }
    }
  }

  //TODO: Check which numbers are factors of n and also check if
  // that number also happens to be a prime
  document.getElementById("pf").innerText = "Prime factors: " + sequence.join(" - ")
  return sequence;
};