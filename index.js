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
            });
});

app.post('/messages', function(req, res) {
  // move to models
  if (!req.body.text) {
    return res.status(422).json({
      message: 'Missing field: text'
    });
  }
  if (!isNaN(req.body.text)) {
    return res.status(422).json({
      message: 'Incorrect field type: text'
    });
  }
  if (!isNaN(req.body.to)) {
    return res.status(422).json({
      message: 'Incorrect field type: to'
    });
  }
  if (!isNaN(req.body.from)) {
    return res.status(422).json({
      message: 'Incorrect field type: from'
    });
  }
  if (!req.body.from) {
    return res.status(422).json({
      message: 'Incorrect field type: from'
    });
  }


  var firstPromise = User.findOne({_id: req.body.from});
  var secondPromise = User.findOne({_id: req.body.to});

  Promise.all([firstPromise, secondPromise]).then(function(result) {
    if (!result[1]) {
      res.status(422).json({message: "Incorrect field value: to"});
    } else if (result[0] === null) {
      res.status(422).json({message: "Incorrect field value: from"});
    } else {
      var message = new Message(req.body);
      return message;
    }
  }).then(function(message) {
    message.save(message, function(err, message) {
      if (err) {
        res.send(500).json({});
      }
      res.location('/messages/' + message._id).status(201).json({});
  }).catch(function() {
    res.status(500).send({message:"Internal error"});
    });
  });

  // Message.create(req.body, function(err, message) {
  //   if (err) {
  //   return res.status(500).json({
  //     message: 'Server error.'
  //   });
  //   }
  // res.location('/messages/' + message._id).status(201).json({});
  //
  // })

// Message.create(req.body, function(err, message) {
//     if (err) {
//       return res.status(500).json({
//         message: 'Server error.'
//       });
//     }
//     console.log(message);
//     res.location('/messages/' + message._id).status(201).json({});
//   });
// });

});

app.get('/messages/:messageId', function(req, res) {
    Message.findOne({_id: req.params.messageId})
    .populate('from')
    .populate('to')
    .then(function(message) {
        if (!message) {
            return res.status(404).json({
                message: 'Message not found'
            });
        }
        res.json(message);
    });
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
