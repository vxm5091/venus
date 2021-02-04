module.exports = {
  venus: {
    /**
       * OPTIONAL: add any endpoint HOSTS below with the value 'true' to EXCLUDE from the analysis
       */
    endpointsExcluded: {
      'localhost': true,
    },
  },
  redisConnect: {
    port: 6379,
    host: 'venus-redis-micro.syohjt.ng.0001.use2.cache.amazonaws.com',
    dnsLookup: (address, callback) => callback(null, address),
    enableAutoPipelining: true,
  },
  redisStream: {
    REDIS_STREAM_NAME: 'logstream',
  },
}