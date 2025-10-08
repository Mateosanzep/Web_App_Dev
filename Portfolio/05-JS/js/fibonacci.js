/*
    Fibonacci Sequence - Enter a number and have the program
    generate the Fibonacci sequence to that number or to the Nth number.
*/
// This array will keep memory of the previous fibonacci numbers
var memo = {};
function fibonacci() {
  "use strict";
  var n = document.getElementById("num").value;
  if (n === "" || isNaN(n) || n < 0) {
    document.getElementById("fibonacciLbl").innerText = "Please enter a valid number";
    return;
  }
  else {
    var val = f(n);
    return val;
  }
}

function f(n) {
  var value;
  // Check if the memory array already contains the requested number
  if (memo.hasOwnProperty(n)) {
    value = memo[n];
  // Fibonacci funtion
  } else {
    if (n === 0) {
      value = 0;
    } else if (n === 1) {
      value = 1;
    } else {
      value = f(n - 1) + f(n - 2);
    }
    // Store value in memo
    memo[n] = value;
  }
  document.getElementById("fibonacciLbl").innerText = "Fibonacci value: " + value;
  return value;
}
