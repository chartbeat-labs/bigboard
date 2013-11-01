'use strict';

angular.module('cbBigBoardCtlr', ['feedCoalesceService', 'configService']);

angular.module('cbBigBoardCtlr').controller('cbBigBoardCtrl', ['$scope',
    '$q',
    'feedCoalesceService',
    'configService',
    function($scope,
      $q,
      feedCoalesceService,
      configService
) {

  /* 
  * sortBy Model setup for cbDropDown directive. 
  *
  * $scope.sortBy controls how the top pages are sorted within the bigboard
  * accessed by sortPages() below
  */
  $scope.sortBy = {
    selection: {label: 'Total Visitors', value: 'people'},
    options: [
        {label: 'Total Visitors', value: 'people'},
        {label: 'Most Engaging Pages', value: 'engaged_time'},
        {label: 'Most Social Traffic', value: 'social'},
        {label: 'Most Internal Traffic', value: 'internal'},
        {label: 'Most New Traffic', value: 'new'}
      ]
    };

  /* 
  * Dictates if settings panel is shown or hidden, toggled
  * by settings icon in the header
  */
  $scope.showSettings = false;

  /* 
  * Dictates if numbers (concurrents, eng time) are shown in the
  * Big Board, toggled by a switch in the settings panel
  */
  $scope.hideNumbers = false;

  /* 
  * Dictates if a network total should be fetched from quickstats
  * and calculated for all hosts in bigboard. Toggled by switch and
  * triggered below by $scope.$watch('hideNetworkTotal'...
  */
  $scope.hideNetworkTotal = true;

  /* 
  * Dictates if landing pages should be 'hidden' (not pushed
  * to allPages array in joinFeeds() below) and toggled by
  * a switch in the settings panel.
  */
  $scope.hideLandingPages = false;

  // Adding config objects to scope for template expression opprtunities
  $scope.hosts = configService.hosts.split(',');
  $scope.hostsCount = $scope.hosts.length;
  var DEFAULT_LIMIT = 15;
  if ($scope.hostsCount >= 3) {
    DEFAULT_LIMIT = 10;
  }

  // These will be used throughout the build of the bigboard
  var topPagesFeed;
  var networkFeed;
  var firstSort;
  var landingPagesCount = {};
  var limits = {};

  /**
   * Takes a model (within this scope) and toggles it to the opposite.
   * @param  {String} model   Name of model in string format.
   * @example
   *      $scope.toggleModel('showSettings')" evaluates as
   *      $scope.showSettings = !$scope.showSettings
   */
  $scope.toggleModel = function(model) {
    $scope.$eval(model + '=!' + model);
  };

  /**
   * Clears the rateOfChange which controls the chevrons
   * @param  {Array} items     Array of pages.
   */
  var resetChevrons = function(items) {
    angular.forEach(items, function(page) {
      if (!page.rateOfChange) {
        return;
      }

      delete page.rateOfChange;
    });
  };

  /**
   * Creates a full url for a page give the host and path
   * @param  {String} host     The host of this page.
   * @param  {String} path     The path of this page.
   * @return {String} ret      A full url which can be used in <a> element
   *                           and track cb-animated-list track by _id_.
   */
  var buildFullPageUrl = function(host, path) {
    var ret;
    if (path && path[0] !== '/') {
      ret = 'http://' + path;
    } else {
      ret = 'http://' + host + path;
    }
    return ret;
  };

  /**
   * Sorts pages based on $scope.sortBy.selection.value but has special conditions
   * if it should be the average
   * success callback.
   * @param  {Array} pages      Unsorted array of pages from all hosts.
   * @return {Array} pages      Sorted array of pages from all hosts.
   */
  var sortPages = function(pages) {
    return pages.sort(function(a, b) {
      var comparison;
      if (a['stats'][$scope.sortBy.selection.value]['avg']) {
        comparison = b['stats'][$scope.sortBy.selection.value]['avg'] - a['stats'][$scope.sortBy.selection.value]['avg'];
      } else {
        comparison = b['stats'][$scope.sortBy.selection.value] - a['stats'][$scope.sortBy.selection.value];
      }

      // If the value is identical, compare alphabetically
      if (comparison === 0) {
        var titleA = a['title'].toLowerCase();
        var titleB = b['title'].toLowerCase();
        return titleB > titleA ? -1 : titleB === titleA ? 0 : 1;
      }
      return comparison;
    });
  };

  /**
   * Calculates a rateOfChange for chevrons
   * @param  {Object} page        One page containg data returned from polling.
   * @param  {Integer} newOrder   Index of the page which represents the new
   *                              order in list.
   */
  var addChevron = function(page, newOrder) {
    var deltaOrder;
    //In case its a newly added page
    if (!page.PREVIOUS_ORDER) {
      return page;
    }

    deltaOrder = page.PREVIOUS_ORDER - newOrder;

    // No Chevron change
    if (deltaOrder === 0) {
      return page;
    }

    if (page.rateOfChange !== deltaOrder) {
      page.rateOfChange = deltaOrder;
    }
  };

  /**
   * Handles Top Pages feed contaning all pages of the bigboard, finds the
   * previous position in $scope.items. If no change in location
   * rateOfChange is preseved.
   * @param  {Array} pages    Array of pages from all hosts.
   */
  var handleTopPagesFeed = function(pages) {
    pages.forEach(function(page) {
      if (!page.url) {
        page.url = buildFullPageUrl(page.host, page.path);
      }

      // Have to pass this through since animated list doesn't
      // inherit from $rootScope
      page.hostsCount = $scope.hostsCount;

      if ($scope.items) {
        // Get previous position from the $scope
        $scope.items.forEach(function(item) {
          if (angular.equals(item.path, page.path)) {
            page.PREVIOUS_ORDER = item.ORDER;
            //keep the old rate of change if it exists
            if (item.rateOfChange) {
              page.rateOfChange = item.rateOfChange;
            }
            return;
          }
        });
      }
    });

    var sortedPages = sortPages(pages);
    if (firstSort) {
      // We dont want to add chevrons on first sort
      firstSort = false;
    } else {
      // Add chevrons
      sortedPages.forEach(function(page, order) {
        addChevron(page, order);
      });
    }

    $scope.items = sortedPages;
  };

  /**
   * Joins feeds that a returned by the feedCoalesceService.subscribe
   * success callback.
   * @param  {Array} data       Array of objects return from polling.
   * @return {Array} allPages   Array of pages from all hosts.
   */
  var joinFeeds = function(data) {
    var allPages = [];
    angular.forEach(data, function(feed) {
      landingPagesCount[feed.host] = 0;
      angular.forEach(feed.pages, function(page) {
        page.host = feed.host;
        // Landing Page hiding
        if (page.stats.type === 'LandingPage') {
           // Count landing pages for extending next refreshFeed limit
          landingPagesCount[page.host]++;

          //Skip this page if landing pages should be hidden
          if ($scope.hideLandingPages) {
            return;
          }
        }
        allPages.push(page);
      });
    });
    return allPages;
  };


  /**
   * Unsubscribes from existing feed, extends limits if landing pages are
   * hidden then sets up subscription for polling each domain in
   * configService.hosts
   */
  var setupTopPagesFeeds = function() {
    if (topPagesFeed) {
      feedCoalesceService.unsubscribe(topPagesFeed);
    }

    angular.forEach($scope.hosts, function(host) {
      //Reset and extend feed limit
      limits[host] = DEFAULT_LIMIT;
      if ($scope.hideLandingPages && landingPagesCount[host]) {
        limits[host] += landingPagesCount[host];
      }
      //Force limit from param
      if (!isNaN(configService.limit)) {
        limits[host] = configService.limit;
      }
    });
    firstSort = true;

    topPagesFeed = feedCoalesceService.subscribe(feedCoalesceService.TYPES.TOP_PAGES, {
      params: {
        'types': 1,
        'section': $scope.sectionFilter
      },

      hosts: $scope.hosts,
      limits: limits,
      frequency: 10000,

      success: function(data) {
        var allData = joinFeeds(data);
        handleTopPagesFeed(allData);
      }
    });
  };

   /**
   * Calls for quickstats api for a network total
   */
  var setupNetworkFeed = function() {
    networkFeed = feedCoalesceService.subscribe(feedCoalesceService.TYPES.QUICKSTATS, {
      hosts: $scope.hosts,
      frequency: 10000,

      success: function(data) {
        var totalPages = 0;
        angular.forEach(data, function(host) {
          totalPages += host.people;
        });
        $scope.networkTotal = totalPages;
      }
    });
  };

  /**
   * Removes landing pages from pages in $scope.items.
   */
  $scope.removeLandingPages = function() {
    // Something fishy happens with $scope.items.splice in forEach loop,
    // forEach only knows about the initial state of the array, and therefore
    // calls splice method twice, even if the first call removes an item from
    // the array. TODO: replace with inverted for loop
    var articlePages = [];
    $scope.items.forEach(function(page) {
      if (page.stats.type !== 'LandingPage') {
        articlePages.push(page);
      }
    });
    resetChevrons(articlePages);
    $scope.items = articlePages;
  };

  $scope.setupBothFeeds = function() {
    setupNetworkFeed();
    setupTopPagesFeeds();
  };

  /*
  *  BUILD THE BIGBOARD!
  *  Doing some detection for presets from params for auto-refreshing diplays
  */

  if (angular.equals(configService.nolps, 'true')) {
    // We don't know how many lp's would be removed so extending limit to be sure
    DEFAULT_LIMIT = DEFAULT_LIMIT += 10;
    $scope.hideLandingPages = true;
  }

  if (angular.equals(configService.network, 'true')) {
    $scope.hideNetworkTotal = false;
    $scope.setupBothFeeds();
  } else {
    setupTopPagesFeeds();
  }

  /*
  *  Refreshes the bigboard based on $scope.sortBy.selection.value
  *  which is the metric controlling how the pages are sorted.
  */
  $scope.$watch('sortBy.selection.value', function(newValue, oldValue) {
    // Called when building DOM, exit early if no change
    if (newValue === oldValue) {
      return;
    }

    resetChevrons($scope.items);
    setupTopPagesFeeds();
  });

  /*
  *  Reacts to changes in $scope.hideLandingPages, which controls
  *  landing pages making it into $scope.items model.
  */
  $scope.$watch('hideLandingPages', function(newValue, oldValue) {
    // Called when building DOM, exit early if no change
    if (angular.equals(newValue, oldValue)) {
      return;
    }

    // If they should be hidden, remove them from the dom
    if (newValue === true) {
      $scope.removeLandingPages();
    }

    // Reset feed subscriptions with the new hideLandingPages state
    setupTopPagesFeeds();
  });

  /*
  *  Reacts to changes in $scope.hideNetworkTotal, which dictates
  *  if a total total should be calculated from all hosts
  */
  $scope.$watch('hideNetworkTotal', function(newValue, oldValue) {
    // Called when building DOM, exit early if no change
    if (angular.equals(newValue, oldValue)) {
      return;
    }

    // Network total should be shown, refreshing top pages feed so
    // both feeds have roughly the same timing
    if (angular.equals(newValue, false)) {
      $scope.setupBothFeeds();
    }

    // Network total should be hidden, only unsubscribing and deleting
    // reference to the network feed.
    if (newValue === true) {
      feedCoalesceService.unsubscribe(networkFeed);
      networkFeed = undefined;
    }
  });

  /*
  *  If an api request fails, give them a message. This could be improved
  *  to handle why the request failed.
  */
  $scope.$on('feedCoalesceService.DOMAIN_ERROR', function(event, host) {
    $scope.errorMessage = 'No data for ' + host + ', sure the domain is correct?';
  });
}]);
