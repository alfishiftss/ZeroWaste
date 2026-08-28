const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
    {
        consumer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        listing: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Listing',
            required: true,
        },
        status: {
            type: String,
            enum: ['Pending', 'Completed', 'Cancelled'],
            default: 'Pending',
        },
        otp: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Claim', claimSchema);
