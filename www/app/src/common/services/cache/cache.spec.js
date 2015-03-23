/**
 * Created by Danny Schreiber on 3/19/15.
 */
describe('CacheService', function() {
    var cacheService;

    // Initialization of the AngularJS application before each test case
    beforeEach(module('grubsta'));

    // Injection of dependencies
    beforeEach(inject(function(_CacheService_) {
        cacheService = _CacheService_;
    }));

    it('should store an object in the local cache', function() {

        // create an object to test with
        var test = {
            name: 'Danny Schreiber'
        };

        //store object in cache
        cacheService.setItem('TEST', test);

        //should be set to Danny Schreiber
        expect(cacheService.getItem('TEST').name).to.equal('Danny Schreiber');

        //remove object
        cacheService.removeItem('TEST');

        //should be null
        expect(cacheService.getItem('TEST')).to.equal(null);
    });

});
