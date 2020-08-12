//dummyss
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const cors = require("cors");
const twilio = require("twilio");
const { Pool } = require("pg");
require("dotenv").config();

const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");

const router = require("./router");
const pool = new Pool({
  user: "ntdjcwjj",
  host: "satao.db.elephantsql.com",
  database: "ntdjcwjj",
  password: "h5zH7qKATB8SJmbp0pjjdavNa06yTUWL",
  port: 5432,
  // user: "howwqpentshjym",ssgh
  // host: "ec2-46-137-84-173.eu-west-1.compute.amazonaws.com",
  // database: "daetddmaeq65j7",
  // password: "b513e136ac155b31bf8a62ba90a4c5aaa383b124a0dcc9deace886ec4903f453",
  // port: 5432,
  ssl: { rejectUnauthorized: false },
});
const app = express();

const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
app.use(router);
const createAccounts = () => {
  const query =
    "CREATE TABLE IF NOT EXISTS accounts ( id SERIAL PRIMARY KEY, name VARCHAR(255), login VARCHAR(255), password VARCHAR(255), modules VARCHAR(8000));";
  return new Promise(function(resolve, reject) {
    pool.connect((err, client, done) => {
      if (err) reject(err);
      client.query(query, [], (err, reply) => {
        done();
        if (err) {
          reject(err);
        } else {
          resolve(reply.rows);
        }
      });
    });
  });
};

const createRooms = () => {
  const query =
    "CREATE TABLE IF NOT EXISTS roomadmins ( id SERIAL PRIMARY KEY, roomname VARCHAR(255), adminID VARCHAR(255), timing VARCHAR(255), timing_end VARCHAR(255) );";
  return new Promise(function(resolve, reject) {
    pool.connect((err, client, done) => {
      if (err) reject(err);
      client.query(query, [], (err, reply) => {
        done();
        if (err) {
          reject(err);
        } else {
          resolve(reply.rows);
        }
      });
    });
  });
};

const createChatlong = () => {
  const query =
    "CREATE TABLE IF NOT EXISTS chatlong ( id SERIAL PRIMARY KEY, author VARCHAR(255), recipent VARCHAR(255), message VARCHAR(255), timestamp BIGINT, groupname VARCHAR(255), isunread BIGINT );";
  return new Promise(function(resolve, reject) {
    pool.connect((err, client, done) => {
      if (err) reject(err);
      client.query(query, [], (err, reply) => {
        done();
        if (err) {
          reject(err);
        } else {
          resolve(reply.rows);
        }
      });
    });
  });
};

const checkAccountExist = login => {
  const query = "SELECT EXISTS(SELECT 1 FROM accounts WHERE login=$1);";
  return new Promise(function(resolve, reject) {
    pool.connect((err, client, done) => {
      if (err) reject(err);
      client.query(query, [login], (err, reply) => {
        done();
        if (err) {
          reject(err);
        } else {
          resolve(reply.rows);
        }
      });
    });
  });
};

const checkAdminExist = login => {
  const query = "SELECT EXISTS(SELECT 1 FROM roomadmins WHERE login=$1);";
  return new Promise(function(resolve, reject) {
    pool.connect((err, client, done) => {
      if (err) reject(err);
      client.query(query, [login], (err, reply) => {
        done();
        if (err) {
          reject(err);
        } else {
          resolve(reply.rows);
        }
      });
    });
  });
};

const checkRoomExist = roomname => {
  const query = "SELECT EXISTS(SELECT 1 FROM roomadmins WHERE roomname=$1);";
  return new Promise(function(resolve, reject) {
    pool.connect((err, client, done) => {
      if (err) reject(err);
      client.query(query, [roomname], (err, reply) => {
        done();
        if (err) {
          reject(err);
        } else {
          resolve(reply.rows);
        }
      });
    });
  });
};

