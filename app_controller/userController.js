const userDataService = require('../data_services/userDataService');

const userController = {
    insert: function(signupdata) {
        userDataService.insert(signupdata)
            .then(successData => {
                console.log(successData);
            })
            .catch(error => {
                console.log(error);
            });
    }
}

module.exports = userController;