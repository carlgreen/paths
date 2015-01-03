'use strict';

describe('Controller: PathsController', function() {

  // load the controller's module
  beforeEach(module('paths'));

  var PathsController,
    scope,
    pathsService,
    $q,
    $rootScope,
    $httpBackend,
    queryDeferred;

  // Initialize the controller and a mock scope
  beforeEach(inject(function(_$q_, _$rootScope_, _$httpBackend_, $controller) {
    $q = _$q_;
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    scope = $rootScope.$new();
    queryDeferred = undefined;
    pathsService = {
      disconnect: function() {
        queryDeferred = $q.defer();
        return queryDeferred.promise;
      }
    };
    spyOn(pathsService, 'disconnect').andCallThrough();

    PathsController = $controller('PathsController', {
      $scope: scope,
      PathsService: pathsService
    });
  }));

  it('should have a PathsController', function() {
    expect(PathsController).toBeDefined();
  });

  it('should clear scope when disconnect succeeds', function() {
    scope.userProfile = {_id: 13};
    scope.immediateFailed = false;

    scope.disconnect();

    queryDeferred.resolve();
    $rootScope.$apply();

    expect(pathsService.disconnect).toHaveBeenCalledWith(13);
    expect(scope.immediateFailed).toBe(true);
    expect(scope.userProfile).toBeUndefined();
  });

  it('should not clear scope when disconnect fails', function() {
    scope.userProfile = {_id: 13};
    scope.immediateFailed = false;

    scope.disconnect();

    queryDeferred.reject({status: 500});
    $rootScope.$apply();

    expect(pathsService.disconnect).toHaveBeenCalledWith(13);
    expect(scope.immediateFailed).toBe(false);
    expect(scope.userProfile).toBeDefined();
  });
});
