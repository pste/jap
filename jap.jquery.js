// http://www.w3.org/html/wg/drafts/html/master/embedded-content-0.html#event-media-ended
// https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events
// http://www.w3schools.com/tags/ref_av_dom.asp
(function($) {
	function dbg(fmt, p1, p2, p3, p4, p5) {
		if (console) console.log(fmt, p1, p2, p3, p4, p5);
	}
	
	/* ::::::::::::::::::: */
	
	var settings = null;
	var controls = null; // save controls for convenience
	var animationOn = false;
	var fontColor = "#00FFDE";
	
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
		var fontSize = settings.buttonSize/3;
		var button_1 = settings.buttonSize;
		var button_2 = settings.buttonSize/2;
		var button_3 = settings.buttonSize/3;
		var miniButtonSize = button_2 - 2; // FIXED VAL (2 border)
		
		// build interface
		controls = {
			drag:	 	$("<div style='height: 10; clear: both; margin-bottom:4' class='ui-widget-header ui-corner-all'></div>")
			, prev: 	$('<div class="prev"></div>')	.button({text: false, icons: { primary: "ui-icon-seek-prev" }} ).css({"width": button_1, "height": button_1, "float": "left"})
			, play: 	$('<div class="play"></div>')	.button({text: false, icons: { primary: "ui-icon-play" }} )	.css({"width": button_1, "height": button_1, "float": "left"})
			, pause: 	$('<div class="pause"></div>')	.button({text: false, icons: { primary: "ui-icon-pause" }} )	.css({"width": button_1, "height": button_1, "float": "left"})
			, stop: 	$('<div class="stop"></div>')	.button({text: false, icons: { primary: "ui-icon-stop" }} )	.css({"width": button_1, "height": button_1, "float": "left"})
			, next: 	$('<div class="next"></div>')	.button({text: false, icons: { primary: "ui-icon-seek-next" }} ).css({"width": button_1, "height": button_1, "float": "left"})
			, loop:		$('<div class="loop"></div>')	.button({text: false, icons: { primary: "ui-icon-refresh" }} ).css({"width": miniButtonSize, "height": miniButtonSize, "float": "left", "clear": "both"})
			, shuffle:	$('<div class="shuffle"></div>').button({text: false, icons: { primary: "ui-icon-shuffle" }} ).css({"width": miniButtonSize, "height": miniButtonSize, "float": "left", "clear": "both"})
			, playlist: 	$('<div class="playlist"></div>').button({text: false, icons: { primary: "ui-icon-eject" }} ).css({"width": button_1, "height": button_1, "font-size":"0.9em", "float":"left"})
			, screen:	$('<canvas class="screen"></canvas>').css({"border-radius": "2px", "border": 1, "clear": "both", "height": button_3})
			, seekbar:	$('<div class="seekbar"></div>').progressbar()	.css({"clear": "both", "height": button_3})
			, volume:	$('<div class="volume"></div>')	.slider({ orientation: "vertical", "value": settings.volume}).css({"font-size":"0.8em", "height": button_1+(2*button_3)})
			, audio:	$("<audio></audio>")			
			, queue:	$("<ol class='queue ui-widget ui-widget-content ui-corner-all'></ol>").selectable().hide().css({"position":"absolute", "list-style-type":"none", "margin": 0, "padding": 7, "font-size": fontSize, "overflow-y":"scroll", "max-height":"200px"})
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
		controls.shuffle.on("click",		function() {
		  var $this = $(this);
		  if ($this.hasClass(css.active)) $this.removeClass(css.active);
		  else $this.addClass(css.active);
		});
		controls.playlist.on("click",	function() {
			if (controls.queue.is(":visible")) controls.queue.fadeOut();
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
		
		// push controls
		var tdcss = {"border":0, "margin":0, "padding":0};
		settings.layout.find(".drag-container").css(tdcss)	.append(controls.drag);
		settings.layout.find(".prev-container").css(tdcss)	.append(controls.prev);
		settings.layout.find(".play-container").css(tdcss)	.append(controls.play);
		settings.layout.find(".pause-container").css(tdcss)	.append(controls.pause);
		settings.layout.find(".stop-container").css(tdcss)	.append(controls.stop);
		settings.layout.find(".next-container").css(tdcss)	.append(controls.next);
		settings.layout.find(".playlist-container").css(tdcss)	.append(controls.playlist);
		settings.layout.find(".shuffleloop-container").css(tdcss).append(controls.shuffle, controls.loop);
		settings.layout.find(".volume-container").css(tdcss)	.append(controls.volume);
		settings.layout.find(".screen-container").css(tdcss)	.append(controls.screen);
		settings.layout.find(".seekbar-container").css(tdcss)	.append(controls.seekbar);
		container.append(settings.layout, controls.audio)
			.after(controls.queue)
			.draggable({handle: controls.drag})
			.css({"font-size": 9, "padding": 8})
			.addClass("ui-widget ui-widget-content ui-corner-all");
		
		
		// canvas
		var w = controls.seekbar.width();
		controls.screen.css("width", w)
		controls.screen.attr("width", w);
		controls.screen.attr("height", button_3);
		var c = controls.screen[0];
		var ctx = c.getContext('2d');
		ctx.font = fontSize + "px 'Varela Round'"; // Verdana
		fontColor = $(".ui-widget-content").css("color");
		ctx.fillStyle = "rgba(0,0,0,0)";
		ctx.fillRect(0,0,c.width,c.height);
		
		// final size fixes
		container.css({"width": settings.layout.outerWidth(true), "height": settings.layout.outerHeight(true)});
		// selectable's little hack
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
		ctx.fillStyle = fontColor;
		ctx.fillText(text, offset, size);
		
		// loop
		if (animationOn === true) {
			if (typeof(window.requestAnimationFrame) == "undefined") setTimeout(tick, 20);
			else window.requestAnimationFrame(tick);
		}
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
		, resize: function(items, w, h) {
			var size = { width:0, height:0 };
			$(items).each(function(i,o) {
				var $o = $(o);
				if (w) $o.css("width", w);
				if (h) $o.css("height", h);
				size.width += $o.outerWidth(true);
				size.height = Math.max($o.outerHeight(true), size.height);
			});
			return size;
		}
		, select: function(cmd) {
			var isLoop = controls.loop.hasClass(css.active);
			var isRnd = controls.shuffle.hasClass(css.active);
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
					
				// now handle special cases (shuffle, loop, ..)
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
			//console.log("init!");
			dbg("init!");
			init(action, this);
		}
		else 
		{
			if (typeof(param) == "undefined") dbg("%s: -", action); // console.log("%s: -", action);
			else dbg("%s: %s", action, JSON.stringify(param)); // console.log("%s: %s", action, JSON.stringify(param));
			
			//
			if (action === "enqueue") { // adds one element to the (html 'li') queue. Param: {src: "title.mp2", metadata: (tipically json)}
				if (typeof(param.metadata) == "undefined")
					param.metadata = null;
				var txt = settings.formatTitle(param.src, param.metadata);
				//var src = $('<li><a href="#"><span class="ui-icon ' + css.icontodo + '"></span>'+txt+'</a></li>"').attr("src", param.src).data(param.metadata);
				var li = $('<li style="font-weight: normal; border: 0px" >' + txt + '</li>"')
				      .attr("src", param.src)
				      .data(param.metadata)
				      .on("keydown", function(evt) {dbg(event.which)});
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
	buttonSize: 30
	, volume: 20
	, formatTitle: function(src, metadata) {
		return src;
	}
	, layout: $('<table> \
		<tr> \
			<td class="drag-container" colspan="8" ></td> \
		</tr> \
		<tr> \
			<td class="prev-container"></td> \
			<td class="play-container"></td> \
			<td class="pause-container"></td> \
			<td class="stop-container"></td> \
			<td class="next-container"></td> \
			<td class="shuffleloop-container"></td> \
			<td class="playlist-container"></td> \
			<td class="volume-container" rowspan="3" ></td> \
		</tr> \
		<tr> \
			<td class="screen-container" colspan="7" ></td> \
		</tr> \
		<tr> \
			<td class="seekbar-container" colspan="7" ></td> \
		</tr> \
		</table>')
}