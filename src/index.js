const express = require("express");
const app = express();
const cluster = require("cluster");
const numCpus = require("os").cpus().length;
const yargs = require("yargs/yargs")(process.argv.slice(2));
const config = require("./options/config");
const bcrypt = require("bcrypt");
const authorize = require("./auth/index");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true };
const User = require("./models/Users.js");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const controllersdb = require("./controllers/controllerDb.js");

const loginRoutes = require("./routes/login");
const infoRoutes = require("./routes/info");
// const randomRoutes = require("./routes/random");

//PASPORT LOCALSTRATEGY

passport.use(
    "local-login",
    new LocalStrategy((username, password, done) => {
        User.findOne({ username }, (err, user) => {
            if (err) return done(err);
            if (!user) {
                console.log("Usuario no encontrado.");
                return done(null, false);
            }
            if (!isValidPassword(user, password)) {
                console.log("Error de contraseña.");
                return done(null, false);
            }
            return done(null, user);
        }).clone();
    })
);

passport.use(
    "local-signup",
    new LocalStrategy(
        {
            passReqToCallback: true,
        },
        async (req, username, password, done) => {
            await User.findOne({ username: username }, (err, user) => {
                if (err) {
                    return done(err);
                }
                if (user) {
                    console.log(`El usuario ${username} ya existe`);
                    return done(null, false);
                }
                const newUser = {
                    username: req.body.username,
                    password: createHash(password),
                };
                User.create(newUser, (err, userWithId) => {
                    if (err) {
                        return done(err);
                    }
                    return done(null, userWithId);
                });
            }).clone();
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

function isValidPassword(user, password) {
    console.log(`chequeando contraseña ${password} con ${user.password}`);

    return bcrypt.compareSync(password, user.password);
}

function createHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}

//EJS

app.set("views", "./views");
app.set("view engine", "ejs");

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(process.cwd() + "/public")); //Adelantando el uso del process jajaja

app.use(
    session({
        store: MongoStore.create({
            mongoUrl:
                "mongodb+srv://leniador:leniador@cluster0.hjris.mongodb.net/ecommerce?retryWrites=true&w=majority",
            mongoOptions: advancedOptions,
        }),
        secret: "secreto",
        resave: true,
        saveUninitialized: true,
        cookie: { maxAge: 60000 },
    })
);

app.use("/", loginRoutes);
app.use("/info", infoRoutes);
// app.use("/api/random", randomRoutes);

app.use(passport.initialize());
app.use(passport.session());

//RUTA DEL HOME. SI NO ESTÁ LOGUEADO O SE PASA EL TIEMPO DE INACTIVIDAD, SE REDIRECCIONA A LOGIN SEGÚN LA FUNCION AUTHORIZE.
app.get("/home", authorize, (req, res) => {
    if (req.user) {
        res.render("pages/home", {
            nameUser: req.user.username,
        });
    }
});
//RUTA DEL LOGOUT. SI YA ESTÁ DESLOGUEADO POR INACTIVIDAD, Y PULSA EL BOTON DE DESLOGUEO, NO DARÁ ERROR, SINO QUE REDIRIGE AL LOGIN.
app.post("/logout", authorize, (req, res) => {
    if (req.user) {
        nameUser = req.user.username;
        req.logout(function (err) {
            if (err) {
                return next(err);
            }
        });
        res.render("pages/logout", { nameUser });
    }
});

app.get("/api/random", (req, res) => {
    res.send(
        `Servidor en puerto ${PORT} - <b>PID ${
            process.pid
        }</b> - ${new Date().toLocaleString()}`
    );
});

const args = yargs
    .default({
        puerto: parseInt(process.argv[2]) || 8080,
        modo: "FORK",
    })
    .alias({ p: "puerto", m: "modo" }).argv;
const PORT = args.puerto || process.argv[2] || 8080;
// const PORT = process.env.PORT || 8080;

// Levantamos la base de Datos y  el Servidor
controllersdb.conectarDB(config.URL_MONGODB, (err) => {
    if (err) return console.log(`Error al conectar con mongo: ${err}`);
    console.log("Conexión con MongoDB establecida correctamente");
});

if (cluster.isMaster && args.modo === "CLUSTER") {
    for (let i = 0; i < numCpus; i++) {
        cluster.fork();
        console.log(
            `El Trabajador ${i + 1} con PID ${process.pid} se ha unido\n`
        );
    }
    cluster.on("exit", (worker, code) => {
        console.log(
            `El worker ${worker.process.pid} perdió la vida trabajando. Será recordado como un héroe`
        );
        cluster.fork(); // Resucitamos al trabajador caído y ponemos uno parecido xD
        console.log(
            `Nuevo Worker con el PID: ${worker.process.pid}. Ojala tenga mas suerte que el anterior`
        );
    });
} else {
    app.listen(PORT, (err) => {
        if (err) return console.log(`Error al iniciar el servidor: ${err}`);
        console.log(
            `Servidor corriendo en el puerto ${PORT} y en modo ${args.modo}\n`
        );
    });
}
