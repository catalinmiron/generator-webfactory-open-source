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

    it('creates a README file', function () {
        assert.file([
            'README.md'
        ]);
    });
});
