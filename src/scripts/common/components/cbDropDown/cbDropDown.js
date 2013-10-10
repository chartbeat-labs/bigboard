'use strict';

/**
 * @ngdoc directive
 * @name cbDropDown
 *
 * @description
 * An standard dropdown that can be properly styled. Directly references the
 * model specified on the scope of the controller.
 * 
 * @example
 * This goes on the controller:
 *  $scope.sortBy = {
 *   selection: {label: 'Total Visitors', value: 'people'},
 *   options: [
 *        {label: 'Total Visitors', value: 'people'},
 *        {label: 'Most Engaging Pages', value: 'engaged_time'},
 *        {label: 'Most Social Traffic', value: 'social'},
 *        {label: 'Most Internal Traffic', value: 'internal'},
 *        {label: 'Most New Traffic', value: 'new'}
 *      ]
 *    };
 *
 * This goes in the template:
 *   <cb-drop-down model="sortBy">
 *
 */

angular.module('cbDropDown', []).directive('cbDropDown', [
  function() {
    return {
      scope: {
        model: '='
      },
      restrict: 'E',
      templateUrl: '/scripts/common/components/cbDropDown/cbDropDown.html',
      controller: 'cbDropDownCtrl'
    };
  }
]);

angular.module('cbDropDown').controller('cbDropDownCtrl',
  ['$scope',
  function($scope) {
    $scope.showList = false;
    if (!$scope.model.selection) {
      $scope.model.selection = {
          label: $scope.model[1].label,
          value: $scope.model[1].value
        };
    }

    $scope.dropdownToggle = function() {
      $scope.showList = !$scope.showList;
    };

    $scope.select = function(option) {
      $scope.model.selection = {
          label: option.label,
          value: option.value
        };
      $scope.dropdownToggle();
    };
  }]);

