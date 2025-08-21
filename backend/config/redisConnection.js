const redis = require('redis'); 
const redisClient = redis.createClient(); 
redisClient.on('connect', () => console.log('✅ Redis client connected successfully!'));
 redisClient.on('error', (err) => console.log('❌ Redis Client Error', err)); 
 (async () => { await redisClient.connect(); })();
  module.exports = redisClient;