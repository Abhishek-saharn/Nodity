const tableDataService = require('../data_services/tableDataService');
const tableController = {
    insert: function(data) {
        console.log(`In controller.`);
        const tableData = {
            tableName: data.tableName,
            initialBootValue: data.initialBootValue,
            plotValue: data.plotValue
        }

        return new Promise((resolve, reject) => {
            tableDataService.insert(tableData)
                .then(successData => resolve(successData))
                .catch(error => reject(error));
        });

    },
}

module.exports = tableController;