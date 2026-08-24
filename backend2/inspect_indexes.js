import { setServers } from "node:dns/promises";
setServers(["1.1.1.1", "8.8.8.8"]);

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected.");
        const indexes = await mongoose.connection.db.collection('users').indexes();
        console.log("Indexes on 'users':", JSON.stringify(indexes, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
