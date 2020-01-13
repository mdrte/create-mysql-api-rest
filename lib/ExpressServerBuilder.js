'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Express server builder
 *
 * @class ExpressServerBuilder
 */
class ExpressServerBuilder {
    constructor() {
        this.fileName = 'app'
        this.filePath = process.cwd()
        this.routesPath = './routes'
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
    async create(routes) {
        try {
            console.log(`✔  ${fileName}.js file created.`)
            const content = this.parseContent(routes)
            await this.createFile(this.fileName, content)
        } catch (e) {
            console.log(`Something went wrong creating "${fileName}" file`, e)
        }
    }

    /**
     * Create a file for the model
     * @param {string} tableName
     * @returns {Promise} 
     */
    async createFile(tableName, content) {
        const fileName = tableName + '.js'
        await fs.writeFileSync(path.resolve(path.join(this.filePath, fileName)), content);
    }

    /**
     * Parse the text for the express routing content
     * @param {string[]} routes 
     * @returns {string} content of the route      
     */
    parseContent(routes) {

        const requirements = this.parseRequirements(routes)
        const useExpressions = this.parseUseExpressions(routes)
        const content =
            `'use strict'
const express = require('express')
const logger = require('morgan')
const port = process.env.PORT || 3000;

${requirements}

const app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({
  extended: false
}))

// create and use ./public folder to serve static content
app.use(express.static("./public"));

${useExpressions}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.status(404).json({
    error: "route not found"
  })
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  const error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500).json({
    message: err.message,
    error: error
  })
})

app.listen(port, () => console.log(\`Server started on \${port}\`))
`

        return content
    }

    /**
     * Parse the text for the express routing requirements
     * @param {string[]} routes 
     * @returns {string} content of the route      
     */
    parseRequirements(routes) {
        // include index route
        const content = `const indexRouter = require('${this.routesPath}/index')\n`
        // include each route
        for (const route in routes) {
            content += `const ${route}Router = require('${this.routesPath}/${route}')\n`
        }

        return content
    }

    /**
     * Parse the text for the express app.use() expressions
     * @param {string[]} routes 
     * @returns {string} content of the route      
     */
    parseUseExpressions(routes) {
        // use index route
        const content = "app.use('/', indexRouter)\n"
        // use each route
        for (const route in routes) {
            content += `app.use('/${route}',${this.routesPath}Router)\n`
        }

        return content
    }

}

module.exports = ExpressServerBuilder;