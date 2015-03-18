/*
spa.model.js
 */

/*jslint
	browser : true, continue : true, 
	devel   : true, indent   : 2,      maxerr : 50,
	newcap  : true, nomen    : true, plusplus : true,
	regexp  : true, sloppy   : true,     vars : true,
	white   : true
*/
/*global TAFFY, $, spa */

spa.model = (function ()
{
	'use strict';

	//===================================
	// Module Scope Variant >>> Start 

	var
		configMap = { anon_id : 'a0' },
		stateMap = 
		{
			anon_user : null,
			cid_serial : 0,
			people_cid_map : {},
			people_db : TAFFY(),
			is_connected : false,
			user : null
		},
		isFakeData = false,

		personProto, makeCid, clearPeopleDb, completeLogin, 
		makePerson, people, chat, removePerson, 
		initModule;

	// Module Scope Variant <<< End
	//===================================

	//===================================
	// Prototype >>> Start

	// The people object API
	//--------------------------------
	// The people object is available at spa.model.people.
	// The people object provides methods and events to manage
	// a colection of person objects. Its public mehtods include:
	//  - get_user() : Returns the current user person object.
	//  			   If the current user is not signed-in, an anonymous person object is returned.
	//  - get_db() : Retuns the TaffyDB database of all the person objects - including the current user - prestored.
	//  - get_by_cid( <client_id> ) : Returns a person object with provided unique id.
	//  - login( <user_name> ) : Login as the user with the provided user name.
	//                           The current user object is changed to reflect the new identiy.
	//                           Successful completion of login publishes a 'spa-login' global custom event.
	//  - logout() : Revert the current user object to anonymous.
	//               This method publishes a 'spa-logout' global custom event.
	//
	// jQuery global custom evnets published by the object include:
	//  - spa-login : This is published when a user login process completes.
	//                The updated user object is provided as data.
	//  - spa-logout : This is published when a logout completes.
	//                 The former user object is provided as data.
	//
	// Each person is represented by a person object.
	// Person objects provide the following methods:
	//  - get_is_user() : Returns true if object is the current user.
	//  - get_is_anon() : Returns true if object is annymous.
	//
	// The attributres for a person object include:
	//  - cid : string client id. This is always defined,
	//          and is only different from the id attribute, if the client data is not synced with the backend.
	//  - id : the unique id. This may be undefined if the object is not synced with the backend.
	//  - name : the string name of the user.
	//  - css_map : a map of attributes used for avatar presentation.
	//
	personProto = 
	{
		get_is_user : function ()
		{
			return this.cid === stateMap.user.cid;
		},
		get_is_anon : function ()
		{
			return this.cid === stateMap.anon_user.cid;
		}
	};

	// Prototype <<< End
	//===================================

	//===================================
	// Utility Methods >>> Start

	makeCid = function ()
	{
		return 'c' + String( stateMap.cid_serial++ );
	};

	clearPeopleDb = function ()
	{
		var
			user = stateMap.user;

		stateMap.people_db = TAFFY();
		stateMap.people_cid_map = {};

		if ( user )
		{
			stateMap.people_db.insert( user );
			stateMap.people_cid_map[ user.cid ] = user;
		}
	};


	completeLogin = function ( user_list )
	{
		var
			user_map = user_list[ 0 ];

		delete stateMap.people_cid_map[ user_map.cid ];

		stateMap.user.cid = user_map._id;
		stateMap.user.id = user_map._id;
		stateMap.user.css_map = user_map.css_map;
		stateMap.people_cid_map[ user_map._id ] = stateMap.user;

		//Set callbacks for "listchange(_publish_listchange)", "updatechat(_publish_updatechat)" global envets.
		chat.join();

		// When we add chat, we shold join here.
		// spa.shell.onLogin changes the title of acctount.
		$.gevent.publish( 'spa-login', [ stateMap.user ] );
	};


	makePerson = function ( person_map )
	{
		var
			person,
			cid     = person_map.cid,
			css_map = person_map.css_map,
			id      = person_map.id,
			name    = person_map.name;

		if ( cid === undefined || ! name )
		{
			throw 'client id and name required';
		}

		// Use Object.create ( <prototype> ) to create our object from a prototype and then add instance-specific properties.
		person         = Object.create( personProto );
		person.cid     = cid;
		person.name    = name;
		person.css_map = css_map;

		if ( id )
		{
			person.id = id;
		}

		stateMap.people_cid_map[ cid ] = person;
		stateMap.people_db.insert( person );

		return person;
	};


	removePerson = function ( person )
	{
		if ( ! person )
		{
			return false;
		}

		// can't remove anonymous person.
		if ( person.id === configMap.anon_id )
		{
			return false;
		}

		stateMap.people_db({ cid : person.cid }).remove();

		if ( person.cid )
		{
			delete stateMap.people_cid_map[ person.cid ];
		}

		return true;
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

	// Define the people closure. This allows us to share only the methods we want.
	people = (function ()
	{
		var
			get_by_cid, get_db, get_user, login, logout;

		get_by_cid = function ( cid )
		{
			return stateMap.people_cid_map[ cid ];
		};

		get_db = function () { return stateMap.people_db; };

		get_user = function () { return stateMap.user; };

		login = function ( name )
		{
			var
				sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();

			stateMap.user = makePerson(
			{
				cid : makeCid(),
				css_map : { top : 25, left : 25, 'background-color' : '#8f8' },
				name : name
			});

			sio.on( 'userupdate', completeLogin );

			sio.emit( 'adduser', 
			{
				cid : stateMap.user.cid,
				css_map : stateMap.user.css_map,
				name : stateMap.user.name
			});
		};

		logout = function ()
		{
			var
				//is_removed,
				user = stateMap.user;
			
			// When we add chat, we should leave the chatroom here
			chat._leave();
			//is_removed = removePerson( user );
			stateMap.user = stateMap.anon_user;
			clearPeopleDb();

			$.gevent.publish( 'spa-logout', [ user ] );

			//return is_removed;
		};

		return {
			get_by_cid : get_by_cid,
			get_db     : get_db,
			get_user   : get_user,
			login      : login,
			logout     : logout
		};
	}());


	// Chat object API
	// ---------------------
	// "chat" object can be used in spa.model.chat.
	// "chat" object provides methods and events for managing chat messeaging.
	// 
	// Followings are included in public methods of "chat" object.
	//  - join() : Join to the chat room. This routine establishes chat protocol 
	//             to the backend which includes global custom events "spa-listchange" and "spa-updatechat".
	//             If the current user is anonymous, then join() will be cancelled and returns false.
	//  - get_chatee() : Returns the person object of person whom the user is chatting to.
	//  				 If the user is not chatting to anybody, it returns null.
	//  - set_chatee( <person_id> ) : Sets the user as a chat partner who is identified by "pserson_id".
	//                                If the person ID is not in the user list, set 'null' as the chat partner.
	//                                If the person specified is already the chat partner, it returns 'false'.
	//                                Issues "spa-setchatee" global custom event.
	//  - send_msg( <msg_text> ) : Send the message to the chat partner.
	//                             Issues "spa-updatechat" global custom event.
	//                             If the user is anonymous or the chat partner is null, 
	//                             cancel the process and returns false.
	//  - update_avatar( <update_avtr_map> ) : Sends "update_avtr_map" to the backend.
	//                                         By this method, "spa-listchange" which includes updated user list 
	//                                         and avatar information(css_map of person object) is issued.
	//                                         "update_avtr_map" must be following format.
	//                                         {
	//                                           person_id : person_id,
	//                                           css_map : css_map
	//                                         }
	// 
	// Global custom events returned by this object are as follow.
	//  - spa-setchatee : This event is issued, when the new chat partner is set.
	//                    Following formatted map is provided as data.
	//                    {
	//                    	old_chatee : <old_chatee_person_object>,
	//                    	new_chatee : <new_chatee_person_object>
	//                    }
	//  - spa-listchange : This event is issued when 
	//  					> The list length of online user is changed.
	//  					  (User joined to the chat room or leave.)
	//  					> Contents is changed (The details of user's avator is changed).
	//  - spa-updatechat : This event is issued, when new message was sent or received.
	//  				   Following formatted map is provided as data.
	//  				   {
	//  				   	 dest_id : <chatee_id>,
	//  				   	 dest_name : <chatee_name>,
	//  				   	 sender_id : <sender_id>,
	//  				   	 msg_text : <message_content>
	//  				   }
	//  				   
	//  * The registrator to this event should get "people_db" from people model as update data.
	//  
	chat = (function ()
	{
		var
			_publish_listchange, _publish_updatechat,
			_update_list, _leave_chat, 
			
			get_chatee, join_chat, send_msg, set_chatee, update_avatar,
			
			chatee = null;

		// >>> Internal method start.
		_update_list = function( arg_list )
		{
			var
				i, person_map, make_person_map, person,
				people_list = arg_list[ 0 ],
				is_chatee_online = false;

			clearPeopleDb();

			PERSON:
			for ( i = 0; i < people_list.length; i++ )
			{
				person_map = people_list[ i ];

				if ( ! person_map.name )
				{
					continue PERSON;
				}

				// If it identifies the user, update css_map and skip others.
				if ( stateMap.user && stateMap.user.id === person_map._id )
				{
					stateMap.user.css_map = person_map.css_map;
					continue PERSON;
				}

				make_person_map = 
				{
					cid     : person_map._id,
					css_map : person_map.css_map,
					id      : person_map._id,
					name    : person_map.name
				};

				person = makePerson( make_person_map );

				if ( chatee && chatee.id === make_person_map.id )
				{
					is_chatee_online = true;
					chatee = person;
				}
			}

			stateMap.people_db.sort( 'name' );

			// When the chat partner becomes offline, release the chat partner.
			// As a result, "spa-setchatee" global event is issued.
			if ( chatee && ! is_chatee_online )
			{
				set_chatee('');
			}

		};

		_publish_listchange = function ( arg_list )
		{
			_update_list( arg_list );
			$.gevent.publish( 'spa-listchange', [ arg_list ] );
		};

		_publish_updatechat = function ( arg_list )
		{
			var
				msg_map = arg_list[ 0 ];

			if ( ! chatee )
			{
				set_chatee( msg_map.sender_id );
			}
			else if ( msg_map.sender_id !== stateMap.user.id
				      && 
				      msg_map.sender_id !== chatee.id )
			{
				set_chatee( msg_map.sender_id );
			}

			$.gevent.publish( 'spa-updatechat', [ msg_map ] );

		};
		
		_leave_chat = function ()
		{
			var 
				sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();
			
			chatee = null;
			stateMap.is_connected = false;

			if ( sio )
			{
				sio.emit( 'leavechat' );
			}
		};

		// <<< Internal method END


		get_chatee = function ()
		{
			return chatee;
		};

		join_chat = function ()
		{
			var
				sio;

			if ( stateMap.is_connected )
			{
				return false;
			}

			if ( stateMap.user.get_is_anon() )
			{
				console.warn( 'User must be defined before joining chat' );
				return false;
			}

			sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();
			sio.on( 'listchange', _publish_listchange );
			sio.on( 'updatechat', _publish_updatechat );
			stateMap.is_connected = true;
			
			return true;
		};

		send_msg = function ( msg_text )
		{
			var
				msg_map,
				sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();

			if ( ! sio )
			{
				return false;
			}

			if ( ! ( stateMap.user && chatee ) )
			{
				return false;
			}

			msg_map = 
			{
				dest_id : chatee.id,
				dest_name : chatee.name,
				sender_id : stateMap.user.id,
				msg_text : msg_text
			};

			// Because "updatechat" event is issued, now it is possible to send the message.
			_publish_updatechat( [ msg_map ] );
			sio.emit( 'updatechat', msg_map );
			return true;
		};

		set_chatee = function ( person_id )
		{
			var
				new_chatee;

			new_chatee = stateMap.people_cid_map[ person_id ];

			if ( new_chatee )
			{
				if ( chatee && chatee.id === new_chatee.id )
				{
					return false;
				}
			}
			else
			{
				new_chatee = null;
			}

			$.gevent.publish( 'spa-setchatee', 
				{
					old_chatee : chatee,
					new_chatee : new_chatee
				});

			chatee = new_chatee;

			return true;
		};

		// "avatar_update_map" must be folowing format.
		// 
		// {
		// 	  person_id : <string>, 
		// 	  css_map : 
		// 	  	{
		// 	  		top : <init>
		// 	  		left : <init>
		// 	  		'background-color' : <string>
		// 	  	}
		// };
		//
		update_avatar = function ( avatar_update_map )
		{
			var
				sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();

			if ( sio )
			{
				sio.emit( 'updateavatar', avatar_update_map );
			}
		};


		return {
			_leave        : _leave_chat,
			get_chatee    : get_chatee,
			join          : join_chat,
			send_msg      : send_msg,
			set_chatee    : set_chatee,
			update_avatar : update_avatar
		};

	}());


	initModule = function ()
	{
		//var
		//	i, people_list, person_map;

		// Initilize anonymous person
		stateMap.anon_user = makePerson(
		{
			cid  : configMap.anon_id,
			id   : configMap.anon_id,
			name : 'anonymous'
		});

		stateMap.user = stateMap.anon_user;

		/*
		if ( isFakeData )
		{
			people_list = spa.fake.getPeopleList();

			for ( i = 0; i < people_list.length; i++ )
			{
				person_map = people_list[ i ];
				makePerson(
				{
					cid     : person_map._id,
					css_map : person_map.css_map,
					id      : person_map._id,
					name    : person_map.name
				});
			}
		}
		*/
	};

	// Public Methods <<< End
	//===================================


	// ### Return Public Methods ###
	return {
		initModule : initModule,
		people     : people,
		chat       : chat
	};

}());