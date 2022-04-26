
var router = require("express").Router();
const controller = require("../controllers/RegLogin");

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/findAll", controller.findAll);
router.get("/findOne/:id", controller.findOne);
router.put("/update/:id",controller.update)
router.delete("/delete/:id",controller.delete)
router.delete("/deleteall",controller.deleteall)
router.post("/verify",controller.verify);
 router.post("/resend",controller.resend)
module.exports  = router;