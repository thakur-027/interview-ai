const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

/**
 * Call at the top of a test file's `before` hook. Connects mongoose to a
 * fresh in-memory MongoDB instance so tests never touch the real database.
 */
async function connectTestDB() {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
}

/**
 * Call in an `after` hook to tear everything down cleanly.
 */
async function disconnectTestDB() {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
}

/**
 * Call in a `beforeEach` (or between tests) to wipe all collections
 * without tearing down the whole connection.
 */
async function clearTestDB() {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
}

module.exports = { connectTestDB, disconnectTestDB, clearTestDB };
