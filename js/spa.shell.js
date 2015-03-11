/*
spa.shell.js
 */

/*jslint
	browser : true, continue : true, 
	devel   : true, indent   : 2,      maxerr : 50,
	newcap  : true, nomen    : true, plusplus : true,
	regexp  : true, sloppy   : true,     vars : true,
	white   : true
*/
/*global $, spa */

spa.shell = (function ()
{
	//===================================
	// Module Scope Variant >>> Start 
	var
		configMap = 
		{
			anchor_schema_map : 
			{
				chat : { opened : true, closed : true }
			},
			main_html : String()
			+ '<div class="spa-shell-head">'
				+ '<div class="spa-shell-head-logo"></div>'
				+ '<div class="spa-shell-head-acct"></div>'
				+ '<div class="spa-shell-head-search"></div>'
			+ '</div>'
			+ '<div class="spa-shell-main">'
				+ '<div class="spa-shell-main-nav"></div>'
				+ '<div class="spa-shell-main-content"></div>'
			+ '</div>'
			+ '<div class="spa-shell-foot"></div>'
			//+ '<div class="spa-shell-chat"></div>'
			+ '<div class="spa-shell-modal"></div>',
			chat_extend_time     : 1000,
			chat_retract_time    : 300,
			chat_extend_height   : 450,
			chat_retract_height  : 15,
			chat_extended_title  : 'Click to retract',
			chat_retracted_title : 'Click to extend'
		},

		stateMap = 
		{ 
			//$container        : null,
			anchor_map        : {}
			//is_chat_retracted : true
		},
		
		jqueryMap = {},  // Cache jQuery collection to jqueryMap.

		copyAnchorMap, setJqueryMap, //toggleChat,
		changeAnchorPart, onHashchange,
		//onClickChat, 
		setChatAnchor, initModule;
	// Module Scope Variant <<< End
	//===================================


	//===================================
	// Utility Methods >>> Start
	copyAnchorMap = function ()
	{
		return $.extend( true, {}, stateMap.anchor_map );
	};
	// Utility Methods <<< End
	//===================================
	

	//===================================
	// DOM Methods >>> Start
	
	// Cache jQuery coleection. 
	// The number of jQuery traversal can be drastically decreased by using jqueryMap chache.
	setJqueryMap = function ()
	{
		var $container = stateMap.$container;
		
		jqueryMap = 
		{ 
			$container : $container
			//$chat : $container.find( '.spa-shell-chat' ) 
		};
	};
	
	/*
	// [Method]: "toggleChat"
	// [Objective]: Extend/Retract Chat-Slider
	// [Parameters]: 
	// 		- do_extend: When its value is TRUE, then extend the slider. In the case of FALSE retract the slider.
	// 		- callback: The function to be executed at the last of animation.
	// [Settings]:
	// 		- chat_extend_time, chat_retract_time
	// 		- chat_extend_height, chat_retract_height
	// [Condition]: Set "stateMap.is_chat_retracted"
	// 		- TRUE: Slider is retracted.
	// 		- FALSE: Slider is extended.
	// [Return value]: BOOLEAN
	// 		- TRUE: Slider animation is started.
	// 		- FALSE: Slider animation is not started.
	toggleChat = function ( do_extend, callback )
	{
		var
			px_chat_ht = jqueryMap.$chat.height(),
			is_open = px_chat_ht === configMap.chat_extend_height,
			is_closed = px_chat_ht === configMap.chat_retract_height,
			is_sliding = ! is_open && ! is_closed;

		// Avoid conflicts
		if ( is_sliding ) { return false; }

		// Start of slider extension
		if ( do_extend )
		{
			jqueryMap.$chat.animate(
			{
				height : configMap.chat_extend_height
			},
				configMap.chat_extend_time,
				function() 
				{
					jqueryMap.$chat.attr( 'title', configMap.chat_extended_title );
					stateMap.is_chat_retracted = false;

					if ( callback )
					{
						callback( jqueryMap.$chat );
					}
				}
			);

			return true;
		}

		// Start of slider retraction
		jqueryMap.$chat.animate(
		{
			height : configMap.chat_retract_height
		},
			configMap.chat_retract_time,
			function() 
			{
				jqueryMap.$chat.attr( 'title', configMap.chat_retracted_title );
				stateMap.is_chat_retracted = true;

				if ( callback )
				{
					callback( jqueryMap.$chat );
				}
			}
		);

		return true;
	};
	*/

	// [Method]: "changeAnchorPart"
	// [Objective]: Change the element of URI anchor.
	// [Parameters]:
	// 	- arg_map: URI anchor part which should be changed.
	// [Return value]: BOOLEAN
	// 	- true: URI anchor part was updated.
	// 	- false: Failed to change URI anchor part.
	// [Behaiver]: 
	// 	> Save current anchor to "stateMap.anchor_map".
	// 	> Modify the key value by using "arg_map".
	// 	> Control independent & dependent values of encording.
	// 	> Try to change URI by "uriAnchor".
	// 	> Return TRUE when it is successfull, otherwise return FALSE.
	changeAnchorPart = function ( arg_map )
	{
		var
			anchor_map_revise = copyAnchorMap(),
			bool_return = true, 
			key_name, key_name_dep;

		// Change to anchor map
		KEYVAL:
		for ( key_name in arg_map )
		{
			if ( arg_map.hasOwnProperty( key_name ) )
			{
				// Skip dependent keys
				if ( key_name.indexOf( '_' ) === 0 )
				{
					continue KEYVAL;
				}

				// Update independent key value
				anchor_map_revise[key_name] = arg_map[key_name];

				// Update independent key which matches
				key_name_dep = '_' + key_name;

				if ( arg_map[key_name_dep] )
				{
					anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
				}
				else
				{
					delete anchor_map_revise[key_name_dep];
					delete anchor_map_revise['_s' + key_name_dep];
				}
			}
		}

		// Start of updating URI. If it fails, undo changes.
		try
		{
			$.uriAnchor.setAnchor( anchor_map_revise );
		}
		catch ( error )
		{
			// Undo changes
			$.uriAnchor.setAnchor( stateMap.anchor_map, null, true );
			bool_return = false;
		}

		return bool_return;
	};

	// DOM Methods <<< End
	//===================================


	//===================================
	// Event Handlers >>> Start

	// [Event Handler]: "onHashChange"
	// [Objective]: hashchange event handling.
	// [Parameters]: 
	// 	- event: jQuery event object
	// [Setting]: None.
	// [Return value]: FALSE.
	// [Behaiver]: 
	// 	> Analyze URI anchor elements.
	// 	> Compare provided application status with the current status.
	// 	> Adjust application only if provided status is differ from the current one, and anchor schema is allowed.
	onHashchange = function ( event )
	{
		var
			anchor_map_proposed,
			_s_chat_previous, _s_chat_proposed, 
			s_chat_proposed,
			is_ok = true,
			anchor_map_previous = copyAnchorMap();

		// Try to analyze anchor.
		try
		{
			anchor_map_proposed = $.uriAnchor.makeAnchorMap();
		}
		catch ( error )
		{
			$.uriAnchor.setAnchor ( anchor_map_previous, null, true );
			return false;
		}

		stateMap.anchor_map = anchor_map_proposed;

		// Convenient variants.
		_s_chat_previous = anchor_map_previous._s_chat;
		_s_chat_proposed = anchor_map_proposed._s_chat;

		// Adjustment of chat component in the case of change.
		if ( (! anchor_map_previous) || (_s_chat_previous !== _s_chat_proposed) )
		{
			s_chat_proposed = anchor_map_proposed.chat;

			switch ( s_chat_proposed )
			{
				case 'opened' : 
					is_ok = spa.chat.setSliderPosition( 'opened' );
					break;
				case 'closed' : 
					is_ok = spa.chat.setSliderPosition( 'closed' );
					break;
				default : 
					spa.chat.setSliderPosition( 'closed' );
					delete anchor_map_proposed.chat;
					$.uriAnchor.setAnchor( anchor_map_proposed, null, true );
			}
		}

		// Return the anchor to the previous one, when the change to slider was rejected.
		if ( ! is_ok )
		{
			if ( anchor_map_previous )
			{
				$.uriAnchor.setAnchor( anchor_map_previous, null, true );
				stateMap.anchor_map = anchor_map_previous;
			}
			else
			{
				delete anchor_map_proposed.chat;
				$.uriAnchor.setAnchor( anchor_map_proposed, null, true );
			}
		}

		return false;
	};

	// <Callback method>: "setChatAnchor"
	// [Example]: setChatAnchor( 'closed' );
	// [Objective]: Change anchor's chat component.
	// [Parameters]: 
	// 	- position_type > [closed] or [opened].
	// [Behaiver]: If possible, change URI anchor parameter "chat" as requested.
	// [Return value]: 
	// 	- true > Requested anchor part is updated.
	// 	- false > Requested anchor part was not updated.
	// [Exception]: none.
	// 
	setChatAnchor = function ( position_type )
	{
		return changeAnchorPart({ chat: position_type });
	};

	/*
	// [Event Handler]: "onClickChat"
	onClickChat = function ( event )
	{
		changeAnchorPart(
		{
			chat: ( stateMap.is_chat_retracted ? 'open' : 'closed' )
		});

		return false;
	};
	*/

	// Event Handlers <<< End
	//===================================



	//===================================
	// Public Methods >>> Start
	
	// <Public method>: "initModule".
	// [Example]: spa.shell.initModule( $('#app_div_id') );
	// [Objective]: Instruct chat to provide the user with the function.
	// [Parameters]: 
	// 	- $append_target > (e.g. $('#app_div_id') );
	// 	  jQuery collection which indicates 1 DOM container.
	// [Behaiver]: 
	// 	- Add UI shell to $container, and configure function module, then initialize it.
	// 	  Shell is responsible for managing URI anchor and Cookie, and issues on the overall browser.
	// [Return value]: none
	// [Exception]: none.
	// 
	initModule = function ( $container )
	{
		stateMap.$container = $container;
		$container.html( configMap.main_html );
		setJqueryMap();

		/*
		stateMap.is_chat_retracted = true;
		jqueryMap.$chat
			.attr( 'title', configMap.chat_retracted_title )
			.click( onClickChat );
		*/

		// Setting of "uriAnchor"
		$.uriAnchor.configModule(
		{
			schema_map: configMap.anchor_schema_map
		});

		// Configure & Initialize function module.
		spa.chat.configModule( 
			{
				set_chat_anchor : setChatAnchor
				//chat_model : spa.model.chat,
				//people_model : spa.model.people
			} );
		
		spa.chat.initModule( jqueryMap.$container );

		// URI anchor change evnet handling.
		// This process should be done after all other function modules were propery set, 
		// otherwise it is not ready to hanlde trigger event.
		// Trigger event is used to guarantee that the anchor is loaded.
		$(window)
			.bind( 'hashchange', onHashchange )
			.trigger( 'hashchage' );

	};
	
	// Public Methods <<< End
	//===================================


	return { initModule : initModule };

}());