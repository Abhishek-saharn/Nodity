const mongoose = require('mongoose');
const Schema = mongoose.Schema;

function email_validator(email) {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

let customMail = [email_validator, "Email not valid"];

const UserShema = new Schema({
    userName: {
        type: String,
        required: true,

    },
    email: {
        type: String,
        unique: true,
        validate: customMail,
        required: true,
    },
    currentMoney: String,
    password: {
        type: String,
        required: true,

    },
    userType: {
        type: String,
        default: "user",
        required: true,
    },
    isAuth: {
        type: Boolean,
        default: false,
        required: true,
    }

});


UserShema.statics = {
    insert: function(signupData) {
        console.log(signupData);
        return new Promise((resolve, reject) => {
            const obj = {
                userName: signupData.userName,
                email: signupData.email,
                currentMoney: "1000",
                password: signupData.password,
            };
            this.create(obj)
                .then(data => {
                    return resolve(data);
                })
                .catch(error => reject(error));
        });
    },
    findUser: function(loginData) {
        return new Promise((resolve, reject) => {
            this.findOne({
                email: loginData.email,
                password: loginData.password
            }).then(data => {
                console.log(data);
                return resolve(data);
            }).catch(err => {
                return reject("Wrong Username/Password");
            });
        });
    }
}

module.exports = mongoose.model("User", UserShema);