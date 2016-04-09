app.controller('iphell_control', function($scope,$http,$interval){
	loadLocalIp();
	loadRemoteWindowsIp();
	loadRemoteLinuxIp();
	$interval(function(){
		loadLocalIp();
		loadRemoteWindowsIp();
		loadRemoteLinuxIp();
	},3000);
	function loadLocalIp() {
		$http.get('http://localhost:3000/loadLocalIp').success(function(data) {
			$scope.localIp = data;
		});
	};
	function loadRemoteWindowsIp() {
		$http.get('http://localhost:3000/loadRemoteWindowsIp').success(function(data) {
			$scope.remoteWindowsIp = data;
		});
	};
	function loadRemoteLinuxIp() {
		$http.get('http://localhost:3000/loadRemoteLinuxIp').success(function(data) {
			$scope.remoteLinuxIp = data;
		});
	};
}