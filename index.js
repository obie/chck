function chck(source, spec, mode) {
 
  var checkConditionals = (mode !== 'same');
  
  // default to filtering mode
  mode = mode || 'filter'
  
  if (checkConditionals) {
    if (spec && spec.$present) {
      return !!source
    }
    else if (spec && spec.$present === false){
      return !source
    }
    else if (spec == null){
      return 'undefined'
    }
    else if (spec.$any){
      return true
    }
  }
  else {
    if (source === spec) {
      return true
    }
    else if (spec == null){
      return false
    }
  }
  
  if (source instanceof Object) {
      if (spec instanceof Object) {
        if (spec.$any && checkConditionals) {
          return true
        }
        else if (Array.isArray(source)) {
          if (Array.isArray(spec.$contains) && checkConditionals){            
            return spec.$contains.every(function(value){
              return (~source.indexOf(value))
            })
            
          }
          else if (Array.isArray(spec.$excludes) && checkConditionals){
            return spec.$excludes.every(function(value){
              return (!~source.indexOf(value))
            })
          }
          else if (Array.isArray(spec)) {
            // both source and spec are arrays, so ensure they match key by key
            return matchKeys(source, spec, mode) && (spec.length == source.length)
          }
          else {
            // source is array but spec is a hash, so ensure that keys that do exist match spec
            return matchKeys(source, spec, mode)
          }
        }
        else {
          // both source and spec are standard hashes so match key by key
          return matchKeys(source, spec, mode)
        }
      }
  }
  else {
    if (Array.isArray(spec.$only) && checkConditionals) {
      return !!~spec.$only.indexOf(source)  
    }
    else if (Array.isArray(spec.$not) && checkConditionals){
      return !~spec.$not.indexOf(source)
    }
    else {
      return source === spec
    }
  }
}

function matchSpecifiedKeysWithOptional(keys, source, filter, mode){
  var result = true

  for (var i = 0, l = keys.length; i < l; i++){
    var key = keys[i];
    if (isNotMeta(key)) {
      var res = chck(source[key], filter[key], mode);
      if ((filter.$optional && ~filter.$optional.indexOf(key)) || res !== 'undefined'){
        result = res;
      }
      else {
        result = false;
      }
      if (!result){
        break
      }
    }
  }
  return result;
}

function matchSpecifiedKeys(keys, source, filter, mode){
  var result = true;

  for (var i = 0, l = keys.length; i < l; i++){
    var key = keys[i]
    if (isNotMeta(key) && !chck(source[key], filter[key], mode)) {
      return false;
    }
  }
  return result;
}

function matchKeys(source, filter, mode){
  var result = false;
  
  if (mode === 'same'){
    var keys = keyUnion(source, filter);
    result = matchSpecifiedKeys(keys, source, filter, mode);
  }
  else if (filter.$matchAny){
    result = filter.$matchAny.some(function(innerFilter) {
      var combinedFilter = mergeClone(filter, innerFilter);
      delete combinedFilter.$matchAny;
      return matchKeys(source, combinedFilter, mode);
    });
  }
  else {
    if (mode === 'filter') {
      result = matchSpecifiedKeys(Object.keys(filter), source, filter, mode)
    }
    else if (mode === 'strict') {
      result = matchSpecifiedKeysWithOptional(Object.keys(source), source, filter, 'filter');
    }
    else  {
      result = matchSpecifiedKeys(Object.keys(source), source, filter, 'filter');
    }
  }

  return result;
}

function keyUnion(a, b){
  var result = {};

  for (var k in a) {
    if (k in a) {
      result[k] = true;
    }
  }

  for (var k in b) {
    if (k in b) {
      result[k] = true;
    }
  }

  return Object.keys(result);
}

function isNotMeta(key) {
  return (key.charAt(0) !== '$');
}

function mergeClone(){
  var result = {};
  for (var i=0; i < arguments.length; i++) {
    var obj = arguments[i];
    if (obj) {
      Object.keys(obj).forEach(function(key) {
        result[key] = obj[key];
      });
    }
  }
  return result;
}

chck.same = function(source, spec) {
  return chck(source, spec, 'same');
}
chck.any = function(source, spec) {
  return chck(source, spec, 'any');
}
chck.strict = function(source, spec) {
  return chck(source, spec, 'strict');
}

module.exports = chck;