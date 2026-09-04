const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ['claim', 'complete', 'system'],
            default: 'system',
        },
        message: {
            type: String,
            required: [true, 'Notification message is required'],
            trim: true,
            maxlength: [300, 'Message cannot exceed 300 characters'],
        },
        relatedListing: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Listing',
            default: null,
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
