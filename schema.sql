CREATE DATABASE Bamazon;

USE Bamazon;

CREATE TABLE products (
    item_id INTEGER(11) AUTO_INCREMENT NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    department_name VARCHAR(100),
    price DECIMAL(10,2),
    stock_quantity INTEGER(11),
    product_sales DECIMAL(10,2),
    PRIMARY KEY (item_id)
);

CREATE TABLE departments (
	department_id INTEGER(11) AUTO_INCREMENT NOT NULL,
    department_name VARCHAR(100) NOT NULL,
    over_head_costs DECIMAL(10,2),
    total_sales DECIMAL(10,2),
    PRIMARY KEY (department_id)
);