/**
 * Created by Jayaram Kancherla ( jkanche [at] umd [dot] edu )
 * Date: 3/8/2016
 */

var mTable = angular.module('dynamicTable', []);

mTable.directive('dyntable', function() {
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        template: '<div>' +
        '<div ng-if="dataReceived == true">' +
        '<form class="form-inline">' +
        '<div class="form-group pull-right">' +
        '<div class="input-group">' +
        '<div class="input-group-addon"><span class="glyphicon glyphicon-search"></span></div>' +
        '<input type="search" class="form-control" placeholder="Search table" ng-model="searchTable">' +
        '</div>' +
        '</div>' +
        '<div >' +
        /*style="height: 300px;overflow: auto"*/
        '<div class="tbContent">' +
        '<table class="table table-hover">' +
        '<thead>' +
        '<tr>' +
        '<th ng-repeat="head in headers">' +
        '<a href="#" ng-click="$parent.sortField = head; $parent.sortReverse = !sortReverse">{{head}}' +
        '<span ng-show="$parent.sortField == head && !$parent.sortReverse" class="glyphicon glyphicon-chevron-down"></span>' +
        '<span ng-show="$parent.sortField == head && $parent.sortReverse" class="glyphicon glyphicon-chevron-up"></span>' +
        '</a>' +
        '</th>' +
        '</thead>' +
        '<tbody>' +
        '<tr ng-repeat="row in data | orderBy:sortField:sortReverse | filter:searchTable track by $index" ng-class="{info: isRowSelected($index, row)}" ng-click="setRowSelected($index, row);">' +
        '<td ng-repeat="cell in row">{{cell}}</td>' +
        '</tr>' +
        '</tbody>' +
        '</table>' +
        '<div style="clear: both;"></div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div ng-if="dataReceived == false"> No data received!! </div>' +
        '</div>',
        scope: {
            data: '=data',
            selectionType: '@selectiontype',
            callbackFn: '&callbackfn'
        },
        controller: function($scope) {

        },
        link: function(scope, elem, attrs) {

            //TODO: implement infinite scroll (load data)
            // emit to parent -> parent loads more data!

            scope.sortField = "";
            scope.sortReverse = false;
            scope.searchTable = "";
            scope.showFilterMenu = false;
            scope.showFilterInput = false;
            scope.dataReceived = false;

            scope.setRowSelected = function(index, row) {

                if(scope.data[index].selected == null ) {
                    scope.data[index].selected = false;
                }

                scope.data[index].selected = !scope.data[index].selected;
            };

            scope.isRowSelected = function(index, row) {

                if(scope.data[index].selected == null ) {
                    scope.data[index].selected = false;
                }

                return scope.data[index].selected;
            };

            scope.$watch('data', function() {

                if(scope.data !== undefined && scope.data.length > 0) {
                    scope.dataReceived = true;
                    scope.headers = Object.keys(scope.data[0]);
                    scope.headers.splice(scope.headers.indexOf('$$hashKey'), 1);
                }
                else {
                    scope.dataReceived = false;
                }
            }, true);

            scope.loadMore = function() {
                scope.callbackFn();
            }
        }
    }
});