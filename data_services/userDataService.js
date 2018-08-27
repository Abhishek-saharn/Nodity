const User = require('../models/User');

const userDataService = {
    insert: function(signupData) {

        return new Promise((resolve, reject) => {
            User.insert(signupData)
                .then(successData => resolve(signupData))
                .catch(signupErrorData => {
                    console.log(signupErrorData);
                    return reject(signupErrorData);
                });
        });
    },
    findUser: function(loginData) {

        return new Promise((resolve, reject) => {
            User.findUser(loginData)
                .then(successData => resolve(successData))
                .catch(error => reject(error));
        });
    }
}

module.exports = userDataService;