const { client } = require("../config/redis");

const getCache = async (key) => {
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
};

const setCache = async (key, value, ttl = 300) => {
  await client.set(key, JSON.stringify(value), { EX: ttl });
};

const deleteByPrefix = async (prefix) => {
  const keys = await client.keys(`${prefix}*`);
  if (keys.length) {
    await client.del(keys);
  }
};

module.exports = { getCache, setCache, deleteByPrefix };