# jap - just another player

Jap (as in "Japan") is a jQueryUI styled HTML5 audio player. It is freely usable, but
still in development (don't consider this a stable/final version, not yet).

### TODO
- Playlist buttons (shuffle, sort -with custom fn-, add -browse local/prompt uri-, remove)


### KNOWN BUGS
none


### WORKS ON
Everything handles jQuery and HTML5 stuff (canvas, audio).


### BASIC USAGE
It can be build this way:
```
<div id='jap'></div>

(..)

$("#jap").jap();
```
The '#jap' div will become the container for all the html stuff needed by the player.


### ADVANCED USAGE
It can be used as a wrapper for a custom player web page.
See this example:
```
$("#jap").jap().hide();
```
Then somewhere in your code you can send commands to the jap:
```
$("#jap").jap("enqueue", {src: "http://127.0.0.1/Get?num=1"});
$("#jap").jap("enqueue", {src: "http://127.0.0.1/Get?num=2"});
$("#jap").jap("enqueue", {src: "http://127.0.0.1/Get?num=3"});
$("#jap").jap("play");
```

### PARAMETERS
All the default parameters are exposed here:
```
$.fn.jap.defaults
```
They are:
- buttonSize (default: 30): the size of the jap controls
- volume (default: 20): the initial value of the volume. It is a percentage [0:100] value
- formatTitle (default: function(src, metadata) { return src; }): it is the formatting function for the song title. It is
used by the playlist and the "now playing" scrolling view
- layout (default: a html table): it is the container for each control of the jap

These can be customized in the jap constructor:
```
$("#jap").jap({
  buttonSize: 50,
  formatTitle: function(src ,metadata) {	
	if ($.isEmptyObject(metadata)) return src;
	return metadata.author + " - " + metadata.album + " - " + metadata.trackn + " - " + metadata.title;
  }
});
```

### METHODS (API)
Every method call will trigger ad event of the same name after being handled. It can be reused from the caller.
Example:
```
$("#jap").jap()
  .tooltip()
  .on("play", function(ev, jap) {
    var $jap = $(jap);
    var nowplaying = $jap.find(".playing").text();
    $jap.find(".drag").attr("title", nowplaying);
  });
```

- enqueue:
```
$("#controls").jap("enqueue", 	{ src: "/home/my/music/is/here/track1.mp3", metadata: {title: "The wonderful song", album: "A new Album"} });
```
  - src (required): the uri of the song.
  - metadata (optional): it is a custom JSON object. It is passed to the "formatTitle" function so you can customize the way jap displays the song title.
- dequeue
```
$("#controls").jap("dequeue", 	{ index: 3 });
```
  - index (required): the playlist index of the item to remove.
- seek
```
$("#controls").jap("seek", 		{ percentage: 20 });
```
  - percentage (required): a [0:100] value.
- play
```
$("#controls").jap("play");
```
- pause
```
$("#controls").jap("pause");
```
- stop
```
$("#controls").jap("stop");
```
- next
```
$("#controls").jap("next");
```
- prev
```
$("#controls").jap("prev");
```