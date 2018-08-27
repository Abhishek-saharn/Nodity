const userDataService = require('../data_services/userDataService');
const md5 = require('md5');
const userController = {
    insert: function(data) {
        console.log(`In controller.`);
        const signupData = {
            userName: data.userName,
            email: data.email,
            password: md5(data.password),
        }

        return new Promise((resolve, reject) => {
            userDataService.insert(signupData)
                .then(successData => resolve(successData))
                .catch(error => reject(error));
        });

    },
    findUser: function(data) {
        console.log(data)
        const loginData = {
            email: data.email,
            password: md5(data.password),
        }

        return new Promise((resolve, reject) => {
            userDataService.findUser(loginData)
                .then(successData => resolve(successData))
                .catch(error => reject(error));
        });
    }
}

module.exports = userController;