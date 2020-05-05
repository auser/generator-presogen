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
    const o = {
      ...OPTIONS,
      ...opts
    }
    Object.keys(o).forEach(key => {
      const obj = o[key];
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

    this._prompts = Object.keys(o).map(key => {
      const obj = o[key];
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
    this.promptOptions = {}

    return this.optionOrPrompt(this._prompts).then(props => {
      console.log('props ->', props)
      Object.keys(OPTIONS).forEach(key => {
        this[key] = props[key] || this.options[key];
        this.promptOptions[key] = this[key];
      });
      this.appName = this.name.replace(/\s+/g, "-").toLowerCase();
      cb();
    });
  }

  configuring() {
    let tmplContext = {
      ...this.promptOptions,
      appName: this.appName,
      appVersion: this.appVersion,
      description: this.description,
      user: this.user,
      repo: this.repo
    };


    this.tmplContext = tmplContext;
    console.log('this.tmplContext', this.promptOptions, this.tmplContext)
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
    Object.keys(templates).forEach(filename => {
      this.fs.copyTpl(
        this.templatePath(filename),
        this.destinationPath(templates[filename]),
        this.tmplContext
      );
    });
  }
};
