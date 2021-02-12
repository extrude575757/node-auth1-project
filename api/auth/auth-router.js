const express = require("express");
const User = require("../users/users-model.js");
const bcrypt = require("bcryptjs");
const router = express.Router();

router.post('/register', (req, res) => {
  const { username, password, role } = req.body

  const hashed = bcrypt.hashSync(password, 13) // 2 ^ 10

  User.add({ username, password: hashed, role })
    .then(user => {
      res.status(201).json(user)
    })
    .catch(err => {
      res.status(500).json(err.message)
    })
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  try {
    // 1- we pull the user from the db by that username
    const allegedUser = await User.findBy({ username }).first()
    // 2- we compare their db hash, against the password in req
    if (allegedUser && bcrypt.compareSync(password, allegedUser.password)) {
      // save a session with this particular user
      req.session.user = allegedUser // this is the magic: changing the session so it's stored
      const loginCreds = {
        id: req.session.user.id,welcomeMsg:'welcome back',
      cookie: req.headers.cookie, session: req.session,
       usr:req.session.user
           }
      console.log(req.headers.cookie)
      res.json(loginCreds);
    } else {
      res.status(401).json('NONE SHALL PASS')
    }
  } catch (err) {
    res.status(500).json(err.message)
  }
});

router.get('/logout', (req, res) => {
  if(req.session && req.session.user) {
    req.session.destroy(err => {
      if (err) {
        res.json('you cannot leave');
      } else {
        res.json('bye');
      }
    })
  } else {
    res.end();
  }
});

module.exports = router;
