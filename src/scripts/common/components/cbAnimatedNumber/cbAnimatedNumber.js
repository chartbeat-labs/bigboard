'use strict';

/**
 * @ngdoc directive
 * @name cbAnimatedNumber
 *
 * @description
 * An animated number element. This directive treats its `value` attribute as a
 * target number to animate to -- when it observes a change in the `value`
 * attribute, it begins animating its content text from the previously displayed
 * number to the new number. This directive is configurable with the following
 * attributes:
 *
 *   * `initial-value`: The number to animate from initially. Defaults to 0.
 *   * `duration`: Millisecond duration of the animation. Defaults to 1000 (1s).
 *   * `template`: Allows you to override how the number value is displayed. The
 *     value `currentValue` in the scope of this template is the current value
 *     calculated for the animation. The default template is
 *     `{{currentValue | number:0 }}` which formats the number with thousands
 *     separators.
 *
 * @example
 * `<cb-animated-number value="{{realtimeValue}}"></cb-animated-number>`
 *
 * In this example, whenever `realtimeValue` updates on the enclosing scope, the
 * content text of the cb-animated-number element will animate to the new value.
 *
 * @example
 * `<cb-animated-number value="{{realtimeValue}}" duration="3000"></cb-animated-number>`
 *
 * Same as above example except animation will take 3 seconds instead of 1.
 */

angular.module('cbAnimatedNumber', ['animationService'])
  .directive('cbAnimatedNumber', ['animationService', function(animationService) {

    return {
      template: function(tElement, tAttrs) {
        return tAttrs.template || '{{currentValue | number:0 }}';
      },
      restrict: 'EA',
      scope: true,
      link: function(scope, iElement, iAttrs) {
        // Initialize the number display to "initial-value" attr or default to 0
        //scope.currentValue = Number(scope.initialValue) || 0;
        scope.currentValue = Number(iAttrs.initialValue) || 0;

        // Set animation duration to duration attr or default to 1 second.
        var duration = Number(iAttrs.duration) || 1000,
            animationId = null;

        // Observe changes to the "value" attribute and animate the number
        // whenever that value changes
        iAttrs.$observe('value', function(value) {
          //console.log('value has changed value to ' + value);
          value = Number(value);

          if (animationId !== null) {
            animationService.cancelAnimFrame(animationId);
          }

          // Animate to the new value, starting from the current displayed number
          var fromValue = scope.currentValue || 0,
              startTime = animationService.getAnimTime();

          // Draw a frame of animation
          function draw(currentTime) {
            var percentage = Math.min(1, (currentTime - startTime) / duration);

            scope.currentValue = fromValue + Math.round(percentage * (value - fromValue));
            scope.$digest();

            if (percentage < 1 && scope.currentValue !== value) {
              animationId = animationService.requestAnimFrame(draw);
            } else {
              animationId = null;
            }
          }

          // Start animation loop by drawing first frame.
          animationId = animationService.requestAnimFrame(draw);
        });
      }
    };
  }]);
