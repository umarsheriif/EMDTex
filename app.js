const express = require("express");
const chalk = require("chalk");
// const debug = require('debug')('app');
const morgan = require("morgan");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const sql = require("mssql");
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: 'https://24ae7abccbdf426789beebb38cc42e75@sentry.io/1375642'
});
const app = express();
const port = process.env.PORT || 3000;

const config = {
  user: "umarsheriif",
  password: "P@ssw0rdP@ssw0rd",
  server: "emdtdd.database.windows.net", // You can use 'localhost\\instance' to connect to named instance
  database: "EMDTDEMO",
  options: {
    encrypt: true // Use this if you're on Windows Azure
  }
};
sql.connect(config).catch(err => console.log(err));
const formRouter = express.Router();
const nav = [{
  link: "/payment",
  title: "Data"
}];
const dataRouter = require("./src/routes/dataRoutes")(nav);
const adminRouter = require("./src/routes/adminRoutes")(nav);
const authRouter = require("./src/routes/authRoutes")(nav);
const paymentRouter = require("./src/routes/paymentRoutes")(nav);
const documentRouter = require("./src/routes/documentRoutes")(nav);
app.use(Sentry.Handlers.requestHandler());
app.get('/', function mainHandler(req, res) {
  throw new Error('Broke!');
});

app.use(morgan("tiny"));
// app.use(bodyParser());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  secret: "payment"
}));

require("./src/config/passport.js")(app);

app.use(express.static(path.join(__dirname, "public")));
app.use(
  "/css",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/css"))
);
app.use(
  "/js",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/js"))
);
app.use(
  "/js",
  express.static(path.join(__dirname, "node_modules/jquery/dist"))
);
// app.set("views", "/home/site/wwwroot/src/views");
app.set("views", "./src/views");
app.set("view engine", "ejs");

formRouter.route("/forms").get((req, res) => {
  res.render("default-forms");
});
app.use("/auth", authRouter);
app.use("/data", dataRouter);

app.use("/document", documentRouter);
app.use("/payment", paymentRouter);
app.use("/admin", adminRouter);
app.get("/", (req, res) => {
  res.redirect("/data/checkout");
});



// The error handler must be before any other error middleware
app.use(Sentry.Handlers.errorHandler());

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500;
  res.end(res.sentry + '\n');
});
// app.get('/forms', (req, res) => {
//   res.render('default-forms');
// });
app.listen(port, () => {
  console.log(`listening on port + ${chalk.green(port)}`);
});