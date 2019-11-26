const Joi = require("joi");

module.exports = {
  // POST /api/ds-160
  createApplication: {
    body: {
      // email: Joi.string(),
        // .regex(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
      completed: Joi.boolean().required(),
      step_index: Joi.number().required(),
      data: Joi.object().required()
    }
  },

  // UPDATE /api/ds-160/:applicationId
  updateApplication: {
    body: {
      // email: Joi.string()
        // .regex(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
        // .required()
    },
    params: {
      applicationId: Joi.string()
        .hex()
        .required()
    }
  },

  // POST /api/users
  createUser: {
    body: {
      fullname: Joi.string().required(),
      email: Joi.string()
        .regex(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
        .required()
    }
  },

  // UPDATE /api/users/:userId
  updateUser: {
    body: {
      fullname: Joi.string().required(),
      email: Joi.string()
        .regex(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
        .required()
    },
    params: {
      userId: Joi.string()
        .hex()
        .required()
    }
  },

  // POST /api/auth/login
  login: {
    body: {
      username: Joi.string().required(),
      password: Joi.string().required()
    }
  }
};
