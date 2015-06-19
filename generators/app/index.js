'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

module.exports = yeoman.generators.Base.extend({
    prompting: function () {
        var done = this.async();

        // Have Yeoman greet the user.
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
                'year': new Date().getFullYear()
            };
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
