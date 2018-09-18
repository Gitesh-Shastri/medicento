const mongoose = require('mongoose');

const LogSchema = mongoose.Schema({
    logd: {
        type: String,
        required: true
    },
    created_at: {
        type: String
    }
});

module.exports = mongoose.model('Log', LogSchema);