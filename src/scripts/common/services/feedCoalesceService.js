/* global angular */
'use strict';

angular.module('feedCoalesceService', ['configService', 'feedTypes'])
.service('feedCoalesceService',
    ['$http',
    '$timeout',
    '$rootScope',
    '$q',
    'configService',
    'feedTypes',
    function($http,
      $timeout,
      $rootScope,
      $q,
      configService,
      feedTypes
) {

  // Types of API requests to make
  this.TYPES = feedTypes.TYPES;

  // Dictionary of our subscriptions
  var subscriptions = {};
  var callbacks = {};

  // Feed class to be used to manage subscriptions
  var Feed = function(feedType, opts) {
    this.deferred = {};
    this.promises = [];
    this.feedType = feedType;
    this.opts = opts;
    this.interval = undefined;
    this.dereg = undefined;
    this.lastPoll = undefined;
    this.nextPoll = undefined;
    this.poll();
  };


  // Cancel our feed
  Feed.prototype.cancel = function() {
    if (this.interval !== undefined) {
      //console.log(this.feedType.url, 'cancel');
      $timeout.cancel(this.interval);
      this.interval = undefined;
    }

    if (this.dereg !== undefined) {
      //console.log(this.feedType.url, 'dereg');
      this.dereg();
    }
  };

  /**
   * Makes polling request for all hosts passed to
   * Feed through opts.hosts with the same configuration
   * and only resolves promise object when all polls
   * return successfully
   */
  Feed.prototype.poll = function() {
    var self = this;

    var now = +new Date();
    if (this.feedType.minFrequency && this.lastPoll && now - this.lastPoll < this.feedType.minFrequency) {
      // we can't actually poll now :(
      console.log('HOLDGING HORSES');
      if (this.nextPoll) {
        // if this is set, we already have a timer set up to call poll, so don't set up another one
        return;
      }

      var nextPollTime = this.feedType.minFrequency - (now - this.lastPoll);
      this.nextPoll = $timeout(angular.bind(self, self.poll), nextPollTime);
      return;
    }
    this.lastPoll = now;
    $timeout.cancel(this.nextPoll);
    this.nextPoll = undefined;

    var params = angular.copy(this.opts.params);

    if (self.opts.frequency !== false) {
      self.interval = $timeout(angular.bind(self, self.poll), self.opts.frequency);
    }

    var cbs;

    angular.forEach(self.opts.hosts, function(host) {
      self.deferred[host] = $q.defer();
      self.promises.push(self.deferred[host].promise);
      params.host = host;
      if (self.opts.limits && self.opts.limits[host]){
        params.limit = self.opts.limits[host];
      }
      $http({method: this.opts.method || 'GET', url: this.opts.url, params: angular.copy(params)})
      .success(function(res) {
        var hash = JSON.stringify(self.opts.params);
        cbs = callbacks[self.opts.url][hash];
        //otherwise no reference of host in object
        res.host = host;
        self.deferred[host].resolve(res);
      })
      .error(function(res) {
        $rootScope.$broadcast('feedCoalesceService.DOMAIN_ERROR', host);
        console.log('[FEED FAIL]', host, this.url, this.ops, res);
      });
    }, this);

    $q.all(self.promises).then(function(res) {
      // Neccesary to clear out all deffered & promises for next interval
      self.deferred = {};
      self.promises = [];
      if (cbs !== undefined) {
        for (var i = 0; i < cbs.length; i++) {
          var cb = cbs[i];
          cb(res);
        }
      }
    }, function(res) {
      self.deferred = {};
      self.promises = [];
      console.log('[FEED FAIL]', '[ALL]', res);
      if (cbs !== undefined) {
        for (var i = 0; i < cbs.length; i++) {
          var cb = cbs[i];
          cb(res);
        }
      }
    });
  };

  /**
   * Configure default params for a $http config object.
   * Includes (if it exists) an apiKey, sessionid,
   * and also includes the host.
   * @param  {Object} config $http Config object.
   * @return {Object}        $http Config object.
   */
  this.configureDefaults = function(config) {
    config.params = config.params || {};

    if (configService.sessionId) {
      config.params.sessionid = configService.sessionId;
    } else {
      config.params.apikey = configService.apiKey;
    }

    return config;
  };


  /**
   * Creates a feed subscription
   * @param  {Object} feedType      FeedType object.
   * @param  {OBject} opts          Additional configuration object.
   * @return {Object}               Reference to this subscription for unsubscribing.
   */
  this.subscribe = function(type, opts) {
    opts = this.configureDefaults(opts);

    var attr;
    // Merge type.params into options.params
    for (attr in type.params) {
      if (opts.params[attr] === undefined) {
        opts.params[attr] = type.params[attr];
      }
    }

    // Merge type into options
    for (attr in type) {
      if (attr !== 'params' && opts[attr] === undefined) {
        opts[attr] = type[attr];
      }
    }

    var url = opts.url;
    var params = opts.params;
    var hash = JSON.stringify(params);
    var existing = subscriptions[url] && subscriptions[url][hash];
    var frequency = opts.frequency;

    if (frequency === undefined) {
      console.log('ERROR: frequency undefined for API', type);
      return;
    }

    subscriptions[url] = subscriptions[url] || {};
    callbacks[url] = callbacks[url] || {};

    if (existing === undefined) {
      subscriptions[url][hash] = new Feed(type, opts);
      if (typeof opts.success === 'function') {
        callbacks[url][hash] = [opts.success];
      }
    } else {
      if (typeof opts.success === 'function') {
        callbacks[url][hash].push(opts.success);
      }
    }

    // Retuning a promise is not neccesary here because
    // resoution is handled by $q.all in polling
    return {'url': url, 'hash': hash};
  };


  /**
   * Cancels a feed and removes references in subscriptions and callbacks
   * @param  {Object} feedRef      Reference object of the feed to unsubscribe.
   */
  this.unsubscribe = function(feedRef) {
    var url = feedRef.url;
    var hash = feedRef.hash;

    if (!subscriptions[url][hash]) {
      console.log('[feedCoalesceService]', '[unsubscribe]', 'No subscriptions found with reference:', feedRef);
      return;
    }

    subscriptions[url][hash].cancel();
    delete subscriptions[url][hash];
    delete callbacks[url][hash];
  };

}]);
