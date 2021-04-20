const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('../libs/timeLib');
const response = require('../libs/responseLib')
const logger = require('../libs/loggerLib');
const check = require('../libs/checkLib');
const cloudinary = require('../libs/cloudinaryLib')

/* Models */
const IssueModel = mongoose.model('Issue')

let addIssue = (req, res) => {

    let addissueDetails = () => {
        return new Promise((resolve, reject) => {
            IssueModel.findOne({ issueId: req.body.issueId })
                .exec((err, retrievedIssueDetails) => {

                    if (err) {
                        logger.error(err.message, 'issueController.addIssue.addissueDetails()', 10);
                        let apiResponse = response.generate(true, 'Operation Failed', 500, null);
                        reject(apiResponse)
                    } else if (check.isEmpty(retrievedIssueDetails)) {

                        console.log(req.body);

                        let newIssue = new IssueModel({
                            issueId: shortid.generate(),
                            issueType: req.body.issueType,
                            issueId: req.body.issueId,
                            userId: req.body.userId,
                            subject: req.body.subject,
                            body: req.body.body,
                            status: req.body.status,
                            priority: req.body.priority,
                            milestone: req.body.milestone,
                            category: req.body.category,
                            version: req.body.version,
                            dueDate: req.body.dueDate,
                            createdOn: time.now(),
                            modifiedOn: time.now()
                        });

                        newIssue.save((err, newIssue) => {

                            if (err) {

                                logger.error(err.message, 'issueController.addIssue().addissueDetails()', 10)
                                let apiResponse = response.generate(true, 'Failed to create new issue', 500, null)
                                reject(apiResponse)

                            } else {

                                let newIssueObj = newIssue.toObject();
                                resolve(newIssueObj)
                            }
                        });

                    } else {

                        logger.error('Issue cannot be created. Issue already present.', 'issueController.addIssue().addissueDetails()', 4)
                        let apiResponse = response.generate(true, 'Issue already present with this ID', 403, null);
                        reject(apiResponse);
                    }
                })
        })
    }

    addissueDetails(req, res)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Issue created sucessfully', 200, resolve)
            res.send(apiResponse)
        })
        .catch((err) => {
            logger.error(err.message, 'issueController.addIssue().catchBlock', 10);
            let apiResponse = response.generate(true, 'Issue creation failed', 500, null)
            res.send(apiResponse);
        })
}

let updateIssue = (req, res) => {
    let options = req.body;

    options.modifiedOn = time.now();

    IssueModel.updateOne({ 'issueId': req.body.issueId }, options).exec((err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'IssueController:updateIssue', 10)
            let apiResponse = response.generate(true, 'Failed To edit Issue details', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            logger.info('No Issue details Found', 'IssueController: updateIssue')
            let apiResponse = response.generate(true, 'No Issue details Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Issue details edited', 200, result)
            res.send(apiResponse)
        }
    });
}

let deleteIssue = (req, res) => {
    if (check.isEmpty(req.params.issueId)) {

        console.log('issueId should be passed')
        let apiResponse = response.generate(true, 'issueId is missing', 403, null)
        res.send(apiResponse)
    } else {

        IssueModel.remove({ 'issueId': req.params.issueId }, (err, result) => {
            if (err) {
                console.log('Error Occured.')
                logger.error(`Error Occured : ${err}`, 'Database', 10)
                let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                console.log('Issue Not Found.')
                let apiResponse = response.generate(true, 'Issue Not Found.', 404, null)
                res.send(apiResponse)
            } else {
                console.log('Issue Deletion Success')
                let apiResponse = response.generate(false, 'Issue Deleted Successfully', 200, result)
                res.send(apiResponse)
            }
        })
    }
}

let getAllIssueDetails = (req, res) => {
    IssueModel.find()
        .select('-__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                logger.error(err.message, 'Issue Controller: getAllIssues', 10)
                let apiResponse = response.generate(true, 'Failed To Find Issue Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No Issue Found', 'Issue Controller: getAllIssue')
                let apiResponse = response.generate(true, 'No Issue Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'All Issue Details Found', 200, result)
                res.send(apiResponse)
            }
        })
}

let getIssueById = (req, res) => {
    if (check.isEmpty(req.params.issueId)) {

        console.log('issueId should be passed')
        let apiResponse = response.generate(true, 'issueId is missing', 403, null)
        res.send(apiResponse)
    } else {

        IssueModel.findOne({ 'issueId': req.params.issueId }, (err, result) => {

            if (err) {
                logger.error(`Error Occured : ${err}`, 'Database', 10)
                let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {

                console.log('Issue Not Found.')
                let apiResponse = response.generate(true, 'Issue Not Found', 404, null)
                res.send(apiResponse)
            } else {
                logger.info("Issue found successfully", "IssueController:getIssueById", 5)
                let apiResponse = response.generate(false, 'Issue Found Successfully.', 200, result)
                res.send(apiResponse)
            }
        })
    }
}

module.exports = {
    addIssue: addIssue,
    updateIssue: updateIssue,
    deleteIssue: deleteIssue,
    getAllIssueDetails: getAllIssueDetails,
    getIssueById: getIssueById
}