/**
 * Created by Danny Schreiber on 3/17/15.
 */
var gulp = require('gulp');
var args = require('yargs').argv;
var browserSync = require('browser-sync');
var config = require('./gulp.config.js')();
var del = require('del');
var $ = require('gulp-load-plugins')({lazy: true});
var _ = require('lodash');
var port = process.env.PORT || config.defaultPort;
var runSequence = require('run-sequence');

gulp.task('help', $.taskListing);

gulp.task('default', ['help']);

gulp.task('vet', function() {
    log('****** Analyzing source with jshint and jscs ******');
    return gulp
        .src(config.alljs)
        .pipe($.if(args.verbose, $.print()))
        .pipe($.jscs())
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish', {verbose: true}))
        .pipe($.jshint.reporter('fail'));
});

gulp.task('styles',  function() {
    log('****** Compiling less to css ******');
    return gulp
        .src(config.less)
        .pipe($.plumber())
        .pipe($.less())
        .pipe($.autoprefixer({browsers: ['last 2 versions', '> 5%']}))
        .pipe(gulp.dest(config.cssDir));
});

gulp.task('seq', function(cb) {
	runSequence('vet', 'clean-styles', 'styles', 'clean-fonts', 'fonts', cb);
});

gulp.task('fonts', function(){
    log('****** Copying fonts to dist ******');

    return gulp
        .src(config.fonts)
        .pipe(gulp.dest(config.dist + 'fonts'));
});

gulp.task('images', function(){
    log('****** Copying images to dist and compressing ******');

    return gulp
        .src(config.images)
        .pipe($.imagemin({optimizationLevel: 4}))
        .pipe(gulp.dest(config.dist + 'images'));
});

gulp.task('clean-all', ['clean-fonts', 'clean-images', 'clean-code'], function(){
    log('****** Clean all temp ******');
    clean(config.temp);
})

gulp.task('clean-styles', function(done) {
    log('******  Cleans css dir ******');
    clean(config.css, done);
});

gulp.task('clean-fonts', function(done) {
    log('******  Cleans dist font dir ******');
    clean(config.dist + 'fonts/**/*.*', done);
});

gulp.task('clean-images', function(done) {
    log('******  Cleans dist images dir ******');
    clean(config.dist + 'images/**/*.*', done);
});

gulp.task('clean-code', function(done) {
    log('******  Cleans dist code ******');

    var files = [].concat(
        config.temp + '**/*.js',
        config.dist + '**/*.html',
        config.dist + 'js/**/*.js',
        config.dist + 'css/**/*.css'
    );

    clean(files, done);
});

gulp.task('less-watcher', function() {
    log('****** Less file watcher will auto compile less and create styles when less files change ******');
    gulp.watch(config.less, ['styles']);
});

gulp.task('wiredep', function(){

    log('****** Wires up the bower and custom css/js into the index.html ******');

    var options = config.getWiredepDefaultOptions();
    var wiredep = require('wiredep').stream;
    return gulp
        .src(config.index)
        .pipe(wiredep(options))
        .pipe($.inject(gulp.src(config.js)))
        .pipe(gulp.dest(config.indexDir));
});

gulp.task('templatecache', ['clean-code'], function(){
    log('****** Create Angular $templateCache ******');

    return gulp
        .src(config.htmlTemplates)
        .pipe($.minifyHtml({empty: true}))
        .pipe($.angularTemplatecache(
            config.templateCache.file,
            config.templateCache.options
        ))
        .pipe(gulp.dest(config.temp));
});

gulp.task('inject', ['wiredep', 'styles', 'templatecache'], function(){

    log('****** Wire up app css to inject into the index.html, then call wiredep ******');
    //startBrowserSync();

    return gulp
        .src(config.index)
        .pipe($.inject(gulp.src(config.css)))
        .pipe(gulp.dest(config.indexDir));
});

gulp.task('serve-dev', ['inject'], function(){
	var isDev = true;
});

gulp.task('build', ['optimize', 'images', 'fonts'], function(){
	log('****** Building all assets ******');

	var msg = {
		title: 'Gulp build',
		subtitle: 'Deployed to dist folder',
		message: 'Running gulp build'
	};

	del(config.temp);
	log(msg.message);
	notify(msg);
});

gulp.task('serve-specs', ['build-specs'], function(){
	log('****** Run the spec runner ******');


});

gulp.task('build-specs', ['templatecache'], function(){
	log('****** building the spec runner ******');

	var wiredep = require('wiredep').stream;
	var options = config.getWiredepDefaultOptions();
	options.devDependencies = true;

	return gulp
		.src(config.specRunner)
		.pipe(wiredep(options))
		.pipe($.inject(gulp.src(config.testLibraries),
			{name: 'inject:testlibraries', read: false}))
		.pipe($.inject(gulp.src(config.js)))
		.pipe($.inject(gulp.src(config.specHelpers),
			{name: 'inject:spechelpers', read: false}))
		.pipe($.inject(gulp.src(config.specs),
			{name: 'inject:specs', read: false}))
		.pipe($.inject(gulp.src(config.temp + config.templateCache.file),
			{name: 'inject:templates', read: false}))
		.pipe(gulp.dest(config.indexDir));
});

