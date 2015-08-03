'use strict';

var path = require('path');
var assert = require('yeoman-generator').assert;
var helpers = require('yeoman-generator').test;

describe('open source generator', function () {
    describe('called with dashed repository name', function () {
        before(function (done) {
            helpers.run(path.join(__dirname, '../generators/app'))
                .withOptions({
                    skipInstall: true,
                    repositoryUrl: "git@github.com:webfactory/generator-webfactory-open-source.git"
                })
                .on('end', done);
        });

        it('creates a license file', function () {
            assert.file([
                'LICENSE'
            ]);
        });

        it('adds current year to license', function () {
            assert.fileContent('LICENSE', new RegExp(new Date().getFullYear().toString()));
        });

        it('creates a README file', function () {
            assert.file([
                'README.md'
            ]);
        });

        it('adds current year to README', function () {
            assert.fileContent('README.md', new RegExp(new Date().getFullYear().toString()));
        });

        it('adds Travis URL to README', function () {
            assert.fileContent('README.md', /https:\/\/travis-ci.org/);
        });

        it('adds Travis configuration', function () {
            assert.file([
                '.travis.yml'
            ]);
        });

        describe('provides Composer configuration and', function () {
            it('creates composer.json', function () {
                assert.file([
                    'composer.json'
                ]);
            });

            it('derives package name from vendor and project', function () {
                assert.fileContent('composer.json', '"webfactory/generator-webfactory-open-source"');
            });
        });

        it('adds .gitignore file', function () {
            assert.file([
                '.gitignore'
            ]);
        });

        it('adds editor config', function () {
            assert.file([
                '.editorconfig'
            ]);
        });

        it('adds PHPUnit config', function () {
            assert.file([
                'phpunit.xml.dist'
            ]);
        });
    });

    describe('called with camel cased repository name', function () {
        before(function (done) {
            helpers.run(path.join(__dirname, '../generators/app'))
                .withOptions({
                    skipInstall: true,
                    repositoryUrl: "git@github.com:WebFactory/GeneratorWebfactoryOpenSource.git"
                })
                .on('end', done);
        });

        describe('provides Composer configuration and', function () {
            it('adds dashed vendor name in composer.json', function () {
                assert.fileContent('composer.json', 'web-factory');
            });

            it('adds dashed repository name in composer.json', function () {
                assert.fileContent('composer.json', 'generator-webfactory-open-source');
            });
        });
    });
});
