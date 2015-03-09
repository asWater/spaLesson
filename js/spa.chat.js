/*
spa.chat.js
 */

/*jslint
	browser : true, continue : true, 
	devel   : true, indent   : 2,      maxerr : 50,
	newcap  : true, nomen    : true, plusplus : true,
	regexp  : true, sloppy   : true,     vars : true,
	white   : true
*/
/* global $, spa, getComputedStyle */

spa.chat = (function ()
{
	//===================================
	// Module Scope Variant >>> Start 

	var
		configMap = 
		{
			main_html : String()
			+ '<div class="spa-chat">'
				+ '<div class="spa-chat-head">'
					+ '<div class="spa-chat-head-toggle">+</div>'
					+ '<div class="spa-chat-head-title">'
						+ 'Chat'
					+ '</div>'
				+ '</div>'
				+ '<div class="spa-chat-closer">x</div>'
				+ '<div class="spa-chat-sizer">'
					+ '<div class="spa-chat-msgs"></div>'
					+ '<div class="spa-chat-box">'
					+ '<input type="text"/>'
					+ '<div>send</div>'
				+ '</div>'
			+ '</div>'
			,
			
			settable_map : 
			{
				slider_open_time    : true,
				slider_close_time   : true,
				slider_opened_em    : true,
				slider_closed_em    : true,
				slider_opened_title : true,
				slider_closed_title : true,

				chat_model          : true,
				people_model        : true,
				set_chat_anchor     : true
			},

			slider_open_time    : 250,
			slider_close_time   : 250,
			slider_opened_em    : 16,
			slider_closed_em    : 2,
			slider_opened_title : 'Click to close',
			slider_closed_title : 'Click to open',

			chat_model          : null,
			people_model        : null,
			set_chat_anchor     : null
		},

		stateMap = 
		{
			$append_target   : null,
			position_type    : 'closed',
			px_per_em        : 0,
			slider_hidden_px : 0,
			slider_closed_px : 0,
			slider_opened_px : 0
		},

		jqueryMap = {},

		setJqueryMap, getEmSize, setPxSizes, setSliderPosition, 
		onClickToggle, configModule, initModule
		;

	// Module Scope Variant <<< End
	//===================================


	//===================================
	// Utility Methods >>> Start

	getEmSize = function ( elem )
	{
		return Number(
			getComputedStyle( elem, '' ).fontSize.match(/\d*\.?\d*/)[0]
		);
	};

	// Utility Methods <<< End
	//===================================
	

	//===================================
	// DOM Methods >>> Start

	setJqueryMap = function ()
	{
		var 
			$append_target = stateMap.$append_target,
			$slider = $append_target.find( '.spa-chat' );
		
		jqueryMap = 
		{
			$slider : $slider,
			$head   : $slider.find( '.spa-chat-head' ),
			$toggle : $slider.find( '.spa-chat-head-toggle' ),
			$title  : $slider.find( '.spa-chat-head-title' ),
			$sizer  : $slider.find( '.spa-chat-sizer' ),
			$msgs   : $slider.find( '.spa-chat-msgs' ),
			$box    : $slider.find( '.spa-chat-box' ),
			$input  : $slider.find( '.spa-chat-input input[type=text]' )
		};
	};

	setPxSizes = function ()
	{
		var px_per_em, opened_height_em;

		px_per_em = getEmSize( jqueryMap.$slider.get(0) );

		opened_height_em = configMap.slider_opened_em;

		stateMap.px_per_em = px_per_em;
		stateMap.slider_closed_px = configMap.slider_closed_em * px_per_em;
		stateMap.slider_opened_px = opened_height_em * px_per_em;

		jqueryMap.$sizer.css(
		{
			height : ( opened_height_em - 2 ) * px_per_em
		});
	};

	// <Public DOM method>: "setSliderPosition"
	// [Example]: spa.chat.setSliderPosition( 'closed' );
	// [Objective]: Make the chat slider as required.
	// [Parameters]: 
	// 	- position_type > enum('closed', 'opened', or 'hidden')
	// 	- callback > Callback of the last option of animation.
	// 		This callback recieves jQuery collection which means slider div as a first parameter.
	// [Behaiver]:
	// 	- This method moves slider as requested.
	// 	- If the required position is same with the current one, it returns TRUE without any behaivers.
	// [Return Value]: 
	// 	- true: Move to the position requested.
	// 	- false: Not move to the requested position.
	// [Exception]: none.
	//
	setSliderPosition = function ( position_type, callback )
	{
		var
			height_px, animate_time, slider_title, toggle_text;

		// If the slider is at the position requested already, it returns true.
		if ( stateMap.position_type === position_type )
		{
			return true;
		}

		// Prepare animation parameters.
		switch ( position_type )
		{
			case 'opened':
				height_px = stateMap.slider_opened_px;
				animate_time = configMap.slider_open_time;
				slider_title = configMap.slider_opened_title;
				toggle_text = '=';
				break;
			
			case 'hidden':
				height_px = 0;
				animate_time = configMap.slider_open_time;
				slider_title = '';
				toggle_text = '+';
				break;
			
			case 'closed':
				height_px = stateMap.slider_closed_px;
				animate_time = configMap.slider_close_time;
				slider_title = configMap.slider_closed_title;
				toggle_text = '+';
				break;
			
			// Unknown position_type
			default:
				return false;
		}

		// Change the slider position by animation.
		stateMap.position_type = '';
		jqueryMap.$slider.animate( { height : height_px }, animate_time, function ()
		{
			jqueryMap.$toggle.prop( 'title', slider_title );
			jqueryMap.$toggle_text( toggle_text );
			stateMap.position_type = position_type;

			if ( callback )
			{
				callback( jqueryMap.$slider );
			}
		});

		return true;
	};

	// DOM Methods <<< End
	//===================================


	//===================================
	// Event Handlers >>> Start

	onClickToggle = function ( event )
	{
		var set_chat_anchor = configMap.set_chat_anchor;

		if ( settable_map.position_type === 'opened' )
		{
			set_chat_anchor( 'closed' );
		}
		else if ( stateMap.position_type === 'closed' )
		{
			set_chat_anchor( 'opened' );
		}

		return false;
	};

	// Event Handlers <<< End
	//===================================



	//===================================
	// Public Methods >>> Start
	
	// <Public Method>: "configModule".
	// [Example]: spa.chat.configModule({ slider_open_em : 18 });
	// [Objective]: Configure moulde before initializetion.
	// [Parameters]: 
	// 	- set_chat_anchor > Callback to change URI anchor in order to show open or close.
	// 						This callback must return false when it cannot achieve the request.
	// 	- chat_model > Chat model object provides instant messaging and handling method.
	// 	- people_model > People model object provides the method which manage people held by the model
	// 	- slider_* > Configuration. All option scalar. Perfect list is to be referred to "mapConfig.settable_map".
	// 				 (e.g.) "slider_open_em" means height by em when it's opened.
	// [Behaiver]: 
	// 	- Update the internal configuration data structure(configMap). It does not do anything others.  
	// [Return value]: true.
	// [Exception]: If this receives unacceptable or imperfect parameters, throws JavaScript error object and stack trace.
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

	// <Public Method>: "initModule".
	// [Example]: spa.chat.initModule( $('#div_id') );
	// [Objective]: Instruct chat to provide user function.
	// [Parameters]: 
	// 	- $append_target (e.g.) $('#div_id')
	// 	  > jQuery collection means 1 DOM container.
	// [Behaiver]:
	//  - Add the chat slider to instructed container and fill HTML contents.
	//  - Initialize elements, events and handler, provides the user with chatroom interface.
	// [Return value]: true when success, false when it fails.
	// [Exception]: none.
	// 
	initModule = function ( $append_target )
	{
		$append_target.append( configMap.main_html );
		stateMap.$append_target = $append_target;
		setJqueryMap();
		setPxSizes();

		// Initialize the chat slider with the default title and condition.
		jqueryMap.$toggle.prop( 'title', configMap.slider_closed_title );
		jqueryMap.$head.click( onClickToggle );
		stateMap.position_type = 'closed';

		return true;
	};

	// ### Return Public Methods ###
	return {
		setSliderPosition : setSliderPosition,
		configModule      : configModule,
		initModule        : initModule
	};

	// Public Methods <<< End
	//===================================


}());