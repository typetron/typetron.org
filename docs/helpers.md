---
layout: docs
title: Helpers
---

## {{ page.title }}

Typetron provides a hand full of build-in helper methods that you can use to speed up the development process.

### Arrays

`empty` - Returns true if the array is empty:

 ```ts
[].empty(); // true
[1].empty(); // false
```

`random` - Returns a random item from the array:
```ts
[1, 2, 3, 4].random(); // 2 - randomly
``` 

`randomIndex` - Returns a random index from the array:
```ts
[1, 2, 3, 4].random(); // 0 - randomly
``` 

`findWhere` - Just like `find` method from array, `findWhere` finds an item based on a key/value condition:
```ts
const users = [
    {name: 'John', age: 36},
    {name: 'Lisa', age: 32},
    {name: 'Doe', age: 28},
];
users.findWhere('name', 'John'); // {name: 'John', age: 36} 
```
 
`pluck` - Returns all the values for a key in a simple array list:  
```ts
const users = [
    {name: 'John', age: 34},
    {name: 'Doe', age: 28},
];
users.pluck('name'); // ['John', 'Doe'] 
```
`remove` - Removes an item from the array:
```ts
const john = {name: 'John'};
const doe = {name: 'doe'};
[john, doe].remove(doe); // [{name: 'John'}]
``` 

`where` - Filters and array based on a key/value pair condition
```ts
const users = [
    {name: 'John', role: 'admin'},
    {name: 'Lisa', role: 'admin'},
    {name: 'Doe', role: 'manager'},
];

users.where('role', 'manager'); // [{name: 'Doe', role: 'manager'}]
```

`whereIn` - Filters and array based on a key/values pair condition where value is an array:

```ts
const users = [
    {name: 'John', role: 'admin'},
    {name: 'Lisa', role: 'admin'},
    {name: 'Doe', role: 'manager'},
    {name: 'Clark', role: 'developer'},
];

users.where('role', ['manager','developer']); 
/*
    [
        {name: 'Doe', role: 'manager'},
        {name: 'Clark', role: 'developer'}
    ]
*/
```

`groupBy` - Groups the array by a given key
```ts
const users = [
    {name: 'John', role: 'admin'},
    {name: 'Lisa', role: 'admin'},
    {name: 'Doe', role: 'manager'},
];

users.groupBy('role');
/*
{
    admin: [
        {name: 'John', role: 'admin'},
        {name: 'Lisa', role: 'admin'}
    ],
    manager: [{name: 'Doe', role: 'manager'}]
}
*/
```
    

### Math
`random` - Returns a random integer number:
```ts
Math.random(10, 20); // 18 - randomly
```
