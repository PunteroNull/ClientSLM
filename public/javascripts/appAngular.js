angular.module('appSLM', ['ui.router', 'ngtweet'])
	.config(function($stateProvider, $urlRouterProvider, $sceDelegateProvider) {
        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'views/login.html',
                controller: 'ctrlLogin'
            })
            .state('results', {
                url: '/results',
                templateUrl: 'views/results.html',
                controller: 'ctrlResults'
            });
            $sceDelegateProvider.resourceUrlWhitelist([
			    'self',
			    'https://www.youtube.com/**'
			  ]);

        $urlRouterProvider.otherwise('login');
    })
    .constant('configuracionGlobal', {
    	'api_url' : 'http://localhost:3000'
    })
	.directive('starRating', function () {
		return {
	        restrict: 'A',
	        template: '<ul class="rating">' +
	            '<li ng-repeat="star in stars" ng-class="star" ng-click="toggle($index)">' +
	            '\u2605' +
	            '</li>' +
	            '</ul>',
	        scope: {
	            ratingValue: '=',
	            max: '=',
	            onRatingSelected: '&'
	        },
	        link: function (scope, elem, attrs) {

	            var updateStars = function () {
	                scope.stars = [];
	                for (var i = 0; i < scope.max; i++) {
	                    scope.stars.push({
	                        filled: i < scope.ratingValue
	                    });
	                }
	            };

	            scope.toggle = function (index) {
	                scope.ratingValue = index + 1;
	                scope.onRatingSelected({
	                    rating: index + 1
	                });
	            };

	            scope.$watch('ratingValue', function (oldVal, newVal) {
	                if (newVal) {
	                    updateStars();
	                }
	            });
	        }
	    }
	})
	.factory('comun', function(configuracionGlobal, $http) {
		var comun = {};
		comun.resultados = [];
		comun.keywords = [];
		comun.oculta = false;
		comun.codigo = "";
		comun.twitter= {};
		comun.videos = [];
		comun.tweets = [];
		comun.twitterUsers = [];
		comun.flickr = [];
		comun.similar = [];
		comun.username = "";

		comun.processTwitter = function(twitter, email, cb) {
			return $http.get(configuracionGlobal.api_url + "/twitterWithFollowingCachedROS?name=" + twitter.username + "&email=" + email)
			.success(function(data) {
				if(data && data.message == "email_sended"){
					angular.copy(data, comun.resultados);
					return cb("sended");
				}

				if(data && data.result && data.code){
					angular.copy(data.result, comun.resultados);
					return cb("cached", data.code);
				}

				return cb("error");
			})
			.catch(function(err) {
            	comun.resultados = "Algo salio mal";
				return cb("error");
        	});
		}

		comun.obtenerResultado = function(codigo, cb) {
			var code = codigo ? codigo : comun.codigo;
			return $http.get(configuracionGlobal.api_url + "/result?code=" + code)
			.success(function(data) {
				angular.copy(data.result.finalResp, comun.resultados);
				angular.copy(data.result.keywords, comun.keywords);
				comun.username = "@" + data.username;

				for (var i=0; i < comun.resultados.length; i++){
					if(comun.resultados[i].cat)
						comun.resultados[i].catImage = comun.resultados[i].cat.replace(/\s/g, '');

					if(i<2){
						$http.get(encodeURI(configuracionGlobal.api_url + "/youtube?keyword=" + comun.resultados[i].cat))
					    .success(function(datos) {
					        if (datos && datos.items){
								angular.forEach(datos.items, function(value, key) {
									if (value && value.id && value.id.videoId)
										comun.videos.push(value.id.videoId);
								});
							};
						});
					}
					if(i<3){
						$http.get(encodeURI(configuracionGlobal.api_url + "/buscarTweets?words=" + comun.resultados[i].cat))
						.success(function(tweets) {
							angular.forEach(tweets, function(value, key) {
								comun.tweets.push(value);
							})
						});
					}
					if(i<1){
						var dataToSend = {
							"categoriesFromResult": comun.resultados
						}
						$http.post(encodeURI(configuracionGlobal.api_url + "/similarCategories?category=" + comun.resultados[i].cat), dataToSend)
						.success(function(categories) {
							if(categories != 'FALLO' && Array.isArray(categories)){
								angular.forEach(categories, function(value, key) {
									comun.similar.push({"cat":value, "catImage":value.replace(/\s/g, '')});
								})
							}
						});
					}
					if(i<2){
						$http.get(encodeURI(configuracionGlobal.api_url + "/buscarTwitterUsers?words=" + comun.resultados[i].cat))
						.success(function(datos) {
							angular.forEach(datos, function(value, key) {
								comun.twitterUsers.push(value);
							})
						});
					}
					if(i<3){
						$http.get(encodeURI("https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=aee4669b8967a28c6ea251f4defeaa67&tags=" + comun.resultados[i].cat + "&per_page=9&format=json&nojsoncallback=1"))
						.success(function(datos) {
							angular.forEach(datos, function(value, key) {
								for (var i=0; i < 5; i++){
									if(value && value.photo && value.photo[i])
						            	comun.flickr.push(value.photo[i]);
						        };
							});
						});
					}
				}
				return cb(comun.resultados);
			})
		}

		return comun;
	})
	.controller('ctrlLogin', function($scope, $state, comun) {
		$scope.twitter = {};
		$scope.twitter = comun.twitter;
		$scope.twitter.username = '';
		$scope.oculta = comun.oculta;
		$scope.codigo = "";
		$scope.datosOk = false;
		$scope.alerta1 = false;
		$scope.username = "";
		$scope.resultState = "process";
		$scope.email = "";

		$scope.limpiar = function() {
			$scope.datosOk = false;
			$scope.alerta1 = false;
			$scope.twitter = {};
			$scope.codigo = "";
			$scope.email = "";
			$scope.username = "";
		}

		$scope.procesarTwitter = function() {
			if($scope.twitter && $scope.email){
				$scope.datosOk = true;
				comun.processTwitter($scope.twitter, $scope.email, function(state, code){
					if(state == "error")
						$scope.resultState = "error";

					if(state == "sended")
						$scope.resultState = "sended";

					if(state == "cached"){
						$scope.resultState = "cached";
						localStorage.setItem("lastCodeUsed", code);
						$state.go('results');
					}
				});
			} else {
				$scope.alerta2 = true;
			}
		}

		$scope.procesarFacebook = function() {
			//$scope.datosOk = true;
			$scope.alerta1 = true;
		}


		$scope.mostrarResultados = function(codigo) {
			comun.codigo = $scope.codigo;
			comun.obtenerResultado($scope.codigo, function(resultados){
				$scope.twitter.username = '';
				localStorage.setItem("lastCodeUsed", comun.codigo);
				$state.go('results');
			});
		}


		getParameterByName = function(name) {
    		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    			results = regex.exec(location.search);
    		return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    	}
	})
	.controller('ctrlResults', function($scope, $state, comun, configuracionGlobal, $http, $sce) {
		$scope.twitter = {};
		var lastCode = localStorage.getItem("lastCodeUsed");
		var lastTwitterName = localStorage.getItem("lastTwitterUsed");
		if(!comun.codigo && lastCode){
			comun.obtenerResultado(lastCode, function(resultados){
				comun.codigo = lastCode;
				$scope.codigo = lastCode;
				$scope.codigo = comun.codigo;
				$scope.resultados = comun.resultados;
				$scope.username = comun.username;
				$scope.keywords = comun.keywords;
				$scope.videos = comun.videos;
				$scope.tweets = comun.tweets;
				$scope.twitterUsers = comun.twitterUsers;
				$scope.flickr = comun.flickr;
				$scope.similar = comun.similar;
			});
		} else {
			$scope.twitter = comun.twitter;
			$scope.twitterUsername = comun.twitter.username;
			$scope.codigo = comun.codigo;
			$scope.resultados = comun.resultados;
			$scope.username = comun.username;
			$scope.keywords = comun.keywords;
			$scope.videos = comun.videos;
			$scope.tweets = comun.tweets;
			$scope.twitterUsers = comun.twitterUsers;
			$scope.flickr = comun.flickr;
			$scope.similar = comun.similar;
		}

		$scope.masPrioridad	= function(_resultado) {
			_resultado.ocultar = true;
		}

		$scope.menosPrioridad	= function(_resultado) {
			_resultado.ocultar = true;
		}

		$scope.getIframeSrc = function(src) {
  			return 'https://www.youtube.com/embed/' + src;
		}

	    $scope.renderHtml = function (htmlCode) {
	        return $sce.trustAsHtml(htmlCode);
        };

		$scope.rating = 0;
		$scope.voted = false;
		$scope.ratings = [{
		    current: 3,
		    max: 5
		}];

		$scope.getSelectedRating = function(rating) {
			$scope.voted = true;
			var dataToSend = {
				"categories": $scope.resultados,
				"keywords": $scope.keywords,
				"note": rating
			}
			$http.post(configuracionGlobal.api_url + '/feedback', dataToSend).then(function(resp){
				console.log(resp);
			}, function(err){
				console.log(err);
			});
		}
	});
