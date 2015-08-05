'use strict';

var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var git = require('gift');
var gitHubInfo = require('hosted-git-info');
var Promise = require('es6-promise').Promise;
var fs = require('fs');

/**
 * Generator that initializes an open source project.
 *
 * @see http://yeoman.io/authoring/running-context.html
 */
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
            {
                type: 'list',
                name: 'projectType',
                message: 'Which type of project would you like to create?',
                choices: [
                    {
                        name: 'PHP Library',
                        value: 'library'
                    },
                    {
                        name: 'Symfony 2 Bundle',
                        value: 'bundle'
                    },
                    {
                        name: 'Symfony 2 Application',
                        value: 'application'
                    }
                ]
            }
        ];
        this.prompt(prompts, function (props) {
            // To access props later use this.props.someOption;
            this.props = props;
            done();
        }.bind(this));
    },

    writing: {
        app: function () {
            var done = this.async();

            this._determineRepositoryUrl()
                .then(function (url) {
                    return gitHubInfo.fromUrl(url);
                })
                .then(function (info) {
                    return {
                        'vendor': info.user,
                        'project': info.project,
                        'year': new Date().getFullYear(),
                        'helpers': {
                            'toDashed': function (str) {
                                return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
                            }
                        }
                    }
                })
                .then(function (templateParameters) {
                    return new Promise(function (resolve, reject) {
                        fs.readdir(this.templatePath(), function (err, files) {
                            /* @type {Array<String>} files */
                            if (err) {
                                reject(err);
                            }
                            for (var i = 0; i < files.length; i++) {
                                /* @type {String} fileName  */
                                var fileName = files[i];
                                if (fileName.indexOf('_') !== 0) {
                                    // Process only templates, which start with "_".
                                    continue;
                                }
                                this.fs.copyTpl(
                                    this.templatePath(fileName),
                                    this.destinationPath(fileName.substr(1)),
                                    templateParameters
                                );
                            }
                            resolve();
                        }.bind(this));
                    }.bind(this));
                }.bind(this))
                .then(done)
                .catch(function (error) {
                    this.log.error('Project setup failed.', error);
                    done();
                }.bind(this));
        }
    },

    install: function () {
        var options = {
            'npm': fs.existsSync(this.destinationPath('package.json')),
            'bower': fs.existsSync(this.destinationPath('bower.json'))
        };
        if (!options.npm && !options.bower) {
            return;
        }
        this.installDependencies(options);
    },

    /**
     * Returns a promise that determines the repository URL of the project that is initialized.
     *
     * @returns {ES6Promise}
     * @private
     */
    _determineRepositoryUrl: function () {
        if (this.options.repositoryUrl !== null) {
            return Promise.resolve(this.options.repositoryUrl);
        }
        // Repository URL must be determined automatically.
        var repo = git(this.destinationPath());
        return new Promise(function (resolve, reject) {
            repo.config(function (error, config) {
                if (error) {
                    reject(error);
                } else {
                    resolve(config.items['remote.origin.url']);
                }
            });
        });
    }
});
