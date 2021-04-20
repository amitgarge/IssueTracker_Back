'use strict'
/**
 * Module Dependencies
 */
const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

let Project = new Schema({
  projectId: {
    type: String,
    default: '',
    index: true,
    unique: true
  },
  projectName: {
    type: String,
    default: ''
  },
  projectKey: {
    type: String,
    default: ''
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  createdOn: {
    type: Date,
    default: ''
  },
  modifiedOn: {
    type: Date,
    default: ''
  }
})

mongoose.model("Project", Project);

module.exports = Project;