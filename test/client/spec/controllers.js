'use strict';

describe('Controller: PathsController', function () {

  // load the controller's module
  beforeEach(module('paths'));

  var PathsController,
    scope,
    usersService,
    pathsService,
    $q,
    $rootScope,
    $httpBackend,
    queryDeferred,
    removeUserQ;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$q_, _$rootScope_, _$httpBackend_, $controller) {
    $q = _$q_;
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    scope = $rootScope.$new();
    queryDeferred = undefined;
    removeUserQ = undefined;
    usersService = {
      getUser: function(/*id*/) {
        queryDeferred = $q.defer();
        return queryDeferred.promise;
      },
      removeUser: function() {
        removeUserQ = $q.defer();
        return removeUserQ.promise;
      }
    };
    spyOn(usersService, 'getUser').andCallThrough();
    spyOn(usersService, 'removeUser').andCallThrough();
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
      UsersService: usersService,
      PathsService: pathsService
    });
  }));

  it('should have a PathsController', function() {
    expect(PathsController).toBeDefined();
  });

  it('should attach the result of UsersService.getUser to the scope', function () {
    expect(scope.userProfile).toBeUndefined();

    scope.signedIn({data: {id: 13}});

    queryDeferred.resolve({status: 200, data: 'xyz'});
    $rootScope.$apply();

    expect(scope.userProfile).toBe('xyz');
  });

  it('should not set the user profile when UsersService.getUser is in error', function () {
    scope.signedIn({data: {id: 13}});

    queryDeferred.reject({status: 500, data: 'xyz'});
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

  it('should call PathsService.disconnect and UsersService.removeUser when disconnect is called', function() {
    scope.userProfile = {_id: 13};
    scope.immediateFailed = false;

    scope.disconnect();

    queryDeferred.resolve({status: 200});
    $rootScope.$apply();
    removeUserQ.resolve({status: 204});
    $rootScope.$apply();

    expect(pathsService.disconnect).toHaveBeenCalled();
    expect(usersService.removeUser).toHaveBeenCalledWith(13);
    expect(scope.immediateFailed).toBe(true);
    expect(scope.userProfile).toBeUndefined();
  });

  it('should not call UsersService.removeUser when PathsService.disconnect errors', function() {
    scope.userProfile = {_id: 13};
    scope.immediateFailed = false;

    scope.disconnect();

    queryDeferred.reject({status: 500});
    $rootScope.$apply();

    expect(pathsService.disconnect).toHaveBeenCalled();
    expect(removeUserQ).toBeUndefined();
    expect(usersService.removeUser).not.toHaveBeenCalled();
    expect(scope.immediateFailed).toBe(false);
    expect(scope.userProfile).toBeDefined();
  });

  it('should not call clear scope when usersService.removeUser errors', function() {
    scope.userProfile = {_id: 13};
    scope.immediateFailed = false;

    scope.disconnect();

    queryDeferred.resolve({status: 200});
    $rootScope.$apply();
    removeUserQ.reject({status: 500});
    $rootScope.$apply();

    expect(pathsService.disconnect).toHaveBeenCalled();
    expect(usersService.removeUser).toHaveBeenCalled();
    expect(scope.immediateFailed).toBe(false);
    expect(scope.userProfile).toBeDefined();
  });
});
