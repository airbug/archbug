//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Package('archbug')

//@Export('ArchBug')

//@Require('bugflow.BugFlow')
//@Require('bugfs.BugFs')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var ArchBuild = bugpack.require('archbug.ArchBuild');
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

var ArchBug = {

    //-------------------------------------------------------------------------------
    // Public Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {string} blueprintLocation
     * @param {function(Error)} callback
     */
    build: function(blueprintLocation, callback) {
        var blueprintPath = BugFs.path(blueprintLocation);
        var blueprint = null;
        var archBuild = new ArchBuild();
        $series([
            $task(function(flow) {
                blueprintPath.readFile(function(error, data) {
                    if (!error) {
                        blueprint = JSON.parse(data);
                        flow.complete();
                    } else {
                        flow.error(error);
                    }
                });
            }),
            $task(function(flow) {
                console.log("Configuring build");
                //TEST
                console.log(blueprint);
                archBuild.configure(blueprint, function(error) {
                    flow.complete(error);
                });
            }),
            $task(function(flow) {
                archBuild.execute(function(error) {
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
