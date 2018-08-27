const Table = require('../models/Table');

const tableDataService = {
    insert: function(tableData) {
        return new Promise((resolve, reject) => {
            Table.insert(tableData)
                .then(successData => resolve(successData))
                .catch(tableErrorData => {
                    console.log(tableErrorData);
                    return reject(tableErrorData);
                });
        });
    }
}

module.exports = tableDataService