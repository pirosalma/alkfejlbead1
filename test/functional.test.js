var Browser = require('zombie');

Browser.localhost(process.env.IP, process.env.PORT);

describe('User visits index page', function() {
   var browser = new Browser();
   
   before(function() {
       return browser.visit('/');
   });
   
   
   it('should be successful', function() {
       browser.assert.success();
   });
   
   it('should see application name', function() {
       browser.assert.text('div.page-header > h1', 'Receptek');
   });
   
   it('should see motivational text', function() {
       browser.assert.text('p', 'A világ legnagyszerűbb és legismertebb recept gyűjtemény oldala.');
   });
   
});

describe('User visits new recipe page', function(argument) {
    const browser = new Browser();
    
    before(function(){
       return browser.visit('recipes/new');
    });
    
    it('should go to the authentication page when not logged in' , function() {
         browser.assert.redirected();
         browser.assert.success();
         browser.assert.url({pathname: '/login'});
    });
    
   it('should be redirected to login page with error message with invalid login credentials', function(done) {
       browser
         .fill('username', 'asd')
         .fill('password', 'asd')
         .pressButton('button[type=submit]')
         .then(function() {
            browser.assert.redirected();
            browser.assert.success();
            browser.assert.url({pathname: '/login'});
            browser.assert.text('.alert-dismissible', '× Helytelen adatok.');
            done();
         });
    });
    
    it('should be able to login with correct credentials', function (done) {
       browser
         .fill('username', 'user')
         .fill('password', 'user')
         .pressButton('button[type=submit]')
         .then(function() {
            browser.assert.redirected();
            browser.assert.success();
            browser.assert.url({pathname: '/recipes/list'});
            done();
         });
    });
    
    it('should go to the new recipes posting page', function(done) {
        return browser.visit('/recipes/new')
         .then(function(){
            browser.assert.success();
            browser.assert.text('div.page-header > h1', 'Új recept felvétele');
            done();
         });
    });
    
    it('should show errors if the form fields are incorrect', function() {
         return browser
            .fill('cim', '')
            .fill('leiras', '')
            .pressButton('button[type=submit]')
            .then(function() {
                browser.assert.success();
                browser.assert.element('form .form-group:nth-child(2) [name=cim]');
                browser.assert.hasClass('form .form-group:nth-child(2)', 'has-error');
                browser.assert.element('form .form-group:nth-child(3) [name=leiras]');
                browser.assert.hasClass('form .form-group:nth-child(3)', 'has-error');
            });
    });
});
