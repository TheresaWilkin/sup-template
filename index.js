var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var app = express();

var User = require('./models/user');

app.use(bodyParser.json());

// Add your API endpoints here
app.get('/users', function(req, res) {
    User.find(function(err, users) {
        if (err) {
            res.sendStatus(500);
        }
        res.status(200).json(users);
    })
})

app.post('/users', function(req, res) {
    if (!req.body.username) {
        return res.status(422).json({message: 'Missing field: username'});
    }
    if (typeof req.body.username !== 'string') {
        return res.status(422).json({message: 'Incorrect field type: username'});
    }
    User.create({username: req.body.username}, function(err, user) {
        if (err) {
            res.sendStatus(500);
        }
    res.location('/users/' + user._id).status(201).json({}) 
    })
})

app.put('/users/:id', function(req, res) {
    // Find a user from the database using ID.
    //  -> We find a user
    //     -> update the user
    //  -> We don't find a user
    //      -> create a new user

    User.find({_id: req.params.id}, function(err, result){

        if (result.length === 0) {
            User.create({username: req.body.username, _id: req.params.id}, function(err, user) {
                return res.status(200).json({});
            });
        } else {
            console.log("found");
            User.findOneAndUpdate(
                {_id: req.params.id},
                {$set: {username: req.body.username}},
                function(err, user) {
                    if (err) {
                        return res.status(500);
                    }
                    res.status(200).json({});
                }
            )
        }
    })
});

var runServer = function(callback) {
    var databaseUri = process.env.DATABASE_URI || global.databaseUri || 'mongodb://localhost/sup';
    mongoose.connect(databaseUri).then(function() {
        var port = process.env.PORT || 8080;
        var server = app.listen(port, function() {
            console.log('Listening on port ' + port);
            if (callback) {
                callback(server);
            }
        });
    });
};

if (require.main === module) {
    runServer();
};

exports.app = app;
exports.runServer = runServer;

