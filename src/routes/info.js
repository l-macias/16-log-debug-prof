const express = require("express");
const { Router } = express;
const router = new Router();
const numCpus = require("os").cpus().length;
const compression = require("compression");
const info = {
    argumentosDeEntrada: process.argv,
    sistemaOperativo: process.platform,
    versionNode: process.version,
    memoriaReservada: process.memoryUsage().heapTotal,
    memoriaLibre: process.memoryUsage().heapUsed,
    pathEjecucion: process.execPath,
    processID: process.pid,
    carpetaProyecto: process.cwd(),
    procesdoresDisponibles: numCpus,
};
router.get("/", compression(), (req, res) => {
    res.send(info);
});

module.exports = router;
