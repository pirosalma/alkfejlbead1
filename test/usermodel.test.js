var expect = require("chai").expect;

var Waterline = require('waterline');
var waterlineConfig = require('../config/waterline');
var userCollection = require('../models/user');
var errorCollection = require('../models/error');

var User;

before(function (done) {
    // ORM indítása
    var orm = new Waterline();

    orm.loadCollection(Waterline.Collection.extend(userCollection));
    orm.loadCollection(Waterline.Collection.extend(errorCollection));
    waterlineConfig.connections.default.adapter = 'memory';

    orm.initialize(waterlineConfig, function(err, models) {
        if(err) throw err;
        User = models.collections.user;
        done();
    });
});

describe('UserModel', function () {

    beforeEach(function (done) {
        User.destroy({}, function (err) {
            done();
        });
    });
    
    it('should work', function () {
        expect(true).to.be.true;
    });

});

