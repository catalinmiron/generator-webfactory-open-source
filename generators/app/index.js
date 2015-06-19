'use strict';

var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var git = require("nodegit");
var gitHubInfo = require("hosted-git-info");

module.exports = yeoman.generators.Base.extend({
    prompting: function () {
        var done = this.async();

        this.log(yosay(
            'Welcome to the ' + chalk.red('webfactory Open Source') + ' project setup!'
        ));

        var prompts = [];
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
            var templateParameters = {
                'vendor': 'webfactory',
                'project': '',
                'year': new Date().getFullYear()
            };

            git.Repository.open(this.destinationPath())
                .then(function (projectRepository) {
                    git.Remote.lookup(projectRepository, "origin")
                        .then(function(remote) {
                            var info = gitHubInfo.fromUrl(remote.url());
                            console.log(info);
                            templateParameters.vendor  = info.user;
                            templateParameters.project = info.project;
                        })
                        .done();
                })
                .done();

            console.log(templateParameters);
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
        }
    },

    install: function () {
        this.installDependencies();
    }
});
