const Counter = require("./counter.model");

function load(req, res, next, id) {
  Counter.get(id)
    .then(counter => {
      req.counter = counter;
      return next();
    })
    .catch(e => next(e));
}

function get(req, res) {
  return res.json(req.counter);
}

function create(req, res, next) {
  
  const counter = new Counter({
    _id: req.body.name,
    seq: 45000
  });

  counter
    .save()
    .then(savedCounter => res.json(savedCounter))
    .catch(e => next(e));
}

function update(req, res, next) {
  const counter = req.counter;
  counter.seq = req.body.seq;
  console.log(counter)

  counter
    .save()
    .then(savedCounter => res.json(savedCounter))
    .catch(e => next(e));
}

function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  Counter.list({ limit, skip })
    .then(counters => res.json(counters))
    .catch(e => next(e));
}

function remove(req, res, next) {
  const counter = req.counter;
  counter
    .remove()
    .then(deletedCounter => res.json(deletedCounter))
    .catch(e => next(e));
}

module.exports = { load, get, create, update, list, remove };
