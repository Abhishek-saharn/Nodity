const userDataService = require('../data_services/userDataService');
const userController = {
    insert: function(data) {
        console.log(`In controller.`);
        const signupData = {
            userName: data.userName,
            email: data.email,
            password: data.password,
        }

        return new Promise((resolve, reject) => {
            userDataService.insert(signupData)
                .then(successData => resolve(successData))
                .catch(error => reject(error));
        });

    },
    find: function(data) {
        console.log(data)
        const loginData = {
            email: data.email,
            password: data.password,
        }

        return new Promise((resolve, reject) => {
            userDataService.find(loginData)
                .then(successData => resolve(successData))
                .catch(error => reject(error));
        });
    }
}

module.exports = userController;