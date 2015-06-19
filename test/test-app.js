'use strict';

var path = require('path');
var assert = require('yeoman-generator').assert;
var helpers = require('yeoman-generator').test;
var os = require('os');

describe('webfactory-open-source:app', function () {
    before(function (done) {
        helpers.run(path.join(__dirname, '../generators/app'))
            .withOptions({skipInstall: true})
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
});
