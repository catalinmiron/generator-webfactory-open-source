'use strict';

var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var git = require("nodegit");
var gitHubInfo = require("hosted-git-info");

module.exports = yeoman.generators.Base.extend({
    constructor: function () {
        yeoman.generators.Base.apply(this, arguments);

        this.option('repositoryUrl', {
            desc: 'URL to GitHub repository (determined automatically if omitted).',
            type: "String",
            defaults: null
        });
    },

    prompting: function () {
        var done = this.async();

        this.log(yosay(
            'Welcome to the ' + chalk.red('webfactory Open Source') + ' project setup!'
        ));

        var prompts = [
        ];
        this.prompt(prompts, function (props) {
            this.props = props;
            // To access props later use this.props.someOption;
            done();
        }.bind(this));
    },

    writing: {
        // ToDo:
        // - Check Repo Url
        //   - Generate Travis Image in README
        // - Check project type (bundle, library, app)
        //   - add typ to README
        // - add Travis config
        app: function () {
            var determineRepositoryUrl = Promise.resolve(this.options.repositoryUrl);
            if (this.options.repositoryUrl === null) {
                // Repository URL must be determined automatically.
                determineRepositoryUrl = git.Repository.open(this.destinationPath())
                    .then(function (projectRepository) {
                        return git.Remote.lookup(projectRepository, "origin");
                    })
                    .then(function (remote) {
                        return remote.url();
                    });
            }
            determineRepositoryUrl
                .then(function (url) {
                    return gitHubInfo.fromUrl(url);
                })
                .then(function (info) {
                    return {
                        'vendor': info.user,
                        'project': info.project,
                        'year': new Date().getFullYear()
                    }
                })
                .then(function (templateParameters) {
                    this.fs.copyTpl(
                        this.templatePath('_LICENSE'),
                        this.destinationPath('LICENSE'),
                        templateParameters
                    );
                    this.fs.copyTpl(
                        this.templatePath('_README.md'),
                        this.destinationPath('README.md'),
                        templateParameters
                    );
                    this.fs.copyTpl(
                        this.templatePath('_.travis.yml'),
                        this.destinationPath('.travis.yml'),
                        templateParameters
                    );
                }.bind(this))
                .catch(function (error) {
                    this.log.error('Project setup failed.', error);
                }.bind(this));
        }
    },

    install: function () {
        this.installDependencies();
    }
});
