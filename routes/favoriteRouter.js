const express = require('express');
const bodyParser = require('body-parser');
const Favorites = require('../models/favorite')
const favoriteRouter = express.Router();
var authenticate = require('../authenticate');
var cors = require('./cors');
const Dishes = require('../models/dishes');
var mongo = require('mongodb');

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => { 
    Favorites.findOne(req.user._id)
    .populate('user')
	.populate('dishes')
    .then((favorites) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(favorites)
    }, (err) => next(err))
    .catch((err) => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    console.log('Body=', req.body)
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if(!favorite) {
            console.log('favorite does not exist')
            Favorites.create({user: req.user._id, dishes: req.body})
            .then((favorites) => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(favorites)
            })
        } else {
            console.log('favorite does exist=',favorite)
            console.log('user=',favorite.user.toString())
            dishIds = []
            favorite.dishes.forEach( (objId) => {
                console.log('objId',objId.toString());
                dishIds.push(objId.toString());
            })
            
            req.body.forEach( (id) => {
                console.log('id=',id._id);
                index = dishIds.indexOf(id._id);
                console.log('index=',index);
			    if (index == -1){
                    var o_id = new mongo.ObjectId(id._id);
                    favorite.dishes.push(o_id);
                }
            })
            
            favorite.save()
            .then((favorite) => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(favorite)
            })
            
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Favorites.remove({})
    .then((resp) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(resp)
    }, (err) => next(err))
    .catch((err) => next(err))
});

favoriteRouter.route('/:dishId')
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    console.log('Body=', req.body)
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if(!favorite) {
            next(new Error(), false);
        } else {
            console.log('favorite does exist=',favorite)
            console.log('user=',favorite.user.toString())
            dishIds = []
            favorite.dishes.forEach( (objId) => {
                console.log('objId',objId.toString());
                dishIds.push(objId.toString());
            })
            console.log('dishId=',req.params.dishId);
            
            index = dishIds.indexOf(req.params.dishId);
            console.log('index=',index);
			if (index == -1){
                var o_id = new mongo.ObjectId(req.params.dishId);
                favorite.dishes.push(o_id);
            }
            favorite.save()
            .then((favorite) => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
               res.json(favorite)
            })
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        var index = favorite.dishes.indexOf(req.params.dishId);
        if(index != -1) {
		    favorite.dishes.splice(index, 1)
            favorite.save()
            console.log('Favorite deleted!', favorite); 
        }
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(favorite)
    }, (err) => next(err))
    .catch((err) => next(err))
});

module.exports = favoriteRouter;