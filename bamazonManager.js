var inquirer = require("inquirer");
var mysql = require("mysql");
var Table = require("cli-table");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3300,
    user: "root",
    password: "#",
    database: "Bamazon"
});

var startManager = function() {
    inquirer.prompt([{
        name: "choice",
        type: "list",
        message: "Welcome Manager, what would you like to do?",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
    }]).then(function(answer) {
        if (answer.choice === "View Products for Sale") {
            console.log("Viewing All Products");
            viewProducts();
        } else if (answer.choice === "View Low Inventory") {
            console.log("These items are low");
            viewLow();
        } else if (answer.choice === "Add to Inventory") {
            console.log("Adding..");
            addInven();
        } else {
            console.log("Adding New Product");
            addItem();
        }
    });
}

var viewProducts = function() {
    var queryItems = "SELECT * FROM products";
    connection.query(queryItems, function(err, res) {
        console.log(`These are our available products for sell`);
        var table = new Table({
            head: ["Item ID", "Product Name", "Department Name", "Cost", "Quantity Available"],
            colWidths: [25, 30, 25, 25, 25]
        });
        for (var i = 0; i < res.length; i++) {
            table.push(
                [res[i].item_id, res[i].product_name, res[i].department_name, "$" + res[i].price, res[i].stock_quantity]
            );
        }
        console.log(table.toString());
        end();
    });
}

var viewLow = function() {
    var queryItems = `SELECT * FROM products GROUP BY product_name HAVING stock_quantity < 5`;
    connection.query(queryItems, function(err, res) {
        console.log(`The below products need to be replenish. We currently carry less than 5 of the below products.`);
        console.log("============");
        var table = new Table({
            head: ["Item ID", "Product Name", "Department Name", "Cost", "Quantity Available"],
            colWidths: [25, 30, 25, 25, 25]
        });
        for (var i = 0; i < res.length; i++) {
            table.push(
                [res[i].item_id, res[i].product_name, res[i].department_name, "$" + res[i].price, res[i].stock_quantity]
            );
        }
        console.log(table.toString());
        end();
    });
}

var addInven = function() {
    var queryItems = "SELECT * FROM products";
    connection.query(queryItems, function(err, res) {
        inquirer.prompt([{
            name: "choice",
            type: "list",
            message: "What item would you like to add available stock quantity for?",
            choices: function() {
                var choiceArray = [];
                for (var i = 0; i < res.length; i++) {
                    choiceArray.push(res[i].product_name);
                }
                return choiceArray
            }
        }]).then(function(response) {
            var chosenProduct;
            for (var i = 0; i < res.length; i++) {
                if (res[i].product_name === response.choice) {
                    chosenProduct = res[i];
                    inquirer.prompt([{
                        name: "quantity",
                        type: "input",
                        message: "How many would you like to add?",
                        validate: function(value) {
                            if (isNaN(value) === false) {
                                return true;
                            }
                            return false;
                        }
                    }]).then(function(answer) {
                        var query = "UPDATE products SET stock_quantity = stock_quantity + ? WHERE product_name = ?";
                        connection.query(query, [answer.quantity, chosenProduct.product_name], function(err, res) {
                            if (err) throw "Oops please try again";
                            var updateVal = parseInt(chosenProduct.stock_quantity) + parseInt(answer.quantity);
                            console.log(`Quantity successfully updated. We now carry a total of ${updateVal} of ${chosenProduct.product_name}`);
                            nextCmd();
                        })
                    });
                }
            }
        });
    })
}

var addItem = function() {
    inquirer.prompt([{
            name: "item",
            type: "input",
            message: "What product would you like to add?"
        },
        {
            name: "department",
            type: "input",
            message: "What department does this product belong in?"
        },
        {
            name: "price",
            type: "input",
            message: "What is the price of the product?",
            validate: function(value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        },
        {
            name: "quantity",
            type: "input",
            message: "How many will be put for sale?",
            validate: function(value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }
    ]).then(function(answer) {
        var query = "INSERT INTO products SET?";
        connection.query(query, {
            product_name: answer.item,
            department_name: answer.department,
            price: answer.price,
            stock_quantity: answer.quantity,
            product_sales: 0
        }, function(err) {
            if (err) throw "sorry please try again";
            console.log(`Successfully added ${answer.item}!`);
            nextCmd();
        })
    });
}

var nextCmd = function() {
    inquirer.prompt([{
        name: "choice",
        type: "list",
        message: "Are you done?",
        choices: ["Yes", "No"]
    }]).then(function(answer) {
        if (answer.choice === "Yes") {
            end();
            console.log("Good Day Manager");
        } else {
            startManager();
        }
    });
}

var end = function() {
    connection.end(function(err) {
    });
}

startManager();