var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var app = express();

var User = require('./models/user');
var Message = require('./models/message');

app.use(bodyParser.json());

// Add your API endpoints here
// 
app.get('/users/:id', function(req, res) {
    User.findOne({_id: req.params.id}, function(err, user) {
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        res.status(200).json(user);
    }) 
})

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

    User.find({_id: req.params.id}, function(err, result){
        if (!req.body.username) {
            return res.status(422).json({message: 'Missing field: username'});
        }
        if (typeof req.body.username !== 'string') {
            return res.status(422).json({message: 'Incorrect field type: username'});
        }

        if (result.length === 0) {
            User.create({username: req.body.username, _id: req.params.id}, function(err, user) {
                return res.status(200).json({});
            });
        } else {
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

app.delete('/users/:id', function(req, res) {
    User.findOneAndRemove({_id: req.params.id}, function(err, user) {
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        res.status(200).json({});
    })
})

app.get('/messages', function(req, res) {
    Message.find(req.query)
            .populate('from')
            .populate('to')
            .then(function(messages) {
 //               console.log(messages);
                res.json(messages);
            })
})

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

