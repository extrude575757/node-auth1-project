const express = require("express");
const helmet = require("helmet");
const session = require("express-session");
const cors = require("cors");
const KnexSessionStore = require("connect-session-knex")(session)

const usersRouter = require("./users/users-router");
const authRouter = require("./auth/auth-router");

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session({
  name: "monkey", // the default would be sid, but that would reveal our stack
  secret: "keep it secret, keep it safe!", // to encrypt/decrypt the cookie
  cookie: {
    maxAge: 1000 * 60 * 60, // how long is the session valid for, in milliseconds
    secure: false, // used over https only, should be true in production
    httpOnly: true, // cannot access the cookie from JS using document.cookie
    // keep this true unless there is a good reason to let JS access the cookie
  },
  resave: false, // we might need to set this to true to avoid idle sessions being deleted
  saveUninitialized: false, // keep it false to avoid storing sessions and sending cookies for unmodified sessions

  // let's persist sessions in the db so sessions don't die on server restarts
  store: new KnexSessionStore({
    knex: require('../database/connection.js'), // configured instance of knex
    tablename: 'sessions', // table that will store sessions inside the db, name it anything you want
    sidfieldname: 'sid', // column that will hold the session id, name it anything you want
    createtable: true, // if the table does not exist, it will create it automatically
    clearInterval: 1000 * 60 * 60, // time it takes to check for old sessions and remove them from the database to keep it clean and performant
  }),
}))

server.use("/api/users", usersRouter);
server.use("/api/auth", authRouter);

server.get("/", (req, res) => {
  res.json({ api: "up" });
});

module.exports = server;
