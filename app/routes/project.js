const express = require('express');
const router = express.Router();
const projectController = require("./../../app/controllers/projectController");
const appConfig = require("./../../config/appConfig")

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/projects`;

    // defining routes.


    // params: firstName, lastName, email, mobileNumber, password
    app.post(`${baseUrl}/createProject`, projectController.createProject);

    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/login api for user login.
     *
     * @apiParam {string} email email of the user. (body params) (required)
     * @apiParam {string} password password of the user. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Login Successful",
            "status": 200,
            "data": {
                "authToken": "eyJhbGciOiJIUertyuiopojhgfdwertyuVCJ9.MCwiZXhwIjoxNTIwNDI29tIiwibGFzdE5hbWUiE4In19.hAR744xIY9K53JWm1rQ2mc",
                "userDetails": {
                "mobileNumber": 2234435524,
                "email": "someone@mail.com",
                "lastName": "Sengar",
                "firstName": "Rishabh",
                "userId": "-E9zxTYA8"
            }

        }
    */


    app.put(`${baseUrl}/linkProjectWithUser`, projectController.linkProjectWithUser);

    app.put(`${baseUrl}/updateProject`, projectController.updateProject);

    app.post(`${baseUrl}/deleteProject`, projectController.deleteProject);

    app.post(`${baseUrl}/getAllProjectDetails`, projectController.getAllProjectDetails)

    app.post(`${baseUrl}/getProjectById`, projectController.getProjectById)
}
