var gravatar = require('gravatar');
var store=require("./store")
var Client = require('node-rest-client').Client;
const levenshtein = require('js-levenshtein');
const IP=store.ip;
var client = new Client();
const version="3.8";
const VIEWURL=`http://${IP}/views/`;
const NAVURL=`http://${IP}/views/`;
const TABURL=`http://${IP}/api/${version}`; 


const prefix = "&";
module.exports = function(app,io){

	function giveClosest(ref,search){
		var min=1000;
		var result,match=[];
		ref.forEach(element => {
			element.static=`${VIEWURL}${element.contentUrl.replace("/sheets","")}.png`;
			element.navigate=`${NAVURL}${element.contentUrl.replace("/sheets","")}`;
			element.distance=levenshtein(element.name.toLowerCase(), search.toLowerCase())
		});
		match= ref.filter(word => word.distance ==0);
		result= ref.filter(word => word.distance < 10);
		if(match.length>0)
			return match;
		return result;	
	}

	function getViews(auth){
		return new Promise((resolve, reject) => {
			var args = {	
				headers: {"X-Tableau-Auth":auth.credentials.token ,"Content-Type": "application/json","Accept": "application/json"}
			};
			client.get(`${TABURL}/sites/${auth.credentials.site.id}/views`, args, function (data, response) {
				resolve(data);
			});
		})
	}

	function getAuthInfo(){
		return new Promise((resolve, reject) => {
			var args = {	
				data: {
					"credentials": {
						"personalAccessTokenName": store.name,
						"personalAccessTokenSecret": store.tk,
						"site":{
							"contentUrl":""
						}
					}
				},
				headers: { "Content-Type": "application/json","Accept": "application/json"}
			};
			client.post(`${TABURL}/auth/signin`, args, function (data, response) {
				resolve(data);
			});
		})
	}
	
	app.get('/log', async function(req, res){
		var auth=await getAuthInfo();
		var views=await getViews(auth);
		var calc=giveClosest(views.views.view,"Obesi");
		res.send(calc);
	});

	app.get('/', function(req,res){
		var id = 1//Math.round((Math.random() * 1000000));
		res.redirect('/chat/'+id);
	});

	app.get('/chat/:id', function(req,res){
		res.render('chat');
	});
	var chat = io.on('connection', function (socket) {
		socket.on('load',async function(data){
			try {
				var room = findClientsSocket(io,data);
				var auth=await getAuthInfo();
				var views=await getViews(auth);
				var calc=views.views.view;
				const min = calc.map((element) => {
				return element.name;
			});
				socket.emit('peopleinchat', {number: 0,tags:min, prefix:prefix});
			} catch (error) {
				//do something smart...
			}
			
		});
		socket.on('login', function(data) {
			var room = findClientsSocket(io, data.id);
			if (room.length < 20) {
				socket.username = data.user;
				socket.room = data.id;
				socket.avatar = gravatar.url(data.avatar, {s: '140', r: 'x', d: 'mm'});
				socket.emit('img', socket.avatar);
				socket.join(data.id);
				if (room.length >= 1) {
					var usernames = [],
						avatars = [];
					usernames.push(room[0].username);
					usernames.push(socket.username);
					avatars.push(room[0].avatar);
					avatars.push(socket.avatar);
					chat.in(data.id).emit('startChat', {
						boolean: true,
						id: data.id,
						users: usernames,
						avatars: avatars
					});
				}
			}
			else {
				socket.emit('tooMany', {boolean: true});
			}
		});
		socket.on('disconnect', function() {

			// Notify the other person in the chat room
			// that his partner has left

			socket.broadcast.to(this.room).emit('leave', {
				boolean: true,
				room: this.room,
				user: this.username,
				avatar: this.avatar
			});

			// leave the room
			socket.leave(socket.room);
		});
		socket.on('msg', async function(data){
			if(data.msg.startsWith(prefix)){
				socket.broadcast.to(socket.room).emit('receive', {msg: data.user +" has requested " +data.msg.replace(prefix,""), user: data.user, img: data.img});
				var auth=await getAuthInfo();
				var views=await getViews(auth);
				var calc=giveClosest(views.views.view,data.msg.replace(prefix,""));
				const min = calc.map((element) => {
					var nw={}
					nw.name=element.name;
					nw.static=element.static;
					nw.navigate=element.navigate;
					return nw;
				});
				io.in(socket.room).emit('receive', {msg: JSON.stringify(min), user: "TABOT", img: data.img});
			}
			else
				socket.broadcast.to(socket.room).emit('receive', {msg: data.msg, user: data.user, img: data.img});
		});
	});
};

function findClientsSocket(io,roomId, namespace) {
	var res = [],
		ns = io.of(namespace ||"/");    // the default namespace is "/"

	if (ns) {
		for (var id in ns.connected) {
			if(roomId) {
				var index = ns.connected[id].rooms.indexOf(roomId) ;
				if(index !== -1) {
					res.push(ns.connected[id]);
				}
			}
			else {
				res.push(ns.connected[id]);
			}
		}
	}
	return res;
}


