var ready = false;
var songlist, library, raw_json;
var audio_p, audio_s;
var skip__;
var loop_type; 
// 0 - no loop. 
// 1 - repeat playlist. 
// 2 - repeat song. (kinda disregard this one)
// 3 - random continuous playlist play

function azzle2(snum, end_num)
{
	if (!ready)
		return;
		
	for (var i = snum; i < end_num; i ++)
		azzle(i);
}

function clizzle()
{
	if (!ready)
		return;
		
	while (songlist.length > 0)
		songlist.pop();
	refresh_sidepanel();
}

function loozzle(num)
{
	if (!ready)
		return;
		
	loop_type = (loop_type + 1) % 4;
	if (loop_type == 0)
		$("#loop").text("normal");
	if (loop_type == 1)
		$("#loop").text("continuous");
	if (loop_type == 2)
		$("#loop").text("repeat");
	if (loop_type == 3)
		$("#loop").text("random");
	
}

function remizzle(num)
{
	if (!ready)
		return;
		
	songlist.splice(num, 1);
	refresh_sidepanel();
}

function skizzle(num)
{
	if (!ready)
		return;

	skip__ = true;
	var i;
	
	if (loop_type == 0)
	{
		for (i = 0; i < num; i ++)
			songlist.shift();
	}
	if (loop_type == 1)
	{
		for (i = 0; i < num; i ++)
			songlist.push(songlist.shift());
	}
	if (loop_type == 2)
	{
		// nothing really needs to happen, so FUCK IT!
	}
	if (loop_type == 3)
	{
		for (i = 0; i < (Math.floor((Math.random() * songlist.length) + 1)); i ++)
			songlist.push(songlist.shift());
	}
	refresh_sidepanel();
}

function azzle(num)
{
	if (!ready)
		return;
		
	songlist.push(num);
	refresh_sidepanel();
}

function plizzle(num)
{
	if (!ready)
		return;
		
	songlist.shift();
	songlist.unshift(num);
	
	refresh_sidepanel();
}

$(document).ready(function()
{
	songlist = new Array();
	skip__ = false;
	loop_type = 0;
	$.ajax(
	{
		url : "library2.json", 
		success : function(result)
		{
			raw_json = result;
			raw_json.sort(function(a, b)
			{
				if (a.artist.toUpperCase().replace(/^[^a-zA-Z0-9]/,"") < b.artist.toUpperCase().replace(/^[^a-zA-Z0-9]/,""))
					return -1;
				if (a.artist.toUpperCase().replace(/^[^a-zA-Z0-9]/,"") > b.artist.toUpperCase().replace(/^[^a-zA-Z0-9]/,""))
					return 1;
				if (a.year < b.year)
					return -1;
				if (b.year < a.year)
					return 1;
				if (a.album.toUpperCase() < b.album.toUpperCase())
					return -1;
				if (a.album.toUpperCase() > b.album.toUpperCase())
					return 1;
				return 0;
			});
			
			generate_mainboard();
			skizzle();
	
			audio_p.addEventListener("ended", function()
			{
				skizzle(1);
			});
			ready = true;
			
			refresh_sidepanel();
		}
	});
	
	audio_p = document.getElementById("audio");
	audio_s = document.getElementById("source");
});

function buildup_tracklist()
{
	if (!ready)
		return;
		
	var h_t_m_l = "";
	var i;
	for (i = 1; i < songlist.length; i ++)
	{
		h_t_m_l += "<div class=\"album_track\" id=\"track";
		h_t_m_l += i;
		h_t_m_l += "\">\n<a class='btn' href=\"javascript:remizzle(";
		h_t_m_l += i;
		h_t_m_l += ");\">remove</a><a class='btn' href=\"javascript:skizzle(";
		h_t_m_l += i;
		h_t_m_l += ");\">play</a>";
		h_t_m_l += library[songlist[i]].title;
		h_t_m_l += "\n</div>";
	}
	$("#track_list").html(h_t_m_l);
}

