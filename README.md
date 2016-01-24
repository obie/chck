#chck

_Inspired by [JSON Filter](https://github.com/mmckegg/json-filter) by Matt McKegg_

Check that objects match a specification. Written specifically for use in Lambda function event handler guard clauses as described in [Serverless: Patterns of Modern Application Design Using Microservices ](http://leanpub.com/serverless)

## Installation

```shell
$ npm install chck
```

## Example

We find `chck` especially useful for refactoring boolean expressions in guard clauses so that they're obvious and maintainable.

```js
var chck = require('chck');

exports.handler = function(order, context) {
  if(chck(order, {
    UserId: {$present: true},
    FeedbackHistory: {$present: false}
  })) {
    feedback.lookup(order.UserId, function(err, history) {
      // attach history to message...

```

## Usage

```js
var chck = require('chck')
```

### chck(source, spec)

Checks a `source` object according to a `spec` object and returns `true` or `false` depending on whether it matches. Every attribute in `spec` must be satisfied or the check fails.

### chck.any(source, spec)
Matching attributes in `spec` is not required, but if there is a match, it must pass.

### chck.strict(source, spec)
Slight variation in that every attribute present in `source` must be included in `spec`.

### chck.same(source, spec)
Deep comparison. All attributes must be exactly the same and $conditionals are ignored. Useful for detecting changed objects.

## Specification Object

The `spec` parameter is an object with keys and values constituting instructions for either accepting or rejecting the `source` object. For example, if you want to require that the attribute `type` equals `person` then your spec would be `{type: 'person'}`. 

## Spec Conditionals

The following conditional attributes are available:

### $present

Specify that the value of an attribute must not be null or false (i.e. 'truthy'). 

```js
{
  name: {$present: true}
}
```

### $any

Specify that the value of an attribute can be anything.

```js
{
  description: {$any: true}
}
```

### $contains

For matching against an array. The array must contain all of the values specified.

```js
{
  tags: {$contains: ['cat', 'animal']}
}
```

### $excludes

For matching against an array. The array cannot contain any of the values specified.

```js
{
  permissions: {$excludes: ['admin', 'mod']}
}
```

### $only

The value can only be one of the ones specified.

```js
{
  gender: {$only: ['male', 'female', 'unspecified']}
}
```

### $not

The value can be anything except one of the ones specified.

```js
{
  browser: {$not: ['IE', 'Firefox']}
}
```

### $matchAny

Allows a filter to branch into multiple filters when at least one must match.

```js
{
  $matchAny: [
    { type: "Post"
      state: {$only: ['draft', 'published']}
    },
    { type: "Comment"
      state: {$only: ['pending', 'approved', 'spam']}
    }
  ]
}
```

### $optional

Syntax sugar for specifying many $any filters at the same time.

```js
{
  $optional: ['description', 'color', 'age']
}
```

Is equivalent to:

```js
{
  description: {$any: true},
  color: {$any: true},
  age: {$any: true}
}
```