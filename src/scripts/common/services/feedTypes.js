/* global angular */
'use strict';

/**
 * A constant enumeration of Chartbeat's API endpoints. The fields of each
 * feedType are as follows:
 *
 * ### url
 * The url of the API endpoint.
 *
 * ### frequency
 * Value in milliseconds specifying how often the API should be polled when
 * active.
 *
 * ### params
 * An object containing static parameters to send to the API. These will be
 * encoded as query parameters to the API.
 *
 * ### filters
 * The `filters` key of each feed should be an object where each key corresponds
 * to a filter key as set in the filterService. Any time the filterService has
 * a value for that key (the dashboard is in a state where it is filtering on
 * that value for that key), any feed that has that key in its `filters` object
 * will send the filter value as a query param to the API. If the value in the
 * `filters` object is `true`, the query param will be named exactly like the
 * filter key. If the value is a string, the query param will use that name
 * instead. The value may also be an object containing any number of static
 * query params along with an alias to use for the filter value. See feedService
 * for more info on how that works. TODO: document this more precisely.
 */

angular.module('feedTypes', [])
  .constant('feedTypes', {
    TYPES: {
      QUICKSTATS: {
        url: '//api.chartbeat.com/live/quickstats/v3/',
        frequency: 5000
      },

      TOP_PAGES: {
        url: '//api.chartbeat.com/live/toppages/v3/',
        frequency: 5000
      },
      TOP_GROUPS: {
        frequency: 15 * 1000,
        url: '//api.chartbeat.com/live/topgroups/'
      },

      TRAFFIC_STATS: {
        url: '/historical/traffic/stats/',
        frequency: 6000
      },

      TRAFFIC_VALUES: {
        frequency: 4 * 60 * 1000,
        url: '/historical/traffic/values/',
        params: {
          'days_ago': '7,14,21,28',
          'limit': 1,
          'fields': 'internal,search,links,direct,social'
        }
      }
    }
  });
