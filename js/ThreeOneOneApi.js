/* Copyright (C) 2012, Code for America
 * This is open source software, released under a standard 2-clause
 * BSD-style license; see the file LICENSE for details.
 */

var ThreeOneOneApi = function () {
  this.MONGOHQ_API_BASE_URI = 'http://mongoprox.herokuapp.com/databases/chicago/collections/'
};

ThreeOneOneApi.REQUEST_STATES = {
  OPEN: 'open',
  CLOSED: 'closed'
};

ThreeOneOneApi.prototype = {
  
  constructor: ThreeOneOneApi,

  find: function (collection, fields, query, results, callback, finalize, caller) {
    this._find(collection, query, results, 0, callback, finalize, caller);
  },

  findDistinct: function (fields, query, results, callback, caller) {

    var dataUri = this.MONGOHQ_API_BASE_URI + 
                  "distinct/" +
                  'documents?' +
                  'q=' + query +
                  '&callback=?';

    $.getJSON(dataUri, function(data) {
        results = data[0];
        callback(results, caller);
    });
    
  },

  // get all documents from mongo, 100 at a time
  _find: function (collection, query, results, skipCount, callback, finalize, caller) {

    // save this context to self so we can make recursive call inside anon func 
    self = this;

    var dataUri = this.MONGOHQ_API_BASE_URI + 
                  collection + "/" +
                  'documents?' +
                  'limit=100&' + 
                  'q=' + query + '&' +
                  'skip=' + skipCount + 
                  '&callback=?';

    // keep calling until we cannot get any more data from API
    $.getJSON(dataUri, function(data) {
      if (data.length > 0) { 
        $.merge(results, data);
        callback(results, caller);
        skipCount += 100;
        self._find(collection, query, results, skipCount, callback, finalize, caller);
      } else {
        finalize(caller); // no more data, alert the caller
      }
    });

  }

};
