/*
* app.js
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
	chatObj,
	emitUserList, signIn, signOut,
	socket = require( 'socket.io' ),
	crud = require( './crud' ),

	makeMongoId = crud.makeMongoId,
	chatterMap = {};

// Module Scope Variant <<< End
//===================================


//===================================
// Utility Method >>> Start

// "emitUserList"
// Broadcast user list to all connected clients.
emitUserList = function ( io )
{
	crud.read( 'user', { is_online : true }, {}, function ( result_list )
	{
		io
			.of( 'chat' )
			.emit( 'listchange', result_list );
	});
};

// "signIn"
// Update is_online property and chatterMap.
signIn = function ( io, user_map, socket )
{
	crud.update(
		'user',
		{ '_id' : user_map._id },
		{ is_online : true },
		function ( result_map )
		{
			emitUserList( io );
			user_map.is_online = true;
			socket.emit( 'userupdate', user_map );
		});

	chatterMap[ user_map._id ] = socket;
	socket.user_id = user_map._id;
};

// "signOut"
// Update is_online property and chatterMap.
signOut = function ( io, user_id )
{
	crud.update(
		'user',
		{ '_id' : user_id },
		{ is_online : false },
		function ( result_list )
		{
			emitUserList( io );
		});

	delete chatterMap[ user_id ];
};

// Utility Method <<< End
//===================================


//===================================
// Public Methods >>> Start

chatObj =
{
	connect: function ( server )
	{
		var
			io = socket.listen( server );

		// io setting
		io
			.set( 'blacklist', [] )
		    .of( '/chat' )
			.on( 'connection', function ( socket )
			{
			  	// <Message Handler> : "adduser"
			  	// [Summary] : Provides sign in capability.
			  	// [Arguments] :
			  	//    A single user_map object.
			  	//    "user_map" should have the following properties:
			  	//     - name = the name of the user.
			  	//     - cid = the client id.
			  	// [Action] :
			  	// 	If an user with the provided username already exists in Mongo,
			  	// 	use the existing user object and ignore other input.
			  	// 	If an user with the provided username does not exist in Mongo,
			  	// 	create one and use it.
			  	// 	Send a 'userupdate' message to the sender so that a login cycle can complete.
			  	// 	Ensure the client id is passed back so the client can correlate the user,
			  	// 	but do not store it in MongoDB.
			  	// 	Mark the user as online and send the updated online user list to all clients,
			  	// 	including the client that originated the 'adduser' message.
			  	//
			  	socket.on( 'adduser', function ( user_map )
				  	{
					    crud.read(
					    	'user',
					      	{ name : user_map.name },
					      	{},
					      	function ( result_list )
					      	{
					      		var
					      			result_map,
					      			cid = user_map.cid;

					      		delete user_map.cid;

					      		// use existing user with provided name.
					      		if ( result_list.length > 0)
					      		{
					      			result_map = result_list[ 0 ];
					      			result_map.cid = cid;
					      			signIn( io, result_map, socket );
					      		}
					      		// create the user with new name
					      		else
					      		{
					      			user_map.is_online = true;
					      			crud.construct( 'user', user_map, function ( result_list )
					      			{
					      				result_map = result_list[ 0 ];
					      				result_map.cid = cid;
					      				chatterMap[ result_map._id ] = socket;
					      				socket.user_id = result_map._id;
					      				socket.emit( 'userupdate', result_map );
					      				emitUserList( io );
					      			});
					      		}
					      	});
				  	});

				// <Message Handler> : "updatechat"
				// [Summary] : Process chat messages.
				// [Arguments] : 
				// 	A single chat_map object.
				// 	"chat_map" has following properties.
				// 		- dest_id = Receiver's ID.
				// 		- dest_name = Reciever's name.
				// 		- sender_id = Sender's ID.
				// 		- msg_text = Message text.
				// [Behavior] : 
				// 	If the receiver is online, send the chat_map to the receiver.
				// 	If not online, send "user has gone offline" to the sender.
				// 	
		  	    socket.on( 'updatechat', function ( chat_map )
		  	    	{
		  	    		if ( chatterMap.hasOwnProperty( chat_map.dest_id ) )
		  	    		{
		  	    			chatterMap[ chat_map.dest_id ]
		  	    				.emit( 'updatechat' );
		  	    		}
		  	    		else
		  	    		{
		  	    			socket.emit(
		  	    				'updatechat',
		  	    				{
		  	    					sender_id : chat_map.sender_id,
		  	    					msg_text : chat_map.dest_name + ' has gone offline'
		  	    				});
		  	    		}

		  	    	} );

		  	    socket.on( 'leavechat', function ()
		  	    	{
		  	    		console.log( '** User %s logged out **', socket.user_id );
		  	    		signOut( io, socket.user_id );
		  	    	} );

		  	    socket.on( 'disconnect', function ()
		  	    	{
		  	    		console.log( '** User %s closed browser window or tab **', socket.user_id );
		  	    		signOut( io, socket.user_id );
		  	    	} );

		  	    // <Message handler> : "updateavatar"
		  	    // [Summary] : Handle update of avatar by the client.
		  	    // [Arguments] :
		  	    // 	A single avtr_map object.
		  	    // 	"avtr_map" must have following properties.
		  	    // 	- person_id = ID of avatart to be updated.
		  	    // 	- css_map = css_map which has top, left, background-color.
		  	    // 	
		  	    socket.on( 'updateavatar', function ( avtr_map )
		  	    	{
		  	    		crud.update(
		  	    			'user',
		  	    			{ '_id' : makeMongoId( avtr_map.person_id ) },
		  	    			{ css_map : avtr_map.css_map },
		  	    			function ( result_list )
		  	    			{
		  	    				emitUserList( io );
		  	    			});
		  	    	} );
		});

		return io;
	}
};

module.exports = chatObj;

// Public Methods <<< End
//===================================


//===================================
// Start Server >>> Start



// Start Server <<< End
//===================================