
const User = require("../models/RegLogin");
const bcrypt = require("bcrypt");
const authy = require('authy')(process.env.AUTHY_API_KEY);
const nodemailer = require('nodemailer')
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth")

var email;

var otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);
console.log(otp);

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    service: 'Gmail',

    auth: {
        user:"archanashinde113@gmail.com" ,
        pass: "Arch@1234%#",
    }

});
module.exports = {
    register : function (req, res) {
      const { Firstname, Lastname,email, phone, countryCode, Password, confirm, } = req.body;
      if (!Firstname || !Lastname || !email || !phone || !countryCode ||!Password || !confirm) {
        res.send("Fill empty fields");
      }
      if (Password !== confirm) {
        console.log("Password must match");
      }
      else {
        User.findOne({ email: email }).then((user) => {
          if (user) {
            res.send("email exists");
            
          } else {
            authy.register_user(email, phone, countryCode, function (regErr, regRes) {
              console.log('In Registration...');
                         
              if (regErr) {
                console.log(regErr);
                console.log('There was some error registering the user.');
              } else if (regRes) {
                user.authyId = regRes.user.id
                console.log(regRes);
                authy.request_sms(regRes.user.id, function (smsErr, smsRes) {
                  console.log('Requesting SMS...');
                  if (smsErr) {
                    console.log(smsErr);
                    res.send('There was some error sending OTP to cell phone.');
                  } else if (smsRes) {
                    console.log(smsRes);
                    res.send('OTP Sent to the cell phone.');
                  }
                });
              }
            });
            const payload = {
              User: {
                 id:User.id
               }
             }
             jwt.sign(
              payload,
              "randomString",
              {
                expiresIn: 3600
              },
              (err, token) => {
                if (err) throw err;
                res.status(200).json({
                  token,
                  Firstname,
              Lastname,
              email,
              Password,
              confirm,
              otp
                });
    
                // newUser.token = token;
                // newUser.save();
              });
              const newUser = new User({
                Firstname,
                Lastname,
                email,
                Password,
                otp,
                
                
              });
              bcrypt.genSalt(10, (err, salt) =>
              bcrypt.hash(newUser.Password, salt, (err, hash) => {
                if (err) throw err;
                newUser.Password = hash;
                newUser.save()
                  // .then(res.redirect("/login"))
                  // .catch((err) => console.log(err));
              }));
             
          }
          
        })
      }

      // send mail with defined transport object
      var mailOptions = {
        to: req.body.email,
        subject: "Otp for registration is: ",
        html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

         res.send({
           Firstname,
           Lastname,
           email,
           Password,
           otp
         });
       
    });

      
    },
    login:  (async( req,res) =>{
      const body = req.body;
    const user = await User.findOne({ email: body.email });
    if (user) {
      // check user password with hashed password stored in the database
      const validPassword = await bcrypt.compare(body.Password, user.Password);
      if (validPassword) {
        if (user.authyId) {
          authy.request_sms(
              user.authyId, {force: true},  
              function (err, smsRes) {
                  if (err) {
                      res.json({ message: 'An error occurred while sending OTP to user'});
                  } 
          });
          return res.status(200).json({ message: 'OTP sent to user' });
      }
      
        const payload = {
         
          User: {
            id: User.id
          }
        };
        jwt.sign(
          payload,
          "randomString",
          {
            expiresIn: 3600
          },
          (err, token) => {
            if (err) throw err;
            res.status(200).json({
              messsage:"Successfully Logged In",
              token:token,
              email:email
             
              
            });




           
          }

        );
      
      } else {
        res.status(400).json({ error: "Invalid Password" });
      }
    } else {
      res.status(401).json({ error: "User does not exist" });
    }
    }),

    update: function (req,res){
      if (!req.body) {
        return res.status(400).send({
          message: "Data to update can not be empty!"
        });
      }
      const id = req.params.id;
      User.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then(data => {
          if (!data) {
            res.status(404).send({
              message: `Cannot update user with id=${id}. Maybe user was not found!`
            });
          } else res.send({ message: "user was updated successfully." });
        })
        .catch(err => {
          res.status(500).send({
            message: "Error updating user with id=" + id
          });
        });
    },
    findOne: function(req,res){
      const id = req.params.id;
      User.findById(id)
        .then(data => {
          if (!data)
            res.status(404).send({ message: "Not found user with id " + id });
          else res.send(data);
        })
        .catch(err => {
          res
            .status(500)
            .send({ message: "Error retrieving user with id=" + id });
        });
    },
    findAll : (auth, (req,res) => {
      const Firstname = req.query. Firstname;
      var condition =  Firstname ? {  Firstname: { $regex: new RegExp( Firstname), $options: "i" } } : {};
      User.find(condition)
        .then(data => {
          res.send(data);
        })
        .catch(err => {
          res.status(500).send({
            message:
              err.message || "Some error occurred while retrieving user Detail."
          });
        });
    }),
    delete: function(req,res) {
      const id = req.params.id;
      User.findByIdAndRemove(id)
        .then(data => {
          if (!data) {
            res.status(404).send({
              message: `Cannot delete user with id=${id}. Maybe user was not found!`
            });
          } else {
            res.send({
              message: "user was deleted successfully!"
            });
          }
        })
        .catch(err => {
          res.status(500).send({
            message: "Could not delete user with id=" + id
          });
        });
    },

    deleteall:function (req,res){
      User.deleteMany({})
      .then(data => {
        res.send({
          message: `${data.deletedCount} users were deleted successfully!`
        });
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while removing all users."
        });
      });
    },
    verify:  (async(req, res) => {


    //   try {
    //     const { email } = req.body
    //     const user = await User.findOne({ email });
        
    //     authy.verify( user.authyId, req.params.token,function(err, tokenRes){
    //             if (err) {
    //                 return res.json({ message:'OTP verification failed' });
    //             }
    //             res.status(200).json({ message: 'Token is valid'});
    //         });
    // } catch (error) {
    //     res.status(500).json({ message: error.message});
    // }

      
        if (req.body.otp == otp) {
            res.send("You has been successfully registered");
            
            
        }
        else {
            res.render('otp', { msg: 'otp is incorrect' });
        }
        authy.verify(user.authyId, req.body.token, function (verifyErr, verifyRes) {
          console.log('In Verification...');
          if (verifyErr) {
            console.log(verifyErr);
            res.send('OTP verification failed.');
          } else if (verifyRes) {
            console.log(verifyRes);
            res.send('OTP Verified.');
          }
        })
      
    }),

    resend: function(req,res){
        email = req.body.email;
        var mailOptions = {
            to: email,
            subject: "Otp for registration is: ",
            html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
        };
    
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            // res.send('otp', { msg: "otp has been sent" });
            res.send('otp has been sent')
        });
    
    }


    
}