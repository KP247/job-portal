const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({

    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true
    },

    applicantName: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true
    },

    resume: {
    type: String,
    required: true
},

    status: {
        type: String,
        default: "Pending"
    },

    appliedAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("Application", applicationSchema);