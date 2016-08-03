var NICKNAME_DICTIONARY = require('./lib/nicknames');
var MAX_DIFFERING_CHARACTERS_IN_TYPO = 1;

var _ = require('lodash');

module.exports = function countUniqueNames(billFirstName, billLastName, shipFirstName, shipLastName, billNameOnCard){

  var names = [ // Parse each name group independently
    parseName(billFirstName + ' ' + billLastName), 
    parseName(shipFirstName + ' ' + shipLastName),
    parseName(billNameOnCard)
  ];
  
  applyMiddleNames(names); // Apply matching middle names, if any such one exists.

  var uniqueCount = uniqueNames(names).length;

  if(uniqueCount === 1) // If there is only one unique name, we are certainly done
    return 1;

  // If not, there is a possibility that billNameOrCard was given as `lastName firstName` as it is the only parameter
  // not explicitly split by first and last name.
  // We'll flip the billNameOnCard group, and count the unique names again,
    
  names[2] = flipFirstAndLastNames(billNameOnCard) // names[2] is the billNameOnCard group
  return Math.min(uniqueCount, uniqueNames(names).length) // Return the lesser of the original count and this count

}

// Break up a string into a map of first name, middle names, and last name
// Additionally, consolidates the first name using a nickname dictionary (no such thing as nicknames for last names)
function parseName(name, dontParseNickname){
  name = name.toLowerCase().trim().split(' '); 

  var firstName = name.shift(); // We'll define the first name as the character sequence until the first space

  if(!dontParseNickname)
    firstName = replaceNickname(firstName);

  return {
    firstName: firstName, 
    lastName: name.pop(), // The last name is the last sequence
    middleName: name.join(' ') // ...and the middle name(s) is everything else
  } 
  // A bit more elegant than a regex, I'd say.
}

// Looks up a potential nickname and replace it with the non-diminutive version, if it exists.
// Otherwise, returns the original name
function replaceNickname(name){
  return NICKNAME_DICTIONARY[name] || name;
}


// Given a list of names, attempts to match the middle names contained in them
function applyMiddleNames(names){
  
  // Michele and Michele F. are likely the same person, however Michele F. and Michele G. are not
  // If we have *one and only* unique non-empty middle name, we'll give it to all the other names as well
  var middleNames = new Set();

  names.forEach(function(name){ // Add every middle name to the set
    middleNames.add(name.middleName); 
  });
  
  middleNames.delete(''); // We aren't interested in a blank middle name
  
  if(middleNames.size === 1){ // If there is one non-blank middle name
    var middleName = middleNames.values().next().value;
    names.forEach(function(name){ // Give it to everyone
      name.middleName = middleName;
    })
  }

  // Otherwise, keep the names as is
}

// Return a list of unique names in a list of name groups [{firstName, lastName, middleNames}]
function uniqueNames(names){
  return _.uniqWith(names, function(name1, name2){
    return _.every(name1, function(value, key){ // For every attribute in the first name
      return equalOrHasAcceptableTypo(value, name2[key]) // Test against the same attribute in the second name
    })
  });
}

// Counts the number of differing characters between 2 strings, *up to the difference limit*
function equalOrHasAcceptableTypo(str1, str2){
  var difference = 0;
  var length = Math.max(str1.length, str2.length);

  // We can only accept "typos" if one ore more of the strings is at least one character longer than the base maximum difference.
  // Otherwise, for a base max difference of 1, the strings "A" and "B" would match, which is ambiguous and cannot reasonably be declared a typo.
  var maxDifference = Math.min(MAX_DIFFERING_CHARACTERS_IN_TYPO, length - 1) 

  // Technically, we can exit early here if(str1 === str2), but there's little reason to believe it's a significant optimization 

  for(var i = 0; i < length; i++){ 
    if(str1.charAt(i) !== str2.charAt(i))
      difference++;

    if(difference > maxDifference)
      return false;
  }
  return true;
}

// Get a new name group with the first and last names flipped
function flipFirstAndLastNames(originalName){
  var name = parseName(originalName, true); // Get a new name group, without replacing the first name with a nickname
  var firstName = name.firstName;
  name.firstName = replaceNickname(name.lastName);
  name.lastName = firstName;
  return name;
}
