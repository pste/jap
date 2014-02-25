// http://www.w3.org/html/wg/drafts/html/master/embedded-content-0.html#event-media-ended
// https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events
// http://www.w3schools.com/tags/ref_av_dom.asp
(function($) {
	/* ::::::::::::::::::: */
	
	var settings = null;
	var controls = null; // save controls for convenience
	var animationOn = false;
	
	var css = {
		active: "ui-state-error"
		, selected: "ui-state-highlight"
		, playing: "playing"
		, icontodo: "ui-icon-radio-on"
		, icondone: "ui-icon-bullet"
	}
	
	/* ::::::::::::::::::: */
	
	function init(options, container) {
		// extend settings
		settings = $.extend( {}, $.fn.jap.defaults, options );
		settings.volume = Math.min(settings.volume, 100);
	
		// build interface
		var miniButtonSize = (settings.buttonSize/2) - 2; // FIXED VAL (2)
		var block1 = $("<div style='display: inline; float: left'></div>");
		var block2 = $("<div style='display: inline; float: right'></div>");
		var block3 = $("<div style='padding: 1px'></div>").css({"width": settings.buttonSize, "height": settings.buttonSize, "float": "left"}); // FIXED VAL (1)
		container.css({"font-size": 9, "padding": 5}).addClass("ui-widget ui-widget-content ui-corner-all");
		controls = {
			audio:		$("<audio></audio>")			
			, queue:	$("<ol class='queue ui-widget ui-widget-content ui-corner-all'></ol>").selectable().hide().css({"position":"absolute", "list-style-type":"none", "margin": 0, "padding": 7, "font-size": "1.1em", "overflow-y":"scroll", "max-height":"200px"})
			, prev: 	$('<div class="block1 prev"></div>')	.button({text: false, icons: { primary: "ui-icon-seek-prev" }} ).css({"width": settings.buttonSize, "height": settings.buttonSize, "float": "left"})
			, play: 	$('<div class="block1 play"></div>')	.button({text: false, icons: { primary: "ui-icon-play" }} )		.css({"width": settings.buttonSize, "height": settings.buttonSize, "float": "left"})
			, pause: 	$('<div class="block1 pause"></div>')	.button({text: false, icons: { primary: "ui-icon-pause" }} )	.css({"width": settings.buttonSize, "height": settings.buttonSize, "float": "left"})
			, stop: 	$('<div class="block1 stop"></div>')	.button({text: false, icons: { primary: "ui-icon-stop" }} )		.css({"width": settings.buttonSize, "height": settings.buttonSize, "float": "left"})
			, next: 	$('<div class="block1 next"></div>')	.button({text: false, icons: { primary: "ui-icon-seek-next" }} ).css({"width": settings.buttonSize, "height": settings.buttonSize, "float": "left"})
			, loop:		$('<div class="block3 loop"></div>')			.button({text: false, icons: { primary: "ui-icon-refresh" }} )//.css({"width": settings.buttonSize/2, "height": settings.buttonSize/2, "float": "left"})
			, random:	$('<div class="block3 rnd"></div>')				.button({text: false, icons: { primary: "ui-icon-shuffle" }} )//.css({"width": settings.buttonSize/2, "height": settings.buttonSize/2, "float": "left"})
			, playlist: 	$('<div class="block1 playlist"></div>').button({text: false, icons: { primary: "ui-icon-eject" }} ).css({"width": settings.buttonSize, "height": settings.buttonSize, "float": "left"})
			, screen:	$('<canvas class="block1" height="15" width="99" ></canvas>')	.css({"border-radius": "2px", "border": 1, "clear": "both"})
			, seekbar:	$('<div class="block1 seekbar"></div>')			.progressbar()	.css({"height":settings.buttonSize/3, "clear": "both"})
			, volume:	$('<div class="block2 volume"></div>')			.slider({ orientation: "vertical", "value": settings.volume}).css({"font-size":"0.8em"})
		};
		
		// attach plugin events to the controls
		controls.audio	.on("timeupdate", function() {
							var p = controls.audio[0];
							var x = utils.getTrackPercentage(p);
							controls.seekbar.progressbar("option", "value", x);
						})
						.on("ended", function() {
							container.jap("next");
						});
		controls.audio[0].volume = settings.volume / 100;
		controls.queue	.on("selectableselecting", function(event, ui) 	{ $(ui.selecting).removeClass(css.active).addClass(css.selected); })
				.on("selectableunselecting", function(event, ui){ $(ui.unselecting).removeClass(css.selected + " " + css.active);	})
				.on("selectableselected", function(event, ui) 	{ $(ui.selected).removeClass(css.selected).addClass(css.active); })
				.on("selectableunselected", function(event, ui) { $(ui.unselected).removeClass(css.selected + " " + css.active);})
				;
		controls.prev.on("click",	function() {container.jap("prev")});
		controls.play.on("click",	function() {container.jap("play")});
		controls.pause.on("click",	function() {container.jap("pause")});
		controls.stop.on("click",	function() {container.jap("stop")});
		controls.next.on("click",	function() {container.jap("next")});
		controls.loop.on("click",	function() {
		  var $this = $(this);
		  if ($this.hasClass(css.active)) $this.removeClass(css.active);
		  else $this.addClass(css.active);
		});
		controls.random.on("click",		function() {
		  var $this = $(this);
		  if ($this.hasClass(css.active)) $this.removeClass(css.active);
		  else $this.addClass(css.active);
		});
		controls.playlist.on("click",	function() {
			if (controls.queue.is(":visible")) controls.queue.fadeOut(/*function() { $(this).menu("destroy").hide(); }*/);
			else controls.queue.fadeIn().position({ my: "left top", at: "right+5 top", of: container});
		});
		controls.seekbar.on("click", 	function(evt) {
			var myoffs = controls.seekbar.offset();
			var x = evt.pageX - myoffs.left;
			var max = controls.seekbar.width();
			container.jap("seek", {percentage: (x/max)*100});
		});
		controls.volume.on("slide", 	function(event, ui) {
			var p = controls.audio[0];
			p.volume = ui.value / 100;
		});
		
		// push controls into the container		
		block1.append(controls.prev, controls.play, controls.pause, controls.stop, controls.next, block3, controls.playlist, controls.screen, controls.seekbar);
		block2.append(controls.volume);
		block3.append(controls.random, controls.loop);
		container.append(controls.audio, controls.queue, block1, block2);
		
		// width must be calculated after the font-size
		block3.height(settings.buttonSize).width(settings.buttonSize/2);
		controls.random.width(miniButtonSize).height(miniButtonSize);
		controls.loop.width(miniButtonSize).height(miniButtonSize);
		
		var fullWidth = (settings.buttonSize*7) + 6; // FIXED VAL
		block1.width(fullWidth);
		console.log(controls.play.outerWidth(true) + " " + (controls.play.outerWidth(true)/2) + " = " + fullWidth);

		block2.width(controls.play.outerWidth(true) / 2); // half button
		
		controls.volume.css("height", block1.innerHeight() - utils.vborder(controls.volume));
		container.css({"width": block1.outerWidth(true) + block2.outerWidth(true) + 10, "height": block1.outerHeight()}); // FIXED VAL
		
		// canvas
		controls.screen.attr("width", block1.innerWidth());
		controls.screen.attr("height", settings.buttonSize/3);
		var c = controls.screen[0];
		var ctx = c.getContext('2d');
		ctx.font = c.height + "px 'Varela Round'"; // Verdana
		
		if (settings.fontColor === null) settings.fontColor = $(".ui-widget-content").css("color");
		console.log(settings.fontColor);
		ctx.fillStyle = "rgba(0,0,0,0)";
		ctx.fillRect(0,0,c.width,c.height);
		
		// little hack
		/*var colorSelected = $("<div class='ui-state-highlight'></div>").css("background-color");//ui-state-selected ui-state-focus ui-state-highlight ui-state-active
		var colorSelecting = $("<div class='ui-state-focus'></div>").css("background-color");
		$("<style>").prop("type", "text/css").html(".ui-selecting { background: " + colorSelecting + "; }").appendTo("head");
		$("<style>").prop("type", "text/css").html(".ui-selected { background: " + colorSelected + "; }").appendTo("head");*/
	}
	
	/* ::::::::::::::::::: */
	
	function tick() {
		var c = controls.screen;
		var ctx = c[0].getContext('2d');
		
		// get text
		var selected = controls.queue.children("li." + css.playing); // little hacky
		var text = settings.formatTitle(selected.text(), selected.data());
		
		// calculate offset
		var offset = c.attr("offset");
		if (typeof(offset) === "undefined")
			offset = 0;
		else {
			offset -= 0.5;
			if (-offset >= ctx.measureText(text).width)
				offset = c.width() + 20;
		}
		c.attr("offset", offset);
		
		// draw
		ctx.clearRect(0,0,c.width(),c.height());
		var size = c.height();
		ctx.fillStyle = settings.fontColor;
		ctx.fillText(text, offset, size);
		
		// loop
		if (animationOn === true) window.requestAnimationFrame(tick); // setTimeout(tick,1000);
	}
	
	/* ::::::::::::::::::: */
	
	var utils = {
		/*::: UI UTILS :::*/
		hborder: function(elem) {
			return elem.outerWidth(true)- elem.innerWidth();
		}
		,vborder: function(elem) {
			return elem.outerHeight(true)- elem.innerHeight();
		}
		, deselectAll: function(container) {
			container.find(".ui-button").removeClass(css.active);
		}
		, select: function(cmd) {
			var isLoop = controls.loop.hasClass(css.active);
			var isRnd = controls.random.hasClass(css.active);
			var selected = controls.queue.children("li." + css.playing); // little hacky
			var next = $();
			var todo = controls.queue.children("li:not(.played)");
			
			// goto next
			if (isRnd) {
				// prepare next full queue loop
				if (todo.length == 0 && isLoop) {
					todo = controls.queue.children("li");
					controls.queue.children("li").removeClass("played"); // .find(".ui-icon").switchClass(css.icondone, css.icontodo);
				}
				// randomize				
				var rnd = Math.round(Math.random() * (todo.length - 1));
				next = todo.eq(rnd);
				
				if (next.length == 0) 
					next = selected; // dont move
			}
			else {
				// get next or prev (base version)
				if (cmd === "next")
					next = selected.next("li");
				else if (cmd === "prev")
					next = selected.prev("li");
					
				// now handle special cases (random, loop, ..)
				if (selected.length == 0)
					selected = controls.queue.children("li:first");
					
				if (next.length == 0) {
					if (isLoop)  {
						// prepare next full queue loop
						controls.queue.children("li").removeClass("played"); // .find(".ui-icon").switchClass(css.icondone, css.icontodo);;
						next = controls.queue.children("li:first");
						if (cmd === "next")
							next = controls.queue.children("li:first");
						else if (cmd === "prev")
							next = controls.queue.children("li:last");
					}
					else 
						next = selected; // dont move
				}
			}
			
			// move to next
			selected.removeClass(css.playing);
			next.addClass(css.playing);
			utils.startAnimation();
		}
		,timetext: function(secs) {
			var d = new Date(secs * 1000);
			var hh = d.getUTCHours();
			var mm = d.getUTCMinutes();
			var ss = d.getUTCSeconds();
			var hhS = (hh<10)?"0"+hh:""+hh;
			var mmS = (mm<10)?"0"+mm:""+mm;
			var ssS = (ss<10)?"0"+ss:""+ss;
			return hhS+":"+mmS+":"+ssS;
		}
		/*::: HTML5 AUDIO UTILS :::*/
		,getTrackPercentage: function(p) {
			if (p.seekable.length > 0)
				return p.currentTime / p.seekable.end(0) * 100;
			return 0;
		}
		, isOk: function(p) {
			return !isNaN(p.duration);
		}
		/*::: ANIMATIONS :::*/
		, startAnimation: function() {
			if (animationOn !== true) {
				animationOn = true;
				tick();
			}
		}
		, stopAnimation: function() {
			animationOn = false;
		}
		/*::: AUDIO UTILS :::*/
		, isPlaying: function() {
			return controls.play.hasClass(css.active);
		}
		, isPaused: function() {
			return controls.pause.hasClass(css.active);
		}
		, isStopped: function() {
			return (!utils.isPlaying()) && (!utils.isPaused());
		}
	}
	
	/* ::::::::::::::::::: */
	
	$.fn.jap = function(action, param) {
		if (typeof(action) != "string") {
			console.log("init!");
			init(action, this);
		}
		else 
		{
			if (typeof(param) == "undefined") console.log("%s: -", action);
			else console.log("%s: %s", action, JSON.stringify(param));
			
			//
			if (action === "enqueue") { // adds one element to the (html 'li') queue. Param: {src: "title.mp2", metadata: (tipically json)}
				if (typeof(param.metadata) == "undefined")
					param.metadata = null;
				var txt = settings.formatTitle(param.src, param.metadata);
				//var src = $('<li><a href="#"><span class="ui-icon ' + css.icontodo + '"></span>'+txt+'</a></li>"').attr("src", param.src).data(param.metadata);
				var li = $('<li style="font-weight: normal; border: 0px" >' + txt + '</li>"')
				      .attr("src", param.src)
				      .data(param.metadata)
				      .on("keydown", function(evt) {console.log(event.which)});
				/*
				var doTheFix = false;
				if (controls.queue.hasClass("ui-selectable"))
					doTheFix = true;
				*/
				//if (doTheFix) controls.queue.selectable("destroy");
				controls.queue.append(li);
				var items = controls.queue.children("li");
				items.removeClass("ui-corner-top ui-corner-bottom");
				items.first().addClass("ui-corner-top");
				items.last().addClass("ui-corner-bottom");
				
				//if (doTheFix) 
				controls.queue.selectable();
			}
			if (action === "dequeue") { // remove the nth elem from the queue. Param: { index: 2 }
				controls.queue.eq(param.index).remove();
			}
			else if (action ==="seek") { // seek the current song to the given percentage (0:100). Param: {percentage: 60}
				var p = controls.audio[0];
				if (utils.isOk(p)) {
					var secs = param.percentage * p.duration / 100;
					p.currentTime = secs;
				}
				else {
					controls.seekbar.progressbar("value", 0);
				}
			}
			else if (action === "play") {
				// get selected (or select "next" if selection is empty)
				var selected = controls.queue.children("li." + css.playing); // little hacky
				if (selected.length == 0) {
					utils.select("next");
					selected = controls.queue.children("li." + css.playing); // little hacky
				}
				// play it
				var p = controls.audio[0];
				var src = selected.attr("src");
				if (!utils.isPaused())
					controls.audio.attr("src", src);
				p.play();
				
				utils.deselectAll(this);
				controls.play.addClass(css.active);
				selected.addClass("played"); // .find(".ui-icon").switchClass(css.icontodo, css.icondone);
			}
			else if (action === "pause") {
				if (utils.isPlaying() && !utils.isPaused()) {
					var p = controls.audio[0];
					//if (p.paused === false) {
						utils.deselectAll(this);
						controls.pause.addClass(css.active);
						
						// player
						p.pause();
					//}
				}
			}
			else if (action === "stop") {
				if (!utils.isStopped()) {
					var p = controls.audio[0];
					utils.deselectAll(this);
					controls.seekbar.progressbar("value", 0);
					
					// player
					if (utils.isOk(p)) {
						p.pause();
						p.currentTime = 0;
					}
				}
			}
			else if (action === "next") {
				utils.select(action);
				var selected = controls.queue.children("li." + css.playing); // little hacky
				
				var src = selected.attr("src");
				var selectionChanged = (controls.audio.attr("src") != src);
				if (selectionChanged && utils.isPlaying())
					this.jap("play");
				else
					this.jap("stop");
			}
			else if (action === "prev") {
				utils.select(action);
				var selected = controls.queue.children("li." + css.playing); // little hacky
				
				var src = selected.attr("src");
				var selectionChanged = (controls.audio.attr("src") != src);
				if (selectionChanged && utils.isPlaying())
					this.jap("play");
				else
					this.jap("stop");
			}
			
			// propagate
			this.trigger(action, this);
		}
		
		// chain ability
		return this;
	};
}(jQuery));

$.fn.jap.defaults = {
	url: "127.0.0.1:80"
	, buttonSize: 30
	, volume: 20
	, fontColor: null // "#00FFC6"
	, formatTitle: function(src, metadata) {
		return src;
	}
}