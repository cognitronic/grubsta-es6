/**
 * Created by Danny Schreiber on 3/18/15.
 */

(function() {
    'use strict';
    /* @ngInject */
    var ProfileController = function($http, $location) {
        var vm = this;

        vm.init = init;


        function init() {
            console.log('hello');
        }

        vm.init();
    };

    angular.module('grubsta').controller('ProfileController', ['$http', '$location', ProfileController]);
})();
