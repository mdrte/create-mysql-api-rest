'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const pluralize = require('pluralize')
var SqlString = require('./sql-string');
const tableUtils = require('./tables')
// const CLIEngine = require('eslint').CLIEngine;

/**
 * Sequelize model builder
 *
 * @class ModelBuilder
 */
class ModelBuilder {
  constructor() {
    this.modelsPath = process.cwd() + '/models'
    this.indentation = 2
    this.additional = {}
    this.dialect = 'mysql'
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
  async create(tableName, tableObj) {
    try {
      const content = this.parseModelContent(tableName, tableObj)
      await this.createFile(tableName, content)

    } catch (e) {
      console.log(`Something went wrong creating "${tableName}" model`, e)
    }
  }

  /**
   * Create a file for the model
   * @param {string} tableName
   * @returns {Promise} 
   */
  async createFile(tableName, content) {
    const fileName = tableName + '.js'
    await fs.writeFileSync(path.resolve(path.join(this.modelsPath, fileName)), content);
  }

  /**
   * Parse the text for a sequelize model content
   * @param {string} tableName 
   * @param {object} tableObj
   * @returns {string} content of the sequelize model
   * 
   * 
   * TODO: continue 
   */
  parseModelContent(tableName, tableObj) {
    const spaces = " ".repeat(this.indentation)
    let text = ''
    text = `/* ${tableName} model */\n`;
    text += "module.exports = function(sequelize, DataTypes) {\n";
    text += spaces + `return sequelize.define('${tableName}', {\n`;

    // parse fields of the table object
    const fields = _.keys(tableObj)
    fields.forEach((field) => {
      text += this.parseField(field, tableObj[field])
    });

    // close the file
    text += spaces + "}";

    //conditionally add additional options to tag on to orm objects
    var hasadditional = _.isObject(this.additional) && _.keys(this.additional).length > 0;

    text += ", {\n";

    text += spaces + spaces + "tableName: '" + tableName + "',\n";

    if (hasadditional) {
      _.each(this.additional, (value, key) => {
        if (key === 'name') {
          // name: true - preserve table name always
          text += spaces + spaces + "name: {\n";
          text += spaces + spaces + spaces + "singular: '" + tableName + "',\n";
          text += spaces + spaces + spaces + "plural: '" + tableName + "'\n";
          text += spaces + spaces + "},\n";
        } else {
          value = _.isBoolean(value) ? value : ("'" + value + "'")
          text += spaces + spaces + key + ": " + value + ",\n";
        }
      })
    }

    text = text.trim();
    text = text.substring(0, text.length - 1);
    text += "\n" + spaces + "}";


    //resume normal output
    text += ");\n};\n";

    return text
  }

  /**
   * Parse a table field in a sequelize model form and returns a concated text
   * @param {string} fieldName
   * @param {object} fieldDefinition 
   * @returns {string} 
   * 
   * 
   * TODO: continue 
   */
  parseField(fieldName, fieldDefinition) {
    const spaces = " ".repeat(this.indentation)
    const additional = this.additional;
    const dialect = this.dialect;
    const parseTypeAttr = this.parseTypeAttr
    let text = ''

    if (additional && additional.timestamps !== undefined && additional.timestamps) {
      if ((additional.createdAt && field === 'createdAt' || additional.createdAt === field) ||
        (additional.updatedAt && field === 'updatedAt' || additional.updatedAt === field) ||
        (additional.deletedAt && field === 'deletedAt' || additional.deletedAt === field)) {
        return true
      }
    }

    // Find foreign key
    // var foreignKey = self.foreignKeys[table] && self.foreignKeys[table][field] ? self.foreignKeys[table][field] : null
    const foreignKey = null

    if (_.isObject(foreignKey)) {
      fieldDefinition.foreignKey = foreignKey
    }

    // column's attributes
    const fieldAttr = _.keys(fieldDefinition);
    text += spaces + spaces + fieldName + ": {\n";

    let defaultVal = fieldDefinition.defaultValue;

    // ENUMs
    if (fieldDefinition.type === "USER-DEFINED" && !!fieldDefinition.special) {
      fieldDefinition.type = "ENUM(" + fieldDefinition.special.map((f) => {
        return quoteWrapper + f + quoteWrapper;
      }).join(',') + ")";
    }

    const isUnique = fieldDefinition.foreignKey && fieldDefinition.foreignKey.isUnique

    _.each(fieldAttr, function (attr) {
      const isSerialKey = fieldDefinition.foreignKey && _.isFunction(self.dialect.isSerialKey) && self.dialect.isSerialKey(fieldDefinition.foreignKey)
      switch (attr) {
        case "foreignKey":
          if (isSerialKey) {
            text += spaces + spaces + spaces + "autoIncrement: true";
          } else if (foreignKey.isForeignKey) {
            text += spaces + spaces + spaces + "references: {\n";
            text += spaces + spaces + spaces + spaces + "model: \'" + fieldDefinition[attr].foreignSources.target_table + "\',\n"
            text += spaces + spaces + spaces + spaces + "key: \'" + fieldDefinition[attr].foreignSources.target_column + "\'\n"
            text += spaces + spaces + spaces + "}"
          } else return true
          break
        case "primaryKey":
          if (fieldDefinition[attr] === true && (!_.has(fieldDefinition, 'foreignKey') || (_.has(fieldDefinition, 'foreignKey') && !!fieldDefinition.foreignKey.isPrimaryKey))) {
            text += spaces + spaces + spaces + "primaryKey: true";
          } else return true
        case "allowNull":
          text += spaces + spaces + spaces + attr + ": " + fieldDefinition[attr];
          break
        case "defaultValue":
          let val_text = defaultVal;

          if (isSerialKey) return true

          //mySql Bit fix
          if (fieldDefinition.type.toLowerCase() === 'bit(1)') {
            val_text = defaultVal === "b'1'" ? '1' : '0';
          }

          if (_.isString(defaultVal)) {
            const field_type = fieldDefinition.type.toLowerCase();
            if (_.endsWith(defaultVal, '()')) {
              val_text = "sequelize.fn('" + defaultVal.replace(/\(\)$/, '') + "')"
            } else if (field_type.indexOf('date') === 0 || field_type.indexOf('timestamp') === 0) {
              if (_.includes(['current_timestamp', 'current_date', 'current_time', 'localtime', 'localtimestamp'], defaultVal.toLowerCase())) {
                val_text = `sequelize.literal('${defaultVal}')`
              } else {
                val_text = `'${val_text}'`
              }
            } else {
              val_text = `'${val_text}'`
            }
          }

          if (defaultVal === null || defaultVal === undefined) {
            return true;
          } else {
            val_text = _.isString(val_text) && !val_text.match(/^sequelize\.[^(]+\(.*\)$/) ? SqlString.escape(_.trim(val_text, '"'), null, dialect) : val_text;

            // don't prepend N for MSSQL when building models...
            val_text = _.trimStart(val_text, 'N')
            text += spaces + spaces + spaces + attr + ": " + val_text;
          }
          break
        default:
          if (attr === "type" && fieldDefinition[attr].indexOf('ENUM') === 0) {
            text += spaces + spaces + spaces + attr + ": DataTypes." + fieldDefinition[attr]
          }
          let val = parseTypeAttr(fieldDefinition[attr])
          text += spaces + spaces + spaces + attr + ": " + val;
      }
      text += ",";
      text += "\n";
    });

    if (isUnique) {
      text += spaces + spaces + spaces + "unique: true,\n";
    }

    text += spaces + spaces + "}";
    text += ",";
    text += "\n";
    return text
  }

  /**
   * Parse type attribute for the field
   * @param {string} attributte attribute value
   * @returns {string} parsed text to describe type attribute
   */
  parseTypeAttr(attributte) {
    let length = 0
    let val = ''
    const _attr = (attributte || '').toString().toLowerCase()
    if (_attr === "boolean" || _attr === "bit(1)" || _attr === "bit") {
      val = 'DataTypes.BOOLEAN';
    } else if (_attr.match(/^(smallint|mediumint|tinyint|int)/)) {
      length = _attr.match(/\(\d+\)/);
      val = 'DataTypes.INTEGER' + (!_.isNull(length) ? length : '');

      const unsigned = _attr.match(/unsigned/i);
      if (unsigned) val += '.UNSIGNED'

      const zero = _attr.match(/zerofill/i);
      if (zero) val += '.ZEROFILL'
    } else if (_attr.match(/^bigint/)) {
      val = 'DataTypes.BIGINT';
    } else if (_attr.match(/^varchar/)) {
      length = _attr.match(/\(\d+\)/);
      val = 'DataTypes.STRING' + (!_.isNull(length) ? length : '');
    } else if (_attr.match(/^string|varying|nvarchar/)) {
      val = 'DataTypes.STRING';
    } else if (_attr.match(/^char/)) {
      length = _attr.match(/\(\d+\)/);
      val = 'DataTypes.CHAR' + (!_.isNull(length) ? length : '');
    } else if (_attr.match(/^real/)) {
      val = 'DataTypes.REAL';
    } else if (_attr.match(/text|ntext$/)) {
      val = 'DataTypes.TEXT';
    } else if (_attr === "date") {
      val = 'DataTypes.DATEONLY';
    } else if (_attr.match(/^(date|timestamp)/)) {
      val = 'DataTypes.DATE';
    } else if (_attr.match(/^(time)/)) {
      val = 'DataTypes.TIME';
    } else if (_attr.match(/^(float|float4)/)) {
      val = 'DataTypes.FLOAT';
    } else if (_attr.match(/^decimal/)) {
      val = 'DataTypes.DECIMAL';
    } else if (_attr.match(/^(float8|double precision|numeric)/)) {
      val = 'DataTypes.DOUBLE';
    } else if (_attr.match(/^uuid|uniqueidentifier/)) {
      val = 'DataTypes.UUIDV4';
    } else if (_attr.match(/^jsonb/)) {
      val = 'DataTypes.JSONB';
    } else if (_attr.match(/^json/)) {
      val = 'DataTypes.JSON';
    } else if (_attr.match(/^geometry/)) {
      val = 'DataTypes.GEOMETRY';
    } else {
      val = `'${attributte}'`
    }
    return val
  }

  /**
   * Verifies that all rules applied for a model are fulfilled
   * @param {string} tableName 
   * @param {object} tableObj
   * @returns {boolean} 
   */
  isValidModel(tableName, tableObj) {
    // All tables are written in lowercase
    if (!tableUtils.isLowerCase(tableName))
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

  // /**
  //  * It writes the content of the model in the generated file
  //  */
  // async write(attributes) {
  //   var tables = _.keys(attributes);
  //   var self = this;

  //   mkdirp.sync(path.resolve(this.modelsPath));

  //   async.each(tables, this.createFile, function () {
  //     var engine = new CLIEngine({
  //       fix: true
  //     });
  //     var report = engine.executeOnFiles([this.modelsPath]);
  //     CLIEngine.outputFixes(report);
  //     callback();
  //   });
  // };

}

module.exports = ModelBuilder;