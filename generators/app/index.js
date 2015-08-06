'use strict';

var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var git = require('gift');
var gitHubInfo = require('hosted-git-info');
var Promise = require('es6-promise').Promise;
var fs = require('fs');
var path = require('path');

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
                    // todo: stack template paths
                    // create Promise via Promise.all to copy templates in order

                    var templateDirectory = this._getTemplatePaths()[0];
                    var findFiles = new Promise(function (resolve, reject) {
                        fs.readdir(templateDirectory, function (err, files) {
                            /* @type {Array<String>} files */
                            if (err) {
                                reject(err);
                            }
                            resolve(files);
                        }.bind(this));
                    }.bind(this));
                    return findFiles
                        .then(function (files) {
                            return files.filter(this._isTemplateFile);
                        }.bind(this))
                        .then(function (templates) {
                            var subDirectory = this._getTemplateSubDirectory(templateDirectory);
                            for (var i = 0; i < templates.length; i++) {
                                /* @type {String} fileName  */
                                var template = templates[i];
                                this.fs.copyTpl(
                                    this.templatePath(path.join(subDirectory, template)),
                                    this.destinationPath(template.substr(1)),
                                    templateParameters
                                );
                            }
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
    },

    /**
     * Returns paths to the template directories that are relevant
     * for the initialized project.
     *
     * The paths are ordered by priority: The most specific ones are
     * at the end of the array.
     *
     * @returns {Array<String>} Paths to the template directories.
     * @private
     */
    _getTemplatePaths: function () {
        return [
            this.templatePath('common'),
            this.templatePath(this.props.projectType)
        ].filter(fs.existsSync);
    },

    /**
     * Returns the path of the given directory relative to the template directory.
     *
     * Example:
     *
     *     var subDirectory = this.templatePath('common');
     *     var directory = _getTemplateSubDirectory(subDirectory); // directory == 'common'
     *
     * @param {String} templateSubDirectory
     * @returns {String}
     * @private
     */
    _getTemplateSubDirectory: function (templateSubDirectory) {
        return path.relative(this.templatePath(), templateSubDirectory);
    },

    /**
     * Checks if the given file is a template.
     *
     * Templates start with an underscore.
     *
     * @param {String} fileName
     * @returns {boolean}
     * @private
     */
    _isTemplateFile: function (fileName) {
        return fileName.indexOf('_') === 0;
    }
});
