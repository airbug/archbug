//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Require('archbug.ArchBugCli')
//@Require('Flows')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context(module, function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var ArchBugCli =    bugpack.require('archbug.ArchBugCli');
    var Flows =       bugpack.require('Flows');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var $series =   Flows.$series;
    var $task =     Flows.$task;


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
});
