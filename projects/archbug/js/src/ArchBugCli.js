//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('archbug')

//@Export('ArchBugCli')

//@Require('Class')
//@Require('archbug.ArchBug')
//@Require('bugcli.BugCli')
//@Require('bugflow.BugFlow')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();
var path = require('path');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class =     bugpack.require('Class');
var ArchBug =   bugpack.require('archbug.ArchBug');
var BugCli =    bugpack.require('bugcli.BugCli');
var BugFlow =   bugpack.require('bugflow.BugFlow');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var $series =   BugFlow.$series;
var $task =     BugFlow.$task;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var ArchBugCli = Class.extend(BugCli, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function() {

        this._super();
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------


    //-------------------------------------------------------------------------------
    // Bugcli Extended Class Methods
    //-------------------------------------------------------------------------------

    /**
     *
     */
    configure: function(callback) {
        var _this = this;
        $series([
            $task(function(flow) {
                _this._super(function(error) {
                    flow.complete(error);
                });
            }),
            $task(function(flow) {
                _this.registerCliAction({
                    name: 'build',
                    flags: [
                        'build'
                    ],
                    parameters: [
                        {
                            name: "blueprintPath"
                        }
                    ],
                    executeMethod: function(cliBuild, cliAction, callback) {
                        console.log("Starting architecture build");
                        /** @type {string} */
                        var blueprintPath = cliAction.getParameter("blueprintPath");
                        /** @type {CliOptionInstance} */
                        var configOption = cliBuild.getOption("config");
                        /** @type {string} */
                        var configPath = "";

                        if (configOption) {
                            configPath = configOption.getParameter("configPath");
                        }
                        ArchBug.build(blueprintPath, configPath, callback);
                    },
                    validateMethod: function(cliBuild, cliAction, callback) {
                        if (!cliAction.containsParameter('blueprintPath')) {
                            callback(new Error("'build' action requires a file path parameter to the blueprint file."));
                        }
                        callback();
                    }
                });

                _this.registerCliAction({
                    name: 'control',
                    flags: [
                        'control'
                    ],
                    parameters: [
                        {
                            name: "controlPath"
                        }
                    ],
                    executeMethod: function(cliBuild, cliAction, callback) {
                        console.log("Running server control");
                        /** @type {string} */
                        var controlPath = cliAction.getParameter("controlPath");
                        /** @type {CliOptionInstance} */
                        var configOption = cliBuild.getOption("config");
                        /** @type {string} */
                        var configPath = "";

                        if (configOption) {
                            configPath = configOption.getParameter("configPath");
                        }
                        ArchBug.control(controlPath, configPath, callback);
                    },
                    validateMethod: function(cliBuild, cliAction, callback) {
                        if (!cliAction.containsParameter("controlPath")) {
                            callback(new Error("'control' action requires a file path parameter to the control file"));
                        }
                        callback();
                    }
                });

                _this.registerCliOption({
                    name: 'config',
                    flags: [
                        '-c',
                        '--config'
                    ],
                    parameters: [
                        {
                            name: "configPath"
                        }
                    ]
                });

                flow.complete();
            })
        ]).execute(callback);
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('archbug.ArchBugCli', ArchBugCli);
