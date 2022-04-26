const express = require('express')
const bodyparser = require('body-parser')
const mongoose = require('mongoose')

const dotenv = require('dotenv')
dotenv.config();

const app = express();


// body parser middleware
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

const reglogin = require('./routes/RegLogin')
app.use('/reglogin',reglogin);


 app.get('/', function (req, res) {
    res.send('welcome Registraion_Login');
});


const database = process.env.mongoURI;
mongoose.connect(database, {useUnifiedTopology: true, useNewUrlParser: true })
.then(() => console.log('mongoose connected'))
.catch(err => console.log(err));


//defining port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`app is live at ${PORT}`);
})




