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
};