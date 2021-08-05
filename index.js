//special characters: "(", ")" ","
//accepted values -> valuetypes (any numbers, strings, dates)
//accepted data -> flat data (arrays or nested objects can't be used)
const BooleanQuery = require('./boolean-query/BooleanQuery');
const util = require('util');

let sampleData = [{
    id: 1,
    title: "My First Post",
    content: "Hello World!",
    views: 1,
    somethingElse: {
        info: "im info"
    },
    timestamp: 1555832341
}
]

let sampleListData = [{
    id: 1,
    title: "My First Post",
    content: "Hello World!",
    views: 1,
    timestamp: 1555832341
}, {
    id: 3,
    title: "My First Post",
    content: "Hello World!",
    views: 2,
    timestamp: 1555832341
},
{
    id: 4,
    title: "My First Post",
    content: "Hello World!",
    views: 2,
    timestamp: 1555832341
}
]


//=====
//Sample usage without object:
//=====

let res1 = BooleanQuery.check(null, operation = "AND(EQUAL(1, 1), LOWER_THAN(3, 4))");
//possible returned result:
console.log(res1)
// res1.result
// res1.tree
// res.errors

//======
//Sample usage for one object:
//======
let res2 = BooleanQuery.check(sampleListData[0], "AND(NOT(EQUAL(views, 1)), OR(EQUAL(content, Hello World!), LOWER_THAN(views, 1)))");

//possible returned result:

// res1.result
// res1.tree
// res.errors

//======
//Sample usage for list of data:
//======

let queriedDataList = BooleanQuery.checkMany(
    dataObjects = sampleListData,
    operation = "AND(NOT(EQUAL(views, 1)), OR(EQUAL(content, Hello World!), LOWER_THAN(views, 1)))").findAll(); // returns with id: 3 and id: 4

let objectWithResult = BooleanQuery.checkMany(
    dataObjects = sampleListData,
    operation = "AND(NOT(EQUAL(views, 1)), OR(EQUAL(content, Hello World!), LOWER_THAN(views, 1)))").firstOne() //returns with id: 3


