"use strict";

const path = require("path");
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const mkdir = require("mkdirp");
const yoOptionOrPrompt = require("yo-option-or-prompt").default;

const DEFAULT_OPTIONS = {
  desc: "",
  alias: "",
  type: "input"
};

const RAW_OPTIONS = {
  name: {
    desc: "What is the name of your application?",
    alias: "n",
    default: "myapp",
    optionType: String
  },
  appVersion: {
    desc: "What is the version of your application?",
    alias: "v",
    default: "0.0.1",
    optionType: String
  },
  description: {
    desc: "Your project description",
    alias: "d",
    default: "Your project description",
    optionType: String
  },
  user: {
    desc: "Your project user",
    alias: "u",
    default: process.env.USER,
    optionType: String
  },
  appPath: {
    desc: "What is the root path for your project (ex: github.com/auser)",
    alias: "r",
    optionType: String,
    default: path.join("github.com", process.env.USER)
  }
};
const OPTIONS = Object.keys(RAW_OPTIONS).reduce((sum, key) => {
  return {
    ...sum,
    [key]: {
      ...DEFAULT_OPTIONS,
      ...RAW_OPTIONS[key]
    }
  };
}, {});

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    Object.keys(opts).forEach(key => {
      if (key !== "env") {
        this.config.set(key, opts[key]);
      }
    });

    this.config.save();
  }

  initializing(opts = {}) {
    Object.keys((...OPTIONS, ...opts)).forEach(key => {
      const obj = OPTIONS[key];
      if (obj.optionType) {
        const optionOpts = {
          name: key,
          desc: obj.desc,
          alias: obj.alias,
          type: obj.optionType
        };
        this.option(key, optionOpts);
      }
    });

    this._prompts = Object.keys(OPTIONS).map(key => {
      const obj = OPTIONS[key];
      return {
        name: key,
        ...obj
      };
    });

    this.optionOrPrompt = yoOptionOrPrompt;
  }

  paths() {
    this.destinationRoot(process.env.GOPATH || "./");
  }

  prompting() {
    this.log(
      chalk.hex("#6fd6e3").bold(`
+---------------------+
mdx-deck preso scaffold
+---------------------+
`)
    );

    let cb = this.async();

    return this.optionOrPrompt(this._prompts).then(props => {
      Object.keys(OPTIONS).forEach(key => {
        this[key] = props[key] || this.options[key];
      });
      this.appName = this.name.replace(/\s+/g, "-").toLowerCase();
      this.appPath = path.join(this.appPath, this.appName);
      cb();
    });
  }

  configuring() {
    console.log("configuring called")

    let tmplContext = {
      appName: this.appName,
      appVersion: this.appVersion,
      description: this.description,
      user: this.user,
      repo: this.repo
    };

    this.tmplContext = tmplContext;
  }

  default () {}
  writing() {}
  conflicts() {}
  install() {}
  end() {}

  writeFiles(files = {}) {
    Object.keys(files).forEach(filename => {
      this.fs.copy(
        this.templatePath(filename),
        this.destinationPath(files[filename])
      );
    });
  }

  writeTemplates(templates = {}) {
    console.log('this.tmplContext', this.tmplContext)
    Object.keys(templates).forEach(filename => {
      this.fs.copyTpl(
        this.templatePath(filename),
        this.destinationPath(templates[filename]),
        this.tmplContext
      );
    });
  }
};
