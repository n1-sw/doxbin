const mongoose = require('mongoose');

let isConnected = false;

// User/Admin Schema for MongoDB
const userAdminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    profile: {
        fullName: String,
        bio: String,
        avatar: String,
        joinDate: { type: Date, default: Date.now }
    },
    metadata: {
        lastLogin: Date,
        loginCount: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true }
    }
}, { timestamps: true });

// Website Data Schema for MongoDB
const websiteDataSchema = new mongoose.Schema({
    dataType: { type: String, required: true }, // 'setting', 'stat', 'log', etc
    key: { type: String, required: true },
    value: mongoose.Schema.Types.Mixed,
    category: String,
    description: String,
    metadata: mongoose.Schema.Types.Mixed,
    version: { type: Number, default: 1 }
}, { timestamps: true });

// Analytics/Storage Schema for MongoDB
const analyticsSchema = new mongoose.Schema({
    eventType: String,
    userId: String,
    data: mongoose.Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now },
    sessionId: String
}, { timestamps: true });

// Create models
const UserAdmin = mongoose.model('UserAdmin', userAdminSchema);
const WebsiteData = mongoose.model('WebsiteData', websiteDataSchema);
const Analytics = mongoose.model('Analytics', analyticsSchema);

// MongoDB connection function
const connectMongoDB = async () => {
    if (isConnected) {
        return;
    }

    const mongoURL = process.env.MONGODB_URL;
    
    if (!mongoURL) {
        console.log('MongoDB connection string not provided. Set MONGODB_URL environment variable to enable MongoDB features.');
        console.log('MongoDB integration is optional and ready when credentials are provided.');
        return;
    }

    try {
        await mongoose.connect(mongoURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            retryWrites: true,
            w: 'majority'
        });
        
        isConnected = true;
        console.log('✓ MongoDB connection established');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        console.log('MongoDB features will be unavailable. Set MONGODB_URL to enable.');
    }
};

// Utility functions
const mongoUtils = {
    isConnected: () => isConnected,
    
    // User/Admin operations
    saveUserAdmin: async (userData) => {
        if (!isConnected) return null;
        try {
            return await UserAdmin.findOneAndUpdate(
                { email: userData.email },
                userData,
                { upsert: true, new: true }
            );
        } catch (error) {
            console.error('Error saving user/admin:', error);
            return null;
        }
    },

    getUserAdmin: async (email) => {
        if (!isConnected) return null;
        try {
            return await UserAdmin.findOne({ email });
        } catch (error) {
            console.error('Error getting user/admin:', error);
            return null;
        }
    },

    getAllAdmins: async () => {
        if (!isConnected) return [];
        try {
            return await UserAdmin.find({ isAdmin: true });
        } catch (error) {
            console.error('Error getting admins:', error);
            return [];
        }
    },

    // Website data operations
    saveWebsiteData: async (key, value, category = 'general') => {
        if (!isConnected) return null;
        try {
            return await WebsiteData.findOneAndUpdate(
                { key, category },
                { key, value, category, version: (await WebsiteData.findOne({ key, category }))?.version + 1 || 1 },
                { upsert: true, new: true }
            );
        } catch (error) {
            console.error('Error saving website data:', error);
            return null;
        }
    },

    getWebsiteData: async (key, category = 'general') => {
        if (!isConnected) return null;
        try {
            const doc = await WebsiteData.findOne({ key, category });
            return doc ? doc.value : null;
        } catch (error) {
            console.error('Error getting website data:', error);
            return null;
        }
    },

    getAllWebsiteData: async (category = null) => {
        if (!isConnected) return [];
        try {
            const query = category ? { category } : {};
            return await WebsiteData.find(query);
        } catch (error) {
            console.error('Error getting website data:', error);
            return [];
        }
    },

    // Analytics operations
    logEvent: async (eventType, userId, data, sessionId) => {
        if (!isConnected) return null;
        try {
            return await Analytics.create({
                eventType,
                userId,
                data,
                sessionId,
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Error logging event:', error);
            return null;
        }
    },

    getAnalytics: async (eventType, startDate, endDate) => {
        if (!isConnected) return [];
        try {
            return await Analytics.find({
                eventType,
                timestamp: { $gte: startDate, $lte: endDate }
            }).sort({ timestamp: -1 });
        } catch (error) {
            console.error('Error getting analytics:', error);
            return [];
        }
    }
};

module.exports = {
    connectMongoDB,
    mongoUtils,
    models: {
        UserAdmin,
        WebsiteData,
        Analytics
    }
};
