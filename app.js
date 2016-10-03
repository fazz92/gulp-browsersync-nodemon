'use strict';
/* 
 * Simple express server
 */
var express = require('express'),
	app     = express(),
	router  = express.Router(),
	server  = app.listen( 7070 ),
	gracefulShutdown;

app.use(express.static('build'));

app.get('/', function( req, res ) {

    res.sendfile('./build/pages/login.html');
});

/*
* This function is called when you want the server to die gracefully.
* i.e. wait for existing connections
*/
gracefulShutdown = function() {

	console.log( 'Received kill signal, shutting down gracefully.' );
	server.close(function() {

		console.log( 'Closed out remaining connections.' );
		process.exit();
	});
  
	/*
	 * Fallback: If after 10 seconds, the server is not closed.
	 */
	setTimeout(function() {

		console.error( 'Could not close connections in time, forcefully shutting down' );
		process.exit();
	}, 10*1000);
};

/*
 * Listen for TERM signal .e.g. kill
 */
process.on ( 'SIGTERM', gracefulShutdown );
/*
 * Listen for INT signal e.g. Ctrl-C
 */
process.on ( 'SIGINT', gracefulShutdown ); 