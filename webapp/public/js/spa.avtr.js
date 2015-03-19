/*
spa.avtr.js
 */

/*jslint
	browser : true, continue : true, 
	devel   : true, indent   : 2,      maxerr : 50,
	newcap  : true, nomen    : true, plusplus : true,
	regexp  : true, sloppy   : true,     vars : true,
	white   : true
*/
/*global $, spa */

spa.avtr = (function ()
{
	'use strict';

	//===================================
	// Module Scope Variant >>> Start 

	var
		configMap =
		{
			chat_model : null,
			people_model : null,

			settable_map : 
			{
				chat_model : true,
				people_model : true
			}
		},

		stateMap = 
		{
			drag_map : null,
			$drag_target : null,
			drag_bg_color : undefined
		},

		jqueryMap = {},

		getRandRgb,
		setJqueryMap,
		updateAvatar,
		onTapNav, onHeldstartNav, onHeldmoveNav, onHeldendNav,
		onSetchatee, onListchange,
		onLogout,
		configModule, initModule;

	// Module Scope Variant <<< End
	//===================================


	//===================================
	// Utility Methods >>> Start

	// Make a color (0-256, 0-256, 0-256) randamly.
	getRandRgb = function ()
	{
		var
			i,
			rgb_list = [];

		for ( i = 0; i < 3; i++ )
		{
			rgb_list.push( Math.floor( Math.random() * 128 ) + 128 );
		}

		return 'rgb(' + rgb_list.join(',') + ')';
	};

	// Utility Methods <<< End
	//===================================
	

	//===================================
	// DOM Methods >>> Start

	setJqueryMap = function ( $container )
	{
		jqueryMap = { $container : $container };
	};

	// Sets target CSS properties and Calls chat_model.update_avatar.
	updateAvatar = function ( $target )
	{
		var
			css_map, person_id;

		css_map = 
		{
			top : parseInt( $target.css( 'top' ), 10 ),
			left : parseInt( $target.css( 'left' ), 10 ),
			'background-color' : $target.css('background-color')
		};

		person_id = $target.attr( 'data-id' );

		configMap.chat_model.update_avatar(
		{
			person_id : person_id,
			css_map : css_map
		});
	};

	// DOM Methods <<< End
	//===================================


	//===================================
	// Event Handlers >>> Start

	// When the user top on the navigation area, then this method is called.
	onTapNav = function ( event )
	{
		var
			css_map,
			$target = $( event.elem_target ).closest('.spa-avtr-box');

		if ( $target.length === 0 )
		{
			return false;
		}

		$target.css(
		{
			'background-color' : getRandRgb()
		});

		updateAvatar( $target );
	};

	onHeldstartNav = function ( event )
	{
		var
			offset_target_map,
			offset_nav_map,
			
			$target = $( event.elem_target ).closest('.spa-avtr-box');

		if ( $target.length === 0 )
		{
			return false;
		}

		stateMap.$drag_target = $target;
		offset_target_map = $target.offset();
		offset_nav_map = jqueryMap.$container.offset();

		offset_target_map.top -= offset_nav_map.top;
		offset_target_map.left -= offset_nav_map.left;

		stateMap.drag_map = offset_target_map;
		stateMap.drag_bg_color = $target.css('background-color');

		$target
			.addClass('spa-x-is-drag')
			.css('background-color', '');
	};

	onHeldmoveNav = function ( event )
	{
		var
			drag_map = stateMap.drag_map;

		if ( ! drag_map )
		{
			return false;
		}

		drag_map.top += event.px_delta_y;
		drag_map.left += event.px_delta_x;

		stateMap.$drag_target.css(
		{
			top : drag_map.top,
			left : drag_map.left
		});
	};

	onHeldendNav = function ( event )
	{
		var
			$drag_target = stateMap.$drag_target;

		if ( ! $drag_target )
		{
			return false;
		}

		$drag_target
			.removeClass('spa-x-is-drag')
			.css('background-color',stateMap.drag_bg_color);

		stateMap.drag_bg_color = undefined;
		stateMap.$drag_target = null;
		stateMap.drag_map = null;

		updateAvatar( $drag_target );
	};

	onSetchatee = function ( event, arg_map )
	{
		var
			$nav = $(this),
			new_chatee = arg_map.new_chatee,
			old_chatee = arg_map.old_chatee;

		// Deaccent old_chatee avatar.
		if ( old_chatee )
		{
			$nav
				.find( '.spa-avtr-box[data-id=' + old_chatee.cid + ']' )
				.removeClass( 'spa-x-is-chatee' );
		}

		// Accent new_chatee avatar.
		if ( new_chatee )
		{
			$nav
				.find( '.spa-avtr-box[data-id=' + new_chatee.cid + ']' )
				.addClass( 'spa-x-is-chatee' );
		}	
	};

	onListchange = function ( event )
	{
		var
			$nav = $(this),
			people_db = configMap.people_model.get_db(),
			user = configMap.people_model.get_user(),
			chatee = configMap.chat_model.get_chatee() || {},
			$box;

		$nav.empty();

		// If the user is loggedout, then it does not depict.
		if ( user.get_is_anon() )
		{
			return false;
		}

		people_db().each( function ( person, idx )
		{
			var
				class_list;

			if ( person.get_is_anon() )
			{
				return true;
			}

			class_list = [ 'spa-avtr-box' ];

			if ( person.id === chatee.id )
			{
				class_list.push( 'spa-x-is-chatee' );
			}

			if ( person.get_is_user() )
			{
				class_list.push( 'spa-x-is-user' );
			}

			$box = $('<div/>')
				.addClass( class_list.join(' ') )
				.css( person.css_map )
				.attr( 'data-id', String( person.id ) )
				.prop( 'title', spa.util_b.encodeHtml( person.name ) )
				.text( person.name )
				.appendTo($nav);
		});
	};

	onLogout = function ()
	{
		jqueryMap.$container.empty();
	};

	// Event Handlers <<< End
	//===================================


	//===================================
	// Public Methods >>> Start
	
	// <Public method> : "configModule"
	// [Example] : spa.avtr.configModule({...});
	// [Objective] : Configure module (set values should not be changed during the user session)
	//               before initialization.
	// [Behavior] : Update internal configuration data structure(configMap) by given parameters.
	//              It does not do anything others.
	// [Return value] : none.
	// [Exception] : Javascript error and stack trace, 
	//               when it receives unacceptable or incomplete parameters.
	//
	configModule = function ( input_map )
	{
		spa.util.setConfigMap(
		{
			input_map : input_map,
			settable_map : configMap.settable_map,
			config_map : configMap
		});

		return true;
	};

	// <Public method> : "initModule"
	// [Example] : spa.avtr.initModule( $container );
	// [Objective] : Instructs module to provide functions.
	// [Parameters] : $container > The container to be used.
	// [Behavior] : Provides the chat user with the avatar interface.
	// [Return values] : none.
	// [Exceptions] : none.
	// 
	initModule = function ( $container )
	{
		setJqueryMap( $container );

		// Registers model global events
		$.gevent.subscribe( $container, 'spa-setchatee', onSetchatee );
		$.gevent.subscribe( $container, 'spa-listchange', onListchange );
		$.gevent.subscribe( $container, 'spa-logout', onLogout );

		// Binds processors. (Browser events)
		// Bind browser event before model event might trigger the conflicts.
		$container
			.bind( 'utap', onTapNav )
			.bind( 'uheldstart', onHeldstartNav )
			.bind( 'uheldmove', onHeldmoveNav )
			.bind( 'uheldned', onHeldendNav );

		return true;
	};

	// Public Methods <<< End
	//===================================


	// ### Return Public Methods ###
	return {
		configModule : configModule,
		initModule : initModule
	}; 

}());