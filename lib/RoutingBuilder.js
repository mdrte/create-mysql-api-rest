'use strict';

const fs = require('fs');
const path = require('path');
const pluralize = require('pluralize')

/**
 * Express routing builder
 *
 * @class RoutingBuilder
 */
class RoutingBuilder {
    constructor() {
        this.routesPath = process.cwd() + '/routes'
        this.indentation = 2
        this.additional = {}
        this.dialect = 'mysql'
        this.timestamp = false
    }

    /**
     * Create model for a table
     * @param {string} tableName 
     * @param {object} tableObj
     * @returns {Promise} 
     * 
     * 
     * TODO continue
     */
    async create(tableName, tableObj, foreignKeys) {
        try {
            console.log('')
            const content = this.parseRouteContent(tableName, tableObj, foreignKeys)
            await this.createFile(tableName, content)

        } catch (e) {
            console.log(`Something went wrong creating "${tableName}" routing`, e)
        }
    }

    /**
     * Create a file for the model
     * @param {string} tableName
     * @returns {Promise} 
     */
    async createFile(tableName, content) {
        const fileName = tableName + '.js'
        await fs.writeFileSync(path.resolve(path.join(this.routesPath, fileName)), content);
    }

    /**
     * Parse the text for the express routing content
     * @param {string} tableName 
     * @param {object} tableObj
     * @returns {string} content of the route
     * 
     * TODO: capture fiels in post and put endpoint
     * TODO: handle relations 
     */
    parseRouteContent(tableName, tableObj, foreignKeys) {

        const getContent = this.parseGetContent(tableName)
        const postContent = this.parsePostContent(tableName)
        const putContent = this.parsePutContent(tableName)
        const deleteContent = this.parseDeleteContent(tableName)
        const content =
            `var express = require('express');
var router = express.Router();
var model = require('../models/index');

${getContent}
${postContent}
${putContent}
${deleteContent}    

module.exports = router;`

        return content
    }



    /**
     * Parse the text for the express GET routes (one element and a collection)
     * @param {string} tableName 
     * @returns {string} content of the routes
     * 
     * TODO: handle relations 
     */
    parseGetContent(tableName) {
        console.log(`✔     GET  /${tableName} created.`)
        console.log(`✔     GET  /${tableName}/:id created.`)

        const content = `    
/* GET ${pluralize.singular(tableName)}. */
router.get('/:id', async function (req, res, next) {
    try {
        const ${tableName} = await model.${tableName}.findOne({
            where: {
                id: req.params.id
            }
        })
        res.status(200).json({
            data: ${tableName}
        })
    } catch (error) {
        res.status(500).json({
            data: [],
            error: error
        })
    }
});

/* GET ${tableName} listing. */
router.get('/', async function (req, res, next) {
    try {
        const limit = req.query.limit ? req.query.limit : 1000;
        const offset = req.query.offset ? req.query.offset : 0;

        const result = await model.${tableName}.findAndCountAll({
            offset: parseInt(offset),
            limit: parseInt(limit)
        })
        res.status(200).json({
            data: result.rows,
            total: result.count
        })
    } catch (error) {
        res.status(500).json({
            data: [],
            error: error
        })
    }
});
`
        return content
    }

    /**
     * Parse the text for the express POST route
     * @param {string} tableName 
     * @returns {string} content of the route
     * 
     * TODO: capture fiels
     * TODO: handle relations 
     */
    parsePostContent(tableName) {
        console.log(`✔    POST  /${tableName} created.`)

        const content = `
/* CREATE ${pluralize.singular(tableName)}. */
router.post('/', async function (req, res, next) {
    try {
        const {
            description
        } = req.body;
        const ${tableName} = await model.${tableName}.create({
            description: description
        })
        res.status(201).json({
            data: ${tableName},
            message: 'New ${pluralize.singular(tableName)} has been created.'
        })
    } catch (error) {
        error => res.status(500).json({
            data: [],
            error: error
        })
    }
});
`
        return content
    }

    /**
     * Parse the text for the express PUT route
     * @param {string} tableName 
     * @returns {string} content of the route
     * 
     * TODO: capture fiels
     * TODO: handle relations 
     */
    parsePutContent(tableName) {
        console.log(`✔     PUT  /${tableName}/:id created.`)

        const content = `
/* UDPATE ${pluralize.singular(tableName)}. */
router.put('/:id', async function (req, res, next) {
    try {
        const id = req.params.id;

        const {
            description
        } = req.body;

        const result = await model.${tableName}.update({
            description: description
        }, {
            where: {
                id: id
            }
        })

        if (result[0] > 0) {
            res.status(200).json({
                message: '${pluralize.singular(tableName)} has been updated.'
            })
        } else {
            res.status(200).json({
                message: '${pluralize.singular(tableName)} has not been modified.'
            })
        }

    } catch (error) {
        res.status(500).json({
            error: error
        })
    }
})
`
        return content
    }

    /**
     * Parse the text for the express DELETE route
     * @param {string} tableName 
     * @returns {string} content of the route
     * 
     * TODO: handle relations 
     */
    parseDeleteContent(tableName) {
        console.log(`✔  DELETE  /${tableName}/:id created.`)

        const content = `
/* DELETE ${pluralize.singular(tableName)}. */
router.delete('/:id', async function (req, res, next) {
    const id = req.params.id;
    try {
        const result = await model.${tableName}.destroy({
            where: {
                id: id
            }
        })

        if (result > 0) {
            res.status(200).json({
                message: '${pluralize.singular(tableName)} has been deleted.'
            })
        } else {
            res.status(400).json({
                message: '${pluralize.singular(tableName)} has not been found.'
            })
        }

    } catch (error) {
        res.status(500).json({
            error: error
        })
    }
});
`
        return content
    }

    /**
     * Create an index route for the project
     * @returns {Promise} 
     * 
     */
    async addIndexRoute() {
        try {
            console.log('✔ GET / route added.')
            const content =
                `const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.json({
    'message': 'Welcome to this App! Everything is running just fine.'
  })
});

module.exports = router;`
            await this.createFile('index', content)

        } catch (e) {
            console.log(`Something went wrong creating "${tableName}" routing`, e)
        }
    }

}

module.exports = RoutingBuilder;