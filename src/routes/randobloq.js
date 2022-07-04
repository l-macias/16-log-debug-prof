const express = require("express");
const { Router } = express;
const router = new Router();
// const random = require("../helpers/randomize");
// const { fork } = require("child_process");

const randomize = (cant) => {
    let arrayNum = [];
    for (let i = 0; i < cant; i++) {
        let num = Math.floor(Math.random() * 100000) + 1;
        arrayNum.push(num);
    }
    let veces = {};
    arrayNum.forEach((num) => {
        veces[num] = (veces[num] || 0) + 1;
    });
    return veces;
};

router.get("/", (req, res) => {
    let cant = 100000000;
    if (req.query.cant) {
        cant = req.query.cant;
    }

    const veces = randomize(cant);

    res.send(
        `LISTADO DE NÚMEROS Y CUANTAS VECES HAN SALIDO\n<pre>${JSON.stringify(
            veces,
            null,
            2
        )}</pre>`
    );
});

module.exports = router;
