/*app.controller('two_way_control', function($scope,$http,$interval){
	loadAllPlayers();
	loadDraftedPlayers();
	$interval(function(){
		loadAllPlayers();
		loadDraftedPlayers();
	},3000);
	function loadAllPlayers(){
		$http.get('http://localhost:3000/loadAllPlayers').success(function(data){
		$scope.players=data;
		});
	};
	
	function loadDraftedPlayers(){
		$http.get('http://localhost:3000/loadDraftedPlayers').success(function(data){
		$scope.draftedPlayers=data;
		});
	};
});*/

app.controller('iphell_control', function($scope,$http,$interval){
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