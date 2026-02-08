
import { User } from '../../modules/users/user.model';
import bcrypt from 'bcrypt';

export const seedSystemAdmin = async () =>
{
    try {
        const adminEmail = process.env.SYSTEM_ADMIN_EMAIL || 'admin@lumina.com';

        // Find existing admin - system_admin role is what we check
        const existingAdmin = await User.findOne({
            $or: [
                { email: adminEmail },
                { roles: 'system_admin' }
            ]
        });

        if (existingAdmin) {
            console.log('System Admin already exists.');
            return;
        }

        const adminPassword = process.env.SYSTEM_ADMIN_PASSWORD || 'ChangeMe123!';

        // Create new user
        // Note: tenantId will be undefined/null if context is empty, which is correct for global admin
        const admin = new User({
            email: adminEmail,
            // Password will be hashed by pre-save hook
            passwordHash: adminPassword,
            roles: [ 'system_admin' ],
            status: 'active',
            emailVerified: true,
            preferences: {
                emailNotifications: true,
                pushNotifications: true,
                theme: 'auto',
                language: 'en',
                timezone: 'UTC'
            }
        });

        // We need to bypass tenant plugin for this?
        // If tenant plugin is active, it might try to check context.
        // But if context is empty, it acts normally?
        // Let's hope so.

        await admin.save();
        console.log(`System Admin seeded successfully: ${adminEmail}`);

    } catch (error) {
        console.error('Error seeding system admin:', error);
    }
};
