'use strict';

describe('Controller: AdminController', function() {

  // load the controller's module
  beforeEach(module('paths'));

  var AdminController,
    scope,
    pathsService,
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
      listFiles: function() {
        queryDeferred = $q.defer();
        return queryDeferred.promise;
      },
      uploadFiles: function() {
        queryDeferred = $q.defer();
        return queryDeferred.promise;
      },
      saveTrip: function() {
        queryDeferred = $q.defer();
        return queryDeferred.promise;
      }
    };
    spyOn(pathsService, 'listFiles').andCallThrough();
    spyOn(pathsService, 'uploadFiles').andCallThrough();
    spyOn(pathsService, 'saveTrip').andCallThrough();

    AdminController = $controller('AdminController', {
      $scope: scope,
      PathsService: pathsService
    });
  }));

  it('should have a AdminController', function() {
    expect(AdminController).toBeDefined();
  });

  it('should have an empty list of files on load', function() {
    expect(scope.files).toEqual([]);
  });

  it('should populate file list', function() {
    queryDeferred.resolve({data: [{id: '1', name: 'file.csv'}]});
    $rootScope.$apply();

    expect(pathsService.listFiles).toHaveBeenCalled();
    expect(scope.files).toEqual([{id: '1', name: 'file.csv'}]);
  });

  it('should extract filenames to upload from the input', function() {
    expect(scope.uploadFiles).toBeUndefined();
    var element = {
      files: {
        '0': {'name': 'afile'},
        '1': {'name': 'bfile'},
        'length': 2
      }
    };
    scope.setFiles(element);
    expect(scope.uploadFiles).toEqual([{'name': 'afile'}, {'name': 'bfile'}]);
  });

  it('should pass the files to the service to be uploaded', function() {
    scope.uploadFiles = [{'name': 'afile'}, {'name': 'bfile'}];
    scope.doUploadFiles();

    queryDeferred.resolve();
    $rootScope.$apply();

    expect(pathsService.uploadFiles).toHaveBeenCalledWith([{'name': 'afile'}, {'name': 'bfile'}]);
    // should be called on load and after upload
    expect(pathsService.listFiles.callCount).toBe(2);
  });

  it('should clear file list once uploaded', function() {
    scope.uploadFiles = [{'name': 'afile'}, {'name': 'bfile'}];
    scope.doUploadFiles();

    queryDeferred.resolve();
    $rootScope.$apply();

    expect(scope.uploadFiles).toBeUndefined();
  });

  it('should call save trip', function() {
    scope.tripName = 'trip1';
    scope.files = [
      {'id': '1'},
      {'id': '2', 'selected': true},
      {'id': '3', 'selected': true},
      {'id': '4'}
    ];

    scope.saveTrip();
    $rootScope.$apply();

    expect(pathsService.saveTrip).toHaveBeenCalledWith({name: 'trip1', paths: ['2', '3']});
  });
});
