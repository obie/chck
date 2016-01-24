var chck = require('./')
  , test = require('tap').test
  

test("basic functionality", function(t){
  
  t.equal(chck(
    {name: "Cats"},
    {name: "Cats"}
  ), true, "same objects")

  t.equal(chck(
    {name: "Dogs"},
    {name: "Cats"}
  ), false, "different objects")

  t.equal(chck(
    {name: "Dogs"},
    {name: {$any: true}}
  ), true, "$any $matches any value for an attribute")

  t.equal(chck(
    {name: "Dogs"},
    {name: {$only: ['Dogs', "Cats"]}}
  ), true, "$only matches value of named attribute against array of values")


  t.equal(chck(
    {name: "Chickens"},
    {name: {$only: ['Dogs', "Cats"]}}
  ), false, "$only value of named attribute not in acceptable array of values")

  t.end();
})

test('$present', function(t){
  t.equal(chck(
    {name: "Chickens"},
    {name: {$present: true}}
  ), true, "attribute present")
  
  t.equal(chck(
    {cat: "Meow"},
    {name: {$present: true}}
  ), false, "attribute not present")

  t.equal(chck(
    {name: "Chickens"},
    {name: {$present: false}}
  ), false, "attribute present but should not be")
  
  t.equal(chck(
    {cat: "Meow"},
    {name: {$present: false}}
  ), true, "attribute not present and should not be")

  t.equal(chck(
    {object: {name: "Chickens"}},
    {object: {$present: true}}
  ), true, "attribute with nested object present")

  t.equal(chck(
    {object: {name: "Chickens"}},
    {object: {$present: false}}
  ), false, "attribute with nested object present but should not be")


  t.end();
})

test("Testing extra undefined attributes", function(t){
  t.equal(chck(
    {name: "Dogs"},
    {name: {$only: ['Dogs', "Cats"]}, value: {$only: [1,2,3,4]}}
  ), false, "fails with missing attribute")
  
  t.equal(chck.any(
    {name: "Dogs"},
    {name: {$only: ['Dogs', "Cats"]}, value: {$only: [1,2,3,4]}}
  ), true, "does not fail missing attribute because of any mode")
  
  t.equal(chck(
    {name: "Dogs", value: 3},
    {name: {$only: ['Dogs', "Cats"]}, value: {$only: [1,2,3,4]}}
  ), true, "does not fail with two attributes")
  
  t.equal(chck(
    {name: "Dogs"},
    {name: {$only: ['Dogs', "Cats"]}, value: {$any: true}}
  ), true, "$any makes a value optional")
  
  t.end();

})

test("Test strict option", function(t){

  t.equal(chck.strict(
    {name: "Dog", color: 'gray', type: 'animal'},
    {name: "Dog", color: {$any: true}, type: 'animal'}
  ), true, "all attribute specified");
  
  t.equal(chck.strict(
    {name: "Dog", color: 'gray', type: 'animal', extraAttribute: 'Stuff'},
    {name: "Dog", color: {$any: true}, type: 'animal'}
  ), false, "extra attributes");
  
  t.equal(chck.strict(
    {name: "Dog", color: 'gray', type: 'animal', extraAttribute: 'Stuff'},
    {name: "Dog", color: {$any: true}, type: 'animal', extraAttribute: {$only: ['Stuff', 'Things']}}
  ), true, "extra attributes with conditional");
  t.end();

})

test("Test same option", function(t){

  // should pass
  
  t.equal(chck.same(
    {name: "Dog", color: 'gray', type: 'animal'},
    {name: "Dog", color: 'gray', type: 'animal'}
  ), true, 'same flat')
  
  t.equal(chck.same(
    {name: "Dog", color: 'gray', type: 'animal', object: {deep: true}},
    {name: "Dog", color: 'gray', type: 'animal', object: {deep: true}}
  ), true, 'same deep')
  
  
  // should fail
  
  t.equal(chck.same(
    {name: "Dog", type: 'animal'},
    {name: "Dog", color: 'gray', type: 'animal'}
  ), false, 'Mising on first')
  
  t.equal(chck.same(
    {name: "Dog", color: 'gray', type: 'animal'},
    {name: "Dog", type: 'animal'}
  ), false, 'Mising on second')

  t.equal(chck.same(
    {name: "Dog", color: 'gray', type: 'animal', object: {deep: true}},
    {name: "Dog", color: 'gray', type: 'animal', object: {deep: false}}
  ), false, 'Deep attribute different')
  
  t.equal(chck.same(
    {name: "Dog", color: 'gray', type: 'animal'},
    {name: "Dog", color: 'gray', type: 'animal', object: {deep: true}}
  ), false, 'No deep on first')
  
  t.equal(chck.same(
    {name: "Dog", color: 'gray', type: 'animal', object: {deep: true}},
    {name: "Dog", color: 'gray', type: 'animal'}
  ), false, 'No deep on second')
  
  t.equal(chck.same(
    {name: "Dog", color: 'gray', type: 'animal', object: {deep: true}},
    {name: "Dog", color: 'gray', type: 'animal', object: {deep: true, another: 'attribute'}}
  ), false, 'Deep second has another attribute')
  
  t.equal(chck.same(
    {name: "Dog", color: 'gray', type: 'animal', object: {deep: true, another: 'attribute'}},
    {name: "Dog", color: 'gray', type: 'animal', object: {deep: true}}
  ), false, 'Deep first has another attribute')
  
  t.equal(chck.same(
    {name: "Dog", color: 'gray', type: 'animal'},
    {name: "Dog", color: 'blue', type: 'animal'}
  ), false, 'Different attribute')
  
  t.equal(chck.same(
    {name: "Dog", color: 'gray', type: 'animal'},
    {name: "Dog", color: {$any: true}, type: 'animal'}
  ), false, '$conditional')
  
  t.end();

})

