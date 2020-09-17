const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const socket = require("socket.io");
const dotenv = require("dotenv");
const flash = require("connect-flash");
const Post = require("./models/Post");
const User = require("./models/User");
const port = process.env.PORT || 3000;
const onlineChatUsers = {};
const MongoStore = require('connect-mongo')(session);

dotenv.config();

const postRoutes = require("./routes/posts");
const userRoutes = require("./routes/users");
const campaignRoutes = require("./routes/campaigns");
const donationRoutes = require("./routes/donations");

const MONGODB_URI = "mongodb://localhost:27017/cways";

const app = express();

// Set view engine to ejs so that template files will be ejs files
app.set("view engine", "ejs");
// Set up express session
app.use(session({
    store: new MongoStore({
        url: MONGODB_URI
    }),
    secret: "secretKey",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 * 2 // two weeks
    }
}));

// Set up passport for authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Set up body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Set up flash (alerts)
app.use(flash());

// Connect to MongoDB database
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Passing variables to template files
app.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.login = req.isAuthenticated();
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// Routes & Middleware
app.use("/", userRoutes);
app.use("/", postRoutes);
app.use("/", campaignRoutes);
app.use("/", donationRoutes);

const server = app.listen(port, () => {
    console.log("App is running on port " + port);
});

// Socket.io setup
const io = socket(server);

const room = io.of("/chat");
room.on("connection", socket => {
    console.log("new user ", socket.id);

    room.emit("newUser", { socketID: socket.id });

    socket.on("newUser", data => {
        if (!(data.name in onlineChatUsers)) {
            onlineChatUsers[data.name] = data.socketID;
            socket.name = data.name;
            room.emit("updateUserList", Object.keys(onlineChatUsers));
            console.log("Online users: " + Object.keys(onlineChatUsers));
        }
    });

    socket.on("disconnect", () => {
        delete onlineChatUsers[socket.name];
        room.emit("updateUserList", Object.keys(onlineChatUsers));
        console.log(`user ${socket.name} disconnected`);
    });

    socket.on("chat", data => {
        console.log(data);
        if (data.to === "Global Chat") {
            room.emit("chat", data);
        } else if (data.to) {
            room.to(onlineChatUsers[data.name]).emit("chat", data);
            room.to(onlineChatUsers[data.to]).emit("chat", data);
        }
        // console.log(`User ${data.name} sent a message: ${data.message}`);
    });
});
