//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('archbug')

//@Export('ArchBuild')

//@Require('Class')
//@Require('Obj')
//@Require('bugflow.BugFlow')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class =             bugpack.require('Class');
var Map =               bugpack.require('Map');
var Obj =               bugpack.require('Obj');
var TypeUtil =          bugpack.require('TypeUtil');
var AwsConfig =         bugpack.require('aws.AwsConfig');
var EC2Api =            bugpack.require('aws.EC2Api');
var EC2SecurityGroup =  bugpack.require('aws.EC2SecurityGroup');
var BugBoil =           bugpack.require('bugboil.BugBoil');
var BugFlow =           bugpack.require('bugflow.BugFlow');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var $foreachParallel =  BugBoil.$foreachParallel;
var $series =           BugFlow.$series;
var $task =             BugFlow.$task;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var ArchBuild = Class.extend(Obj, {

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
         * @type {string}
         */
        this.archKey = null;

        /**
         * @private
         * @type {AwsConfig}
         */
        this.awsConfig = null;

        /**
         * @private
         * @type {Map.<string, EC2Api>}
         */
        this.regionToEC2ApiMap = new Map();

        /**
         * @private
         * @type {*}
         */
        this.securityGroups = null;
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------


    //-------------------------------------------------------------------------------
    // Public Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @param blueprint
     * @param {function(Error)} callback
     */
    configure: function(blueprint, callback) {
        this.configureBuild(blueprint);
        callback();
    },

    /**
     *
     */
    execute: function(callback) {
        this.buildFromBluePrint(callback);
    },


    //-------------------------------------------------------------------------------
    // Private Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {function(Error)} callback
     */
    buildFromBluePrint: function(callback) {
        var _this = this;
        $series([
            $task(function(flow) {
                _this.buildSecurityGroups(function(error) {
                    flow.complete(error);
                });
            })/*,
            $task(function(flow) {

            })*/
        ]).execute(function(error) {
            callback(error);
        });
    },


    // Configure
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param blueprint
     */
    configureBuild: function(blueprint) {
        if (blueprint.archKey) {
            this.archKey = blueprint.archKey;
        } else {
            throw new Error("archKey is required in blueprint");
        }

        if (blueprint.awsConfig) {
            this.awsConfig = new AwsConfig(blueprint.awsConfig);
        } else {
            throw new Error("awsConfig is required in blueprint");
        }

        if (blueprint.securityGroups) {
            if (TypeUtil.isArray(blueprint.securityGroups)) {
                blueprint.securityGroups.forEach(function(securityGroup) {
                    if (!securityGroup.groupName) {
                        throw new Error("'name' is required in a security group entry");
                    }
                    if (!securityGroup.region) {
                        throw new Error("'region' is required in a security group entry");
                    }
                });
                this.securityGroups = blueprint.securityGroups;
            } else {
                throw new Error("securityGroups must be an array or empty in the blueprint");
            }
        } else {
            this.securityGroups = [];
        }
    },

    /**
     * @private
     * @param {string} region
     * @return {EC2Api}
     */
    generateEC2Api: function(region) {
        var ec2Api = this.regionToEC2ApiMap.get(region);
        if (!ec2Api) {
            ec2Api = new EC2Api(this.awsConfig, {region: region});
            this.regionToEC2ApiMap.put(region, ec2Api);
        }
        return ec2Api;
    },


    // Security Groups
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {function(Error)} callback
     */
    buildSecurityGroups: function(callback) {
        var _this = this;
        $foreachParallel(this.securityGroups, function(boil, securityGroup) {
            _this.buildSecurityGroup(securityGroup, function(error) {
                boil.bubble(error);
            });
        }).execute(callback);
    },

    /**
     * @private
     * @param securityGroup
     * @param {function(Error)} callback
     */
    buildSecurityGroup: function(securityGroup, callback) {
        var _this = this;
        var groupName = this.archKey + "-" + securityGroup.groupName;
        var description = securityGroup.description;
        var ec2SecurityGroup = null;
        var ec2Api = this.generateEC2Api(securityGroup.region);
        $series([
            $task(function(flow) {
                ec2Api.getSecurityGroupByName(groupName, function(error, _ec2SecurityGroup) {
                    if (!error) {
                        ec2SecurityGroup = _ec2SecurityGroup;
                        flow.complete();
                    } else {
                        flow.error(error);
                    }
                });
            }),
            $task(function(flow) {
                if (ec2SecurityGroup) {
                    if (ec2SecurityGroup.getDescription() !== description) {
                        console.log("Note that a security group description cannot be updated once it's been created");
                    }
                    flow.complete();
                } else {
                    ec2SecurityGroup = new EC2SecurityGroup({
                        groupName: groupName,
                        description: description
                    });
                    ec2Api.createSecurityGroup(ec2SecurityGroup, function(error) {
                        flow.complete(error);
                    });
                }
            })
        ]).execute(function(error) {
            callback(error);
        });
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('archbug.ArchBuild', ArchBuild);
