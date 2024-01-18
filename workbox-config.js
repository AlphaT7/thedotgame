module.exports = {
  globDirectory: "src/",
  globPatterns: ["**/*.{html,js,css,json,png,jpg,mp3,ico}"],
  swDest: "dist/sw.js",
  clientsClaim: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "FuturisticMenu",
        networkTimeoutSeconds: 4,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5,
        },
      },
    },
  ],
};
