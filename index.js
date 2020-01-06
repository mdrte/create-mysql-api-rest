const Sequelize = require('sequelize')
const defaultConfig = require('./config.json')
const fileUtils = require('./lib/files')
const ModelBuilder = require('./lib/ModelBuilder')

const sequelizeOptions = {
    dialect: 'mysql',
    logging: false
}
const modelsDir = '/models'
let sequelize
let queryInterface

let tables = []

async function run(config) {
    console.log('Trying to find models from MySQL...')
    try {
        // initializing sequelize
        sequelize = new Sequelize(config.database, config.username, config.password, sequelizeOptions || {})
        queryInterface = sequelize.getQueryInterface()

        // create models directory
        await fileUtils.createDirectoryIfDoesntExist(process.cwd() + modelsDir)

        const tableNames = await queryInterface.showAllTables()
        console.log(tableNames.length, 'tables found:', tableNames)

        await Promise.all(tableNames.map(async (table) => {
            tables[table] = await queryInterface.describeTable(table)
        }));

        await buildModels(tables)
        // console.log(tables)

        sequelize.close();
    } catch (e) {
        console.log('Something went wrong.', e)
    }
}


async function buildModels(tables) {
    try {
        // initializing the modelBuilder
        const modelBuilder = new ModelBuilder()

        for (const table in tables) {
            // skip loop if the property is from prototype
            if (!tables.hasOwnProperty(table)) continue;

            const obj = tables[table];
            if (modelBuilder.isValidModel(table, obj)) {
                console.log('✔ Model ' + table + ' discovered.')
                modelBuilder.create(table, obj)


                for (var prop in obj) {
                    // skip loop if the property is from prototype
                    if (!obj.hasOwnProperty(prop)) continue;

                    //console.log(prop + " = " + obj[prop]);
                }
            }
        }
    } catch (e) {
        console.log(e)
    }
}



/**
 * TODO: use a good config manager
 */
run(defaultConfig);