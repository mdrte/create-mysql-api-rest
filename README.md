# create-mysql-api-rest
This is a package for automatically generate REST API from a MySQL database.
It connects to a database , reads all the tables, builds the models and relations for [SequelizeJS](https://github.com/sequelize/sequelize) via the command line and allows the user to automatically generate REST (GET and DELETE) endpoints for a Express application.

## Requirements
For this package to work you need to install the following pre-requisites:

**MySQL2**

`npm install -g mysql`

**Sequelize**

`npm install sequelize --save`

**Sequelize-cli**

`npm install -g sequelize-cli`

## Install

    npm install -g create-mysql-api-rest

## Database tables naming
To work properly, this package, requires that the tables are named as follows:

1. All table's names must be written in lowercase (example: ​users)
1. All table's names must be written in English (example: devices)
1. In case of having a space in the table's name it must be replaced by an underscore 
(example: ​device_brands​).
1. All tables that represent a **model** must be written in plural (example: ​devices​).
1. All tables that represent a **relation** must have as a suffix the model's name in singular (example: ​device_brands​ where ​device​ is the model). 
1. There are two types of relations:
    1. **Betewen models** (example: ​organization_users​, where one model is ​organizations​ and the other is ​users​, as this 2 tables exists and are written in plural, therefore they are models)
    1. **Extensions of a same model** (example: ​device_brands​ where the model is ​devices​ and it has attributes (1 or more) extensibles/related to ​brands​).
1. All tables must have a **PRIMARY KEY** called **id**
1. All tables who have a relation with another model or an extension of the same model, have a **KEY** which starts with the suffix **id_** followed by the model's name in singular (example: ​id_user​).


## TODO
1. Generate POST and PUT endpoints.
1. A good log handling
1. Update existing models
1. Automatic Swagger documentation
