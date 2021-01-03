---
layout: docs

title: Helpers
---

## {{ page.title }}

Typetron provides a hand full of build-in helper methods that you can use to speed up the development process.

### Arrays

`empty` - Returns true if the array is empty:

 ```ts
[].empty() // true
[1].empty() // false
```

`random` - Returns a random item from the array:
```ts
[1, 2, 3, 4].random() // 2 - randomly
``` 

`randomIndex` - Returns a random index from the array:
```ts
[1, 2, 3, 4].random() // 0 - randomly
``` 

`findWhere` - Just like `find` method from array, `findWhere` finds an item based on a key/value condition:
```ts
const users = [
    {name: 'John', age: 36},
    {name: 'Lisa', age: 32},
    {name: 'Doe', age: 28},
]
users.findWhere('name', 'John') // {name: 'John', age: 36} 
```
 
`pluck` - Returns all the values for a key in a simple array list:  
```ts
const users = [
    {name: 'John', age: 34},
    {name: 'Doe', age: 28},
]
users.pluck('name') // ['John', 'Doe'] 
```
`remove` - Removes an item from the array:
```ts
const john = {name: 'John'}
const doe = {name: 'doe'}
[john, doe].remove(doe) // [{name: 'John'}]
``` 

`where` - Filters and array based on a key/value pair condition
```ts
const users = [
    {name: 'John', role: 'admin'},
    {name: 'Lisa', role: 'admin'},
    {name: 'Doe', role: 'manager'},
]

users.where('role', 'manager') // [{name: 'Doe', role: 'manager'}]
```

`whereIn` - Filters and array based on a key/values pair condition where value is an array:

```ts
const users = [
    {name: 'John', role: 'admin'},
    {name: 'Lisa', role: 'admin'},
    {name: 'Doe', role: 'manager'},
    {name: 'Clark', role: 'developer'},
]

users.where('role', ['manager','developer']) 
/*
    [
        {name: 'Doe', role: 'manager'},
        {name: 'Clark', role: 'developer'}
    ]
*/
```

`groupBy` - Groups the array by a given key or a given callback
```ts
const users = [
    {name: 'John', role: 'admin'},
    {name: 'Lisa', role: 'admin'},
    {name: 'Doe', role: 'manager'},
]

users.groupBy('role')
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
    
```ts
const users = [
    {name: 'John', role: 'admin', type: 'human'},
    {name: 'Lisa', role: 'admin', type: 'human'},
    {name: 'Doe', role: 'manager', type: 'robot'},
]

users.groupBy(user => `${user.type}-${user.role}`)
/*
{
	human-admin: [
		{ name: "John", role: "admin", type: "human" },
		{ name: "Lisa", role: "admin", type: "human" }
	],
	robot-manager: [
		{ name: "Doe", role: "manager", type: "robot" }
	]
}
*/
```

`unique` - returns all the unique values from an array

```ts
[1, 1, 2, 3].unique() // [1, 2, 3]

const users = [
    {name: 'John', role: 'admin'},
    {name: 'Lisa', role: 'admin'},
    {name: 'Doe', role: 'manager'},
]

const uniqueUsersByRole = user.unique('role')
/*
[
    {name: 'John', role: 'admin'},
    {name: 'Doe', role: 'manager'},
]
*/

const usernamesContainingO = user.unique(user => user.includes('o'))
/*
[
    {name: 'John', role: 'admin'},
    {name: 'Doe', role: 'manager'},
]
*/
````

`sum` - sums values of an array
```ts
[1, 2, 3].sum() // 6

const users = [
    {name: 'John', salary: 30},
    {name: 'Lisa', salary: 25},
    {name: 'Doe', salary: 15},
]

users.sum('salary') // 70
users.sum(user => user.salary) // 70
```

### String
`random` - Returns a random string:
```ts
String.random() // '3g5re' - randomly
String.random() // 'eh56gf34f23de' - randomly
String.random(5) // 'j8h7w' - randomly
String.random(5, 'abcd') // 'aabdd' - randomly
```

`capitalize` - Makes the first character uppercase
```ts
'hello world'.capitalize() // 'Hello world'
```

`limit` - Limits the length of a string
```ts
'hello world'.limit('8') // 'hello...'
'hello world'.limit('6', ' +') // 'hello +'
```

### Math
`random` - Returns a random integer number:
```ts
Math.random(10, 20) // 18 - randomly
```
