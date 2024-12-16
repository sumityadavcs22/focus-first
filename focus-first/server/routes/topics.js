const router = require('express').Router();
let Topic = require('../models/Topic');

router.route('/').post((req, res) => {
    const userId = req.body.userId;
    const topic = req.body.topic;

    const newTopic = new Topic({userId, topic});

    newTopic.save()
        .then(() => res.json('Topic added!'))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:userId').get((req, res) => {
    Topic.findOne({userId: req.params.userId})
        .then(topic => res.json(topic))
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;