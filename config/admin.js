/**
 * SCXBIN - DEFAULT ADMIN LOGIN CONFIGURATION
 * ================================================
 * This is the ONLY place where admin credentials are defined
 * All admin logins use these credentials
 * 
 * DO NOT MODIFY - Unless you want to change the default admin password
 */

module.exports = {
    DEFAULT_ADMIN: {
        email: 'admin@scxbin.local',
        username: 'admin',
        password: 'Admin@123456',
        is_admin: true
    },
    
    // Security settings
    PASSWORD_RESET_EXPIRY_MINUTES: 15,
    PASSWORD_MIN_LENGTH: 6
};

/**
 * DEFAULT ADMIN LOGIN CREDENTIALS FOR SCXBIN WEBSITE:
 * 
 * Email:    admin@scxbin.local
 * Password: Admin@123456
 * 
 * ⚠️  CHANGE PASSWORD IMMEDIATELY AFTER FIRST LOGIN
 *     Use the admin dashboard to change password
 */
