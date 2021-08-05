class CheckedObject {

    object = {};
    checkResult = false;

    constructor(object) {
        this.object = object;
    };

    addCheckResult(checkResult) {
        this.checkResult = checkResult;
    };
}

class ObjectsFilter {
    objects = [];

    addObject(object) {
        this.objects.push(object);
    };

    /**
    * Finds first object in the list which passes query checks
    * May return null if such record wasn't found
    * 
    * @return {any} returns original object which passed query checks
    */
    firstOne() {
        for (const checkObjectInstance of this.objects) {
            if (checkObjectInstance.checkResult === true) {
                return checkObjectInstance.object;
            }
        }
        return null;
    };

    /**
    * Finds all objects in the list which passes query checks
    * May return null if such record wasn't found
    * 
    * @return {any} returns list of original objects which passed query checks
    */
    findAll() {
        const filteredObjects = [];

        for (const checkObjectInstance of this.objects) {
            if (checkObjectInstance.checkResult === true) {
                filteredObjects.push(checkObjectInstance.object);
            }
        }
        return filteredObjects;
    };
}

class BooleanQuery {

    static options = { firstParameterIsProperty: false };
    static operation = '';
    static tree = {};
    static errors = [];
    static dataObject;
    objectFilter;

    /**
    * Takes reference value and gets its type, if it is numeric then casts 2nd parameter
    *
    * @param {Array<any>} args array with length 2 representing reference value, and value to check against.
    * @return {Array<any>} cleaned up arguments with appropriate types
    */
    static parseArguments(args) {

        let argTwoVal;

        if (typeof args[0] === "number") {
            argTwoVal = Number(args[1]);
            if (argTwoVal === NaN) {
                this.errors.push({
                    errorType: "type_error",
                    description: `couldn't cast ${args[1]} to number`
                });
            } else {
                args[1] = argTwoVal;
            }
        }

        return args;
    };

    /**
    * List of possible commands and their logic function
    */

    static commands = {
        "EQUAL": {
            action: (args) => {
                const cleanedArgs = this.parseArguments(args);

                if (cleanedArgs[0] === cleanedArgs[1]) {
                    return true;
                }
                return false;
            }
        },
        "AND": {
            action: (args) => {
                if (args[0].node.result === true && args[1].node.result === true) {
                    return true;
                }
                return false;
            }
        },
        "OR": {
            action: (args) => {
                if ((args[0].node.result === args[1].node.result) || args[0].node.result || args[1].node.result) {
                    return true;
                }
                return false;
            }
        },
        "GREATER_THAN": {
            action: (args) => {
                const cleanedArgs = this.parseArguments(args);

                if (cleanedArgs[0] > cleanedArgs[1]) {
                    return true;
                }
                return false;
            }
        },
        "LOWER_THAN": {
            action: (args) => {
                const cleanedArgs = this.parseArguments(args);

                if (cleanedArgs[0] < cleanedArgs[1]) {
                    return true;
                }
                return false;
            }
        },
        "NOT": {
            action: (args) => {
                let originalRes = args[0].node.result;
                return !originalRes;
            }
        }
    };

    /**
    * Returns instance of object filter which contains operation objects with their check results
    *
    * @param {any} dataObject an object to be checked.
    * @param {string} operation a string with boolean operations.
    * @return {any} result object with bool result and errors if such occured
    */
    //TODO: create return object;
    static check(dataObject, operation = {}) {

        if (dataObject) {
            this.options.firstParameterIsProperty = true;
            this.dataObject = dataObject;
        };

        if (operation) this.operation = operation;

        try {
            this.buildTree();

            if (this.tree && this.tree.node) {
                return { result: this.tree.node.result, errors: this.errors, tree: this.tree };
            }
            return { result: null, errors: this.errors, tree: null };
        } catch (err) {
            console.log("Unexpected operation format. Could not parse operation string");
        }
    };

    /**
    * Returns instance of object filter which contains operation objects with their check results
    *
    * @param {Array<any>} dataObjects enumerable with objects to check.
    * @param {string} operation a string with boolean operations.
    * @return {ObjectsFilter} unique instance containing objects on which checking was done.
    */

