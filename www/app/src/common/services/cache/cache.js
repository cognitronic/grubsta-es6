/**
 * Created by Danny Schreiber on 3/19/15.
 */

(function() {
    'use strict';
    /**
     * @constructor CacheService
     * @classdesc The cache service is a wrapper for the sessionStorage object and allows
     * for client side state management.
     *
     */
    var CacheService = function() {

        /**
         * Constants representing the available items in the cache.  This allows for using dot notation.
         *
         * @namespace
         * @property {object} UserInfo - global user info
         * @property {object} UserInfo.orgId - currently logged in users's org id
         * @memberOf CacheService
         */
        var _cacheItems = {
            UserInfo: {
                orgId: 'orgId',
                selectedOrg: 'selectedOrg',
                userOrgs: 'userOrgs',
                userData: 'userData',
                userId: 'userId',
                browserSupportChecked: 'browserSupportChecked'
            },
            Referrals: {
                selectedReferral: 'selectedReferral',
                selectedStatus: 'selectedStatus'
            },
            Profile: {
                loadedProfile: 'loadedProfile',
                allClnServices: 'clnServices',
                allNclnServices: 'nclnServices'
            },
            Reports: {
                selectedReport: 'selectedReport'
            },
            Codelists:{
                locList: 'locList',
                allLists: 'allLists',
                declineReasons: 'declineReasons'
            },
            Documents:{
                showAddNewReferral: 'showAddNewReferral'
            },
            TreeInfo: {
                selectedCustomerID: 'selectedCustomerID',
                selectedFacilityID: 'selectedFacilityID'
            },
            Internal: {
                userData: 'internalUserData'
            }
        };

        /**
         * Inserts an item into session storage object
         * @param {string} key
         * @param {object} val value that will be stringified and stored
         * @function setItem
         * @memberOf CacheService
         */
        var _setItem = function(key, val) {
            sessionStorage.setItem(key, JSON.stringify(val));
        };

        /**
         * Retrieves an item from the cache
         * @param {string} item name of the key
         * @function getItem
         * @memberOf CacheService
         */
        var _getItem = function(item) {
            if(angular.fromJson) {
                return angular.fromJson(sessionStorage.getItem(item));
            }
        };

        /**
         * Removes an item from the cache
         *
         * @param {string} item name of the key
         * @function removeItem
         * @memberOf CacheService
         */
        var _removeItem = function(item) {
            sessionStorage.removeItem(item);
        };

        /**
         *Clears all data from the local sessionStorage object
         *
         * @function clearCache
         * @memberOf CacheService
         */
        var _clearCache = function() {
            sessionStorage.clear();
        };



        return {
            setItem: _setItem,
            getItem: _getItem,
            removeItem: _removeItem,
            Items: _cacheItems,
            clearCache: _clearCache
        };
    };

    angular.module('grubsta').factory('CacheService', [CacheService]);
})();
