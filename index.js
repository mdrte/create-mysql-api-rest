#!/usr/bin/env node

const Sequelize = require('sequelize')
const projectConfig = require(process.cwd() + '/config/config.json')
const fileUtils = require('./lib/files')
const tableUtils = require('./lib/tables')
const ModelBuilder = require('./lib/ModelBuilder')
const RoutingBuilder = require('./lib/RoutingBuilder')
const chalk = require('chalk');
const _ = require('lodash');

const sequelizeOptions = {
    dialect: 'mysql',
    logging: false
}
const modelsDir = '/models'
const routesDir = '/routes'
let sequelize
let queryInterface

let tables = []

async function run(config) {

    try {
        console.log(chalk.blue("Let's start connecting to the database...\n"))
        // initializing sequelize
        sequelize = new Sequelize(config.development.database, config.development.username, config.development.password, sequelizeOptions || {})
        queryInterface = sequelize.getQueryInterface()

        // create models directory
        await fileUtils.createDirectoryIfDoesntExist(process.cwd() + modelsDir)

        // create routes directory
        await fileUtils.createDirectoryIfDoesntExist(process.cwd() + routesDir)

        // obtain tables from database
        const tableNames = await queryInterface.showAllTables()
        console.log(tableNames.length, 'tables found:', tableNames)

        await Promise.all(tableNames.map(async (table) => {
            tables[table] = await queryInterface.describeTable(table)
        }));

        models = await buildModels(tables)
        await buildRouting(models)
        // console.log(tables)

        sequelize.close();
        console.log(chalk.green('\nProcess finished successfully.'))
        console.log(`You can find the created files inside the .${modelsDir} and .${routesDir} folders`)
    } catch (e) {
        console.log(chalk.red('Something went wrong:'), e)
    }
}

/**
 * Build models for an array of valid tables
 * @param {object[]} tables 
 */
async function buildModels(tables) {
    console.log('\nTrying to find models from MySQL...\n')
    let models = []
    try {
        // initializing the modelBuilder
        const modelBuilder = new ModelBuilder()

        for (const table in tables) {
            // skip loop if the property is from prototype
            if (!tables.hasOwnProperty(table)) continue;

            const obj = tables[table];
            if (modelBuilder.isValidModel(table, obj)) {
                models[table] = tables[table]
                console.log('✔  Model ' + table + ' discovered.')
                let foreignKeys = await mapForeignKeys(table)
                modelBuilder.create(table, obj, foreignKeys)


                for (var prop in obj) {
                    // skip loop if the property is from prototype
                    if (!obj.hasOwnProperty(prop)) continue;

                    //console.log(prop + " = " + obj[prop]);
                }
            }
        }
        return models
    } catch (e) {
        console.log(chalk.red('Something went wrong building mthe models:'), e)
    }
}

/**
 * Map the keys of a table
 * @param {object} table 
 * @returns {object} foreignKeys
 */
async function mapForeignKeys(table) {

    let foreignKeys = {}

    const sql = tableUtils.getForeignKeysQuery(table, sequelize.config.database)

    try {
        const response = await sequelize.query(sql, {
            type: sequelize.QueryTypes.SELECT,
            raw: true
        })

        response.forEach(ref => {

            ref = _.assign({
                source_table: table,
                source_schema: sequelize.options.database,
                target_schema: sequelize.options.database
            }, ref);

            if (!_.isEmpty(_.trim(ref.source_column)) && !_.isEmpty(_.trim(ref.target_column))) {
                ref.isForeignKey = true
                ref.foreignSources = _.pick(ref, ['source_table', 'source_schema', 'target_schema', 'target_table', 'source_column', 'target_column'])
            }

            if (_.isFunction(tableUtils.isUnique) && tableUtils.isUnique(ref))
                ref.isUnique = true

            if (_.isFunction(tableUtils.isPrimaryKey) && tableUtils.isPrimaryKey(ref))
                ref.isPrimaryKey = true

            if (_.isFunction(tableUtils.isSerialKey) && tableUtils.isSerialKey(ref))
                ref.isSerialKey = true

            foreignKeys[ref.source_column] = _.assign({}, foreignKeys[ref.source_column], ref);
        })
    } catch (e) {
        console.log(chalk.red('Error mapping foreign keys:'), e)
    }
    return foreignKeys
}

/**
 * Build models for an array of valid tables
 * @param {object[]} models 
 */
async function buildRouting(models) {
    console.log('\nBuilding routes for each model...')
    try {
        // initializing the routingBuilder
        const routingBuilder = new RoutingBuilder()

        for (const model in models) {
            // skip loop if the property is from prototype
            if (!models.hasOwnProperty(model)) continue;

            const obj = models[model];
            routingBuilder.create(model, obj, null)


            for (var prop in obj) {
                // skip loop if the property is from prototype
                if (!obj.hasOwnProperty(prop)) continue;

                //console.log(prop + " = " + obj[prop]);
            }
        }
    } catch (e) {
        console.log(chalk.red('Something went wrong building the routing:'), e)
    }
}

/**
 * TODO: use a good config manager
 */
run(projectConfig);