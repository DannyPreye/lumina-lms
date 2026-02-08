import app from './app';
import { config } from './config/env.config';
import { connectDB } from './database/mongoose';

import { seedSystemAdmin } from './common/utils/seed-admin';

const startServer = async () =>
{
    try {
        // Connect to Database
        await connectDB();
        await seedSystemAdmin();

        const PORT = config.PORT || 5000;

        const server = app.listen(PORT, () =>
        {
            console.log(`🚀 Server running in ${config.NODE_ENV} mode on port ${PORT}`);
        });

        // Handle Unhandled Rejections
        process.on('unhandledRejection', (err: any) =>
        {
            console.error(`Error: ${err.message}`);
            server.close(() => process.exit(1));
        });

    } catch (error) {
        console.error(`Failed to start server: ${error}`);
        process.exit(1);
    }
};

startServer();
