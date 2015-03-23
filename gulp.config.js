/**
 * Created by Danny Schreiber on 3/17/15.
 */

module.exports = function(){
    var baseSrc = './www/app/src/';
    var testFixtures = './www/app/fixtures/';
    var indexDir = './www/app/';
    var temp = './.tmp/';
    var root = './';
    var coverage = './www/app/coverage/';
    var wiredep = require('wiredep');
    var bowerFiles = wiredep({devDependencies: true})['js'];
    var images = baseSrc + 'assets/images/';
	var specRunnerFile = 'specs.html';

    var config = {
        defaultPort: 8080,
        temp: temp,
        root: root,
        testFixtures: testFixtures,
        alljs: [
            baseSrc + '**/*.js'
        ],
        images: images,
        index: './www/app/index.html',
        indexDir: indexDir,
        baseSrc: baseSrc,
        dist: './dist/',
        coverage: coverage,
        fonts: ['./www/vendors/font-awesome/fonts/**/*.*'],
        images: baseSrc + 'assets/images/**/*.*',
        js: [
            baseSrc + '**/*.module.js',
            baseSrc + '**/*.js',
            '!' + baseSrc + '**/*.spec.js'
        ],

        css: [
            baseSrc + 'assets/css/**/*.css'
        ],

        html: baseSrc + '**/*.html',

        cssDir: baseSrc + 'assets/css/',
        htmlTemplates: baseSrc + '**/*.html',

        less: [
            baseSrc + 'assets/less/*.less'
        ],
        bower: {
            json: require('./bower.json'),
            directory: './www/vendors/'
        },
        templateCache: {
            file: 'templates.js',
            options: {
                module: 'grubsta',
                standAlone: false,
                root: './src'
            }
        },
        optimized: {
            libJs: 'lib.js',
            appJs: 'mdm.js'
        },
        packages: [
            './package.json',
            './bower.json'
        ],
	    specs: indexDir + '**/*.spec.js',
        specRunner: indexDir + specRunnerFile,
	    specRunnerFile: specRunnerFile,
	    testLibraries: [
		    'node_modules/mocha/mocha.js',
		    'node_modules/chai/chai.js',
		    'node_modules/mocha-clean/index.js',
		    'node_modules/sinon-chai/lib/sinon-chai.js'
	    ],
	    specHelpers: testFixtures + '**/*.js'


    };

    config.getWiredepDefaultOptions = function(){
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorePath: config.bower.ignorePath
        };
        return options;
    };

    config.karma = getkarmaOptions();

    function getkarmaOptions(){
        var options = {
            files: [].concat(
                bowerFiles,
                config.testFixtures,
                indexDir + '**/*.module.js',
                indexDir + '**/*.js',
                temp + config.templateCache.file
            ),
            exclude: [],
            coverage: {
                dir: coverage,
                reporters: [
                    {
                        type: 'html',
                        subdir: 'report-html'
                    },
                    {
                        type: 'lcov',
                        subdir: 'report-lcov' // this is for CIs to consume
                    },
                    {
                        type: 'text-summary'
                    }
                ]
            },
            preprocessors: {

            },
	        autoWatch: false,
	        singleRun: true
        };

        options.preprocessors[indexDir + '**/!(*.spec)+(.js)'] = ['coverage'];
        return options;
    }
    return config;
};