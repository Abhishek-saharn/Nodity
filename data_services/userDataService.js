const User = require('../models/User');

const userDataService = {
    insert: function(signupData) {
        User.insert(signupData)
            .then(successData => successData)
            .catch(signupErrorData => signupErrorData);
    }
}

module.exports = userDataService;