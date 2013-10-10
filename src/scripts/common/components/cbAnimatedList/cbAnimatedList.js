'use strict';

/**
 * @ngdoc directive
 * @name cbAnimatedList
 *
 * @description
 * An animated list of items.
 *
 * Should be added as an attribute on a <ul> with an <li> inside of it.
 * The <li> will be ng-repeat'd according to the array passed in.
 *
 * On the <ul>'s scope, there's a HEIGHT() function which returns the total height of all <li>s inside it.
 * On the <li>'s scope, there's a TOP() function which returns its top position relative to the <ul> parent.
 *
 * If your <li> elements' heights are fixed, you can use the more efficient FIXED_HEIGHT() and FIXED_TOP() functions.
 *
 * cbAnimatedList format: `_item_ in _array_ track by _id_`
 *
 * @example
 *   <ul cb-animated-list="page in items track by path" style="height: {{HEIGHT()}}px;">
 *     <li style="top: {{TOP()}}px;">{{page}}</li>
 *   </ul>
 *
 * @example
 *   <ul cb-animated-list="page in items track by path" style="height: {{FIXED_HEIGHT()}}px;">
 *     <li style="top: {{FIXED_TOP()}}px;">{{page}}</li>
 *   </ul>
 */


(function() {

  function getChildren(scope) {
    var childs = [];
    var child = scope.$$childHead;
    while (child) {
      childs.push(child);
      child = child.$$nextSibling;
    }
    return childs;
  }

  angular.module('cbAnimatedList', [])
    .directive('cbAnimatedList', function() {

      function arrayToObject(arr, key) {
        var obj = {};

        angular.forEach(arr, function(item, i) {
          obj[arr[i][key]] = arr[i];
          arr[i].ORDER = i;
        });

        return obj;
      }

      return {
        scope: true,
        restrict: 'A',
        compile: function(tElement, tAttrs) {
          var li = tElement.children('li');

          var expression = tAttrs.cbAnimatedList;
          var match = expression.match(/^(.+?)\s+in\s+(.+?)\s+track\s+by\s+(.+?)$/);

          if (!match) {
            throw new Error('Expected cbAnimatedList in form of "_item_ in _array_ track by _id_" but got "' +
              expression + '".');
          }

          var itemName = match[1];
          var itemsName = match[2];
          var itemsKey = match[3];

          // add class to ul so it would be styled properly
          tElement.addClass('cb-animated-list');

          var ngRepeat = itemName + ' in ITEMS_OBJ track by ' + itemName + '.' + itemsKey;

          // add ng-repeat stanza to li
          li.attr('ng-repeat', ngRepeat);

          // add cb-animated-li to it so that we can get its element once ng-repeat does its magic
          li.attr('cb-animated-li', '1');

          // add animate attrs
          li.attr('ng-animate', '"animate"');

          return {
            pre: function preLink(scope) {
              // store for cbAnimatedLi
              scope.itemName = itemName;
              scope.itemsName = itemsName;
              scope.itemsKey = itemsKey;
            },
            post: function postLink(scope) {
              scope.FIXED_HEIGHT = function() {
                if(!scope.ITEMS_ARR) {
                  return 0;
                }
                return scope.ITEMS_ARR.length * scope.ITEM_HEIGHT;
              };

              scope.HEIGHT = function() {
                var height = 0;
                var children = getChildren(scope);
                for(var i=0, l = children.length; i < l; ++i) {
                  height += children[i].element[0].offsetHeight;
                }
                return height;
              };

              scope.$parent.$watch(scope.itemsName, function(newVal) {
                if (!newVal) {
                  return;
                }

                scope.ITEMS_OBJ = arrayToObject(newVal, itemsKey);
                scope.ITEMS_ARR = newVal;
              });
            }
          };
        }
      };

    });

  angular.module('cbAnimatedList').
    directive('cbAnimatedLi', function() {
      // NOTE: this directive shouldn't be used directly.
      // It is used by cbAnimatedList to gain access to the child li's elements
      return {
        scope: false,
        restrict: 'A',
        link: function(scope, element) {
          scope.element = element;
          scope.$parent.ITEM_HEIGHT = element[0].offsetHeight;
          var itemName = scope.$parent.itemName;

          scope.FIXED_TOP = function() {
            return scope[itemName].ORDER * scope.$parent.ITEM_HEIGHT;
          };

          scope.TOP = function() {
            var top = 0;
            var children = getChildren(scope.$parent);
            children.sort(function(a,b) { return a[itemName].ORDER - b[itemName].ORDER; });
            for(var i=0, l = scope[itemName].ORDER; i < l; ++i) {
              top += children[i].element[0].offsetHeight;
            }
            return top;
          };
        }
      };
    });

})();
