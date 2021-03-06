"use strict";
const Generator = require("../../lib/BaseGenerator");
const chalk = require("chalk");
const yosay = require("yosay");
const glob = require("glob");
const path = require("path");

module.exports = class extends Generator {
  // prompting() {
  //   // Have Yeoman greet the user.
  //   this.log(
  //     yosay(`Welcome to the extraordinary ${chalk.red("presogen")} generator!`)
  //   );

  //   const prompts = [
  //     {
  //       type: "confirm",
  //       name: "someAnswer",
  //       message: "Would you like to enable this option?",
  //       default: true
  //     }
  //   ];

  //   return this.prompt(prompts).then(props => {
  //     // To access props later use this.props.someAnswer;
  //     this.props = props;
  //   });
  // }

  initializing() {
    super.initializing({
      author: {
        optionType: String,
        desc: "Author of the package"
      }
    });
  }

  prompting() {
    super.prompting();
  }

  configuring() {
    super.configuring();
  }

  writing() {
    const src = path.join(this.templatePath("src"), "**/*");
    const staticFiles = glob
      .sync(src, { nodir: true })
      .map(filePath => filePath.replace(this.templatePath("src") + "/", "src/"))
      .reduce(
        (acc, filePath) => ({
          ...acc,
          [filePath]: filePath
        }),
        {}
      );
    this.writeFiles({
      ...staticFiles,
      _gitignore: ".gitignore",
      "_gatsby-config.js": "gatsby-config.js",
      "src/theme.js": "src/theme.js",
      "lib/*": "lib"
    });

    this.writeTemplates({
      "_cli.js": "cli.js",
      "_package.json": "package.json",
      "src/deck.mdx": "src/deck.mdx"
    });
  }

  install() {
    this.installDependencies({
      npm: true,
      bower: false
    });
  }

  end() {
    const opts = { cwd: this.config.get("srcDir") };
    this.log("Initializing git repository");
    this.spawnCommandSync("git", ["init", "--quiet"], opts);
    this.log("Adding all files");
    this.spawnCommandSync("git", ["add", "--all"], opts);
    this.spawnCommandSync("git", ["commit", "-am", "initial commit"], opts);
  }
};
