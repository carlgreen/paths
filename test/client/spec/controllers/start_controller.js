'use strict';

describe('Controller: StartController', function() {

  // load the controller's module
  beforeEach(module('paths'));

  var StartController,
    pathsService,
    scope,
    $q,
    $rootScope,
    queryDeferred;

  // Initialize the controller and a mock scope
  beforeEach(inject(function(_$q_, _$rootScope_, $controller) {
    $q = _$q_;
    $rootScope = _$rootScope_;
    scope = $rootScope.$new();
    queryDeferred = undefined;
    pathsService = {
      connect: function(/*authResult*/) {
        queryDeferred = $q.defer();
        return queryDeferred.promise;
      }
    };
    spyOn(pathsService, 'connect').andCallThrough();

    StartController = $controller('StartController', {
      $scope: scope,
      PathsService: pathsService
    });
  }));

  it('should have a StartController', function() {
    expect(StartController).toBeDefined();
  });

  it('should attach the result of connect to the scope', function() {
    /* jshint camelcase: false */
    spyOn($rootScope, '$broadcast').andCallThrough();

    expect(scope.userProfile).toBeUndefined();

    scope.processAuth({access_token: 'abc123'});

    queryDeferred.resolve({data: 'xyz'});
    $rootScope.$apply();

    expect(pathsService.connect).toHaveBeenCalledWith({access_token: 'abc123'});
    expect($rootScope.$broadcast).toHaveBeenCalledWith('signedIn', 'xyz');
  });

  it('should not set the user profile when connect fails', function() {
    /* jshint camelcase: false */
    spyOn($rootScope, '$broadcast').andCallThrough();

    scope.processAuth({access_token: 'abc123'});

    queryDeferred.reject({status: 500});
    $rootScope.$apply();

console.log(jasmine.any);
    expect($rootScope.$broadcast).not.toHaveBeenCalledWith('signedIn', jasmine.any(String));
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
});
