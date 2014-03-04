# jap - just another player
![](https://raw.github.com/pste/jap/master/jap.png)

Jap (as in "Japan", a fascinating land with a fascinating culture) is a jQueryUI styled HTML5 audio player. 

### TODO
- Playlist add button (browse local/prompt uri)
- Sort playlist / shuffle playlist now stops playing
- Snap and drag

### LICENSING
The jap project is released under the terms of the MIT license.

### WORKS ON
Everything handles jQuery and HTML5 stuff (canvas and audio). Succesfully tested on Firefox, Chrome, Rekonq, Ie9.

### BASIC USAGE
Given a container:
```
<div id='jap'></div>
```
The jap can be build this way:
```
$("#jap").jap();
```
The plugin will build all the stuff needed by the player.

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
- font: (default: 'Verdana'): the font used
- volume (default: 20): the initial value of the volume. It is a percentage [0:100] value
- formatTitle (default: function(src, metadata) { return src; }): it is the formatting function for the song title. It is
used by the playlist and the "now playing" scrolling view
- layout (default: a html table): it is the container for each control of the jap

These can be customized in the jap constructor:
```
$("#jap").jap({
  buttonSize: 50,
  font: "Orbitron", // <link href='http://fonts.googleapis.com/css?family=Orbitron:400,700' rel='stylesheet' type='text/css'>
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
$("#controls").jap("enqueue", { src: "/home/my/music/is/here/track1.mp3", metadata: {title: "The wonderful song", album: "A new Album"} });
```
    * src (required): the uri of the song.
    * metadata (optional): it is a custom JSON object. It is passed to the "formatTitle" function so you can customize the way jap displays the song title.
- dequeue
```
$("#controls").jap("dequeue", { index: 3 });
```
    * index (required): the playlist index of the item to remove.
- seek
```
$("#controls").jap("seek", { percentage: 20 });
```
    * percentage (required): a [0:100] value.
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
