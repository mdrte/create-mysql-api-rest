# mysql-api-rest-generator
This is a package for automatically generate REST API from a MySQL database.
It basically connects to a database , reads all the tables, builds the models and relations from the data structure and allows the user to automatically generate REST (GET and DELETE)endpoints in a Express application.

## Requirements
* Sequelize
* Sequelize-cli

## Database tables naming
To work properly, this package, requires that the tables are named as follows:

1. All table's names must be lowercase (example: ​users)
1. All table's names must be in English (example: devices)
1. In case of having and space in the table's name it must e replaced by a underscore 
(example: ​device_brands​).
1. All tables that represent a **model** must be in plural (example: ​devices​).
1. All tables that represent a **relation** must have as a suffix the model's name in singular (example: ​device_brands​ where ​device​ is the model).  
1. There are two types of relations:
    1. **Betewen models** (example: ​organization_users​ where the model is ​organizations​ and the other is ​users​, as this 2 tables are written in plural, by the which are models)
    1. **Extensions of a same model** (example: ​device_brands​ where the model is ​devices​ and has attributes (1 o more) extensible/relation with ​device_brands​).
1. All tables have a **PRIMARY KEY** call **id**
1. All tables who have a relation with another model or an extension of the same model, have a **KEY** which starts with the suffix **id_** and then the model's name in singular (example: ​id_user​).



## TODO
1. Generate POST and PUT endpoints.
1. A good log handling
1. Automatic Swagger documentation