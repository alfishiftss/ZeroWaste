const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        quantity: {
            type: String,
            required: [true, 'Quantity is required'],
            trim: true,
        },
        foodType: {
            type: String,
            required: [true, 'Food type is required'],
            enum: ['Cooked', 'Raw', 'Packaged', 'Bakery', 'Dairy', 'Other'],
        },
        expiryTime: {
            type: Date,
            required: [true, 'Expiry time is required'],
        },
        businessId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['Active', 'Claimed', 'Expired'],
            default: 'Active',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Listing', listingSchema);
