const Mail = require("./mail.model");

function load(req, res, next, id) {
  Mail.get(id)
    .then(mail => {
      req.mail = mail;
      return next();
    })
    .catch(e => next(e));
}

function get(req, res) {
  return res.json(req.mail);
}

function create(req, res, next) {
  
  const mail = new Mail({
    country: req.body.country,
    content: req.body.content
  });

  mail
    .save()
    .then(savedMail => res.json(savedMail))
    .catch(e => next(e));
}

function update(req, res, next) {
  const mail = req.mail;
  mail.content = req.body.content;

  mail
    .save()
    .then(savedMail => res.json(savedMail))
    .catch(e => next(e));
}

function list(req, res, next) {
  const { limit = 10, skip = 0 } = req.query;
  Mail.countDocuments({}, function(err, total) {
    Mail.list({ skip, limit })
    .then(mails => res.json({ list: mails, total: total }))
    .catch(e => next(e));  
  })
  
}

function remove(req, res, next) {
  const mail = req.mail;
  mail
    .remove()
    .then(deletedMail => res.json(deletedMail))
    .catch(e => next(e));
}

module.exports = { load, get, create, update, list, remove };
