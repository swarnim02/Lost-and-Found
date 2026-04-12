import mongoose, { Connection } from 'mongoose';

/**
 * Database — Singleton wrapper around the Mongoose connection.
 *
 * Design pattern: Singleton. Exactly one Mongoose connection per process so
 * all repositories share the same connection pool, event listeners, and
 * schema registrations.
 */
class DatabaseSingleton {
  private static instance: DatabaseSingleton | null = null;
  private connectionPromise: Promise<Connection> | null = null;

  private constructor() {}

  static getInstance(): DatabaseSingleton {
    if (!DatabaseSingleton.instance) {
      DatabaseSingleton.instance = new DatabaseSingleton();
    }
    return DatabaseSingleton.instance;
  }

  async connect(): Promise<Connection> {
    if (!this.connectionPromise) {
      const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lostfound';
      mongoose.set('strictQuery', true);
      this.connectionPromise = mongoose
        .connect(uri, { autoIndex: true })
        .then((m) => m.connection);
    }
    return this.connectionPromise;
  }

  getConnection(): Connection {
    return mongoose.connection;
  }

  async close(): Promise<void> {
    await mongoose.disconnect();
    this.connectionPromise = null;
  }
}

export default DatabaseSingleton.getInstance();
