/*
* cache.js
*/
/*jslint node : true, continue : true,
devel : true, indent : 2, maxerr : 50,
newcap : true, nomen : true, plusplus : true,
regexp : true, sloppy : true, vars : false,
white : true
*/
/*global */

'use strict';

//===================================
// Module Scope Variant >>> Start

var
	redisDriver = require( 'redis' ),
	redisClient = redisDriver.createClient(),

	makeString, deleteKey, getValue, setValue;

// Module Scope Variant <<< End
//===================================


//===================================
// Utility Method >>> Start

makeString = function ( key_data )
{
	return ( typeof key_data === 'string' ) ? key_data : JSON.stringify( key_data );
};

// Utility Method <<< End
//===================================


//===================================
// Public Method >>> Start

deleteKey = function ( key )
{
	redisClient.del( makeString( key ) );
};

getValue = function ( key, hit_callback, miss_callback )
{
	redisClient.get( makeString( key ), function ( err, reply )
	{
		if ( reply )
		{
			console.log( '!!! HIT cache !!!' );
			hit_callback( reply );
		}
		else
		{
			console.log( ';;; MISS cache ;;;' );
			miss_callback();
		}
	});
};

setValue = function ( key, value )
{
	redisClient.set( makeString( key ), makeString( value ) );
};


module.exports =
{
	deleteKey : deleteKey,
	getValue : getValue,
	setValue : setValue
};

// Public Method <<< End
//===================================



