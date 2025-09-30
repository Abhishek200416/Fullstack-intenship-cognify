import apicache from "apicache";

/**
 * Wire apicache to a provided Redis client (ioredis instance),
 * add useful defaults, and expose cache() middleware.
 */
export function makeCache(redisClient) {
  apicache.options({
    // Use Redis as the backing store
    redisClient,
    appendKey: (req) => `u:${req.ip}`, // vary cache by client IP (tune as needed)
    statusCodes: {
      include: [200] // cache only successful responses
    },
    headerBlacklist: ["authorization", "cookie"] // don't mix auth headers into cache key
  });

  // Short alias: cache("30 seconds") etc.
  const cache = apicache.middleware;

  // Tiny helper to add a visible header for demo/testing
  function addCacheDebugHeaders(req, res, next) {
    res.setHeader("X-App-Cache", "apicache");
    next();
  }

  return { cache, addCacheDebugHeaders };
}
