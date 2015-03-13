/*
spa.fake.js
 */

/*jslint
	browser : true, continue : true, 
	devel   : true, indent   : 2,      maxerr : 50,
	newcap  : true, nomen    : true, plusplus : true,
	regexp  : true, sloppy   : true,     vars : true,
	white   : true
*/
/*global $, spa */

spa.fake = (function ()
{
	'use strict';
	//===================================
	// Module Scope Variant >>> Start 
	var
		getPeopleList;
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
	
	getPeopleList = function () 
	{
		return [
			{
				name : 'Betty',
				_id : 'id_01',
				css_map : 
				{
					top : 20,
					left : 20,
					'background-color' : 'rgb( 128, 128, 128 )'
				}
			},
			{
				name : 'Mike',
				_id : 'id_02',
				css_map : 
				{
					top : 60,
					left : 20,
					'background-color' : 'rgb( 128, 255, 128 )'
				}
			},
			{
				name : 'Pebbles',
				_id : 'id_03',
				css_map : 
				{
					top : 100,
					left : 20,
					'background-color' : 'rgb( 128, 192, 192 )'
				}
			},
			{
				name : 'Wilma',
				_id : 'id_04',
				css_map : 
				{
					top : 140,
					left : 20,
					'background-color' : 'rgb( 192, 128, 128 )'
				}
			}
			];
	};

	// Public Methods <<< End
	//===================================


	// ### Return Public Methods ###
	return { getPeopleList : getPeopleList };

}());