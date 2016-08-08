'use strict';

/**
 * @ngdoc service
 * @name recurse.nodeMock
 * @description
 * # nodeWrapper
 * Wrapper service for NodeJS: Returns actual NodeJS require function if available, otherwise
 * a specialized mock is returned. This is useful when developing outside the NodeJS environment.
 */
angular.module('recurse.core.utils')
	.factory('nodeWrapper', function nodeWrapper($window) {
		if (angular.isUndefined($window.require)) {
			// return mock-service if NodeJS is not available
			return {
				require: function(service) {
					switch (service) {
						case 'dgram':
							return {
								createSocket: function() {
									return {
										send: function() {}
									};
								}
							};
						case 'osc-min':
							return {
								toBuffer: function() {
									return [];
								},
								send: function() {}
							};
					}
				}
			};
		}
		return {
			require: function(service) {
                console.log('called upon to deliver', service);
				return $window.require(service);
			}
		};
	});
