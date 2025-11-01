module.exports = {
  default: {
    require: ["src/bdd/steps/**/*.ts", "src/bdd/support/**/*.ts"],
    requireModule: ["ts-node/register"],
    paths: ["src/bdd/features/**/*.feature"],
    publishQuiet: true,
    format: ["progress", "json:reports/cucumber.json"],
    parallel: 1,
    tags: "not @ignore",
    timeout: 60000, // 60 seconds timeout for steps
  },
};
