'use strict'
/**
 * Module Dependencies
 */
const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

let issueSchema = new Schema({
    issueId: {
        type: String,
        default: '',
        index: true,
        unique: true
    },
    issueType: {
        type: String,
        default: ''
    },
    projectId: {
        type: String,
        default: ''
    },
    userId: {
        type: String,
        default: ''
    },
    subject: {
        type: String,
        default: ''
    },
    body: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        default: ''
    },
    priority: {
        type: String,
        default: ''
    },
    milestone: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        default: ''
    },
    version: {
        type: String,
        default: ''
    },
    dueDate: {
        type: Date,
        default: ''
    },
    fileId: {
        type: String,
        default: ''
    },
    fileUrl: {
        type: String,
        default: ''
    },
    createdOn: {
        type: Date,
        default: ''
    },
    modifiedOn: {
        type: Date,
        default: ''
    }
})

mongoose.model('Issue', issueSchema);