const redis = require("redis");

const client = redis.createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT)
    }
});

client.on("error", (err) => {
    console.error("Redis error:", err.message);
});
const connectRedis = async () =>{
    if(!client.isOpen) {
        await client.connect();
        console.log("Redis connected");
    }
};
module.exports = {client, connectRedis};