app.get("/sendmessage", (req, res) => {
  var url = require("url");

  var url_parts = url.parse(req.url, true);
  var query_parts = url_parts.query;

  const author = query_parts["author"];
  const recipent = query_parts["recipent"];
  const message = query_parts["message"];
  const timestamp = query_parts["timestamp"];
  const groupname = query_parts["groupname"];
  console.log("hi");
  createChatlong()
    .then(response => {
      const query =
        "INSERT INTO chatlong (author, recipent, message, timestamp, groupname, isunread) VALUES ($1, $2, $3, $4, $5, $6)";
      return new Promise(function(resolve, reject) {
        pool.connect((err, client, done) => {
          if (err) reject(err);
          console.log(author, recipent, message, timestamp, groupname, 1);
          client.query(
            query,
            [author, recipent, message, timestamp, groupname, 1],
            (err, reply) => {
              done();
              if (err) {
                console.log(err);
                res.status(500).send(err);
              } else {
                console.log(reply);
                res.status(200).send(reply);
              }
            },
          );
        });
      });
    })
    .catch(error => {
      console.log(error);
      res.status(500).send(error);
    });
});

app.get("/setasread", (req, res) => {
  var url = require("url");
  var url_parts = url.parse(req.url, true);
  var query_parts = url_parts.query;

  const author = query_parts["author"];
  const recipent = query_parts["recipent"];
  createChatlong()
    .then(response => {
      const query =
        "UPDATE chatlong SET isunread = 0 WHERE author = $1 AND recipent = $2 ";
      return new Promise(function(resolve, reject) {
        pool.connect((err, client, done) => {
          if (err) {
            reject(err);
          }
          client.query(query, [author, recipent], (err, reply) => {
            done();

            if (err) {
              res.status(500).send(err);
            } else {
              res.status(200).send(reply.rows);
            }
          });
        });
      });
    })
    .catch(error => {
      res.status(500).send(error);
    });
});

app.get("/setasreadsingle", (req, res) => {
  var url = require("url");
  var url_parts = url.parse(req.url, true);
  var query_parts = url_parts.query;

  const author = query_parts["author"];
  const recipent = query_parts["recipent"];
  const message = query_parts["message"];
  const timestamp = query_parts["timestamp"];
  console.log(author, recipent, message, timestamp);
  createChatlong()
    .then(response => {
      const query =
        "UPDATE chatlong SET isunread = 0 WHERE author = $1 AND recipent = $2 AND message = $3 AND timestamp = $4";
      return new Promise(function(resolve, reject) {
        pool.connect((err, client, done) => {
          if (err) {
            reject(err);
          }
          client.query(
            query,
            [author, recipent, message, timestamp],
            (err, reply) => {
              done();

              if (err) {
                console.log(err);
                res.status(500).send(err);
              } else {
                console.log(reply);
                res.status(200).send(reply.rows);
              }
            },
          );
        });
      });
    })
    .catch(error => {
      console.log(error);
      res.status(500).send(error);
    });
});

app.get("/updatemodules", (req, res) => {
  var url = require("url");
  var url_parts = url.parse(req.url, true);
  var query_parts = url_parts.query;

  const user = query_parts["user"];
  const modules = query_parts["modules"];
  console.log("modules:", modules);
  createAccounts()
    .then(response => {
      const query = "UPDATE accounts SET modules = $2 WHERE login = $1";
      return new Promise(function(resolve, reject) {
        pool.connect((err, client, done) => {
          if (err) {
            reject(err);
          }
          client.query(query, [user, modules], (err, reply) => {
            done();

            if (err) {
              console.log(err);
              res.status(500).send(err);
            } else {
              res.status(200).send(reply.rows);
            }
          });
        });
      });
    })
    .catch(error => {
      res.status(500).send(error);
    });
});

app.get("/getmodules", (req, res) => {
  var url = require("url");
  var url_parts = url.parse(req.url, true);
  var query_parts = url_parts.query;

  const user = query_parts["user"];

  createAccounts()
    .then(response => {
      const query = "SELECT modules FROM accounts WHERE login=$1";
      return new Promise(function(resolve, reject) {
        pool.connect((err, client, done) => {
          if (err) {
            reject(err);
          }
          client.query(query, [user], (err, reply) => {
            done();
            if (err) {
              console.log(err);
              res.status(500).send();
            } else {
              var omodules = reply.rows[0]["modules"];
              if (omodules != null) {
                res.status(200).send(omodules);
              } else {
                res.status(200).send("No modules yet!");
              }
            }
          });
        });
      });
    })
    .catch(error => {
      res.status(500).send(error);
    });
});

