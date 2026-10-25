import mongoose from 'mongoose';

export const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;

  if (!primaryUri) {
    console.error('[Database] Connection failed: MONGO_URI environment variable is missing.');
    process.exit(1);
  }

  try {
    console.log('[Database] Connecting to MongoDB...');
    await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('[Database] MongoDB connected successfully.');
  } catch (err) {
    console.error(`[Database] Failed to connect to MongoDB: ${err.message}`);
    process.exit(1);
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
};
