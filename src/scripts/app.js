'use strict';

angular.module('chartbeat.labs.bigboard', [
  'ngRoute',
  'ngCookies',
  'ngAnimate',
  'configService',
  'feedTypes',
  'feedCoalesceService',
  'cbTimeDisplayFilter',
  'animationService',
  'cbAnimatedList',
  'cbAnimatedNumber',
  'cbBigBoardCtlr',
  'cbDropDown'
])

.config(['$httpProvider',
         '$routeProvider',
        function($httpProvider,
        $routeProvider
) {

  // X-Requested-With cause CORS issues with chartbeat API's
  delete $httpProvider.defaults.headers.common['X-Requested-With'];

  // I want to route it, route it
  $routeProvider
    .when('/:hosts', {
      templateUrl: '/scripts/views/bigBoard.html',
      controller: 'cbBigBoardCtrl'
    })
    .otherwise({redirectTo: '/'});
}])

.run(['$rootScope',
      '$routeParams',
      'configService',
      function($rootScope,
      $routeParams,
      configService
) {
  $rootScope.$on('$routeChangeSuccess', function() {
    // Extend our configService with all params in the route
    angular.extend(configService, $routeParams);
  });
}]);