    static checkMany(dataObjects, operation = {}) {
        this.options.firstParameterIsProperty = true;
        this.objectFilter = new ObjectsFilter();

        for (const dataObject of dataObjects) {
            this.objectFilter.addObject(new CheckedObject(dataObject));
        }

        for (const objectToFilter of this.objectFilter.objects) {
            const query = this.check(objectToFilter.object, operation); //TODO create promise right here

            if (query) {
                objectToFilter.addCheckResult(query.result);
            }
        }
        return this.objectFilter;
    }

    static splitOperations(operation) {
        let openParenthesisSum = 0;
        let splitIndex;

        for (let i = 0; i < operation.length; i++) {
            let changeMade = false;
            if (operation[i] == "(") {
                openParenthesisSum += 1;
                changeMade = true
            } else if (operation[i] == ")") {
                openParenthesisSum -= 1;
                changeMade = true
            }
            if (changeMade && openParenthesisSum === 0) { //meaning that at least 1 iteration happened and found at least 1 parenthesis in the string
                splitIndex = i;
                break;
            }
        }

        if (splitIndex) {
            let firstOperation = operation.substring(0, splitIndex + 1);
            let secondOperation = operation.substring(splitIndex + 1, operation.length + 1)

            if (secondOperation[0] === ',') {
                secondOperation = secondOperation.substring(1, secondOperation.length + 1).trim()
            }

            return [firstOperation, secondOperation];
        }

        return null;
    };

    static getNewOperations(operationString) {
        let foundOperationName;
        let command;
        for (const [key] of Object.entries(this.commands)) {
            command = key;
            foundOperationName = operationString.slice(0, command.length);

            if (foundOperationName === command) {
                break;
            }
        }

        let newOpTemp = operationString.slice(command.length);
        let newOperationCleaned = newOpTemp.substr(1, newOpTemp.length - 2);

        if (foundOperationName && (foundOperationName === 'AND' || foundOperationName === 'OR' || foundOperationName === 'NOT')) { //expecting 2 results

            if (foundOperationName !== 'NOT') {
                let childOperations;
                childOperations = this.splitOperations(newOperationCleaned) // this splits operation to 2 parts

                let commandNode = {  //for AND or OR commands
                    name: foundOperationName,
                    childOperations: childOperations || null
                }

                return commandNode;
            }

            let commandNode = {  //for NOT command
                name: foundOperationName,
                childOperations: [newOperationCleaned]
            }

            return commandNode;

        }

        if (foundOperationName && (foundOperationName === 'EQUAL' || foundOperationName === 'GREATER_THAN' || foundOperationName === 'LOWER_THAN')) {
            let operationArguments;
            let calcResult;

            operationArguments = newOperationCleaned.split(",")
            operationArguments[1] = operationArguments[1].trim();

            if (this.options.firstParameterIsProperty) {
                let objval = this.dataObject[operationArguments[0]];

                if (!objval) {
                    errors.push({
                        errorType: "null_property",
                        description: `Property ${operationArguments[0]} doesn't exist`
                    });
                    calcResult = false;
                }

                else if (objval && typeof objval !== "object") {
                    operationArguments[0] = objval;
                } else {
                    errors.push({
                        errorType: "not_value_type",
                        description: `Property ${operationArguments[0]} is not a value type`
                    });
                    calcResult = false;
                }
            }

            if (calcResult == null) {
                calcResult = this.commands[foundOperationName].action(operationArguments);
            }

            let commandNode = {  //for AND or OR commands
                name: foundOperationName,
                args: operationArguments,
                result: calcResult,
            }

            return commandNode;
        }

        return null;
    };

    static buildTree(tree = this.tree, operation = this.operation) {
        let commandNode = this.getNewOperations(operation) //find first command

        if (commandNode && !commandNode.childOperations) {
            tree.node = {
                name: commandNode.name,
                args: commandNode.args,
                result: commandNode.result
            }
        }

        if (commandNode && commandNode.childOperations) {

            tree.node = {
                name: commandNode.name,
                childOperations: []
            }

            for (let i = 0; i < commandNode.childOperations.length; i++) {

                tree.node.childOperations.push({})
                this.buildTree(tree.node.childOperations[i], commandNode.childOperations[i]);
            }
        }

        if (tree.node.childOperations) { //only relevant for AND, NOT, OR operators (uses boolean results of chlidren)
            let treeCommandName = tree.node.name;
            tree.node.result = this.commands[treeCommandName].action(tree.node.childOperations)
        }
    }
}

module.exports = BooleanQuery;