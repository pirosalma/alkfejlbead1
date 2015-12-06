// controllers/error.js
var express = require('express');
var router = express.Router();

function addDisables(recipeContainer,req) {
    return recipeContainer.map(function (e) {
        e.canRemove = "";
        e.canModify = "";
        if(req.user.role !== "admin" && req.user.username !== e.created){
            e.canRemove = "disabled";
            e.canModify = "hidden";
        }
        return e;
    });
}
router.get('/list', function (req, res) {
    req.app.models.recipe.find().then(function (recipes) {
        
        res.render('recipes/list', {
            recipes: addDisables(recipes,req),
            messages: req.flash('info'),
        });
    });
});
router.get('/mylist', function (req, res) {
    req.app.models.recipe.find().then(function (recipes) {
        var myRecipes = recipes.filter(function (el) { return el.created === req.user.username; });
        res.render('recipes/list', {
            recipes: addDisables(recipes,req),
            messages: req.flash('info'),
        });
    });
});
router.get('/new', function (req, res) {
    var validationErrors = (req.flash('validationErrors') || [{}]).pop();
    var data = (req.flash('data') || [{}]).pop();
    
    res.render('recipes/new', {
        validationErrors: validationErrors,
        data: data,
    });
});
router.get('/edit/:id', function (req, res) { //szerkesztés
    var validationErrors = (req.flash('validationErrors') || [{}]).pop();
    //var data = (req.flash('data') || [{}]).pop();
    var id = req.params.id;
    req.app.models.recipe.find().then(function (recipes) {
        for(var i = 0; i < recipes.length;i++){
            if(recipes[i].id==id){
                var data=recipes[i];
            }
        }
        res.render('recipes/edit', {
            validationErrors: validationErrors,
            data: data,
        });
    });
});
router.get('/delete/:id', function(req, res) {
    var id = req.params.id;
    req.app.models.recipe.destroy({id: id})
        .then(function (deletedRecipes) {
            res.redirect('/recipes/list');
        });
});
router.post('/new', function (req, res) {
    // adatok ellenőrzése
    req.checkBody('cim', 'Hibás helyszín').notEmpty().withMessage('Kötelező megadni!');
    req.sanitizeBody('leiras').escape();
    req.checkBody('leiras', 'Hibás leírás').notEmpty().withMessage('Kötelező megadni!');

    var validationErrors = req.validationErrors(true);
    console.log(validationErrors);
    
    if (validationErrors) {
        req.flash('validationErrors', validationErrors);
        req.flash('data', req.body);
        res.redirect('/recipes/new');
    }
    else {
        req.app.models.recipe.create({
            created: req.user.username,
            title: req.body.cim,
            description: req.body.leiras
        })
        .then(function (recipe) {
            req.flash('info', 'Recept sikeresen felvéve!');
            res.redirect('/recipes/list');
        })
        .catch(function (err) {
            console.log(err);
        });
    }
});
router.post('/edit/:id', function (req, res) {
    var id = req.params.id;
    // adatok ellenőrzése
    req.checkBody('cim', 'Hibás helyszín').notEmpty().withMessage('Kötelező megadni!');
    req.sanitizeBody('leiras').escape();
    req.checkBody('leiras', 'Hibás leírás').notEmpty().withMessage('Kötelező megadni!');

    var validationErrors = req.validationErrors(true);
    console.log(validationErrors);
    
    if (validationErrors) {
        
        req.flash('validationErrors', validationErrors);
        req.flash('data', req.body);
        res.redirect('/recipes/edit/'+id);
    }
    else {
            req.app.models.recipe.update({id: id},{
                title: req.body.cim,
                description: req.body.leiras
            })
            .then(function (recipe) {
                req.flash('info', 'Recept sikeresen módosítva!');
                res.redirect('/recipes/list');
            })
            .catch(function (err) {
                console.log(err);
            });
    }
});

module.exports = router;