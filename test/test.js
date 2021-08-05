const BooleanQuery = require("../boolean-query/BooleanQuery");
const assert = require('assert');
const {dataRow} = require('../sampleData');

// id: 1,
// title: "My First Post",
// content: "Hello World!",
// views: 1,
// timestamp: 1555832341

describe("Querying individual object", () => {
    it("GREATER_THAN(views,100) -> false", () => {
        
        const {result} = BooleanQuery.check(dataRow, "GREATER_THAN(views,100)");

        assert.strictEqual(result, false);
    });
    it("EQUAL(title, My First Post) -> true", () => {
        
        const {result} = BooleanQuery.check(dataRow, "EQUAL(title, My First Post)");

        assert.strictEqual(result, true);
    });
    it("EQUAL(views, 1) -> true", () => {
        
        const {result} = BooleanQuery.check(dataRow, "EQUAL(views, 1)");

        assert.strictEqual(result, true);
    });
    it("AND(EQUAL(title, My First Post),EQUAL(views,1)) -> true", () => {
        
        const {result} = BooleanQuery.check(dataRow, "AND(EQUAL(title,My First Post),EQUAL(views,1))");
        assert.strictEqual(result, true);
    });
    it("OR(EQUAL(id, 2),EQUAL(views,1)) -> true", () => {
        
        const {result} = BooleanQuery.check(dataRow, "OR(EQUAL(id,2),EQUAL(views,1))");

        assert.strictEqual(result, true);
    });
    it("LESS_THAN(views,100) -> true", () => {
        
        const {result} = BooleanQuery.check(dataRow, "LESS_THAN(views,100)");

        assert.strictEqual(result, true);
    });
    it("GREATER_THAN(views,100) -> false", () => {
        
        const {result} = BooleanQuery.check(dataRow, "GREATER_THAN(views,100)");

        assert.strictEqual(result, false);
    });
    it("NOT(EQUAL(id, 1)) -> false", () => {
        
        const {result} = BooleanQuery.check(dataRow, "NOT(EQUAL(id, 1))");

        assert.strictEqual(result, false);
    });
    it("AND(NOT(EQUAL(views, 1)), OR(EQUAL(content, Hello World!), LOWER_THAN(views, 1))) -> false", () => {
        
        const {result} = BooleanQuery.check(dataRow, "AND(NOT(EQUAL(views, 1)), OR(EQUAL(content, Hello World!), LOWER_THAN(views, 1)))");

        assert.strictEqual(result, false);
    });
})