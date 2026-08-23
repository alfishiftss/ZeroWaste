const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
    {
        business: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            minlength: [3, 'Title must be at least 3 characters'],
            maxlength: [80, 'Title cannot exceed 80 characters'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            minlength: [10, 'Description must be at least 10 characters'],
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [1, 'Quantity must be at least 1'],
        },
        foodType: {
            type: String,
            required: [true, 'Food type is required'],
            enum: ['Veg', 'Non-Veg'],
        },
        expiryTime: {
            type: Date,
            required: [true, 'Expiry time is required'],
        },
        status: {
            type: String,
            enum: ['active', 'claimed', 'expired'],
            default: 'active',
        },
        imageUrl: {
            type: String,
            default: '',
        },
        imagePublicId: {
            type: String,
            default: '',
        },
        city: {
            type: String,
            trim: true,
            maxlength: [60, 'City cannot exceed 60 characters'],
            default: '',
        },
        neighborhood: {
            type: String,
            trim: true,
            maxlength: [60, 'Neighborhood cannot exceed 60 characters'],
            default: '',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Listing', listingSchema);
