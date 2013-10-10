'use strict';

/**
 * A simple abstraction layer for requestAnimationFrame.
 *
 * @todo: This doesn't polyfill the functionality for browsers where there is no
 * support for requestAnimationFrame. Should probably add a setTimeout-based
 * solution for that, which should be easy to do. Ideally that solution should
 * also collect multiple requests into a list and execute all the callbacks in
 * response to a single timeout (i.e. in a single event loop cycle) for
 * efficiency.
 *
 * @todo: Optimize. Shouldn't call window.performance.now where native
 * implementation passes correct value already.
 *
 * This service exposes a getAnimTime function that should be used as the basis
 * of time difference calculations during your animation. Since native
 * implementations of requestAnimationFrame vary from browser to browser (some
 * of them call your callback with timing info from window.performance.now, some
 * use a Date.now type of value), we ensure that getAnimTime and your callback
 * will always receive the same type of value. So if you follow this sort of
 * pattern, you will always calculate a correct elapsed time:
 *
 *     var startTime = animationService.getAnimTime()
 *     animationService.requestAnimFrame(function(currentTime) {
 *       var elapsed = currentTime - startTime;
 *       // Draw frame based on elapsed time.
 *     });
 */

angular.module('animationService', [])
  .factory('animationService', ['$window', function($window) {
    var getAnimTime =
        // Use sub-millisecond timing with window.performance.now where available.
        ($window.performance.now && angular.bind($window.performance, $window.performance.now)) ||
        Date.now ||
        function() {
          return new Date().getTime();
        };

    var nativeRequestAnimationFrame =
        $window.requestAnimationFrame ||
        $window.mozRequestAnimationFrame ||
        $window.webkitRequestAnimationFrame;

    var cancelAnimationFrame =
        $window.cancelAnimationFrame ||
        $window.mozCancelAnimationFrame ||
        $window.webkitCancelAnimationFrame ||
        $window.webkitCancelRequestAnimationFrame ||
        function() {};
    cancelAnimationFrame = angular.bind($window, cancelAnimationFrame);

    var requestAnimationFrame = function(f) {
      /* @todo: don't need to override this if nativeRequestAnimationFrame is
         already doing what we want, but how to detect instantly/consistently
         whether native implementation is using performance.now? */
      return nativeRequestAnimationFrame(function() {
        f(getAnimTime());
      });
    };

    return {
      getAnimTime: getAnimTime,
      requestAnimFrame: requestAnimationFrame,
      cancelAnimFrame: cancelAnimationFrame
    };
  }]);