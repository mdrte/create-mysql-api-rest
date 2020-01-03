const pluralize = require('pluralize')

module.exports = {
    /**
     * Verifies a string is written in lowercase
     * @param {string} str 
     * @returns {string} 
     */
    isLowerCase: (str) => {
        return str === str.toLowerCase();
    },

    /**
     * Verifies that all rules applied for a model are fulfilled
     * @param {string} tableName 
     * @param {object} tableObj
     * @returns {boolean} 
     */
    isValidModel: (tableName, tableObj) => {
        // All tables are written in lowercase
        if (!isLowerCase(tableName))
            return false
        // All tables that represent a relation must have as a suffix the model's name in singular
        const words = tableName.split('_')
        if (words.length > 0 && pluralize.isSingular(words[0]))
            return false
        // all models are plural
        // all models have a primary key called id 
        if (pluralize.isPlural(tableName) &&
            tableObj.id !== undefined && tableObj.id.primaryKey === true
        ) {
            return true
        }
        return false
    }
};