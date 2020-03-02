const express = require("express");
const session = require("express-session");
const { db, Users, Restaurants, Menus } = require("./data/db");

const app = express();
app.set("view engine", "hbs");
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "a long unguessable string here",
    resave: false,
    saveUninitialized: true
  })
);

app.get("/view", (req, res) => {
  console.log(req.session);
  if (req.session.count) {
    req.session.count++;
  } else {
    req.session.count = 1;
  }
  req.session.save();
  res.render("viewcounter", {
    count: req.session.count
  });
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/signup/restaurant", (req, res) => {
  res.render("restaurant");
});

app.post("/signup", async (req, res) => {
  const user = await Users.create({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    name: req.body.name,
    type: req.body.type
  });
  res.redirect("/login");
});
app.post("/signup/restaurant", async (req, res) => {
  const restaurant = await Restaurants.create({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    name: req.body.name
  });
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  if (req.body.type == "user") {
    const user = await Users.findOne({
      where: {
        username: req.body.username
      }
    });

    if (!user) {
      res.send("Wrong username");
      return;
    }

    if (user.password != req.body.password) {
      res.send("Wrong password");
      return;
    }

    req.session.username = user.username;
    req.session.save();

    res.redirect("/profile");
  }
  if (req.body.type == "restaurant") {
    const user = await Restaurants.findOne({
      where: {
        username: req.body.username
      }
    });

    if (!user) {
      res.send("Wrong username");
      return;
    }

    if (user.password != req.body.password) {
      res.send("Wrong password");
      return;
    }

    req.session.username = user.username;
    req.session.save();

    res.redirect("/RestaurantProfile");
  }
});

app.get("/profile", async (req, res) => {
  if (!req.session.username) {
    res.redirect("/login");
    return;
  }

  const user = await Users.findOne({
    where: {
      username: req.session.username
    }
  });
  console.log(req.session);

  res.render("profile", { user });
});

app.get("/Restaurantprofile", async (req, res) => {
  if (!req.session.username) {
    res.redirect("/login");
    return;
  }

  const user = await Restaurants.findOne({
    where: {
      username: req.session.username
    }
  });
  console.log(req.session);

  res.render("RestaurantProfile", { user });
});

app.get("/logout", (req, res) => {
  req.session.username = undefined;
  console.log(req.session);
  res.redirect("/login");
});

app.get("/", (req, res) => {
  res.render("home");
});

app.post("/check", (req, res) => {
  if (req.body.enter == "restaurant") {
    res.redirect("/signup/restaurant");
  } else if (req.body.enter == "user") {
    res.redirect("/signup");
  }
});

app.post("/additem", async (req, res) => {
  const menu = await Menus.create({
    name: req.body.username,
    price: req.body.price,
    type: req.body.type,
    ownerUsername: req.body.owner
  });
  console.log(menu);
});
app.get("/menu/:name", async (req, res) => {
  items = await Menus.findAll({
    attributes: ["name", "price", "type"],
    where: {
      ownerUsername: req.params.name
    }
  });

  res.send(items);
});
db.sync().then(() => {
  app.listen(3131, () => {
    console.log("started on http://localhost:3131/");
  });
});