'use strict';

describe('Service: ErrorService', function () {

  // load the controller's module
  beforeEach(module('paths'));

  var service,
    errorCb;

  // Initialize the service
  beforeEach(inject(function (ErrorService) {
    service = ErrorService;

    errorCb = jasmine.createSpy('errorCb');
    service.onError(errorCb);
  }));

  it('should have no errors initially', function() {
    expect(service.errors).toEqual([]);
  });

  it('should add an error', function() {
    expect(service.errors).toEqual([]);

    service.add({msg: 'abc'});

    expect(service.errors).toEqual([{msg: 'abc'}]);
    expect(errorCb).toHaveBeenCalledWith({msg: 'abc'});
  });

  it('should handle multiple errors', function() {
    expect(service.errors).toEqual([]);

    service.add({msg: 'abc'});
    service.add({msg: 'def'});

    expect(service.errors).toEqual([{msg: 'abc'}, {msg: 'def'}]);
    expect(errorCb).toHaveBeenCalledWith({msg: 'abc'});
    expect(errorCb).toHaveBeenCalledWith({msg: 'def'});
  });

});
