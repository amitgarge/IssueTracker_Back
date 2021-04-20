const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('../libs/timeLib');
const response = require('../libs/responseLib')
const logger = require('../libs/loggerLib');
const validateInput = require('../libs/paramsValidationLib')
const check = require('../libs/checkLib');
const token = require('../libs/tokenLib');
const passwordLib = require('../libs/generatePasswordLib')
const cloudinary = require('../libs/cloudinaryLib')

/* Models */
const UserModel = mongoose.model('User')
const AuthModel = mongoose.model('Auth');

// start user signup function 
let signUpFunction = (req, res) => {
    let validateUserInput = () => {
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                if (!validateInput.Email(req.body.email)) {
                    let apiResponse = response.generate(true, 'Email does not meet the requirement', 400, null);
                    reject(apiResponse);
                } else if (check.isEmpty(req.body.password)) {
                    let apiResponse = response.generate(true, 'Password is missing', 400, null);
                    reject(apiResponse);
                } else {
                    resolve(req);
                }
            } else {
                logger.error('Field missing during User creation', 'userController.signUpFunction.validateUserInput', 5);
                let apiResponse = response.generate(true, 'One or more parameter is missing', 404, null);
                reject(apiResponse);
            }
        });
    }

    let createUser = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({ email: req.body.email })
                .exec((err, retrievedUserDetails) => {

                    if (err) {
                        logger.error(err.message, 'userController.signupFunction.createUser()', 10);
                        let apiResponse = response.generate(true, 'Operation Failed', 500, null);
                        reject(apiResponse)
                    } else if (check.isEmpty(retrievedUserDetails)) {

                        console.log(req.body);

                        let newUser = new UserModel({
                            userId: shortid.generate(),
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            userType: req.body.userType,
                            email: req.body.email.toLowerCase(),
                            password: passwordLib.hashpassword(req.body.password),
                            mobileNumber: req.body.mobileNumber,
                            createdOn: time.now(),
                            modifiedOn: time.now()
                        });

                        newUser.save((err, newUser) => {

                            if (err) {

                                logger.error(err.message, 'userController.signUpFunction().createUser()', 10)
                                let apiResponse = response.generate(true, 'Failed to create new User', 500, null)
                                reject(apiResponse)

                            } else {

                                let newFrancObj = newUser.toObject();
                                resolve(newFrancObj)
                            }
                        });

                    } else {

                        logger.error('User cannot be created. Frachisee already present.', 'userController.signUpFunction().createUser()', 4)
                        let apiResponse = response.generate(true, 'User already present with this email ID', 403, null);
                        reject(apiResponse);
                    }
                })
        })
    }

    validateUserInput(req, res)
        .then(createUser)
        .then((resolve) => {
            delete resolve.password
            let apiResponse = response.generate(false, 'User created sucessfully', 200, resolve)
            res.send(apiResponse)
        })
        .catch((err) => {
            logger.error(err.message, 'userController.signUpFunction.catchBlock', 10);
            let apiResponse = response.generate(true, 'User creation failed', 500, null)
            res.send(apiResponse);
        })
}// end user signup function 

// start of login function 
let loginFunction = (req, res) => {

    let findUser = () => {

        console.log("findUser");
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                console.log("req body email is there");
                console.log(req.body);
                UserModel.findOne({ email: req.body.email }, (err, UserDetails) => {
                    /* handle the error here if the User is not found */
                    if (err) {
                        console.log(err)
                        logger.error('Failed To Retrieve User Data', 'userController: findUser()', 10)
                        /* generate the error message and the api response message here */
                        let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                        reject(apiResponse)
                        /* if Company Details is not found */
                    } else if (check.isEmpty(UserDetails)) {
                        /* generate the response and the console error message here */
                        logger.error('No User Found', 'userController: findUser()', 7)
                        let apiResponse = response.generate(true, 'No User Details Found', 404, null)
                        reject(apiResponse)
                    } else {
                        /* prepare the message and the api response here */
                        logger.info('User Found', 'userController: findUser()', 10)
                        resolve(UserDetails)
                    }
                });

            } else {
                let apiResponse = response.generate(true, '"email" parameter is missing', 400, null)
                reject(apiResponse)
            }
        })
    }

    let validatePassword = (retrievedUserDetails) => {
        console.log("validatePassword");
        return new Promise((resolve, reject) => {
            passwordLib.comparePassword(req.body.password, retrievedUserDetails.password, (err, isMatch) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'userController: validatePassword()', 10)
                    let apiResponse = response.generate(true, 'Login Failed', 500, null)
                    reject(apiResponse)
                } else if (isMatch) {
                    let retrievedUserDetailsObj = retrievedUserDetails.toObject()
                    delete retrievedUserDetailsObj.password
                    delete retrievedUserDetailsObj._id
                    delete retrievedUserDetailsObj.__v
                    delete retrievedUserDetailsObj.created_on
                    delete retrievedUserDetailsObj.modified_on
                    resolve(retrievedUserDetailsObj)
                } else {
                    logger.info('Login Failed Due To Invalid Password', 'userController: validatePassword()', 10)
                    let apiResponse = response.generate(true, 'Wrong Password.Login Failed', 400, null)
                    reject(apiResponse)
                }
            });
        });
    }
    let generateToken = (UserDetails) => {
        console.log("generate token");
        return new Promise((resolve, reject) => {
            token.generateToken(UserDetails, (err, tokenDetails) => {
                if (err) {
                    console.log(err)
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else {
                    tokenDetails.userId = UserDetails.userId
                    tokenDetails.UserDetails = UserDetails
                    resolve(tokenDetails)
                }
            })
        })
    }
    let saveToken = (tokenDetails) => {
        console.log("save token");
        return new Promise((resolve, reject) => {
            AuthModel.findOne({ userId: tokenDetails.userId }, (err, retrievedTokenDetails) => {
                if (err) {
                    console.log(err.message, 'userController: saveToken', 10)
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(retrievedTokenDetails)) {
                    let newAuthToken = new AuthModel({
                        userId: tokenDetails.userId,
                        authToken: tokenDetails.token,
                        tokenSecret: tokenDetails.tokenSecret,
                        tokenGenerationTime: time.now()
                    });
                    newAuthToken.save((err, newTokenDetails) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                UserDetails: tokenDetails.UserDetails
                            }
                            resolve(responseBody)
                        }
                    });
                } else {
                    retrievedTokenDetails.authToken = tokenDetails.token
                    retrievedTokenDetails.tokenSecret = tokenDetails.tokenSecret
                    retrievedTokenDetails.tokenGenerationTime = time.now()
                    retrievedTokenDetails.save((err, newTokenDetails) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                UserDetails: tokenDetails.UserDetails
                            }
                            resolve(responseBody)
                        }
                    });
                }
            });
        });
    }

    findUser(req, res)
        .then(validatePassword)
        .then(generateToken)
        .then(saveToken)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Login Successful', 200, resolve)
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log("errorhandler");
            console.log(err);
            res.status(err.status)
            res.send(err)
        });
}
// end of the login function 

