/**
 * Created by Jayaram Kancherla ( jkanche [at] umd [dot] edu )
 * Date: 3/8/2016
 */

var mServices = angular.module('mServices', []);

mServices.factory('measurementAPI', function($http, $q) {

    var service = {};

    service.getDataSources = function(dataProvider) {

        var deferred = $q.defer();
        var reqs = [];
        var reqs_index = [];

        angular.forEach(dataProvider, function(dp, index) {
            var dp_url = dp.url + '/dataSources';
            reqs_index.push(index);
            reqs.push($http({
                    method: 'GET',
                    url: dp_url
                })
            );
        });

        $q.all(reqs).then(function(response) {
            deferred.resolve(response);
        });

        return deferred.promise;
    };

    service.getDataAnnotations = function(dataProvider, dataSource) {

        var deferred = $q.defer();
        var reqs = [];

        var ds_url = dataProvider.url + '/annotations/' + dataSource.name;
        reqs.push($http({
            method: 'GET',
            url: ds_url
            })
        );

        $q.all(reqs).then(function(response) {
            deferred.resolve(response);
        });

        return deferred.promise;

    };

    service.getDataQueries = function(dataProvider, dataSource) {

        var deferred = $q.defer();
        var reqs = [];

        var ds_url = dataProvider.url + '/queries/' + dataSource.name;
        reqs.push($http({
                method: 'GET',
                url: ds_url
            })
        );

        $q.all(reqs).then(function(response) {
            deferred.resolve(response);
        });

        return deferred.promise;

    };

    service.getMeasurements = function(dataProvider, dataSource, filters, pageSize, offset) {

        //var ds_url = dataProvider.url + '/measurements/' + dataSource.name;

        var reqs = [];

        //TEST FILTERS
/*        filters = [
            {'field': 'sex', 'filterName': 'equals', 'filterValue': 'male', negate:'false'},
            {'field': 'age', 'filterName': 'range', 'filterValue': '20,30', negate:'false'}];*/

        var deferred = $q.defer();

        var ds_url = dataProvider.url + '/measurements/' + dataSource.name;
        reqs.push(
            $http({
                method: 'POST',
                url: ds_url,
                data: {
                    pageSize: pageSize,
                    pageOffset: offset,
                    filter : filters
                }
            })
        );

        $q.all(reqs).then(function(response) {
            deferred.resolve(response);
            //TODO: concatenate all measurements from different data sources
        });

         return deferred.promise;

    };

    service.getChartTypes = function() {

        return {
            "chartTypes": [{
                'name': 'Scatter Plot',
                'label': 'Scatter Plot'
            }, {
                'name': 'HeatMap',
                'label': 'HeatMap'
            }, {
                'name': 'Line Plot',
                'label': 'Line Plot'
            }, {
                'name': 'Bar Plot',
                'label': 'Bar Plot'
            }]
        }
    };

    return service;
});
