/**
 * @fileoverview
 * ConfigService provides a registry of configuration data.
 * By default, the object will include:
 * - 'apiKey': The apikey as retrieved from view in the config_data object.
 *
 * You app code can call addConfigData(configObj) on the configServiceProvider
 * to add custom configuration, like so:
 *
 *     var myDashboardModule = angular.module('myDashboard', ['configService']);
 *     myDashboardModule.config(function(configServiceProvider) {
 *       configServiceProvider.addConfigData({host: 'mydomain.com'});
 *     });
 *
 * Any configuration added as in the above example will be added at module
 * configuration time (before the app starts) and is guaranteed to be available
 * when you inject the configService into your controller/service/directive etc.
 * This is ideal for configuration information that needs to be passed into the
 * app by the server. The server can render a script tag into the html that
 * contains code as in the example to make sure the app is configured before
 * starting.
 */
'use strict';

(function() {

/*******************************************************************************
 * The configServiceProvider constructor.
 */
  function configServiceProvider() {
    this.appConfigData = [];
  }

  configServiceProvider.prototype.addConfigData = function(configData) {
    this.appConfigData.push(configData);
  };

  /**
   * Actually provides the service by returning the assembled configData.
   */
  configServiceProvider.prototype.$get = ['$cookies', '$location', function($cookies, $location) {
    var configData = {};
    // Add any configuration data that the app
    // specified by calling addConfigData.
    angular.forEach(this.appConfigData, function(appData) {
      angular.extend(configData, appData);
    });

    // if (!configData.hosts) {
    //   throw new Error('No hosts configured');
    // }

    // if ($location.search().apikey) {
    //   configData.apiKey = $location.search().apikey;
    // }

    // if (!configData.apiKey) {
    //   throw new Error('No apikey configured');
    // }

    return configData;
  }];


  /*******************************************************************************
   * Register our provider to provide the configService.
   */
  angular.module('configService', ['ngCookies'])
    .provider('configService', configServiceProvider);
})();
