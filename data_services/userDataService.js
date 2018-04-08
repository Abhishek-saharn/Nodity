const User = require('../models/User');

const userDataService = {
    insert: function(signupData) {

        console.log(`>>>>>>> ${JSON.stringify(signupData)}`);

        return new Promise((resolve, reject) => {
            User.insert(signupData)
                .then(successData => resolve(signupData))
                .catch(signupErrorData => {
                    console.log(signupErrorData);
                    return reject(signupErrorData);
                });
        });
    },
    find: function(loginData) {

        return new Promise((resolve, reject) => {
            User.findUser(loginData)
                .then(successData => resolve(successData))
                .catch(error => reject(error));
        });
    }
}

module.exports = userDataService;