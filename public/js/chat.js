
$(function(){
	var isMobile = false;
	// device detection
	if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
		|| /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
		isMobile = true;
	}
	var viz;
	var prefix="$";
	var availableTags = [];
	var id = Number(window.location.pathname.match(/\/chat\/(\d+)$/)[1]);
	var socket = io();
	
	var name = "",
		email = "",
		img = "",
		friend = "";

	var section = $(".section"),
		footer = $("footer"),
		onConnect = $(".connected"),
		inviteSomebody = $(".invite-textfield"),
		personInside = $(".personinside"),
		chatScreen = $(".chatscreen"),
		left = $(".left"),
		noMessages = $(".nomessages"),
		tooManyPeople = $(".toomanypeople");

	var chatNickname = $(".nickname-chat"),
		leftNickname = $(".nickname-left"),
		loginForm = $(".loginForm"),
		yourName = $("#yourName"),
		yourEmail = $("#yourEmail"),
		hisName = $("#hisName"),
		hisEmail = $("#hisEmail"),
		chatForm = $("#chatform"),
		textarea = $("#message"),
		messageTimeSent = $(".timesent"),
		chats = $(".chats");

	var ownerImage = $("#ownerImage"),
		leftImage = $("#leftImage"),
		noMessagesImage = $("#noMessagesImage");


	socket.on('connect', function(){
		socket.emit('load', id);
	});
	socket.on('disconnect', function(){
		showMessage("personinchat");
	});

	socket.on('img', function(data){
		img = data;
	});

	socket.on('peopleinchat', function(data){
			data.user="Tableau Bot";
			showMessage("personinchat",data);

			loginForm.on('submit', function(e){

				e.preventDefault();

				name = $.trim(hisName.val());

				if(name.length < 1){
					alert("Please enter a nick name longer than 1 character!");
					return;
				}

				if(name == data.user){
					alert("There already is a \"" + name + "\" in this room!");
					return;
				}
				email="tony@gmail.com"
				socket.emit('login', {user: name, avatar: email, id: id});
				personInside.hide();
				noMessages.hide();
				section.children().css('display','none');
				chatScreen.css('display','block');
				footer.fadeIn(1200);
				availableTags=data.tags;
				prefix=data.prefix;
				completeIt();
			});

	});

	socket.on('startChat', function(data){
		createChatMessage(`${ data.users[data.users.length -1]} has joined...`, "System", img, moment());
		scrollToBottom();
	});

	socket.on('leave',function(data){
		createChatMessage(`${data.user} has left...`, "System", img, moment());
		scrollToBottom();
	});

	socket.on('tooMany', function(data){
		if(data.boolean && name.length === 0) {

			showMessage('tooManyPeople');
		}
	});

	socket.on('receive', function(data){
		showMessage('chatStarted');
		if(data.user==="TABOT"){
			createTabMessage(data.msg, data.user, "/img/tabico.png", moment());
			scrollToBottom();
		}
		else
		if(data.msg.trim().length) {
			createChatMessage(data.msg, data.user, data.img, moment());
			scrollToBottom();
		}
	});

	textarea.keypress(function(e){
		if(e.which == 13) {
			e.preventDefault();
			chatForm.trigger('submit');
		}
	});

	chatForm.on('submit', function(e){
		e.preventDefault();
		showMessage("chatStarted");
		if(textarea.val().trim().length) {
			createChatMessage(textarea.val(), name, img, moment());
			scrollToBottom();
			socket.emit('msg', {msg: textarea.val(), user: name, img: img});
		}
		textarea.val("");
	});
	setInterval(function(){
		messageTimeSent.each(function(){
			var each = moment($(this).data('time'));
			$(this).text(each.fromNow());
		});
	},60000);

	function createTabMessage(msg,user,imgg,now){
		var who = '';
		if(user===name) {
			who = 'me';
		}
		else {
			who = 'you';
		}
		var imgSrc=JSON.parse(msg)[0].static;
		var nav=JSON.parse(msg)[0].navigate;
		var li = $(
			'<li class=' + who + '>'+
				'<div class="image">' +
					'<img src=' + imgg + ' />' +
					'<b></b>' +
					'<i class="timesent" data-time=' + now + '></i> ' +
				'</div>' +
				'<img class="chart tabimg" src="/img/clear.gif"/><br>' +
				'<a style="display:none;" title="Open Live View..." class="mobile face chartlink" href="'+nav+'" target="_blank"><img class="chartlnkimg" border="0" src="/img/nav.png" width="25" height="25"></a>'+
				'<a idnav="'+nav+'" rel="modal:open" style="display:none;" title="Open Live View..." class="large face chartlink" href="#emb"><img class="chartlnkimg" border="0" src="/img/nav.png" width="25" height="25"></a>'+
			'</li>');

		li.find('b').text(user);
		li.css("display","none");
		chats.append(li);
		$("a[idnav='"+nav+"']").click(function(e) {
			initViz($(this).attr("idnav"));
		  });
		li.fadeIn(1000);
		$(".tabimg").one("load", function() {
			var tp=$(".tabimg");
			tp.removeClass("tabimg");
			if(this.width>$(".chatscreen").width()){
				tp.attr("width","100%");
			}
			scrollToBottom();
			isMobile===true? $(".mobile.chartlink").fadeIn(1500): $(".large.chartlink").fadeIn(1500);
		})
		$(".tabimg").attr("src",imgSrc);
		messageTimeSent = $(".timesent");
		messageTimeSent.last().text(now.fromNow());
	}

	function createChatMessage(msg,user,imgg,now){
		var who = '';
		if(user===name) {
			who = 'me';
		}
		else {
			who = 'you';
		}
		var li = $(
			'<li class=' + who + '>'+
				'<div class="image">' +
					'<img src=' + imgg + ' />' +
					'<b></b>' +
					'<i class="timesent" data-time=' + now + '></i> ' +
				'</div>' +
				'<p style="margin-top:20px;"></p>' +
			'</li>');
		li.find('p').text(msg.replace(prefix,""));
		li.find('b').text(user);
		chats.append(li);
		messageTimeSent = $(".timesent");
		messageTimeSent.last().text(now.fromNow());
	}

	function scrollToBottom(){
		$("html, body").animate({ scrollTop: $(document).height()-$(window).height() },1000);
	}

	function isValid(thatemail) {

		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(thatemail);
	}

	function showMessage(status,data){
		if(status === "connected"){
			section.children().css('display', 'none');
			onConnect.fadeIn(1200);
		}
		else if(status === "inviteSomebody"){
			$("#link").text(window.location.href);

			onConnect.fadeOut(1200, function(){
				inviteSomebody.fadeIn(1200);
			});
		}
		else if(status === "personinchat"){
			$("footer").hide();
			onConnect.css("display", "none");
			personInside.fadeIn(1200);
			if(data)
				chatNickname.text(data.user);
			chats.empty();
			// ownerImage.attr("src",data.avatar);
		}
		else if(status === "youStartedChatWithNoMessages") {
			left.fadeOut(1200, function() {
				inviteSomebody.fadeOut(1200,function(){
					noMessages.fadeIn(1200);
					footer.fadeIn(1200);
				});
			});
			friend = data.users[1];
			noMessagesImage.attr("src",data.avatars[1]);
		}
		else if(status === "heStartedChatWithNoMessages") {
			personInside.fadeOut(1200,function(){
				noMessages.fadeIn(1200);
				footer.fadeIn(1200);
			});
			friend = data.users[0];
			noMessagesImage.attr("src",data.avatars[0]);
		}
		else if(status === "chatStarted"){
			section.children().css('display','none');
			chatScreen.css('display','block');
		}
		else if(status === "somebodyLeft"){
			leftImage.attr("src",data.avatar);
			leftNickname.text(data.user);
			section.children().css('display','none');
			footer.css('display', 'none');
			left.fadeIn(1200);
		}
		else if(status === "tooManyPeople") {
			section.children().css('display', 'none');
			tooManyPeople.fadeIn(1200);
		}
	}
	
	function split(val) {
	return val.split("\n");
	}

	function extractLast(term) {
	return split(term).pop();
	}

	function completeIt(){
	$("#message").on("keydown", function(event) {
		if (event.keyCode === $.ui.keyCode.TAB &&
			$(this).autocomplete("instance").menu.active) {
			event.preventDefault();
		}
		})
		.autocomplete({
		minLength: 1,
		source: function(request, response) {
			response($.ui.autocomplete.filter(
			availableTags, extractLast(request.term)));
		},
		focus: function() {
			return false;
		},
		position: { 
			collision:"flipfixed"
		},
		select: function(event, ui) {
			var terms = split(this.value);
			terms.pop();
			terms.push("&"+ui.item.value);
			this.value = terms//.join("\r\n");
			return false;
		}
		});
	}
	function initViz(url) {
		if(viz)
			viz.dispose();
		var containerDiv = document.getElementById("vizContainer"),
			url = url+"?:embed=y",
			options = {
				hideTabs: true,
				onFirstInteractive: function () {
					console.log("Run this code when the viz has finished loading.");
				}
			};

		viz = new tableau.Viz(containerDiv, url, options);
	}

	$.ui.position.flipfixed = {
		left: function( position, data ) {
			var within = data.within,
				withinOffset = within.offset.left + within.scrollLeft,
				outerWidth = within.width,
				offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left,
				collisionPosLeft = position.left - data.collisionPosition.marginLeft,
				overLeft = collisionPosLeft - offsetLeft,
				overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft,
				myOffset = data.my[ 0 ] === "left" ?
					-data.elemWidth :
					data.my[ 0 ] === "right" ?
						data.elemWidth :
						0,
				atOffset = data.at[ 0 ] === "left" ?
					data.targetWidth :
					data.at[ 0 ] === "right" ?
						-data.targetWidth :
						0,
				offset = -2 * data.offset[ 0 ],
				newOverRight,
				newOverLeft;
	
			if ( overLeft < 0 ) {
				newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth - outerWidth - withinOffset;
				if ( newOverRight < 0 || newOverRight < Math.abs( overLeft ) ) {
					position.left += myOffset + atOffset + offset;
				}
			} else if ( overRight > 0 ) {
				newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset + atOffset + offset - offsetLeft;
				if ( newOverLeft > 0 || Math.abs( newOverLeft ) < overRight ) {
					position.left += myOffset + atOffset + offset;
				}
			}
		},
		top: function( position, data ) {
			var within = data.within,
				withinOffset = within.offset.top + within.scrollTop,
				outerHeight = within.height,
				offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
				collisionPosTop = position.top - data.collisionPosition.marginTop,
				overTop = collisionPosTop - offsetTop,
				overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
				top = data.my[ 1 ] === "top",
				myOffset = top ?
					-data.elemHeight :
					data.my[ 1 ] === "bottom" ?
						data.elemHeight :
						0,
				atOffset = data.at[ 1 ] === "top" ?
					data.targetHeight :
					data.at[ 1 ] === "bottom" ?
						-data.targetHeight :
						0,
				offset = -2 * data.offset[ 1 ],
				newOverTop,
				newOverBottom;
			if ( overTop < 0 ) {
				newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight - outerHeight - withinOffset;
				if ( newOverBottom < 0 || newOverBottom < Math.abs( overTop ) ) {
					position.top += myOffset + atOffset + offset;
				}
			} else if ( overBottom > 0 ) {
				newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset + offset - offsetTop;
				if ( newOverTop > 0 || Math.abs( newOverTop ) < overBottom ) {
					position.top += myOffset + atOffset + offset;
				}
			}
		}
	};  
});


