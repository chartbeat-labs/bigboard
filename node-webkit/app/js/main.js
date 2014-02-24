'use strict';

angular.module('bigboard-app', [])
  .config(function($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
      'self',
      'https://chartbat.com/**'
    ]);
  });


angular.module('bigboard-app').controller('AuthController', function($scope, $timeout) {
  $scope.form = {};

  // Make AJAX post request to sign user in
  $scope.auth = function() {
    $scope.message = 'Loading...';

    $timeout(function() {
      $scope.toggleBigboard();
    }, 500);
  };
});


angular.module('bigboard-app').controller('MainController', function($scope, $sce) {

  var demoUrls = [
    'ads.chartbeat.com',
    'techcrunch.com',
    'chartbeat.com',
    'gizmodo.com',
    'nytimes.com',
    'demo.com',
    'ads.vice.com',
    'ads.smh.com.au',
    'ads.sbnation.com',
    'ads.time.com'
  ];

  /**
   * Returns a ready to use bigboard url
   * @param  {Array} domains Array of domains to show in bigboard.
   * @return {String}
   */
  var getUrl = function(domains) {
    var url = 'https://chartbeat.com/labs/publishing/bigboard/';
    return $sce.trustAsResourceUrl(url + domains.join());
  };

  $scope.toggleBigboard = function() {
    $scope.bigboard.showing = !$scope.bigboard.showing;
  };

  $scope.bigboard = {
    showing: false,
    url: getUrl(demoUrls)
  };

});
