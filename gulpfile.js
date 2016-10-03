'use strict';

var gulp        = require('gulp'),
    browserSync = require('browser-sync'),
    nodemon     = require('gulp-nodemon'),
    sass        = require('gulp-sass'),
    prefix      = require('gulp-autoprefixer'),
    handlebars  = require('gulp-compile-handlebars'),
    rename      = require('gulp-rename'),
    concatMulti = require('gulp-concat-multi'),
    clean       = require('gulp-clean'),
    jshint      = require('gulp-jshint'),
    reload      = browserSync.reload;

/*************Configuration Variables: START******************/

/*
 * Global Paths Configuration.
 */
var source = {
    root : 'public/',
    all : 'public/**/*.*',
    app : 'app.js',
    api : 'api/*.js',
    js : 'public/js/**/*.js',
    sass : 'public/styles/**/*.scss',
    images : 'public/images',
    templates : 'public/templates/pages/*.hbs',
    partials : 'public/templates/partials',
    layoutdir : 'public/templates/layouts/'
};

var dest = {
    root: 'build/',
    temp : 'build/temp',
    css : 'build/css',
    js : 'build/js',
    images : 'build/images',
    pages : 'build/pages'
};

/*
 * Server Configuration.
 */
var server = {
    port : 7000,
    proxy : 7070,
    syncDelay : 500,
    files : [ source.app, source.api ] /* Watch APP and also API's*/
};

/*
 * BrowserSync Configurations.
 */
var syncConfigs = {
    watchFiles : [ source.all, source.app ]
};

/*
 * 
 */
/*************Configuration Variables: END******************/

/****************GULP TASKS: START********************/
gulp.task('watch', function() {
    /* 
     * Watch Scripts
     */
    gulp.watch( [ source.js ], [
        'concat-js',
        'jshint',
        reload
        ]);

    /*
     * Watch styles
     */
    gulp.watch( [ source.sass ], [
        'sass'
        ]);
    /*
     * Watch templates
     */
    gulp.watch( [ source.templates ], [
        'templating',
        reload
        ]);

});
/*
 * Gulp Default task equivalent to the development
 */
gulp.task('default', [ 'templating', 'sass', 'concat-js','jshint', 'browser-sync' ], function () {
    /*
     * Run watch task to keep on tab on required resources.
     */
    gulp.start('watch');
});
/*
 * Gulp SASS compilation configuration
 */
gulp.task('sass', function() {
    var sassLoader = gulp.src( source.sass )
        .pipe(sass({
            outputStyle: 'expanded',
            sourceComments: 'map'
        }, {errLogToConsole: true} ))
        .pipe( prefix( 'last 10 versions' ) )
        .pipe( gulp.dest( dest.css ) )
        .pipe( reload( {stream:true} ) );

    return sassLoader;
});
/*
 * Gulp page CSS with global CSS configuration.
 */
gulp.task('concat-css', ['sass'], function() {
    concatMulti({
            'landing.js': ['build/css/main*.css', 'public/css/pages/landing.css']
        })
        /*.pipe(uglify())*/
        .pipe( gulp.dest( dest.css ) );
});
/*
 * Gulp JS configuration
 */
gulp.task('concat-js', function() {
    concatMulti({
            'login.js': ['public/js/global/*.js', 'public/js/login/*.js'],
            'landing.js': ['public/js/global/*.js', 'public/js/landing/*.js']
        })
        /*.pipe(uglify())*/
        .pipe( gulp.dest( dest.js ) );
});
/*
 * JS Linting configurations.
 */
gulp.task('jshint', function() {
    gulp .src([ dest.js ])
        /*All your JS hint configs*/
});

/*
 * Templating of HandleBars task
 */
gulp.task('templating', function() {
  
    return gulp.src( source.templates )
        .pipe(handlebars({}, {
          ignorePartials: true,
          batch: [ source.partials ]
        }))
        .pipe(rename({
          extname: '.html'
        }))
        .pipe( gulp.dest( dest.pages ) );
});
/*
 * Gulp BrowserSync configuration --> Runs post 'nodemon' task.
 */
gulp.task('browser-sync', ['nodemon'], function() {
    /*
     * Automatically close the browser tab on server error
     */
    browserSync.use({
        plugin: function(){},
        hooks : {
            'client:js': '(function (bs) {bs.socket.on("disconnect", function (client) { window.close(); });})(___browserSync___);'
        }
    });
    /*
     * BrowserSync Initialization
     */
    browserSync.init(null, {
        proxy   : 'http://localhost:' + server.proxy,
        files   : syncConfigs.watchFiles,
        browser : 'google chrome',
        port    : server.port,
    });
});
/*
 * Gulp Nodemon configuration.
 */
gulp.task('nodemon', function ( callback ) {

    var called = false,
        stream,
        startCallback,
        restartCallback,
        crashCallback;

    startCallback = function (){
        /* 
        * To avoid nodemon being started multiple times
        */
        if ( !called ) {

            callback();
            started = true; 
        }            
    };

    restartCallback = function () {
        /*
         * Reload connected browsers after a slight delay --> "syncDelay"
         */
        setTimeout(function reload() {

            browserSync.reload({
                stream: false
            });
        }, server.syncDelay); 
    };

    crashCallback = function () {

        console.error( 'Application has crashed!\n' )
        /*
         * Restart the server in 10 seconds
         */
        stream.emit( 'restart', 10 );
    };

    /*
     * Creating a Nodemon Instance
     */
    stream = nodemon({
        script : 'app.js',
        watch  : server.files
    });

    /*
     * Attach Events to the nodemon instance
     */
    stream.on('start', startCallback );

    stream.on('restart', restartCallback );

    stream.on('crash', crashCallback );

    return stream;
});

/****************GULP TASKS: END********************/