gulp.task('optimize', ['inject', 'test'], function(){

    log('****** Optimizing js, css, html for production build ******');

    var assets = $.useref.assets({searchPath: ['./', './www/app']});
    var templateCache = config.temp + config.templateCache.file;
    var cssFilter = $.filter('**/*.css');
    var jsLibFilter = $.filter('**/' + config.optimized.libJs);
    var jsMdmFilter = $.filter('**/' + config.optimized.appJs);

    return gulp
        .src(config.index)
        .pipe($.plumber())
        .pipe($.inject(gulp.src(templateCache, {read: false}), {
            starttag: '<!-- inject:templates:js -->'
        }))
        .pipe(assets)
        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe(jsLibFilter)
        .pipe($.uglify())
        .pipe(jsLibFilter.restore())
        .pipe(jsMdmFilter)
        .pipe($.ngAnnotate())
        .pipe($.uglify())
        .pipe(jsMdmFilter.restore())
        .pipe($.rev())
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe($.revReplace())
        .pipe(gulp.dest(config.dist))
        .pipe($.rev.manifest())
        .pipe(gulp.dest(config.dist));
});

gulp.task('bump', function(){
    var msg = 'Bumping versions';
    var type = args.type;
    var version = args.version;
    var options = {};

    if(version) {
        options.version = version;
        msg += ' to ' + version;
    } else {
        options.type = type;
        msg += ' for a ' + type;
    }
    log(msg);

    return gulp
        .src(config.packages)
        .pipe($.print())
        .pipe($.bump(options))
        .pipe(gulp.dest(config.root));

});


gulp.task('test', ['vet', 'templatecache'], function(done){
	log('****** Manual single run tests started ******');

    startTests(true /* single run */, false /* autowatch */,  done);
});

gulp.task('autotest', ['vet', 'templatecache'], function(done){
	startTests(false /* single run */, true /* autowatch */, done);
});



/////////////////////  UTILITY FUNCTIONS /////////////////////////////

/* Start tests*/
function startTests(singleRun, autowatch, done){
    var karma = require('karma').server;
    var excludeFiles = [];

    karma.start({
        configFile: __dirname + '/karma.conf.js',
        exclude: excludeFiles,
        singleRun: !!singleRun,
	    autoWatch: !!autowatch
    }, karmaCompleted);

    function karmaCompleted(karmaResult) {
        log('****** Karma completed! ******');
        if(karmaResult === 1) {
            done('Karma: tests failed with code ' + karmaResult);
        } else {
            done();
        }
    }


}

/* Start browser sync */
function startBrowserSync(isDev, specRunner){
    if(args.nosync || browserSync.active){
        return;
    }

    log('****** Starting browser-sync on port' + config.defaultPort + ' ******');

    if(isDev){

        gulp.watch(config.less, ['styles'])
            .on('change', function(event) {
                changeEvent(event);
            });
    } else {

        gulp.watch([config.less, config.js, config.html], ['optimize', browserSync.reload()])
            .on('change', function(event) {
                changeEvent(event);
            });
    }

    var options = {
        proxy: 'localhost:' + config.defaultPort,
        port: 3000,
        files: isDev ? [
            config.baseSrc + '**/*.*',
            '!' + config.baseSrc + '**/*.less'
        ] : [],
        ghostMode: {
            clicks: true,
            location: false,
            forms: true,
            scroll: true
        },
        injectChanges: true,
        logFileChanges: true,
        logLevel: 'debug',
        logPrefix: 'gulp-patterns',
        notify: true,
        reloadDelay: 1000
    };

	if(specRunner) {
		options.startPath = config.specRunnerFile;
	}
    browserSync(options);
}

/* Logging */
function log(msg) {
    if(typeof(msg) === 'object') {
        msg.map(function(prop) {
            if(prop.hasOwnProperty(prop)) {
                $.util.log($.util.colors.blue(msg[prop]));
            }
        });
    } else {
        $.util.log($.util.colors.blue(msg));
    }
}

/* Clean paths */
function clean(path, done) {
    log('Cleaning: ' + $.util.colors.blue(path));
    del(path, done);
}

function changeEvent(event) {
    var srcPattern = new RegExp('/.*(?=/' + config.baseSrc + ')/');
    log('File ' + event.path.replace(srcPattern, '') + ' ' + event.type);
}

function notify(options) {
    var notifier = require('node-notifier');
    var notifyOptions = {
        sound: 'Bottle',
        contentImage: config.images + 'gulp.png',
        icon: config.images + 'gulp.png'
    };

    _.assign(notifyOptions, options);
    notifier.notify(notifyOptions);

}

/* Node server config*/
function serve(isDev, specRunner){
	var nodeOptions = {
		script: config.nodeServer,
		delayTime: 1,
		env: {
			'PORT': port,
			'NODE_ENV': isDev ? 'dev' : 'build'
		},
		watch: [config.server]
	};

	return $.nodemon(nodeOptions)
		.on('restart', function(ev){
			log('****** nodemon restarted ******');
			log('****** files changed on restart: \n' + ev +' ******');
			setTimout(function(){
				browserSync.notify('reloading now....');
				browserSync.reload({stream: false});
			}, config.browserReloadDelay);
		})
		.on('start', function(){
			log('****** nodemon started ******');
			startBrowserSync(isDev, specRunner);
		})
		.on('crash', function(){
			log('****** nodemon crashed: why you script crashed...why.... ******');
		})
		.on('exit', function(){
			log('****** nodemon exited cleanly ******');
		});
}