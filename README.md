# Yeoman generator to setup webfactory Open Source projects on GitHub #

[![Build Status](https://travis-ci.org/webfactory/generator-webfactory-open-source.svg?branch=master)](https://travis-ci.org/webfactory/generator-webfactory-open-source)

This generator simplifies the initialization of Open Source software repositories on GitHub.
It is mainly useful for webfactory GmbH as for instance the company name is hardcoded in the templates.

## Installation ##

### Install Yeoman and generator ###

Follow the following steps to install Yeoman and the webfactory Open Source generator.
This has to done only *once*.

    sudo npm install -g yo
    cd ~/Projekte
    git clone git@github.com:webfactory/generator-webfactory-open-source.git
    cd generator-webfactory-open-source
    sudo npm link

## Usage ##

Create an empty Git repository.

Either initialize and connect it to GitHub...

    git init
    git remote add origin git@github.com:webfactory/my-new-project.git
    
... or create it on GitHub and clone it:

    git clone git@github.com:webfactory/my-new-project.git
    
Switch to the repository and use the generator to create some basic files:

    yo webfactory-open-source

## Credits, Copyright and License ##

This project was started at webfactory GmbH, Bonn.

- <http://www.webfactory.de>
- <http://twitter.com/webfactory>

Copyright 2015 webfactory GmbH, Bonn. Code released under [the MIT license](LICENSE).
