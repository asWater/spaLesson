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
	http = require( 'http' ),
	express = require( 'express' ),
	app = express(),
	server = http.createServer( app );

// Module Scope Variant <<< End
//===================================

//===================================
// Server Configuration >>> Start

// Configuration of Middleware methods.
app.configure( function ()
{
	app.use( express.bodyParser() );
	app.use( express.methodOverride() );
	app.use( express.static( __dirname + '/public' ) );
	app.use( app.router );
});

app.configure( 'development', function ()
{
	app.use( express.logger() );
	app.use( express.errorHandler(
	{
		dumpExceptions : true,
		showStack : true
	}) );
});

app.configure( 'production', function ()
{
	app.use( express.errorHandler() );
});

app.get( '/', function (request, response )
{
	response.redirect( '/spa.html' );
});

// Server Configuration <<< End
//===================================

//===================================
// Start Server >>> Start

server.listen( 3000 );

console.log(
	'Express server listening on port %d in %s mode',
	 server.address().port,
	 app.settings.env
);

// Start Server <<< End
//===================================

