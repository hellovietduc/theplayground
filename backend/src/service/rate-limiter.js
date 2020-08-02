const Redis = require('ioredis');

const GLOBAL_KEY = 'rate_limiter';

class RateLimiter {
    constructor(config) {
        this.redis = new Redis(config);
        this.map = new Map();
    }

    add(key, limit) {
        if (!key) {
            throw new Error('Unknown key');
        }
        if (!Number.isInteger(limit)) {
            throw new Error(`${limit} is not an integer`);
        }
        this.map.set(key, limit);
    }

    async exceeded(key) {
        if (!this.map.has(key)) {
            throw new Error(`Key ${key} has not been rate limited`);
        }
        try {
            const res = await this.redis.get(`${GLOBAL_KEY}:${key}`);
            const count = Number(res);
            if (Number.isNaN(count)) return true;
            return count >= this.map.get(key);
        } catch {
            return true;
        }
    }

    async increase(key) {
        if (!this.map.has(key)) {
            throw new Error(`Key ${key} has not been rate limited`);
        }
        await this.redis.incr(`${GLOBAL_KEY}:${key}`);
    }

    async decrease(key) {
        if (!this.map.has(key)) {
            throw new Error(`Key ${key} has not been rate limited`);
        }
        await this.redis.decr(`${GLOBAL_KEY}:${key}`);
    }

    async flush() {
        const flushKeys = [];
        for (const [key] of this.map) {
            flushKeys.push(new Promise(resolve => {
                this.redis.del(`${GLOBAL_KEY}:${key}`)
                    .then(resolve)
                    .catch(resolve);
            }));
        }
        await Promise.all(flushKeys);
    }
}

module.exports = RateLimiter;
