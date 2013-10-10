# The [Chartbeat](https://chartbeat.com/) Big Board
----------------------------

Always know what's up. A simple leader-board style visualization to show your best stories on your biggest screen. Built with [AngularJS](http://angularjs.org/) and powered by the Chartbeat [Top Pages API](https://chartbeat.com/docs/api/explore/#endpoint=live/toppages/v3/).

Try the [Demo](http://chartbeat.com/labs/publishing/bigboard/gizmodo.com) with gizmodo.com.


## Installing

First, clone this repository :

    git clone git://github.com/chartbeat-labs/bigboard.git

Install [node.js](http://nodejs.org) (Only used for building the app, not needed for deployment)

then install [grunt-cli](https://github.com/gruntjs/grunt-cli) as a global module.

    [sudo] npm install grunt-cli -g

then install grunt and it's modules in the project's folder.

    cd bigboard/
    npm install

then install bower and it's modules in the src folder.

    cd src/
    bower install

-----------------------
## Running the app

### To run the app locally, run:

    grunt server

then view your bigboard following this url convention:

	http://localhost:9000/#/domain1.com,domain2.com?apiKey={{_apikey_}}
