(function() {
  'use strict';

  angular.module('pathsServices').factory('ErrorService', function() {
    var errorService = {};

    errorService.errors = [];

    errorService.add = function(error) {
      console.error(error.msg);
      if ('detail' in error) {
        console.info(error.detail);
      }
      this.errors.push(error);
      if (this.errorHandler) {
        this.errorHandler(error);
      }
    };

    errorService.onError = function(errorHandler) {
      this.errorHandler = errorHandler;
    };

    return errorService;
  });
})();
