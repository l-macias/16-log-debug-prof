const express = require("express");
const { Router } = express;
const router = new Router();
const { fork } = require("child_process");

router.get("/", (req, res) => {
    // res.send(
    //     `Servidor en puerto ${args.puerto} - <b>PID ${
    //         process.pid
    //     }</b> - ${new Date().toLocaleString()}`
    // );
    let cant = 100000000;
    if (req.query.cant) {
        cant = req.query.cant;
    }
    const random = fork("./src/helpers/randomize.js");
    random.send(cant);
    random.on("message", (veces) => {
        res.send(
            `LISTADO DE NÚMEROS Y CUANTAS VECES HAN SALIDO\n<pre>${JSON.stringify(
                veces,
                null,
                2
            )}</pre>`
        );
    });
});

module.exports = router;
