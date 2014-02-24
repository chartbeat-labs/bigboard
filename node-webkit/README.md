Chartbeat Big Board Application
===============================

This is an application version of Chartbeat's [Big Board](https://github.com/chartbeat-labs/bigboard) web application.  Packaged into an application using [node-webkit](https://github.com/rogerwang/node-webkit).

# How To Develop

1. Clone down locally
2. `bower install`
3. `make`

[node-webkit](https://github.com/rogerwang/node-webkit) allows you to package a web application to run as a desktop application.  It is a good to read up on `node-webkit` to more thoroughly understand what is going on.

The tl;dr is that the web application lives in `app` and node-webkit specific files live in `app-contents`.


# How To Build Distributable Copy

1. Run `make`