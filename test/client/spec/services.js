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

  it('should connect and return user', function() {
    $httpBackend.expectPOST('api/connect').respond(204, {id: 13});
    $httpBackend.expectGET('api/users/13').respond(200, {});

    service.connect();

    $httpBackend.flush();
  });

  it('should disconnect and delete on disconnect', function() {
    $httpBackend.expectPOST('api/disconnect').respond(204);
    $httpBackend.expectDELETE('api/users/13').respond(204);

    var success;
    service.disconnect(13)
      .then(function() {
        success = true;
      })
      .catch(function() {
        success = false;
      });

    $httpBackend.flush();
    expect(success).toBe(true);
  });

  it('should not delete when disconnect fails on disconnect', function() {
    $httpBackend.expectPOST('api/disconnect').respond(500);

    var success;
    service.disconnect(13)
      .then(function() {
        success = true;
      })
      .catch(function() {
        success = false;
      });

    $httpBackend.flush();
    expect(success).toBe(false);
  });

  it('should not be successful when delete fails on disconnect', function() {
    $httpBackend.expectPOST('api/disconnect').respond(204);
    $httpBackend.expectDELETE('api/users/13').respond(500);

    var success;
    service.disconnect(13)
      .then(function() {
        success = true;
      })
      .catch(function() {
        success = false;
      });

    $httpBackend.flush();
    expect(success).toBe(false);
  });

  it('should list all files', function() {
    $httpBackend.expectGET('api/files').respond(200, [{name: 'file.csv'}]);

    var data;
    service.listFiles()
      .then(function(response) {
        data = response.data;
      });

    $httpBackend.flush();
    expect(data).toEqual([{'name': 'file.csv'}]);
  });

  it('should upload the files', function() {
    var xhr = sinon.useFakeXMLHttpRequest();
    var request;
    xhr.onCreate = function(xhr) {
      request = xhr;
    };
    var success;
    service.uploadFiles([{name: 'file.csv'}])
      .then(function() {
        success = true;
      });
    sinon.restore();

    expect(request.method).toBe('POST');
    expect(request.url).toBe('api/files/upload');
    // no idea how to test the actual data sent

    request.respond(204);
    expect(success).toBe(true);
  });

  it('should not be successful when files could not be uploaded', function() {
    var xhr = sinon.useFakeXMLHttpRequest();
    var request;
    xhr.onCreate = function(xhr) {
      request = xhr;
    };
    var success;
    service.uploadFiles([{name: 'file.csv'}])
      .then(function() {
        success = true;
      })
      .catch(function() {
        success = false;
      });
    sinon.restore();

    expect(request.method).toBe('POST');
    expect(request.url).toBe('api/files/upload');

    request.respond(500);
    expect(success).toBe(false);
  });
});
