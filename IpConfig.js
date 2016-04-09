'use strict';

var os = require('os');
var exec = require('ssh-exec');
var net = require('net');
var express = require("express");
var bodyParser = require('body-parser');
var app = express();

var ifaces = os.networkInterfaces();

var linuxHostList = ["192.168.1.11", "192.168.1.12"]
var windowsHostList = ["192.168.1.5"]

var localIps = new Array();
var remoteWindowsIps = new Array();
var remoteLinuxIps = new Array();

function GetLocalIPs() {
	var ipList = new Array();
	Object.keys(ifaces).forEach(function (ifname) {
	var alias = 0;
	
	ifaces[ifname].forEach(function (iface) {
		var ip = {};
		if ('IPv4' !== iface.family || iface.internal !== false) {
			// skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
			return;
		}
		if (alias >= 1) {
			// this single interface has multiple ipv4 addresses
			//console.log(ifname + ':' + alias, iface.address);
			ip['ifname'] = ifname + ':' + alias ;
			ip['address'] = iface.address;
		} else {
			// this interface has only one ipv4 adress
			//console.log(ifname, iface.address);
			ip['ifname'] = ifname ;
			ip['address'] = iface.address;
		}
		ip['alias'] = alias;
		ipList.push(ip);
		++alias;
	});
	});
	return ipList;
};

function GetRemoteLinuxIpList(hostListParam, callback) {
	var ipList = new Array();
	hostListParam.forEach(function(entry) {
		GetRemoteLinuxIp(entry, function(data) {
			if (data.length > 0) {
				ipList.push(data);
			}
			callback(ipList);
		});
	});
};

function GetRemoteLinuxIp(hostAddress, callback) {
	var ipList = new Array();
	
	exec("for i in `ifconfig | grep \"Link encap:\" | awk '{print $1}'`; do echo \"$i `ifconfig $i | sed 's/inet addr:/inet addr: /' | grep \"inet addr:\" | awk '{print $3}'`\"; done", {
		user: 'serban',
		host: hostAddress,
		password: 'serban'
	}).on('data', function(data) {
		var tempIpList = ConvertStringToIpList(data);
		for(var i = 0; i < tempIpList.length; i++) {
			ipList.push(ConvertStringToIpList(data)[i]);	
		}
	}).on('end', function() {
		callback(ipList);
	}).on('error', function() {
		callback(ipList);
		console.log('ssh error on remote linux');
	});;
};

function GetRemoteWindowsIpList(hostListParam, callback) {
	var ipList = new Array();
	hostListParam.forEach(function(entry) {
		GetRemoteWindowsIp(entry, function(data) {
			if (data.length > 0) {
				ipList.push(data);
			}callback(ipList);
		});
	});
};

function GetRemoteWindowsIp(hostAddress, callback) {
	var ipList = new Array();
	
	var client = new net.Socket();
	client.connect(1337, hostAddress, function() {
		client.write('Requesting IPs');
	});
	
	client.on('data', function(data) {
		ipList = ConvertStringToIpList(data);
		client.destroy();
	});

	client.on('close', function() {
		callback(ipList);
	});
	
	client.on('error', function() {
		console.log('socket timeout on remote windows');
		client.destroy();
	});
};

function runFunction() {
	localIps = GetLocalIPs();
	
	GetRemoteLinuxIpList(linuxHostList, function(data) {
		remoteLinuxIps = data;
	});
	GetRemoteWindowsIpList(windowsHostList, function(data) {
		remoteWindowsIps = data;
	});
};


function ConvertStringToIpList(data) {
	var ipList = new Array();
	var str = data.toString('ascii');
	var arr = str.split("\n");
	arr.forEach(function(entry) {
		var ip = {};
		var littlearr = entry.split(" ");
		ip['ifname'] = littlearr[0];
		ip['address'] = littlearr[1];
		ip['alias'] = 0;
		if (ip['ifname'] != "") {
			ipList.push(ip);
		}
	});
	return ipList;
};

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static('public'));


app.get('/',function(req,res){
	res.sendFile(__dirname + '/index.html');
});


app.get('/loadLocalIp',function(req,res){
	res.end(JSON.stringify(localIps));
});

app.get('/loadRemoteWindowsIp',function(req,res){
	res.end(JSON.stringify(remoteWindowsIps));
});

app.get('/loadRemoteLinuxIp',function(req,res){
	res.end(JSON.stringify(remoteLinuxIps));
});

app.get('/loadWindowsHosts',function(req,res){
	res.end(JSON.stringify(windowsHostList));
});

app.get('/loadLinuxHosts',function(req,res){
	res.end(JSON.stringify(linuxHostList));
});

app.post('/addWindowsIp', function(req,res){
	console.log("W");
	console.log(req.body.windowsIp);
	windowsHostList.push(req.body.windowsIp);
});

app.post('/addLinuxIp', function(req,res){
	console.log("L");
	console.log(req.body.linuxIp);
	linuxHostList.push(req.body.linuxIp);
});

app.listen(3000,function(){
	console.log("It's Started on PORT 3000");
});

var t = setInterval(runFunction, 2000);







