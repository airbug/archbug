//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Require('archbug.ArchBugCli')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context(module);


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var ArchBugCli =   bugpack.require('archbug.ArchBugCli');


//-------------------------------------------------------------------------------
// Bootstrap
//-------------------------------------------------------------------------------

ArchBugCli.execute(process.argv);
