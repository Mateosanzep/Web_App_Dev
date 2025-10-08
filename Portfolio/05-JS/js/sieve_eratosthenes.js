/*
    Sieve of Eratosthenes - The sieve of Eratosthenes is one of the most efficient ways
    to find all of the smaller primes (below 10 million or so).
*/

// TODO: Adjust this script so it can work with the sieve.html file.

var sieve = function (n) {
  "use strict";

  var array = [],
    primes = [],
    i,
    j;
  if (n === "" || isNaN(n) || n < 2) {
    document.getElementById("primes").innerText = "Please enter a valid number greater than 1";
    return;
  }
  for (i = 0; i <= n; i++) {
    array.push(true);
  }
  array[0] = false;
  array[1] = false;
  for (i = 2; i <= Math.sqrt(n)+ 1; i++){
    if (array[i]===true){
      for(j=i*i; j<=n; j+=i){
        array[j]=false;
      }
    }
  }
  for(i=0; i<array.length; i++){
    if(array[i]===true){
      primes.push(i);
    }
  }
  document.getElementById("primes").innerText = primes.join(" - ");

  // TODO: Implement the sieve of eratosthenes algorithm to find all the prime numbers under the given number.

  return primes;
}