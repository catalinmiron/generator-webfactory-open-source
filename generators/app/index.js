'use strict';

var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var git = require('gift');
var gitHubInfo = require('hosted-git-info');
var Promise = require('es6-promise').Promise;
var fs = require('fs');
var path = require('path');
var objectMerge = require('object-merge');

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
                    var findTemplates = Promise.all(this._getTemplatePaths().map(function (templateDirectory) {
                        return this._findTemplates(templateDirectory);
                    }.bind(this)));
                    return findTemplates
                        .then(this._combineTemplateDestinations.bind(this))
                        .then(function (sourceToDestination) {
                            this._copyTemplates(sourceToDestination, templateParameters);
                        }.bind(this));
                }.bind(this))
                .then(function () {
                    done();
                })
                .catch(function (error) {
                    /** @type {Error} error */
                    this.log.error('Project setup failed.');
                    this.env.error(error);
                }.bind(this));
        }
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
    },

    /**
     * Copies the templates in the given directory to project directory.
     *
     * @param {String} templateDirectory
     *
     * @returns {ES6Promise}
     * @private
     */
    _findTemplates: function (templateDirectory) {
        var findFiles = new Promise(function (resolve, reject) {
            fs.readdir(templateDirectory, function (err, files) {
                /* @type {Array<String>} files */
                if (err) {
                    reject(err);
                } else {
                    resolve(files);
                }
            });
        });
        return findFiles
            .then(function (files) {
                return files.filter(this._isTemplateFile);
            }.bind(this))
            .then(function (templates) {
                var sourceToDestination = {};
                var subDirectory = this._getTemplateSubDirectory(templateDirectory);
                for (var i = 0; i < templates.length; i++) {
                    /* @type {String} fileName  */
                    var template = templates[i];
                    var source = this.templatePath(path.join(subDirectory, template));
                    sourceToDestination[source] = this.destinationPath(template.substr(1));
                }
                return sourceToDestination;
            }.bind(this));
    },

    /**
     * Accepts a list of template sources and destinations and combines them.
     *
     * In case of conflict, the latter source wins.
     *
     * @param {Array<Object<string, string>>} sourcesAndDestinations
     * @return {Object<string, string>} Sources and their corresponding destinations.
     * @private
     */
    _combineTemplateDestinations: function (sourcesAndDestinations) {
        var destinationToSource = {};
        for (var i = 0; i < sourcesAndDestinations.length; i++) {
            var sourceToDestination = sourcesAndDestinations[i];
            destinationToSource = objectMerge(destinationToSource, this._invert(sourceToDestination));
        }
        return this._invert(destinationToSource);
    },

    /**
     * Accepts an object with source and destination template paths and copies them.
     *
     * @param {Object<string, string>} sourceToDestination
     * @param {Object} templateParameters
     * @private
     */
    _copyTemplates: function (sourceToDestination, templateParameters) {
        for (var source in sourceToDestination) {
            if(sourceToDestination.hasOwnProperty(source)) {
                this.fs.copyTpl(
                    source,
                    sourceToDestination[source],
                    templateParameters
                );
            }
        }
    },

    /**
     * Flips keys and values in an object.
     *
     * @param {Object<string, string>} obj
     * @returns {Object<string, string>}
     * @private
     * @see http://nelsonwells.net/2011/10/swap-object-key-and-values-in-javascript/
     */
    _invert: function (obj) {
        var newObj = {};
        for (var prop in obj) {
            if(obj.hasOwnProperty(prop)) {
                newObj[obj[prop]] = prop;
            }
        }
        return newObj;
    }
});