app.get("/registeradmins", (req, res) => {
  createRooms()
    .then(response => {
      var url = require("url");
      var url_parts = url.parse(req.url, true);
      var query_parts = url_parts.query;

      const roomName = query_parts["roomname"];
      const adminID = query_parts["user"];
      const timing = query_parts["timing"];
      const timing2 = query_parts["timing2"];

      checkRoomExist(roomName)
        .then(response => {
          const roomExists = response[0]["exists"];
          if (roomExists) {
            res.status(200).send("Room Exists");
          } else {
            const query =
              "INSERT INTO roomadmins (roomname, adminID, timing, timing_end) VALUES ($1, $2, $3, $4)";

            pool.connect((err, client, done) => {
              if (err) {
                reject(err);
              }
              client.query(
                query,
                [roomName, adminID, timing, timing2],
                (err, reply) => {
                  done();
                  if (err) {
                    console.log(error);
                    res.status(500).send(err);
                  } else {
                    res.status(200).send(response);
                  }
                },
              );
            });
          }
        })
        .catch(error => {
          console.log(error);
          res.status(500).send(error);
        });
    })
    .catch(error => {
      console.log(error);
      res.status(500).send(error);
    });
});

app.get("/detectadmin", (req, res) => {
  createRooms()
    .then(response => {
      var url = require("url");
      var url_parts = url.parse(req.url, true);
      var query_parts = url_parts.query;

      const roomName = query_parts["roomname"];
      const userID = query_parts["user"];

      const query = "SELECT adminid FROM roomadmins WHERE roomname=$1;";

      pool.connect((err, client, done) => {
        if (err) reject(err);
        client.query(query, [roomName], (err, reply) => {
          done();
          if (err) {
            console.log(err);
            res.status(500).send(err);
          } else {
            if (reply.rows.length == 0) {
              console.log("noreply");
              res.status(200).send("No Such Room");
            } else {
              var adminID = reply.rows[0]["adminid"];
              if (adminID == userID) {
                console.log("this is +" + adminID);
                console.log(userID);
                res.status(200).send("Admin!");
              } else {
                console.log("this is not admin! +" + adminID);
                console.log(userID);
                res.status(200).send("Not admin!");
              }
            }
          }
        });
      });
    })
    .catch(error => {
      console.log(error);
      res.status(500).send(error);
    });
});

app.get("/checkrooms", (req, res) => {
  createRooms()
    .then(response => {
      var url = require("url");
      var url_parts = url.parse(req.url, true);
      var query_parts = url_parts.query;

      const roomName = query_parts["roomname"];

      checkRoomExist(roomName)
        .then(response => {
          const roomExists = response[0]["exists"];
          if (roomExists) {
            res.status(200).send("Room Exists");
          } else {
            res.status(200).send("Room does not Exist");
          }
        })
        .catch(error => {
          res.status(500).send(error);
        });
    })
    .catch(error => {
      res.status(500).send(error);
    });
});

app.get("/singlechat", (req, res) => {
  var url = require("url");
  var url_parts = url.parse(req.url, true);
  var query_parts = url_parts.query;

  const recipent = query_parts["recipent"];
  const minTimestamp = query_parts["minTimestamp"];
  createChatlong()
    .then(response => {
      const query =
        "SELECT id, author, recipent, message, timestamp, isunread FROM chatlong WHERE (recipent=$1 OR author=$1) AND timestamp >= $2 ORDER BY timestamp;";
      return new Promise(function(resolve, reject) {
        pool.connect((err, client, done) => {
          if (err) reject(err);
          client.query(query, [recipent, minTimestamp], (err, reply) => {
            done();
            if (err) {
              res.status(500).send(err);
            } else {
              res.status(200).send(reply.rows);
            }
          });
        });
      });
    })
    .catch(error => {
      res.status(500).send(error);
    });
});

