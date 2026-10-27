import { createClient } from "redis";
import { REDIS_URI } from "../config/config.js";

export const client = createClient({ url: REDIS_URI });

// Without an "error" listener, any Redis connection error crashes the whole server.
client.on("error", (error) => {
  console.log("Redis Error:", error.message);
});

export async function connectRedis() {
  try {
    await client.connect();
    console.log("Redis Connected");
  } catch (error) {
    console.log("Redis Connection Failed");
    console.log(error);
  }
}
