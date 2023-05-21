let alert = require("alert");
var express = require("express");
var bodyParser = require("body-parser");
var fs = require("fs");
var path = require("path");
const session = require("express-session");
var app = express();

var MongoClient = require("mongodb").MongoClient;
var db;
var error;
var waiting = [];
MongoClient.connect("mongodb://127.0.0.1:27017", function (err, client) {
  error = err;
  db = client.db("myDB");

  waiting.forEach(function (callback) {
    callback(err, client);
  });
});
module.exports = function (callBack) {
  if (db || error) {
    callback(error, db);
  } else {
    waiting.push(callBack);
  }
};

app.use(bodyParser.json());
app.use(express.static("public"));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(
  session({
    secret: "secret-word",
    resave: false,
    saveUninitialized: false,
  })
);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// app.use('/api/users', users);
// app.use('/api/auth',auth);

app.get("/", function (req, res) {
  res.render("login");
});
app.get("/annapurna", function (req, res) {
  if (req.session.context) {
    res.render("annapurna");
  } else {
    res.render("login");
  }
});
app.get("/bali", function (req, res) {
  if (req.session.context) {
    res.render("bali");
  } else {
    res.render("login");
  }
});

app.get("/cities", function (req, res) {
  if (req.session.context) {
    res.render("cities");
  } else {
    res.render("login");
  }
});

app.get("/hiking", function (req, res) {
  if (req.session.context) {
    res.render("hiking");
  } else {
    res.render("login");
  }
});
app.get("/home", function (req, res) {
  if (req.session.context) {
    res.render("home");
  } else {
    res.render("login");
  }
});
app.get("/inca", function (req, res) {
  if (req.session.context) {
    res.render("inca");
  } else {
    res.render("login");
  }
});
app.get("/islands", function (req, res) {
  if (req.session.context) {
    res.render("islands");
  } else {
    res.render("login");
  }
});
app.get("/paris", function (req, res) {
  if (req.session.context) {
    res.render("paris");
  } else {
    res.render("login");
  }
});
app.get("/registration", function (req, res) {
  res.render("registration");
});
app.get("/rome", function (req, res) {
  if (req.session.context) {
    res.render("rome");
  } else {
    res.render("login");
  }
});
app.get("/santorini", function (req, res) {
  if (req.session.context) {
    res.render("santorini");
  } else {
    res.render("login");
  }
});
app.get("/searchresults", function (req, res) {
  if (req.session.context) {
    res.render("searchresults");
  } else {
    res.render("login");
  }
});
app.get("/wanttogo", async function (req, res) {
  if (req.session.context) {
    const user = await db
      .collection("myCollection")
      .findOne({ username: `${req.session.context}` });
    res.render("wanttogo", { myList: user.want_to_go });
  } else {
    res.render("login");
  }
});

app.post("/", async function (req, res) {
  try {
    const user = req.body.username;
    const pass = req.body.password;

    const currentuser = await db
      .collection("myCollection")
      .findOne({ username: user });

    if (currentuser.password == pass) {
      req.session.context = req.body.username;
      res.render("home");
    } else {
      alert("Incorrect Password");
    }
  } catch (error) {
    alert(
      "Invalid username. Please create an account or enter an existing username"
    );
  }
});

app.post("/register", async (req, res) => {
  var user = req.body.username;
  var pass = req.body.password;
  var data = {
    username: user,
    password: pass,
    want_to_go: [],
  };
  if (await db.collection("myCollection").findOne({ username: `${user}` })) {
    alert("user already exists");
  } else {
    db.collection("myCollection").insertOne(data, function (err) {
      if (err) {
        console.log(err);
      } else console.log("Record inserted Successfully");
    });
    alert("registration successful");
    res.redirect("http://localhost:3000/");
  }
});

app.get("/search", function (req, res) {
  res.render("searchresults", { ourlist: [], added: "" });
});
const des = JSON.parse(fs.readFileSync("destinations.json"));

app.post("/search", function (req, res) {
  var sear = req.body.Search.toLowerCase();
  var result = [];
  var f = false;
  des.forEach((element) => {
    console.log(des);
    console.log(element.name);
    console.log(typeof element.name);
    console.log(sear);
    console.log(typeof term);
    console.log(element.name.includes(sear));
    if (element.name.toLowerCase().includes(sear)) {
      var obj = { name: element.name, val: element.link };
      result.push(obj);
      f = true;
    }
  });
  if (f) {
    res.render("searchresults", { ourlist: result, added: "" });
  } else {
    res.render("searchresults", {
      ourlist: [],
      added: "Destination not Found",
    });
  }
});
async function wanttogohelp(place, req, res) {
  var user = await db
    .collection("myCollection")
    .findOne({ username: `${req.session.context}` });
  var list = [];
  if(user.want_to_go == undefined){
    list = [];
  }
  else{
    list = user.want_to_go;
  }
  if(list == undefined){
    list.push(place);
    db.collection("myCollection").updateOne(
      {username: `${req.session.context}`},
      {$set: { want_to_go: list}}
    );
    console.info(list);
  }

  else if (list.includes(place)) {
    alert("this place already exits in your want to go list!");
  } else {
    list.push(place);
    db.collection("myCollection").updateOne(
      { username: `${req.session.context}` },
      { $set: { want_to_go: list } }
    );
    console.info(list);
  }
}

app.post("/annapurna", async (req, res) => {
  wanttogohelp("Annapurna Circuit", req, res);
});
app.post("/bali", async (req, res) => {
  wanttogohelp("Bali Island", req, res);
});
app.post("/inca", async (req, res) => {
  wanttogohelp("Inca Trail to Machu Picchu", req, res);
});
app.post("/paris", async (req, res) => {
  wanttogohelp("Paris", req, res);
});
app.post("/rome", async (req, res) => {
  wanttogohelp("Rome", req, res);
});
app.post("/santorini", async (req, res) => {
  wanttogohelp("Santorini Island", req, res);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
