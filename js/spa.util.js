/*
spa.util.js
 */

/*jslint
	browser : true, continue : true, 
	devel   : true, indent   : 2,      maxerr : 50,
	newcap  : true, nomen    : true, plusplus : true,
	regexp  : true, sloppy   : true,     vars : true,
	white   : true
*/
/*global $, spa */

spa.util = (function ()
{
	//===================================
	// Module Scope Variant >>> Start 

	var 
		makeError, setConfigMap;

	// Module Scope Variant <<< End
	//===================================


	//===================================
	// Utility Methods >>> Start

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
	
	// <Public Constructor> "makeError".
	// [Objective]: Wrapper to create error object.
	// [Parameters]:
	// 	- name_text > Error name.
	// 	- msg_text  > Long error message.
	// 	- data      > Data optionally appended to the error object.
	// [Return value]: Newly created error object.
	// [Exeptions]: none.
	// 
	makeError = function ( name_text, msg_text, data )
	{
		var error = new Error();
		error.name = name_text;
		error.message = msg_text;

		if ( data )
		{
			error.data = data;
		}

		return error;
	};

	// <Public Method> "setConfigMap".
	// [Objective]: Common code for the configuration in function modules.
	// [Parameters]: 
	// 	- input_map    > Key value map to be configured.
	// 	- settable_map > Map of key which can be configured.
	// 	- config_map   > Map to be applied configuration.
	// [Return value]: true.
	// [Exceptions]: Issue exceptions when the input key is not allowed.
	// 
	setConfigMap = function ( arg_map )
	{
		var
			input_map =  arg_map.input_map,
			settable_map = arg_map.settable_map,
			config_map = arg_map.config_map,
			key_name, 
			error;

		for ( key_name in input_map )
		{
			if ( input_map.hasOwnProperty( key_name ) )
			{
				if ( settable_map.hasOwnProperty( key_name ) )
				{
					config_map[key_name] = input_map[key_name];
				}
				else
				{
					error = makeError( 'Bad input', 'Setting config key |' + key_name + '| is not supported');

					throw error;
				}
			}
		}
	};
	// Public Methods <<< End
	//===================================


	// ### Return Public Methods ###
	return {
		makeError : makeError,
		setConfigMap : setConfigMap
	}; 

}());