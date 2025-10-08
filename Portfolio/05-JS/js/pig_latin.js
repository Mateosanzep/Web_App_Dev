/*
Pig Latin
*/

function igpayAtinlay(str) {
  // TODO: Initialize the word array properly
  var returnArray = [],
    wordArray = str.split(" ");
  // TODO: make sure that the output is being properly built to produce the desired result.
  for (var i = 0; i < wordArray.length; i++) {
    var word = wordArray[i];
    var beginning = word.charAt(0);

    if (/[aeiouAEIOU]/.test(beginning)) {
      returnArray.push(word + "way");
      continue;
    }

    for (var j = 1; j < word.length; j++) {
      if (/[aeiouAEIOU]/.test(word.charAt(j))) {
        returnArray.push(word.slice(j) + beginning.toLowerCase() + "ay");
        break;
      } else {
        beginning += word.charAt(j);
      }
    }
  }
  document.getElementById("pigLatLbl").innerText = "Pig Latin translation: " + returnArray.join(" ");
  return returnArray;
}

