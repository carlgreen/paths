'use strict';

describe('Service: PathsService', function () {

  // load the controller's module
  beforeEach(module('paths'));

  var service,
    $httpBackend;

  // Initialize the service and a mock http backend
  beforeEach(inject(function (_$httpBackend_, PathsService) {
    $httpBackend = _$httpBackend_;
    service = PathsService;
  }));

  it('should have a PathsService', function() {
    expect(service).toBeDefined();
  });

  it('should post to disconnect api on disconnect', function() {
    $httpBackend.expectPOST('api/disconnect').respond(204);

    service.disconnect();

    $httpBackend.flush();
  });
});
