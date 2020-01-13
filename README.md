# create-mysql-api-rest
This is a package for automatically generate REST API from a MySQL database.
It connects to a database , reads all the tables, builds the models and relations for [SequelizeJS](https://github.com/sequelize/sequelize) via the command line and allows the user to automatically generate REST (GET and DELETE) endpoints for a Express application.

## Before you install
This package is intended to be an excercise, to understand how node works, to explore how javascript behave in server side and to publish my first npm package.


## Requirements
For this package to work you need to install the following pre-requisites:

**MySQL2**

To hadle connections to MySQL database

    npm install -g mysql2

**Sequelize**

To handle models and queries to the database

    npm install sequelize --save

**Sequelize-cli**

To build the directories and index for the models 

    npm install -g sequelize-cli

## Install

    npm install -g create-mysql-api-rest

## Usage

To create a REST API with this package you need to install this package, the requeriments listed and follow this steps:

First, create a folder:

    mkdir my-rest-api
    cd my-rest-api

Then, install the npm packages that we will use and make the sequelize files and folders:

    npm init
    npm install express sequelize mysql2 body-parser --save
    npm install sequelize-cli -g
    npm install create-mysql-api-rest

    sequelize init

Go into config/config.json and replace the content of the file with your database configuration.
After that run:

    TODO: define how to call the function


## Database tables naming
To work properly, this package, requires that the tables are named as follows:

1. All table's names must be written in lowercase (example: ​users)
1. All table's names must be written in English (example: devices)
1. In case of having a space in the table's name it must be replaced by an underscore 
(example: ​device_brands​).
1. All tables that represent a **model** must be written in plural (example: ​devices​).
1. All tables that represent a **relation** must have as a suffix the model's name in singular (example: ​device_brands​ where ​device​ is the model). 
1. There are two types of relations:
    1. **Between models** (example: ​organization_users​, where one model is ​organizations​ and the other is ​users​, as this 2 tables exists and are written in plural, therefore they are models)
    1. **Extensions of a same model** (example: ​device_brands​ where the model is ​devices​ and it has attributes (1 or more) extensibles/related to ​brands​).
1. All tables must have a **PRIMARY KEY** called **id**
1. All tables who have a relation with another model or an extension of the same model, have a **KEY** which starts with the suffix **id_** followed by the model's name in singular (example: ​id_user​).


## TODO
1. Create relations between models.
1. A good log handling.
1. Update existing models.
1. Automatic Swagger documentation.
