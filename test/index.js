var assert = require('assert');

var countUniqueNames = require('../');

describe('Count Unique Names', function(){

  it('should count perfectly equal unique names', function(){
    assert.equal(countUniqueNames('Deborah','Egli','Deborah','Egli','Deborah Egli'), 1);
  });

  it('should count non-equal unique names', function(){
    assert.equal(countUniqueNames('Michele','Egli','Deborah','Egli','Michele Egli'), 2);
    assert.equal(countUniqueNames('Michele','Egli','Deborah','Egli','Andy Egli'), 3);
  });

  it('should match nicknames', function(){
    assert.equal(countUniqueNames('Deborah','Egli','Debbie','Egli','Debbie Egli'), 1);
    assert.equal(countUniqueNames('Andy','Egli','Andrew','Egli','Andy Egli'), 1);
  });

  it('should allow flipping of first and last names in non-explicit name field', function(){
    assert.equal(countUniqueNames('Deborah','Egli','Deborah','Egli','Egli Deborah'), 1);
  });

  describe('Typo handling', function(){
    it('should accept minor typos', function(){
      assert.equal(countUniqueNames('Deborah','Egni','Deborah','Egli','Deborah Egli'), 1);
      assert.equal(countUniqueNames('Mary','Egln','Maryd','Egli','Mar Egli'), 1);
    });
    
    it('should not accept significantly diverging names', function(){
      assert.equal(countUniqueNames('Deborah','Edfi','Deborah','Egli','Deborah Egli'), 2);
    });
  });

  describe('Middle name handling', function(){
    it('should accept one unique middle name as equivalent to a missing middle name', function(){
      assert.equal(countUniqueNames('Deborah S','Egli','Deborah','Egli','Deborah Egli'), 1);
    });

    it('should not accept multiple differing middle names as equivalent to any other middle name', function(){
      assert.equal(countUniqueNames('Deborah S','Egli','Deborah F','Egli','Deborah S Egli'), 2);
      assert.equal(countUniqueNames('Deborah S','Egli','Deborah F','Egli','Deborah G Egli'), 3);
    })
  });

});