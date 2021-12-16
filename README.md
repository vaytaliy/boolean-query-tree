# boolean-query-tree
Boolean query

Go to index.js to see samples of how to use this tool

The main purpose of query tree tool is to be able to filter various flat JSON data in a very flexible way. 
Example of usages:
- web app, where frontend user wants to filter products based on many different generic conditions instead of limited filter options
- Data analysts, who need to use highly specific conditions to filter large sets of data (FYI: you can also use csv with that, just need to build a javascript object to be able to use this tool)

Operators like "AND", "EQUAL", "LARGER THAN" and etc. can have nested filter operators within them
