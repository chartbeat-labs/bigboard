'use strict';

/**
 * @ngdoc filter
 * @name cbTimeDisplay
 * @function
 *
 * @description
 * Formats a number of seconds as a colon-separated time display value,
 * optionally forcing a certain number of digits/characters.
 * 
 * @example
 * `{{5 | cbTimeDisplay}}` will output `5`
 * `{{5 | cbTimeDisplay:2}} will output `05`
 * `{{5 | cbTimeDisplay:3}} will output `0:05`
 * `{{63 | cbTimeDisplay}} will output `1:03`
 * `{{8073 | cbTimeDisplay}} will output `2:14:33`
 *
 * If the input is not a number an empty string is returned.
 *
 * @param {number|string} number Number to format.
 * @param {(number|string)=} [forcedDigits=3] Number of digits to force display.
 * @returns {string} The formatted time display
 */

angular.module('cbTimeDisplayFilter', [])
  .filter('cbTimeDisplay', function() {
    return function(seconds, forcedDigits) {
      if (seconds === null) {
        return '';
      }

      seconds = Number(seconds);
      if (!angular.isNumber(seconds)) {
        return '';
      }

      // Make sure there's no fractional weirdness
      seconds = Math.floor(seconds);

      // Default to 3 digits (m:ss)
      forcedDigits = Number(forcedDigits) || 3;

      var output = '';

      // seconds...
      var digits = seconds % 60;

      seconds = seconds - digits;

      if (forcedDigits > 1 || seconds > 0) {
        output = (digits < 10 ? '0' : '') + digits;
        forcedDigits -= 2;
      } else {
        return String(digits);
      }

      if (forcedDigits <= 0 && seconds === 0) {
        return output;
      }

      // minutes...
      digits = (seconds / 60) % 60;
      seconds = seconds - (digits * 60);

      if (forcedDigits > 1 || seconds > 0) {
        output = (digits < 10 ? '0' : '') + digits + ':' + output;
        forcedDigits -= 2;
      } else {
        return String(digits) + ':' + output;
      }

      if (forcedDigits <= 0 && seconds === 0) {
        return output;
      }

      // hours...
      digits = (seconds / 60 / 60) % 24;
      seconds = seconds - (digits * 60 * 60);

      if (forcedDigits > 1 || seconds > 0) {
        output = (digits < 10 ? '0' : '') + digits + ':' + output;
        forcedDigits -= 2;
      } else {
        return String(digits) + ':' + output;
      }

      if (forcedDigits <= 0 && seconds === 0) {
        return output;
      }

      // days!
      return (seconds / 60 / 60 / 24) + ':' + output;
    };
  });
