'use strict';

var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var git = require('gift');
var gitHubInfo = require('hosted-git-info');
var Promise = require('es6-promise').Promise;

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
        app: function () {
            var determineRepositoryUrl = Promise.resolve(this.options.repositoryUrl);
            if (this.options.repositoryUrl === null) {
                // Repository URL must be determined automatically.
                var repo = git(this.destinationPath());
                determineRepositoryUrl = new Promise(function (resolve, reject) {
                    repo.config(function (error, config) {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(config.items['remote.origin.url']);
                        }
                    });
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
