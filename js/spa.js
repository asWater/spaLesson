/*
spa.js
 */

/*jslint
	browser : true, continue : true, 
	devel   : true, indent   : 2,      maxerr : 50,
	newcap  : true, nomen    : true, plusplus : true,
	regexp  : true, sloppy   : true,     vars : true,
	white   : true
*/
/*global $, spa:true */

var spa = (function ()
{
	var initModule = function ( $container )
	{
		//$container.html('<h1 style="display:inline-block; margin:25px;">' + 'hello world!!' + '</h1>');
		spa.shell.initModule( $container );
	};

	//[This is the module pattern of Javascript]
	// Methods only published to the user of "spa" are returned.
	// i.e. <Published method name>: <Method named defined in this function> 
	// e.g. If it said "return { init: initModule }" here, the user will use this method by "spa.init($container)".
	return { initModule: initModule };
}());
