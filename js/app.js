'use strict'

angular.module('DawgCoffeeApp', ['ngSanitize', 'ui.router', 'ui.bootstrap'])
.config(function($stateProvider, $urlRouterProvider) {
    // if the path doesn't match any of the urls you configured
    // otherwise will take care of routing the user to the specified url
    $urlRouterProvider.otherwise('/');
    
	$stateProvider
		.state('home', {
			url:'/',
			templateUrl: 'partials/home.html',
		})
		.state('orders', {
			url:'/orders',
			templateUrl: 'partials/order.html',
			controller: 'OrdersCtrl'
		})
		.state('detail', {
			url:'/orders/{id}',
			templateUrl: 'partials/bean-detail.html',
			controller: 'DetailCtrl'
		})
		.state('cart', {
			url:'/cart',
			templateUrl: 'partials/cart.html',
			controller: 'CartCtrl'
		})
})

// For order page
.controller('OrdersCtrl', ['$scope', '$http', function($scope, $http) {
    // get data from the data file
	var request = 'data/products.json';
	$http.get(request).then(function(response) {
		$scope.orders = response.data;    
	});
}])

// For bean detail plage
.controller('DetailCtrl', ['$scope', '$http', '$stateParams', '$filter', 'orderCart', function($scope, $http, $stateParams, $filter, orderCart) {
	$http.get('data/products.json').then(function(response) {
		$scope.bean = $filter('filter')(response.data, {
			id: $stateParams.id
		}, true)[0];
	});
	$scope.saveToCart = function(bean) {
        orderCart.saveToCart(bean);
        orderCart.addToService(bean);
    };

}])

// For shopping cart page
.controller('CartCtrl', ['$scope', '$http', 'orderCart', '$uibModal', function($scope, $http, orderCart, $uibModal) {	
    // re-initialize
	$scope.shoppingList = orderCart.shoppingList;
    
    // subtracting quantity of the bean
	$scope.subtract = function(bean) {
		if(bean.quantity > 1 && bean.quantity <= 10) {
			bean.quantity--;
		}
		orderCart.addToService();
	}
    // adding quantity of the bean
	$scope.add = function(bean) {
		if(bean.quantity < 10 && bean.quantity >= 1) {
			bean.quantity++;
		}
		orderCart.addToService();
	}
    // removing bean
	$scope.removeBean = function(bean) {
		$scope.shoppingList.splice($scope.shoppingList.indexOf(bean), 1);
		orderCart.addToService();
	}
    // submit order
	$scope.submit = function() {
        // thank the user
		var modalInstance = $uibModal.open({
			 templateUrl: 'partials/cart-modal.html',
		});
		$scope.shoppingList.length = 0;
		orderCart.addToService();
	}
    // calculate the total price for orders
	$scope.totalPrice = function() {
		var total = 0;
		for (var i = 0; i < $scope.shoppingList.length; i++) {
			total += $scope.shoppingList[i].price * $scope.shoppingList[i].quantity;
		}
		return total;
	}
}])

.controller('ModalCtrl', function($scope, $http, $uibModalInstance) {
  $scope.shoppingList = {};
})

// saving data to local storage
.factory('orderCart', function(){
	var service = {};

	service.shoppingList = [];
	if (localStorage.getItem("storedCart")) {
		service.shoppingList = JSON.parse(localStorage.getItem("storedCart"));
	}
	service.saveToCart = function(bean, quantity, grind){
		service.shoppingList.push(bean);
		service.addToService();
	};
	service.addToService = function() {
		localStorage.setItem("storedCart", angular.toJson(service.shoppingList));
	};
	return service; 
});