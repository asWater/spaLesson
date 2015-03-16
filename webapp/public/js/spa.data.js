/*
spa.data.js
 */

/*jslint
	browser : true, continue : true, 
	devel   : true, indent   : 2,      maxerr : 50,
	newcap  : true, nomen    : true, plusplus : true,
	regexp  : true, sloppy   : true,     vars : true,
	white   : true
*/
/*global $, io, spa */

spa.data = (function ()
{
	'use strict';

	//===================================
	// Module Scope Variant >>> Start 

	var
		stateMap = 
		{ 
			sio : null 
		},

		makeSio, getSio, initModule;

	// Module Scope Variant <<< End
	//===================================


	//===================================
	// Utility Methods >>> Start

	makeSio = function ()
	{
		var
			socket = io.connect( '/chat' );

		return {
			emit : function ( event_name, data )
			{
				socket.emit( event_name, data );
			},
			on : function ( event_name, callback )
			{
				socket.on( event_name, function ()
				{
					callback( arguments );
				});
			}
		};
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
	
	getSio = function ()
	{
		if ( ! stateMap.sio )
		{
			stateMap.sio = makeSio();
		}
	};

	initModule = function (){};

	// Public Methods <<< End
	//===================================


	// ### Return Public Methods ###
	return {
		getSio : getSio,
		initModule : initModule
	}; 

}());