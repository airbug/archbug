//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('archbug')

//@Export('ArchBugCli')

//@Require('archbug.ArchBug')
//@Require('bugflow.BugFlow')
//@Require('bugfs.BugFs')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();
var path = require('path');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class =     bugpack.require('Class');
var Map =       bugpack.require('Map');
var Obj =       bugpack.require('Obj');
var ArchBug =   bugpack.require('archbug.ArchBug');
var BugFlow =   bugpack.require('bugflow.BugFlow');
var BugFs =     bugpack.require('bugfs.BugFs');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var $series =   BugFlow.$series;
var $task =     BugFlow.$task;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var ArchBugCli = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function() {

        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {Object}
         */
        this.action = null;

        /**
         * @private
         * @type {Object}
         */
        this.actionFlags = {
            'build': function(options, callback) {
                console.log("Starting architecture build");
                var blueprint = options.get("blueprint");
                ArchBug.build(blueprint, callback);
            }
        };

        /**
         * @private
         * @type {Object}
         */
        this.optionFlags = {
            '-bp': 'blueprint',
            '--blueprint': 'blueprint'
        };

        /**
         * @private
         * @type {Map.<string}
         */
        this.options = new Map();
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------


    //-------------------------------------------------------------------------------
    // Public Class Methods
    //-------------------------------------------------------------------------------

    /**
     *
     */
    execute: function(callback) {
        var actionMethod = this.actionFlags[this.action];
        actionMethod(this.options, callback);
    },

    /**
     *
     */
    initialize: function(argv, callback) {
        var error = null;
        for (var i = 2; i < argv.length; i++ ) {
            var flag = argv[i];
            if (this.actionFlags[flag]) {
                if (!this.action) {
                    this.action = flag;
                } else {
                    error = new Error("Only one action can be specified");
                }
            } else if (this.optionFlags[flag]) {
                this.options.put(this.optionFlags[flag], argv[i + 1]);
            }
        }
        callback(error);
    },

    /**
     *
     */
    validate: function(callback) {
        var error = null;
        if (this.action) {
            if (this.actionFlags[this.action]) {
                if (this.action === "build") {
                    if (this.options.containsKey("blueprint")) {
                        //TODO BRN: Validate the blueprint is either a url or a file path
                    } else {
                        error = new Error("blue print option is required when executing the build action. " +
                            "Use the --blueprint or -bp option to specify the blueprint path");
                    }
                }
            } else {
                error = new Error("Unknown action '" + this.action + "'");
            }
        } else {
            error = new Error("An action must be specified");
        }
        callback(error);
    }
});


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @param {Array.<string>} argv
 */
ArchBugCli.execute = function(argv) {
    var archBugCli = new ArchBugCli();

    $series([
        $task(function(flow) {
            archBugCli.initialize(argv, function(error) {
                flow.complete(error);
            });
        }),
        $task(function(flow) {
            archBugCli.validate(function(error) {
                flow.complete(error);
            });
        }),
        $task(function(flow) {
            archBugCli.execute(function(error) {
                flow.complete(error);
            });
        })
    ]).execute(function(error) {
        if (!error) {
            console.log("archbug ran successfully");
        } else {
            console.log(error);
            console.log(error.stack);
            console.log("archbug encountered an error");
            process.exit(1);
        }
    });
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('archbug.ArchBugCli', ArchBugCli);