function refresh_playinfo()
{
	if (!ready)
		return;
		
	var load = false;
	
	if (songlist.length > 0)
	{
		load = !($("#sb_title").text() === library[songlist[0]].title);
		if (skip__)
		{
			load = true;
			skip__ = false;
		}
		$("#sb_title").text(library[songlist[0]].title);
		$("#sb_artist").text(library[songlist[0]].artist);
		$("#sb_album").text(library[songlist[0]].album);
		$("#sb_cover").attr("src", library[songlist[0]].cover);
		audio_s.src = library[songlist[0]].source;
		if (load)
		{
			audio_p.load();
			audio_p.play();
		}
	}
	else
	{
		$("#sb_title").text("-- N/A --");
		$("#sb_artist").text("-- N/A --");
		$("#sb_album").text("-- N/A --");
		$("#sb_cover").attr("src", "art.png");
		audio_s.src = "";
		audio_p.pause();
		audio_p.load();
	}
}

function refresh_sidepanel()
{
	refresh_playinfo();
	buildup_tracklist();
}

function generate_mainboard()
{
	library = new Array();
	$("#not_found").hide();
	var n = 0;
	var h_t_m_l = "";
	
	for (var i = 0; i < raw_json.length; i ++)
	{
		h_t_m_l += "<div class=\"album\">\n<div class=\"album_left\">\n<img src=\"";
		h_t_m_l += raw_json[i].cover;
		h_t_m_l += "\" width=\"200px\" height=\"200px\" class=\"album_image\" /><br />";
		h_t_m_l += "<a class=\"add_album_btn\" href=\"javascript:azzle2("
		h_t_m_l += n;
		h_t_m_l += ",";
		h_t_m_l += (n + raw_json[i].songs.length);
		h_t_m_l += ");\">queue album</a>"
		h_t_m_l += "<h3>";
		h_t_m_l += raw_json[i].album;
		h_t_m_l += "</h3>\n<h4>";
		h_t_m_l += raw_json[i].artist;
		h_t_m_l += "</h4>\n"
		h_t_m_l += "</div>\n<div class=\"album_right\">\n";
		for (var j = 0; j < raw_json[i].songs.length; j ++)
		{
			h_t_m_l += "<div class=\"album_track\">\n<a class=\"btn\" href=\"javascript:azzle(";
			h_t_m_l += n;
			h_t_m_l += ");\">queue</a><a class=\"btn\" href=\"javascript:plizzle(";
			h_t_m_l += n;
			h_t_m_l += ");\">play</a> ";
			h_t_m_l += raw_json[i].songs[j].title;
			h_t_m_l += "\n</div>";
			library.push(raw_json[i].songs[j]);
			n += 1;
		}
		h_t_m_l += "</div>\n</div>\n<div class=\"clear\"></div>\n";
	}
	
	$("#mainboard").html(h_t_m_l);
}

function sizzle()
{
	if (!ready)
		return;
		
	// generate view depending on current state of the website
	var query = $("#tha_box").val().trim();
	if (query == "")
		generate_mainboard();
	else
	{
		if (generate_mainboard_query(query) == "")
		{
			generate_mainboard();
			$("#not_found").show();
		}
	}
}

function generate_mainboard_query(query)
{
	if (!ready)
		return "";
		
	query = query.toUpperCase();
	var h_t_m_l = "<div class=\"search_list\">";
	var post = false;
	for (var i = 0; i < library.length; i += 1)
	{
		post = false;
		if (library[i].artist.toUpperCase().indexOf(query) != -1)
			post = true;
		if (library[i].title.toUpperCase().indexOf(query) != -1)
			post = true;
		if (library[i].album.toUpperCase().indexOf(query) != -1)
			post = true;
			
		console.log(post + " " + library[i].title)
		if (post)
		{
			h_t_m_l += "<div class=\"album_track\">\n<a class=\"btn\" href=\"javascript:azzle(";
			h_t_m_l += i;
			h_t_m_l += ");\">queue</a><a class=\"btn\" href=\"javascript:plizzle(";
			h_t_m_l += i;
			h_t_m_l += ");\">play</a> ";
			h_t_m_l += library[i].album;
			h_t_m_l += " &nbsp; &nbsp; - &nbsp; &nbsp; "
			h_t_m_l += library[i].artist;
			h_t_m_l += " &nbsp; &nbsp; - &nbsp; &nbsp; "
			h_t_m_l += library[i].title;
			h_t_m_l += "\n</div>";
		}
	}
	h_t_m_l += "</div>";
	$("#mainboard").html(h_t_m_l);
	if (h_t_m_l == "<div class=\"search_list\"></div>")
	{
		$("#not_found").show();
		return "";
	}
	return h_t_m_l;
}

function clizzle_rizzle()
{
	$('#tha_box').val('');
	sizzle();
}