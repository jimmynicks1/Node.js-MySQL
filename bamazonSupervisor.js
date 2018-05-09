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


var startSupervisor = function() {
    inquirer.prompt([{
        name: "choice",
        type: "list",
        message: "Hello, what would you like to do?",
        choices: ["View Product Sales by Department", "Create New Department"]
    }]).then(function(answer) {
        if (answer.choice === "View Product Sales by Department") {
            viewProduct();
        } else {
            createDept();
        }

    });
}

var viewProduct = function() {
       var query = "SELECT department_id, department_name, over_head_costs, total_sales, (total_sales - over_head_costs) as total_profit FROM departments";
    connection.query(query, function(err, res) {
        var table = new Table({
            head: ["Department ID", "Department Name", "Over Head Costs", "Total Sales", "Total Profit"],
            colWidths: [25, 30, 25, 25, 25]
        });
        for (var i = 0; i < res.length; i++) {
            table.push(
                [res[i].department_id, res[i].department_name, "$" + res[i].over_head_costs, "$" + res[i].total_sales, "$" + res[i].total_profit]
            );
        }
        console.log(table.toString());
        end();
    });
}

var createDept = function() {n
    inquirer.prompt([{
            name: "department",
            type: "input",
            message: "What Department do you like to create?"
        },
        {
            name: "over",
            type: "input",
            message: "What is the overhead cost?",
            validate: function(value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }
    ]).then(function(response) {
        var query = "INSERT INTO departments SET ?";
        connection.query(query, {
            department_name: response.department,
            over_head_costs: response.over,
            total_sales: 0
        }, function(err) {
            if (err) throw err;
            console.log(`Successfully added ${response.department}!`);
            end();
        })
    })
}

var end = function() {
    connection.end(function(err) {
    });
}

startSupervisor();