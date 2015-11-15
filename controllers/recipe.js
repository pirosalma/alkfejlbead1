// controllers/error.js
var express = require('express');
var router = express.Router();

//Viewmodel réteg
var statusTexts = {
    'new': 'Új',
    'assigned': 'Hozzárendelve',
    'ready': 'Kész',
    'rejected': 'Elutasítva',
    'pending': 'Felfüggesztve',
};
var statusClasses = {
    'new': 'danger',
    'assigned': 'info',
    'ready': 'success',
    'rejected': 'default',
    'pending': 'warning',
};

function decorateErrors(errorContainer) {
    return errorContainer.map(function (e) {
        e.statusText = statusTexts[e.status];
        e.statusClass = statusClasses[e.status];
        return e;
    });
}

router.get('/list', function (req, res) {
    req.app.models.recipe.find().then(function (recipes) {
        
        res.render('recipes/list', {
            recipes: decorateErrors(recipes),
            messages: req.flash('info'),
        });
    });
});
router.get('/mylist', function (req, res) {
    req.app.models.recipe.find().then(function (recipes) {
        var myRecipes = recipes.filter(function (el) { return el.created === req.user.username; });
        res.render('recipes/list', {
            recipes: decorateErrors(myRecipes),
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
    var id = req.params.id;
    req.app.models.recipe.find().then(function (recipes) {
        for(var i = 0; i < recipes.length;i++){
            if(recipes[i].id==id){
                var data=recipes[i];
            }
        }
        res.render('recipes/edit', {
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
        // űrlap megjelenítése a hibákkal és a felküldött adatokkal
        req.flash('validationErrors', validationErrors);
        req.flash('data', req.body);
        res.redirect('/recipes/new');
    }
    else {
        // adatok elmentése (ld. később) és a hibalista megjelenítése
        req.app.models.recipe.create({
            status: 'new',
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
    // adatok ellenőrzése
    req.checkBody('cim', 'Hibás helyszín').notEmpty().withMessage('Kötelező megadni!');
    req.sanitizeBody('leiras').escape();
    req.checkBody('leiras', 'Hibás leírás').notEmpty().withMessage('Kötelező megadni!');

    var validationErrors = req.validationErrors(true);
    console.log(validationErrors);
    
    if (validationErrors) {
        // űrlap megjelenítése a hibákkal és a felküldött adatokkal
        req.flash('validationErrors', validationErrors);
        req.flash('data', req.body);
        res.redirect('/recipes/edit/'+req.body.id);
    }
    else {
        // adatok elmentése (ld. később) és a hibalista megjelenítése
        req.app.models.recipe.destroy({id: req.body.id})
        .then(function (deletedRecipes) {
            req.app.models.recipe.create({
                status: 'new',
                created: req.user.username,
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
        });
        
    }
});

module.exports = router;