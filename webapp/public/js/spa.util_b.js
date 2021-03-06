/*
spa.util_b.js
 */

/*jslint
	browser : true, continue : true, 
	devel   : true, indent   : 2,      maxerr : 50,
	newcap  : true, nomen    : true, plusplus : true,
	regexp  : true, sloppy   : true,     vars : true,
	white   : true
*/
/*global $, spa, getComputedStyle */

spa.util_b = (function ()
{
	'use strict';
	//===================================
	// Module Scope Variant >>> Start 

	var
		configMap = 
		{
			regex_encode_html : /[&"'><]/g,
			regex_encode_noamp : /["'><]/g,
			html_encode_map : 
			{
				'&' : '&#38;',
				'"' : '&#34;',
				"'" : '&#39;',
				'>' : '&#62;',
				'<' : '&#60;'
			}
		},

		decodeHtml, encodeHtml, getEmSize;

		configMap.encode_noamp_map = $.extend( {}, configMap.html_encode_map );

		delete configMap.encode_noamp_map['&'];

	// Module Scope Variant <<< End
	//===================================


	//===================================
	// Utility Methods >>> Start

	// "decodeHtml"
	// Decode HTML entities accoding to the browser.
	// Refer to http://stackoverflow.com/questions/1912501/unescape-html-entities-in-javascript 
	// 
	decodeHtml = function ( str )
	{
		return $('<div/>').html(str || '').text();
	};

	// "encodeHtml"
	// Single path encoder for html entities.
	// 
	encodeHtml = function ( input_arg_str, exclude_amp )
	{
		var
			input_str = String( input_arg_str ),
			regex, lookup_map
			;

		if ( exclude_amp )
		{
			lookup_map = configMap.encode_noamp_map;
			regex = configMap.regex_encode_noamp;
		}
		else
		{
			lookup_map = configMap.html_encode_map;
			regex = configMap.regex_encode_html;
		}

		return input_str.replace(regex, function ( match, name )
			{
				return lookup_map[ match ] || '';
			});
	};

	// "getEmSize"
	// Returns Pixel of EM size.
	// 
	getEmSize = function ( elem )
	{
		return Number( getComputedStyle( elem, '' ).fontSize.match(/\d*\.?\d*/)[0] );
	};

	// Utility Methods <<< End
	//===================================
	

	//===================================
	// DOM Methods >>> Start

	// DOM Methods <<< End
	//===================================


	//===================================
	// Event Handlers >>> Start

	// Event Handlers <<< End
	//===================================



	//===================================
	// Public Methods >>> Start
	
	// Public Methods <<< End
	//===================================


	// ### Return Public Methods ###
	return {
		decodeHtml : decodeHtml,
		encodeHtml : encodeHtml,
		getEmSize  : getEmSize
	}; 

}());