/**
 * Created by jayaram on 4/12/16.
 */

var mBrowser = angular.module('mBrowser', ['mControllers', 'ui.bootstrap']);

mBrowser.directive('measurementbrowser', function() {
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        template: '<uib-tabset active="active">' +
        '<uib-tab index="$index" ng-repeat="tab in tabs" heading="{{tab.title}}" active="tab.active" disable="tab.disabled" ng-click="loadContent()">' +
        '<div ng-include src="tab.templateURL"></div>' +
        '</uib-tab>' +
        '</uib-tabset>',
        scope: {
        },
        controller: 'tabCtrl',
        link: function(scope, elem, attrs) {
        }
    }
});