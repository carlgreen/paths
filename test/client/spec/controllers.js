'use strict';

describe('Controller: PathsController', function () {

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
  beforeEach(inject(function (_$q_, _$rootScope_, _$httpBackend_, $controller) {
    $q = _$q_;
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    scope = $rootScope.$new();
    queryDeferred = undefined;
    pathsService = {
      connect: function(/*authResult*/) {
        queryDeferred = $q.defer();
        return queryDeferred.promise;
      },
      disconnect: function() {
        queryDeferred = $q.defer();
        return queryDeferred.promise;
      }
    };
    spyOn(pathsService, 'connect').andCallThrough();
    spyOn(pathsService, 'disconnect').andCallThrough();

    PathsController = $controller('PathsController', {
      $scope: scope,
      PathsService: pathsService
    });
  }));

  it('should have a PathsController', function() {
    expect(PathsController).toBeDefined();
  });

  it('should attach the result of connect to the scope', function () {
    /* jshint camelcase: false */
    expect(scope.userProfile).toBeUndefined();

    scope.processAuth({access_token: 'abc123'});

    queryDeferred.resolve({data: 'xyz'});
    $rootScope.$apply();

    expect(pathsService.connect).toHaveBeenCalledWith({access_token: 'abc123'});
    expect(scope.userProfile).toBe('xyz');
  });

  it('should not set the user profile when connect fails', function () {
    /* jshint camelcase: false */
    scope.processAuth({access_token: 'abc123'});

    queryDeferred.reject({status: 500});
    $rootScope.$apply();

    expect(scope.userProfile).toBeUndefined();
  });

  it('should call PathsService.connect when processAuth has an access token', function() {
    scope.processAuth({'access_token': 'abc'});

    expect(scope.immediateFailed).toBe(false);
    expect(pathsService.connect).toHaveBeenCalledWith({'access_token': 'abc'});
  });

  it('should call PathsService.connect when processAuth has an access token', function() {
    scope.processAuth({error: 'immediate_failed'});

    expect(scope.immediateFailed).toBe(true);
    expect(pathsService.connect).not.toHaveBeenCalled();
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

describe('Controller: AdminController', function () {

  // load the controller's module
  beforeEach(module('paths'));

  var AdminController,
    scope,
    pathsService,
    $q,
    $rootScope,
    queryDeferred;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$q_, _$rootScope_, $controller) {
    $q = _$q_;
    $rootScope = _$rootScope_;
    scope = $rootScope.$new();
    queryDeferred = undefined;
    pathsService = {
    listFiles: function() {
        queryDeferred = $q.defer();
        return queryDeferred.promise;
      }
    };
    spyOn(pathsService, 'listFiles').andCallThrough();

    AdminController = $controller('AdminController', {
      $scope: scope,
      PathsService: pathsService
    });
  }));

  it('should have a AdminController', function() {
    expect(AdminController).toBeDefined();
  });

  it('should have an empty list of files on load', function () {
    expect(scope.files).toEqual([]);
  });

  it('should populate file list', function () {
    queryDeferred.resolve({data: [{id: '1', name: 'file.csv'}]});
    $rootScope.$apply();

    expect(pathsService.listFiles).toHaveBeenCalled();
    expect(scope.files).toEqual([{id: '1', name: 'file.csv'}]);
  });
});