let logout = (req, res) => {
    AuthModel.findOneAndRemove({ userId: req.body.userId }, (err, result) => {

        if (err) {

            console.log(err)
            logger.error(err.message, 'userController: logout', 10)
            let apiResponse = response.generate(true, `error occurred: ${err.message}`, 500, null)
            res.send(apiResponse)

        } else if (check.isEmpty(result)) {

            let apiResponse = response.generate(true, 'Already Logged Out or Invalid userId', 404, null)
            res.send(apiResponse)

        } else {

            let apiResponse = response.generate(false, 'Logged Out Successfully', 200, null)
            res.send(apiResponse)
        }
    })
} // end of the logout function.

let updateUserDetails = (req, res) => {
    let options = req.body;

    options.modifiedOn = time.now();

    UserModel.updateOne({ 'userId': req.body.userId }, options).exec((err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'UserController:updateUserDetails', 10)
            let apiResponse = response.generate(true, 'Failed To edit User details', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            logger.info('No User details Found', 'UserController: updateUserDetails')
            let apiResponse = response.generate(true, 'No User details Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'User details edited', 200, result)
            res.send(apiResponse)
        }
    });
}

let deleteUser = (req, res) => {
    if (check.isEmpty(req.params.userId)) {

        console.log('userId should be passed')
        let apiResponse = response.generate(true, 'userId is missing', 403, null)
        res.send(apiResponse)
    } else {

        UserModel.remove({ 'userId': req.params.userId }, (err, result) => {
            if (err) {
                console.log('Error Occured.')
                logger.error(`Error Occured : ${err}`, 'Database', 10)
                let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                console.log('User Not Found.')
                let apiResponse = response.generate(true, 'User Not Found.', 404, null)
                res.send(apiResponse)
            } else {
                console.log('User Deletion Success')
                let apiResponse = response.generate(false, 'User Deleted Successfully', 200, result)
                res.send(apiResponse)
            }
        })
    }
}

let getAllUsers = (req, res) => {
    UserModel.find()
    .populate("projects","-__v -_id -users")
        .select('-__v -_id -password')
        .lean()
        .exec((err, result) => {
            if (err) {
                logger.error(err.message, 'User Controller: getAllUsers', 10)
                let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No User Found', 'User Controller: getAllUser')
                let apiResponse = response.generate(true, 'No User Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'All User Details Found', 200, result)
                res.send(apiResponse)
            }
        })
}

let getUserById = (req, res) => {
    if (check.isEmpty(req.body._userId)) {

        console.log('_userId should be passed')
        let apiResponse = response.generate(true, '_userId is missing', 403, null)
        res.send(apiResponse)
    } else {

        UserModel.findById(req.body._userId).populate("projects", "-_id -__v -users").select('-__v -_id').exec((err, result) => {

            if (err) {
                logger.error(`Error Occured : ${err}`, 'Database', 10)
                let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {

                console.log('User Not Found.')
                let apiResponse = response.generate(true, 'User Not Found', 404, null)
                res.send(apiResponse)
            } else {
                logger.info("User found successfully", "userController:getUserById", 5)
                let apiResponse = response.generate(false, 'User Found Successfully.', 200, result)
                res.send(apiResponse)
            }
        });
    }
}

module.exports = {

    signUpFunction: signUpFunction,
    loginFunction: loginFunction,
    logout: logout,
    updateUserDetails: updateUserDetails,
    deleteUser: deleteUser,
    getAllUsers: getAllUsers,
    getUserById: getUserById
}// end exports