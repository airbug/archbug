//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('archbug.ArchBug')

//@Require('Flows')
//@Require('archbug.ArchBuild')
//@Require('bugfs.BugFs')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // Common Modules
    //-------------------------------------------------------------------------------

    var mustache = require('mustache');


    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var ArchBuild = bugpack.require('archbug.ArchBuild');
    var Flows =   bugpack.require('Flows');
    var BugFs =     bugpack.require('bugfs.BugFs');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var $series =   Flows.$series;
    var $task =     Flows.$task;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    var ArchBug = {

        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {string} blueprintLocation
         * @param {string} configLocation
         * @param {function(Error)} callback
         */
        build: function(blueprintLocation, configLocation, callback) {

            //TODO BRN: Add support for these being urls

            var blueprintPath = BugFs.path(blueprintLocation);
            var configPath = null;
            if (configLocation) {
                configPath = BugFs.path(configLocation);
            }
            var blueprint = null;
            var config = null;
            var archBuild = new ArchBuild();
            $series([
                $task(function(flow) {
                    blueprintPath.readFile('utf8', function(error, data) {
                        if (!error) {
                            var temp = JSON.parse(data);
                            blueprint = JSON.parse(mustache.render(data, temp));
                            flow.complete();
                        } else {
                            flow.error(error);
                        }
                    });
                }),
                $task(function(flow) {
                    configPath.readFile('utf8', function(error, data) {
                        if (!error) {
                            config = JSON.parse(data);
                            flow.complete();
                        } else {
                            flow.error(error);
                        }
                    });
                }),
                $task(function(flow) {
                    console.log("Configuring build");
                    archBuild.configure(config, function(error) {
                        flow.complete(error);
                    });
                }),
                $task(function(flow) {
                    console.log("Process blueprint for build");
                    console.log(blueprint);
                    archBuild.execute(blueprint, function(error) {
                        flow.complete(error);
                    });
                })
            ]).execute(function(error) {
                callback(error);
            });
        }
    };


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('archbug.ArchBug', ArchBug);
});
