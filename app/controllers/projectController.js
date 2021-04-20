const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('../libs/timeLib');
const response = require('../libs/responseLib')
const logger = require('../libs/loggerLib');
const check = require('../libs/checkLib');

/* Models */
const ProjectModel = mongoose.model("Project");
const UserModel = mongoose.model("User");

let createProject = (req, res) => {

    let addProjectDetails = () => {
        return new Promise((resolve, reject) => {
            ProjectModel.findOne({ projectName: req.body.projectName })
                .exec((err, retrievedProjectDetails) => {

                    if (err) {
                        logger.error(err.message, 'projectController.createProject.addProjectDetails()', 10);
                        let apiResponse = response.generate(true, 'Operation Failed', 500, null);
                        reject(apiResponse)
                    } else if (check.isEmpty(retrievedProjectDetails)) {

                        console.log(req.body);

                        let newProject = new ProjectModel({
                            projectId: shortid.generate(),
                            projectName: req.body.projectName,
                            projectKey: req.body.projectKey,
                            createdOn: time.now(),
                            modifiedOn: time.now()
                        });

                        newProject.save((err, newProject) => {

                            if (err) {

                                logger.error(err.message, 'projectController.createProject().addProjectDetails()', 10)
                                let apiResponse = response.generate(true, 'Failed to create new project', 500, null)
                                reject(apiResponse)

                            } else {

                                let newProjObj = newProject.toObject();
                                resolve(newProjObj)
                            }
                        });

                    } else {

                        logger.error('Project cannot be created. Project already present.', 'projectController.createProject().addProjectDetails()', 4)
                        let apiResponse = response.generate(true, 'Project already present with this name', 403, null);
                        reject(apiResponse);
                    }
                })
        })
    }

    addProjectDetails(req, res)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Project created sucessfully', 200, resolve)
            res.send(apiResponse)
        })
        .catch((err) => {
            logger.error(err.message, 'projectController.createProject().catchBlock', 10);
            let apiResponse = response.generate(true, 'Project creation failed', 500, null)
            res.send(apiResponse);
        })
}

let linkProjectWithUser = (req, res) => {

    let adduserIdToProject = () => {

        return new Promise((resolve, reject) => {

            ProjectModel.findOneAndUpdate({ '_id': req.body._projectId },
                { $push: { users: req.body._userId } },
                { new: true, useFindAndModify: false }
            ).exec((err, result) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'ProjectController:adduserIdToProject', 10)
                    let apiResponse = response.generate(true, 'Failed To add user to the project', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(result)) {
                    logger.info('No Project details Found for linking', 'ProjectController: adduserIdToProject')
                    let apiResponse = response.generate(true, 'No Project details Found for linking', 404, null)
                    reject(apiResponse)
                } else {
                    let apiResponse = response.generate(false, 'Success! User added to the project successfully.', 200, result)
                    resolve(apiResponse)
                }
            });
        });
    }

    let addprojectIdToUser = () => {

        return new Promise((resolve, reject) => {

            UserModel.findOneAndUpdate({ '_id': req.body._userId },
                { $push: { projects: req.body._projectId } },
                { new: true, useFindAndModify: false }
            ).exec((err, result) => {

                if (err) {
                    console.log(err)
                    logger.error(err.message, 'ProjectController:addprojectIdToUser', 10)
                    let apiResponse = response.generate(true, 'Failed To add proejectId to the user', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(result)) {
                    logger.info('No User details Found for linking', 'ProjectController: addprojectIdToUser')
                    let apiResponse = response.generate(true, 'No User details Found for linking', 404, null)
                    reject(apiResponse)
                } else {
                    let apiResponse = response.generate(false, 'Success! Project added to the user successfully.', 200, result)
                    resolve(apiResponse)
                }
            });
        });
    }
    adduserIdToProject(req, res)
        .then(addprojectIdToUser)
        .then((resolve) => {

            let apiResponse = response.generate(false, 'Project and User linked sucessfully', 200, resolve)
            res.send(apiResponse)
        })
        .catch((err) => {

            logger.error(err.message, 'projectController.addUserToProject().catchBlock', 10);
            let apiResponse = response.generate(true, 'Project and User linking failed', 500, null)
            res.send(apiResponse);
        })
}

let updateProject = (req, res) => {
    let options = req.body;

    options.modifiedOn = time.now();

    ProjectModel.updateOne({ 'projectId': req.body.projectId }, options).exec((err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'ProjectController:updateProjectDetails', 10)
            let apiResponse = response.generate(true, 'Failed To edit Project details', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            logger.info('No Project details Found', 'ProjectController: updateProjectDetails')
            let apiResponse = response.generate(true, 'No Project details Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Project details edited', 200, result)
            res.send(apiResponse)
        }
    });
}

let deleteProject = (req, res) => {
    if (check.isEmpty(req.params.projectId)) {

        console.log('projectId should be passed')
        let apiResponse = response.generate(true, 'projectId is missing', 403, null)
        res.send(apiResponse)
    } else {

        ProjectModel.remove({ 'projectId': req.params.projectId }, (err, result) => {
            if (err) {
                console.log('Error Occured.')
                logger.error(`Error Occured : ${err}`, 'Database', 10)
                let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                console.log('Project Not Found.')
                let apiResponse = response.generate(true, 'Project Not Found.', 404, null)
                res.send(apiResponse)
            } else {
                console.log('Project Deletion Success')
                let apiResponse = response.generate(false, 'Project Deleted Successfully', 200, result)
                res.send(apiResponse)
            }
        })
    }
}

let getAllProjectDetails = (req, res) => {
    ProjectModel.find()
        .populate("users", "-__v -_id -projects -password")
        .select('-__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                logger.error(err.message, 'Project Controller: getAllProjects', 10)
                let apiResponse = response.generate(true, 'Failed To Find Project Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No Project Found', 'Project Controller: getAllProject')
                let apiResponse = response.generate(true, 'No Project Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'All Project Details Found', 200, result)
                res.send(apiResponse)
            }
        })
}

let getProjectById = (req, res) => {
    if (check.isEmpty(req.body._projectId)) {

        console.log('projectId should be passed')
        let apiResponse = response.generate(true, 'projectId is missing', 403, null)
        res.send(apiResponse)
    } else {

        ProjectModel.findById(req.body._projectId).populate("users", "-_id -__v -password -projects").select('-__v -_id').exec((err, result) => {

            if (err) {
                logger.error(`Error Occured : ${err}`, 'Database', 10)
                let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {

                console.log('Project Not Found.')
                let apiResponse = response.generate(true, 'Project Not Found', 404, null)
                res.send(apiResponse)
            } else {
                logger.info("Project found successfully", "ProjectController:getProjectById", 5)
                let apiResponse = response.generate(false, 'Project Found Successfully.', 200, result)
                res.send(apiResponse)
            }
        });
    }
}

module.exports = {
    createProject: createProject,
    linkProjectWithUser: linkProjectWithUser,
    updateProject: updateProject,
    deleteProject: deleteProject,
    getAllProjectDetails: getAllProjectDetails,
    getProjectById: getProjectById
}