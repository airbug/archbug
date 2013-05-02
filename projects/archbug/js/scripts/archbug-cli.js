//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Require('archbug.ArchBugCli')
//@Require('bugflow.BugFlow')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context(module);


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var ArchBugCli =    bugpack.require('archbug.ArchBugCli');
var BugFlow =       bugpack.require('bugflow.BugFlow');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var $series =   BugFlow.$series;
var $task =     BugFlow.$task;


//-------------------------------------------------------------------------------
// Bootstrap
//-------------------------------------------------------------------------------

var archBugCli = new ArchBugCli();
$series([
    $task(function(flow) {
        archBugCli.configure(function(error) {
            flow.complete(error);
        });
    }),
    $task(function(flow) {
        archBugCli.run(process.argv, function(error) {
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
