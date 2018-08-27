const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let tableSchema = new Schema({
    tableName: { type: String, require: true },
    createdOn: { type: String, default: Date.now },
    initialBootValue: { type: Number },
    plotValue: { type: Number }
});

tableSchema.statics = {
    insert: function(tableData) {
        return new Promise((resolve, reject) => {
            const obj = {
                tableName: tableData.tableName,
                initialBootValue: tableData.initialBootValue,
                plotValue: tableData.plotValue
            }

            this.create(obj)
                .then((returnedTableData) => {
                    return resolve(returnedTableData);
                })
                .catch(error => {
                    return reject(error);
                });

        });
    }
}



module.exports = mongoose.model("Table", tableSchema);