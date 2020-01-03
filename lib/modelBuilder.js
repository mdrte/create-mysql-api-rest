const fs = require('fs');
const path = require('path');
const path = require('./files');
const _ = Sequelize.Utils._;

/**
 * TODO: convert to class and initialize
 */
const quoteWrapper = '"';
const modelsPath = process.cwd() + '/models'

async function createFile(table) {
  var fileName = self.options.camelCaseForFileName ? _.camelCase(table) : table;
  fs.writeFile(path.resolve(path.join(self.options.directory, fileName + (self.options.typescript ? '.ts' : '.js'))), attributes[table], _callback);
}

module.exports = {
    /**
     * Create model for a table
     * @param {string} tableName 
     * @param {object} tableObj
     * @returns {Promise} 
     * 
     * 
     * TODO continue
     */
    create: (tableName, obj) => {

      await createFile(modelsPath, tableName, content)

      if (_.isEmpty(data)) {
        throw new Error(`No description found for "${tableName}" table. Check the table name and schema; remember, they _are_ case sensitive.`);
      }
    },

    /**
     * Parse sequelize model content
     * @param {string} tableName 
     * @param {object} tableObj
     * @returns {string} 
     * 
     * 
     * TODO: continue 
     */
    parseSequelizeConten: async (modeltableNamesPath, tableObj) => {
      const fileName = tableName + '.js'
      await fs.writeFile(path.resolve(path.join(modelsPath, fileName)), content);


      text[table] = "/* jshint indent: " + self.options.indentation + " */\n\n";
      text[table] += "module.exports = function(sequelize, DataTypes) {\n";
      text[table] += spaces + "return sequelize.define('" + tableName + "', {\n";

      return text

    },

    /**
     * Create the file for the model
     * @param {string} modelsPath 
     * @param {string} tableName
     * @returns {Promise} 
     */
    createFile: async (modelsPath, fileName, content) => {
      const fileName = tableName + '.js'
      await fs.writeFile(path.resolve(path.join(modelsPath, fileName)), content);

    },

    generateText: (table) => {
      async.each(_.keys(self.tables), function (table, _callback) {
        var fields = _.keys(self.tables[table]),
          spaces = '';

        for (var x = 0; x < self.options.indentation; ++x) {
          spaces += (self.options.spaces === true ? ' ' : "\t");
        }

        var tableName = self.options.camelCase ? _.camelCase(table) : table;
        var tsTableDef = self.options.typescript ? 'export interface ' + tableName + 'Attribute {' : '';

        text[table] = "/* jshint indent: " + self.options.indentation + " */\n\n";
        text[table] += "module.exports = function(sequelize, DataTypes) {\n";
        text[table] += spaces + "return sequelize.define('" + tableName + "', {\n";

        _.each(fields, function (field, i) {
          var additional = self.options.additional;
          if (additional && additional.timestamps !== undefined && additional.timestamps) {
            if ((additional.createdAt && field === 'createdAt' || additional.createdAt === field) ||
              (additional.updatedAt && field === 'updatedAt' || additional.updatedAt === field) ||
              (additional.deletedAt && field === 'deletedAt' || additional.deletedAt === field)) {
              return true
            }
          }
          // Find foreign key
          var foreignKey = self.foreignKeys[table] && self.foreignKeys[table][field] ? self.foreignKeys[table][field] : null

          if (_.isObject(foreignKey)) {
            self.tables[table][field].foreignKey = foreignKey
          }

          // column's attributes
          var fieldAttr = _.keys(self.tables[table][field]);
          var fieldName = self.options.camelCase ? _.camelCase(field) : field;
          text[table] += spaces + spaces + fieldName + ": {\n";


          // typescript
          var tsAllowNull = '';
          var tsVal = '';

          var isUnique = self.tables[table][field].foreignKey && self.tables[table][field].foreignKey.isUnique

          _.each(fieldAttr, function (attr, x) {
            var isSerialKey = self.tables[table][field].foreignKey && _.isFunction(self.dialect.isSerialKey) && self.dialect.isSerialKey(self.tables[table][field].foreignKey)

            // We don't need the special attribute from postgresql describe table..
            if (attr === "special") {
              return true;
            }

            if (attr === "foreignKey") {
              if (isSerialKey) {
                text[table] += spaces + spaces + spaces + "autoIncrement: true";
              } else if (foreignKey.isForeignKey) {
                text[table] += spaces + spaces + spaces + "references: {\n";
                text[table] += spaces + spaces + spaces + spaces + "model: \'" + self.tables[table][field][attr].foreignSources.target_table + "\',\n"
                text[table] += spaces + spaces + spaces + spaces + "key: \'" + self.tables[table][field][attr].foreignSources.target_column + "\'\n"
                text[table] += spaces + spaces + spaces + "}"
              } else return true
            } else if (attr === "primaryKey") {
              if (self.tables[table][field][attr] === true && (!_.has(self.tables[table][field], 'foreignKey') || (_.has(self.tables[table][field], 'foreignKey') && !!self.tables[table][field].foreignKey.isPrimaryKey)))
                text[table] += spaces + spaces + spaces + "primaryKey: true";
              else return true
            } else if (attr === "allowNull") {
              text[table] += spaces + spaces + spaces + attr + ": " + self.tables[table][field][attr];
              if (self.options.typescript) tsAllowNull = self.tables[table][field][attr];
            } else if (attr === "defaultValue") {
              if (self.sequelize.options.dialect === "mssql" && defaultVal && defaultVal.toLowerCase() === '(newid())') {
                defaultVal = null; // disable adding "default value" attribute for UUID fields if generating for MS SQL
              }

              var val_text = defaultVal;

              if (isSerialKey) return true

              //mySql Bit fix
              if (self.tables[table][field].type.toLowerCase() === 'bit(1)') {
                val_text = defaultVal === "b'1'" ? 1 : 0;
              }
              // mssql bit fix
              else if (self.sequelize.options.dialect === "mssql" && self.tables[table][field].type.toLowerCase() === "bit") {
                val_text = defaultVal === "((1))" ? 1 : 0;
              }

              if (_.isString(defaultVal)) {
                var field_type = self.tables[table][field].type.toLowerCase();
                if (_.endsWith(defaultVal, '()')) {
                  val_text = "sequelize.fn('" + defaultVal.replace(/\(\)$/, '') + "')"
                } else if (field_type.indexOf('date') === 0 || field_type.indexOf('timestamp') === 0) {
                  if (_.includes(['current_timestamp', 'current_date', 'current_time', 'localtime', 'localtimestamp'], defaultVal.toLowerCase())) {
                    val_text = "sequelize.literal('" + defaultVal + "')"
                  } else {
                    val_text = quoteWrapper + val_text + quoteWrapper
                  }
                } else {
                  val_text = quoteWrapper + val_text + quoteWrapper
                }
              }

              if (defaultVal === null || defaultVal === undefined) {
                return true;
              } else {
                val_text = _.isString(val_text) && !val_text.match(/^sequelize\.[^(]+\(.*\)$/) ? SqlString.escape(_.trim(val_text, '"'), null, self.options.dialect) : val_text;

                // don't prepend N for MSSQL when building models...
                val_text = _.trimStart(val_text, 'N')
                text[table] += spaces + spaces + spaces + attr + ": " + val_text;
              }
            } else if (attr === "type" && self.tables[table][field][attr].indexOf('ENUM') === 0) {
              text[table] += spaces + spaces + spaces + attr + ": DataTypes." + self.tables[table][field][attr];
            } else {
              var _attr = (self.tables[table][field][attr] || '').toLowerCase();
              var val = quoteWrapper + self.tables[table][field][attr] + quoteWrapper;

              if (_attr === "boolean" || _attr === "bit(1)" || _attr === "bit") {
                val = 'DataTypes.BOOLEAN';
              } else if (_attr.match(/^(smallint|mediumint|tinyint|int)/)) {
                var length = _attr.match(/\(\d+\)/);
                val = 'DataTypes.INTEGER' + (!_.isNull(length) ? length : '');

                var unsigned = _attr.match(/unsigned/i);
                if (unsigned) val += '.UNSIGNED'

                var zero = _attr.match(/zerofill/i);
                if (zero) val += '.ZEROFILL'
              } else if (_attr.match(/^bigint/)) {
                val = 'DataTypes.BIGINT';
              } else if (_attr.match(/^varchar/)) {
                var length = _attr.match(/\(\d+\)/);
                val = 'DataTypes.STRING' + (!_.isNull(length) ? length : '');
              } else if (_attr.match(/^string|varying|nvarchar/)) {
                val = 'DataTypes.STRING';
              } else if (_attr.match(/^char/)) {
                var length = _attr.match(/\(\d+\)/);
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
              }
              text[table] += spaces + spaces + spaces + attr + ": " + val;
              if (self.options.typescript) tsVal = val;
            }

            text[table] += ",";
            text[table] += "\n";
          });

          if (isUnique) {
            text[table] += spaces + spaces + spaces + "unique: true,\n";
          }

          if (self.options.camelCase) {
            text[table] += spaces + spaces + spaces + "field: '" + field + "',\n";
          }

          // removes the last `,` within the attribute options
          text[table] = text[table].trim().replace(/,+$/, '') + "\n";

          text[table] += spaces + spaces + "}";
          if ((i + 1) < fields.length) {
            text[table] += ",";
          }
          text[table] += "\n";

          // typescript, get definition for this field
          if (self.options.typescript) tsTableDef += tsHelper.def.getMemberDefinition(spaces, fieldName, tsVal, tsAllowNull);
        });

        text[table] += spaces + "}";

        //conditionally add additional options to tag on to orm objects
        var hasadditional = _.isObject(self.options.additional) && _.keys(self.options.additional).length > 0;

        text[table] += ", {\n";

        text[table] += spaces + spaces + "tableName: '" + table + "',\n";

        if (hasadditional) {
          _.each(self.options.additional, addAdditionalOption)
        }

        text[table] = text[table].trim();
        text[table] = text[table].substring(0, text[table].length - 1);
        text[table] += "\n" + spaces + "}";

        // typescript end table in definitions file
        if (self.options.typescript) typescriptFiles[0] += tsHelper.def.getTableDefinition(tsTableDef, tableName);

        function addAdditionalOption(value, key) {
          if (key === 'name') {
            // name: true - preserve table name always
            text[table] += spaces + spaces + "name: {\n";
            text[table] += spaces + spaces + spaces + "singular: '" + table + "',\n";
            text[table] += spaces + spaces + spaces + "plural: '" + table + "'\n";
            text[table] += spaces + spaces + "},\n";
          } else {
            value = _.isBoolean(value) ? value : ("'" + value + "'")
            text[table] += spaces + spaces + key + ": " + value + ",\n";
          }
        }

        //resume normal output
        text[table] += ");\n};\n";
        _callback(null);
      }, function () {
        self.sequelize.close();

        // typescript generate tables
        if (self.options.typescript) typescriptFiles[1] = tsHelper.model.generateTableModels(_.keys(text), self.options.spaces, self.options.indentation, self.options.camelCase, self.options.camelCaseForFileName);

        if (self.options.directory) {
          return self.write(text, typescriptFiles, callback);
        }
        return callback(false, text);
      });
    },

    write = function (attributes, typescriptFiles, callback) {
      var tables = _.keys(attributes);
      var self = this;

      mkdirp.sync(path.resolve(self.options.directory));

      async.each(tables, createFile, !self.options.eslint ? callback : function () {
        var engine = new CLIEngine({
          fix: true
        });
        var report = engine.executeOnFiles([self.options.directory]);
        CLIEngine.outputFixes(report);
        callback();
      });

      if (self.options.typescript) {
        if (typescriptFiles !== null && typescriptFiles.length > 1) {
          fs.writeFileSync(path.join(self.options.directory, 'db.d.ts'), typescriptFiles[0], 'utf8');
          fs.writeFileSync(path.join(self.options.directory, 'db.tables.ts'), typescriptFiles[1], 'utf8');
        }
      }


    };