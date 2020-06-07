const path = require("path");

module.exports = {
  outputDir: path.resolve(__dirname, "../server/public"),
  devServer: {
    proxy: {
      "/tasks": {
        target: "http://localhost:3000"
      },
      "/user": {
        target: "http://localhost:3000"
      }
    }
  },
  transpileDependencies: ["vuetify"]
};