test("Test Deep $Matching", function(t){

  t.equal(chck(
    {name: "Chicken", data: {age: 1, gender: 'male'}},
    {name: "Chicken", data: {age: {$only: [1,2,3,4]}, gender: 'male'}}
  ), true);
  
  t.equal(chck(
    {name: "Chicken", data: {age: 1, gender: 'female'}},
    {name: "Chicken", data: {age: {$only: [1,2,3,4]}, gender: 'male'}}
  ), false);
  
  t.equal(chck(
    {name: "Chicken", data: {age: 6, gender: 'male'}},
    {name: "Chicken", data: {age: {$only: [1,2,3,4]}, gender: 'male'}}
  ), false);
  
  t.equal(chck(
    {name: "Chicken", data: {age: 1, gender: 'female'}},
    {name: "Chicken", data: {age: {$only: [1,2,3,4]}, gender: {$only: ['male', 'female']}}}
  ), true);
  t.end();
  
})

test("Test Array matching", function(t){

  t.equal(chck(
    {name: "Chicken", array: [1,2,3,4,5]},
    {name: "Chicken", array: [1,2,3,4,5]}
  ), true);
  
  t.equal(chck(
    {name: "Chicken", array: [1,2,3,4,5,6]},
    {name: "Chicken", array: [1,2,3,4,5]}
  ), false);
  
  t.equal(chck(
    {name: "Chicken", array: [1,2,3,4]},
    {name: "Chicken", array: [1,2,3,4,5]}
  ), false);
  
  //// TODO: this test should probably pass:
  //t.equal(chck(
  //  {name: "Chicken", array: [1,2,3,4]},
  //  {name: "Chicken", array: [1,2,3,4, {$any: true}]}
  //), true);
  
  t.equal(chck(
    {name: "Chicken", array: [1,2,3,4]},
    {name: "Chicken", array: [1,{$only: [2,3]},3,4]}
  ), true);
  
  t.equal(chck(
    {name: "Chicken", array: [1,1,3,4]},
    {name: "Chicken", array: [1,{$only: [2,3]},3,4]}
  ), false);
  
  t.equal(chck(
    {name: "Chicken", array: [1,2,3,4]},
    {name: "Chicken", array: {$contains: [4, 2] }}
  ), true);
  
  t.equal(chck(
    {name: "Chicken", array: [1,2,3,4]},
    {name: "Chicken", array: {$contains: [4, 2, 5] }}
  ), false);
  
  t.equal(chck(
    {name: "Chicken", array: [1,2,3,4]},
    {name: "Chicken", array: {$excludes: [4, 2, 5] }}
  ), false);
  
  t.equal(chck(
    {name: "Chicken", array: [1,3]},
    {name: "Chicken", array: {$excludes: [4, 2, 5] }}
  ), true);
  
  t.end();
  

})
test("Test Combinations", function(t){

  t.equal(chck(
    {name: "Chicken", array: [1,{cat: 1},3,4]},
    {name: "Chicken", array: [1,{cat: 1},3,4]}
  ), true);
  
  t.equal(chck(
    {name: "Chicken", array: [1,{cat: 2},3,4]},
    {name: "Chicken", array: [1,{cat: 1},3,4]}
  ), false);
  
  t.equal(chck(
    {name: "Chicken", array: [1,{cat: 2},3,4]},
    {name: "Chicken", array: [1,{cat: {$only: [1,2]}},3,4]}
  ), true);
  
  t.equal(chck(
    {name: "Chicken", array: [1,{cat: 3},3,4]},
    {name: "Chicken", array: [1,{cat: {$only: [1,2]}},3,4]}
  ), false);

  t.end();

});