app.get("/register", (req, res) => {
  createAccounts()
    .then(response => {
      var url = require("url");
      var url_parts = url.parse(req.url, true);
      var query_parts = url_parts.query;

      const name = query_parts["name"];
      const login = query_parts["login"];
      const password = query_parts["password"];
      checkAccountExist(login)
        .then(response => {
          const accountExists = response[0]["exists"];
          if (accountExists) {
            res.status(200).send("Account Exists");
          } else {
            const query =
              "INSERT INTO accounts (name, login, password) VALUES ($1, $2, $3)";

            pool.connect((err, client, done) => {
              if (err) {
                reject(err);
              }
              client.query(query, [name, login, password], (err, reply) => {
                done();
                if (err) {
                  res.status(500).send(err);
                } else {
                  res.status(200).send(response);
                }
              });
            });
          }
        })
        .catch(error => {
          res.status(500).send(error);
        });
    })
    .catch(error => {
      res.status(500).send(error);
    });
});

app.get("/login", (req, res) => {
  createAccounts()
    .then(response => {
      var url = require("url");
      var url_parts = url.parse(req.url, true);
      var query_parts = url_parts.query;

      const login = query_parts["login"];
      const client_password = query_parts["password"];

      const query = "SELECT password, modules FROM accounts WHERE login=$1;";

      pool.connect((err, client, done) => {
        if (err) reject(err);
        client.query(query, [login], (err, reply) => {
          done();
          if (err) {
            res.status(500).send(err);
          } else {
            if (reply.rows.length == 0) {
              res.status(200).send("No Such User");
            } else {
              var server_password = reply.rows[0]["password"];
              var modules = reply.rows[0]["modules"];
              if (server_password == client_password) {
                res.status(200).send(modules);
              } else {
                res.status(200).send("Wrong Password");
              }
            }
          }
        });
      });
    })
    .catch(error => {
      res.status(500).send(error);
    });
});

app.get("/token", (req, res) => {
  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET,
  );

  token.addGrant(new VideoGrant());

  token.identity = req.query.user;

  res.send({ token: token.toJwt() });
});

io.on("connect", socket => {
  socket.on("init", ({ user }, callback) => {
    console.log(user);
    socket.join("master");
    callback();
  });

  socket.on("join", ({ name, room }, callback) => {
    console.log(name, room);
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);

    socket.join(user.room);

    socket.emit("message", {
      user: "admin",
      text: `${user.name}, welcome to room ${user.room}.`,
    });

    socket.emit("freshRoomData", {
      users: getUsersInRoom(user.room),
    });

    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name} has joined!` });

    socket.broadcast.to(user.room).emit("newUser", user.name);

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("quizJoin", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);
    socket.join(user.room);

    socket.emit("freshRoomData", {
      users: getUsersInRoom(user.room),
    });

    socket.broadcast.to(user.room).emit("newUser", user.name);

    socket.emit("receiveQuizMessage", {
      user: "admin",
      text: `${user.name}, welcome to quiz room ${user.room}.`,
    });

    socket.broadcast.to(user.room).emit("receiveQuizMessage", {
      user: "admin",
      text: `${user.name} has joined!`,
    });

    io.to(user.room).emit("quizRoomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on(
    "publishMessage",
    (id, author, recipent, message, minTimestamp, groupname) => {
      io.to("master").emit("newMessage", {
        id: -1,
        author: author,
        message: message,
        recipent: recipent,
        message: message,
        timestamp: minTimestamp,
        groupname: groupname,
      });
    },
  );

  socket.on("shareWhiteboard", message => {
    io.to("master").emit("newWhiteboard", {
      message,
    });
  });

  socket.on("shareQuiz", message => {
    io.to("master").emit("newQuiz", {
      message,
    });
  });

  socket.on("shareScore", message => {
    io.to("master").emit("newScore", {
      message,
    });
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit("message", { user: user.name, text: message });

    callback();
  });

  socket.on("end", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", {
        user: "Admin",
        text: `${user.name} has left.`,
      });
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", {
        user: "Admin",
        text: `${user.name} has left.`,
      });
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(process.env.PORT || 5000, () =>
  console.log(`Server has started.`),
);
