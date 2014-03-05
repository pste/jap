/**
* @preserve Stefano Pirra (2014)
* v1.0 - 20140303
*/
// http://www.w3.org/html/wg/drafts/html/master/embedded-content-0.html#event-media-ended
// https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events
// http://www.w3schools.com/tags/ref_av_dom.asp
(function($) {
	function dbg(fmt, p1, p2, p3, p4, p5) {
		if (typeof(p1) == "undefined") p1 = "";
		if (typeof(p2) == "undefined") p2 = "";
		if (typeof(p3) == "undefined") p3 = "";
		if (typeof(p4) == "undefined") p4 = "";
		if (typeof(p5) == "undefined") p5 = "";
		if (typeof(console) != "undefined") console.log(fmt, p1, p2, p3, p4, p5);
	}
	
	/* ::::::::::::::::::: */
	
	var settings = null; // join defaults with custom
	var controls = null; // save controls for convenience
	var animationOn = false; // TODO: UGLY GLOBAL
	var displaymode = {
	  TIME_TITLE: 0
	  , TIMELEFT_TITLE: 1
	  , TIMELEFT_URI: 2
	  , TIME_URI: 3	  
	};
	var nowdisplay = displaymode.TIME_TITLE; // TODO: UGLY GLOBAL
	
	var css = {
		active: "ui-state-error"
		, selected: "ui-state-highlight"
		, selecting: "ui-state-hover"
		, playing: "ui-state-error"
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
		var button_3 = settings.buttonSize/3;
		var miniButtonSize = (settings.buttonSize/2) - 2; // FIXED VAL (2 border)
		var initialvolume = 25;
		
		// build interface
		var css_btn = {"width": button_1, "height": button_1, "float": "left"};
		var css_btn_mini = {"width": miniButtonSize, "height": miniButtonSize};
		controls = {
			drag:	 	$('<div class="drag ui-widget-header ui-corner-all" style="height:10px; clear:both; margin-bottom:4; cursor:pointer"></div>')
			, prev: 	$('<div class="prev"></div>')	.button({text: false, icons: { primary: "ui-icon-seek-prev" }} ).css(css_btn)
			, play: 	$('<div class="play"></div>')	.button({text: false, icons: { primary: "ui-icon-play" }} )		.css(css_btn)
			, pause: 	$('<div class="pause"></div>')	.button({text: false, icons: { primary: "ui-icon-pause" }} )	.css(css_btn)
			, stop: 	$('<div class="stop"></div>')	.button({text: false, icons: { primary: "ui-icon-stop" }} )		.css(css_btn)
			, next: 	$('<div class="next"></div>')	.button({text: false, icons: { primary: "ui-icon-seek-next" }} ).css(css_btn)
			, loop:		$('<div class="loop"></div>')	.button({text: false, icons: { primary: "ui-icon-refresh" }} )	.css(css_btn_mini).css({"float":"left", "clear":"both"})
			, shuffle:	$('<div class="shuffle"></div>').button({text: false, icons: { primary: "ui-icon-shuffle" }} )	.css(css_btn_mini).css({"float":"left", "clear":"both"})
			, playlist: 	$('<div class="playlist"></div>').button({text: false, icons: { primary: "ui-icon-eject" }} )	.css(css_btn).css({"font-size":"0.9em"})
			, display:	$('<canvas class="display"></canvas>').css({"border-radius": "2px", "border": 1, "clear": "both", "height": button_3})
			, seekbar:	$('<div class="seekbar"></div>').progressbar()	.css({"clear": "both", "height": button_3})
			, volume:	$('<div class="volume"></div>')	.slider({ orientation: "vertical", "value": initialvolume}).css({"font-size":"0.5em", "height": button_1+(2*button_3)})
			, audio:	$("<audio></audio>")			
			, queue:	$("<ol class='queue ui-widget ui-widget-content ui-corner-all'></ol>").css({"list-style-type":"none", "overflow":"hidden", "margin": 0, "padding": 7})
		};
		var queuecontrols  = {
			play: 	$('<div></div>')	.button({text: false, icons: { primary: "ui-icon-play" }} )	.css(css_btn_mini)//.css({"float":"left", "margin":"0px 5px 0px 5px"})
			, add: $('<div></div>')		.button({text: false, icons: { primary: "ui-icon-plus" }} )	.css(css_btn_mini)//.css({"float":"left", "margin":"0px 5px 0px 5px"})
			, remove: $('<div></div>')	.button({text: false, icons: { primary: "ui-icon-minus" }} )	.css(css_btn_mini)//.css({"float":"left", "margin":"0px 5px 0px 5px"})
			, sort: $('<div></div>')	.button({text: false, icons: { primary: "ui-icon-arrowthick-1-s" }} ).css(css_btn_mini)//.css({"float":"left", "margin":"0px 5px 0px 5px"})
			, shuffle: $('<div></div>')	.button({text: false, icons: { primary: "ui-icon-shuffle" }} )	.css(css_btn_mini)//.css({"float":"left", "margin":"0px 5px 0px 5px"})
		};
		
		// attach plugin events to the controls
		controls.audio	.on("timeupdate", function() {
							var p = controls.audio[0];
							var x = utils.getTrackPercentage(p);
							controls.seekbar.progressbar("option", "value", x);
						})
						.on("ended", function() { container.jap("next"); });
		controls.audio[0].volume = initialvolume / 100;
		controls.queue	.on("selectableselecting", function(event, ui) 	{ $(ui.selecting).removeClass(css.selecting).addClass(css.selected); })
				.on("selectableunselecting", function(event, ui){ $(ui.unselecting).removeClass(css.selected + " " + css.selecting);	})
				.on("selectableselected", function(event, ui) 	{ $(ui.selected).removeClass(css.selected).addClass(css.selecting); })
				.on("selectableunselected", function(event, ui) { $(ui.unselected).removeClass(css.selected + " " + css.selecting);})
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
			var qwrap = controls.queue.parent();
			if (qwrap.is(":visible")) qwrap.fadeOut();
			else qwrap.fadeIn();
		});
		controls.display.on("click",	function() {
			nowdisplay = (nowdisplay+1)%4;
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
		
		// queue toolbar events
		queuecontrols.play.on("click", function(evt) {
			controls.queue.children("li").removeClass(css.playing);
			controls.queue.children("li.ui-selected").first().addClass(css.playing);
			container.jap("play");
		});
		queuecontrols.add.on("click", function(evt) {
			var uri = prompt("Insert a URI:", "http://");
			if (uri != null) {
				container.jap("enqueue", {src: uri}); // TODO metadata
			}
		});
		queuecontrols.remove.on("click", function(evt) {
			controls.queue.find(".ui-selected").remove();
		});
		queuecontrols.shuffle.on("click", function(evt) {
			controls.queue.selectable("option", "autoRefresh", false);
			var q = controls.queue.find("li");
			q.sort(function(a,b){
				return Math.random() > Math.random();
			}).each(function(i,o) {
				var $o = $(o);
				$o.detach();
				controls.queue.append($o);
			});
			utils.redrawqueue();
		});
		queuecontrols.sort.on("click", function(evt) {
			controls.queue.selectable("destroy");
			var q = controls.queue.find("li"); 
			q.sort(function(a,b){
				var $a = $(a);
				var $b = $(b);
				var t1 = settings.formatTitle($a.text(), $a.data("jap"));
				var t2 = settings.formatTitle($b.text(), $b.data("jap"));
				return t1.localeCompare(t2);
			}).each(function(i,o) {
				var $o = $(o);
				$o.detach();
				controls.queue.append($o);
			});
			utils.redrawqueue();
		});
		
		// make a resizable / selectable queue;
		var queuetoolbar = $('<div class="ui-widget ui-widget-content ui-corner-all"></div>').css({"height": settings.buttonSize/2, "clear":"both", "overflow":"hidden", "padding":0, "margin":0});
		for (btn in queuecontrols) {
			queuetoolbar.append(queuecontrols[btn]);
		}
		queuetoolbar.buttonset().css({"cursor":"pointer"});
		
		// 
		var queuewrap = settings.layout.find(".queue-container");//controls.queue.wrap($("<div class='queue-wrap' style='position:absolute'></div>")).parent(); // .wrap(..) uses a copy of the element
		queuewrap	
				.css("position","absolute")
				.resizable()
				.draggable({ snap:container, snapMode:"outer", handle:queuetoolbar })
				.on("resize", function(event, ui) {
					var qbord_w = controls.queue.outerWidth(true) - controls.queue.width();
					var qbord_h = controls.queue.outerHeight(true) - controls.queue.height();
					var w = queuewrap.width() - qbord_w;
					var h = queuewrap.height() - qbord_h - queuetoolbar.outerHeight(true);
					controls.queue.width(w).height(h);
				})
				.hide();
		
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
		settings.layout.find(".display-container").css(tdcss)	.append(controls.display);
		settings.layout.find(".seekbar-container").css(tdcss)	.append(controls.seekbar);
		settings.layout.find(".queue-container").append(queuetoolbar, controls.queue)
		container.wrap("<jap style='font-size:" + fontSize + "px'></jap>") // my scope
			.append(settings.layout, controls.audio)
			.draggable({snap:queuewrap, snapMode:"outer", handle: controls.drag})
			.css({"padding": 8}) // "font-size": fontSize, 
			.addClass("ui-widget ui-widget-content ui-corner-all")
			.parent().append(/*controls.queue*/queuewrap)
			;
			
		// canvas
		var w = controls.seekbar.width();
		controls.display.css("width", w)
		controls.display.attr("width", w);
		controls.display.attr("height", button_3);
		var c = controls.display[0];
		var ctx = c.getContext('2d');
		var fontColor = container.find(".ui-widget-content:first").css("color");
		//fontSize = container.find(".ui-widget-content:first").css("font-size");
		var fontType = container.find(".ui-widget-content:first").css("font-family");
		//ctx.fillStyle = "rgba(0,0,0,0)";
		//ctx.fillRect(0,0,c.width,c.height);
		ctx.font = fontSize + "px " + fontType;
		ctx.fillStyle = fontColor;
		
		// final size fixes
		var fullw = settings.layout.outerWidth(true);
		var fullh = settings.layout.outerHeight(true);
		container.css({"width": fullw, "height": fullh});
		queuewrap.css({"width": fullw, "height": fullh})
				.position({ my: "left top", at: "right+5 top", of: container}); // position after "container"'s resize
	}
	
	/* ::::::::::::::::::: */
	
	function tick() {
		var c = controls.display;
		var ctx = c[0].getContext('2d');
		var p = controls.audio[0];
		
		// get text
		var selected = controls.queue.children("li." + css.playing); // little hacky
		var text = ""; // settings.formatTitle(selected.text(), selected.data("jap"));
		var time = ""; // utils.timetext(p.currentTime);
		if (p.seekable.length > 0) {
			switch (nowdisplay)
			{
			  case displaymode.TIME_TITLE:
			    time = utils.timetext(p.currentTime);
			    text = settings.formatTitle(selected.text(), selected.data("jap"));
			    break;
			  case displaymode.TIMELEFT_TITLE: 
			    time = (p.duration!=Infinity)?"-" + utils.timetext(p.duration-p.currentTime):utils.timetext(p.currentTime);
			    text = settings.formatTitle(selected.text(), selected.data("jap"));
			    break;
			  case displaymode.TIME_URI:
			    time = utils.timetext(p.currentTime);
			    text = selected.attr("src");
			    break;
			  case displaymode.TIMELEFT_URI: 
			    time = (p.duration!=Infinity)?"-" + utils.timetext(p.duration-p.currentTime):utils.timetext(p.currentTime);
			    text = selected.attr("src");
			    break;
			}
		}
		
		// some measure
		var timewidth = ctx.measureText(time).width + 3;
		var titlewidth = ctx.measureText(text).width;
		var canvaswidth = c.width();
		var canvasheight = c.height();
		//var fontColor = controls.find(".ui-widget-content:first").css("color");
		
		// calculate offset
		var offset = c.attr("offset");
		if (typeof(offset) === "undefined")
			offset = titlewidth; // starts here
		else {
			offset -= 1; // move to the left
			if (-offset >= titlewidth) // if everything to the left
				offset = titlewidth; // restarts here
		}
		c.attr("offset", offset);
		
		// draw
		//ctx.fillStyle = fontColor;
		// title
		ctx.clearRect(0,0,canvaswidth,canvasheight);
		ctx.fillText(text, offset, canvasheight);
		// draw time
		ctx.clearRect(0,0,timewidth,canvasheight);
		ctx.fillText(time, 0, canvasheight);
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
						controls.queue.children("li").removeClass("played");
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
			return /*hhS+":"+*/mmS+":"+ssS;
		}
		,redrawqueue: function() {
			var items = controls.queue.children("li");
			items.removeClass("ui-corner-top ui-corner-bottom");
			items.first().addClass("ui-corner-top");
			items.last().addClass("ui-corner-bottom");
			
			// TODO: need to rebuild the selectable BUT have to check if multiple init is safe .. maybe force redraw?
			controls.queue.selectable();
			controls.queue.parent().trigger("resize", {element: controls.queue.parent()}); // TODO :NEEDED?
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
		/*::: JAP :::*/
		, queueitem: function(elem) {
			var $o = $(elem);
			return {
				src: $o.attr("src")
				, metadata: $o.data("jap")
			}
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
			if (typeof(param) == "undefined") dbg("%s: -", action);
			else dbg("%s: %s", action, JSON.stringify(param));
			var _jap = this;
			
			//
			if (action === "enqueue") { // adds one element to the (html 'li') queue. Param: {src: "title.mp2", metadata: (tipically json)}
				// handle a string as single param
				if (typeof(param) == "string") {
					param = {src: param};
				}
				// fix metadata
				if (typeof(param.metadata) == "undefined")
					param.metadata = null;
				// 
				var txt = settings.formatTitle(param.src, param.metadata);
				var li = $('<li>' + txt + '</li>"')
				    .css({"font-weight":"normal", "padding-left":10, "padding-right":10, "border":0, "overflow":"hidden", "text-overflow":"ellipsis", "white-space":"nowrap"})
				    .attr("src", param.src)
				    .data("jap", param.metadata)
				    ;
				
				//
				controls.queue.append(li);
				utils.redrawqueue();
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
				
				utils.startAnimation();
				utils.deselectAll(_jap);
				controls.play.addClass(css.active);
				selected.addClass("played");
			}
			else if (action === "pause") {
				if (utils.isPlaying() && !utils.isPaused()) {
					var p = controls.audio[0];
						utils.deselectAll(_jap);
						controls.pause.addClass(css.active);
						
						// player
						p.pause();
				}
			}
			else if (action === "stop") {
				if (!utils.isStopped()) {
					var p = controls.audio[0];
					utils.deselectAll(_jap);
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
					_jap.jap("play");
				else
					_jap.jap("stop");
			}
			else if (action === "prev") {
				utils.select(action);
				var selected = controls.queue.children("li." + css.playing); // little hacky
				
				var src = selected.attr("src");
				var selectionChanged = (controls.audio.attr("src") != src);
				if (selectionChanged && utils.isPlaying())
					_jap.jap("play");
				else
					_jap.jap("stop");
			}
			
			// propagate
			_jap.trigger(action, _jap);
		}
		
		// chain ability
		return this;
	};
}(jQuery));

$.fn.jap.defaults = {
	buttonSize: 34
	, formatTitle: function(src, metadata) {
		return src;
	} 
	, layout: $('<table><tr> \
			<td class="drag-container" colspan="8" > \
			<div class="queue-container"></div> \
			</td> \
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
			<td class="display-container" colspan="7" ></td> \
		</tr> \
		<tr> \
			<td class="seekbar-container" colspan="7" ></td> \
		</tr></table>')
}