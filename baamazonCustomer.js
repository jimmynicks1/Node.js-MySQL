var inquirer = require("inquirer");
var mysql = require("mysql");
var Table = require("cli-table");
//======================================================
var connection = mysql.createConnection({
    host: "localhost",
    port: 3300,
    user: "root",
    password: "#",
    database: "Bamazon"
});

var queryItems = "SELECT * FROM products";

connection.query(queryItems, function(err, res) {
    console.log(`Welcome to Bamazon! Below is our current invetory available for purchase. Here at Bamazon we strive for top notch customer service. Please do not hestitate to reach out!`);
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
    inquirer.prompt([{
        name: "choice",
        type: "list",
        message: "What item would you like to buy?",
        choices: function() {
            var choiceArray = [];
            for (var i = 0; i < res.length; i++) {
                choiceArray.push(res[i].product_name);
            }
            return choiceArray
        }
    }]).then(function(answer) {

        var chosenProduct;
        for (var i = 0; i < res.length; i++) {
            if (res[i].product_name === answer.choice) {
                chosenProduct = res[i];
                inquirer.prompt([{
                    name: "quantity",
                    type: "input",
                    message: "How many would you like to purchase?",
                    validate: function(value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        return false;
                    }
                }]).then(function(answer) {
                    if (answer.quantity > chosenProduct.stock_quantity) {
                        console.log(`I am sorry. We do not carry that many items in stock. Please input a valid quantity for ${chosenProduct.product_name}. We currently only have ${chosenProduct.stock_quantity} in our inventory`);
                        end();
                    } else {
                        var query = "UPDATE products SET stock_quantity = stock_quantity - ?, product_sales = product_sales + (price * ?) WHERE product_name = ?";
                        connection.query(query, [answer.quantity, answer.quantity, chosenProduct.product_name], function(err, res) {
                            if (err) throw "Something went wrong. Please try again";
                            var total = answer.quantity * chosenProduct.price;
                            var dept = chosenProduct.department_name; 
                            var deptQuery = "UPDATE departments SET total_sales = total_sales + ? WHERE department_name = ?";
                            connection.query(deptQuery, [total, dept], function(err, res) {
                                if (err) throw "Something went wrong. Please try again";
    
                            });
                            var orderNum = Math.floor(Math.random() * 90000) + 10000;
                            console.log(`Thank you for purchasing from Bamazon. Your total is $${total.toFixed(2)}. Your order will be delivered in 9 days after confirmation of payment. Please make sure your billing information is up to date. You will be charged shortly.`);
                            console.log("=================================================");
                            console.log(`Transaction completed. Your Order Number is #${orderNum}. Have a nice day. We thank you for for shopping at Bamazon!`);
                            end();
                        });
                    }
                })

            }
        }
    });
});

var end = function() {
    connection.end(function(err) {
    });
}