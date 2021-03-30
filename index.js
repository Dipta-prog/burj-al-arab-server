const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

// const uri = "mongodb+srv://arabian:v3Oie9xBZwTQhYsK@cluster0.stltu.mongodb.net/burj-al-arab?retryWrites=true&w=majority";

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.stltu.mongodb.net/burj-al-arab?retryWrites=true&w=majority`;

// console.log(process.env.DB_USER);
// console.log(process.env.DB_PASS);
// console.log(uri);
const port = 5000


const app = express()

app.use(cors());
app.use(bodyParser.json())


var serviceAccount = require("./configs/burj-al-arab-ee4c7-firebase-adminsdk-hz8hk-a14aa319ac.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


const password = "v3Oie9xBZwTQhYsK"




const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const bookings = client.db("burj-al-arab").collection("bookings");

    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;
        bookings.insertOne(newBooking)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
        console.log(newBooking);
    })

    
    app.get('/bookings', (req, res) => {
        const bearer = req.headers.authorization;
        if(bearer && bearer.startsWith('Bearer ')){
            const idToken = bearer.split(' ')[1];
            console.log({idToken});
            admin.auth().verifyIdToken(idToken)
            .then((decodedToken) => {
                const tokenEmail = decodedToken.email;
                const queryEmail = req.query.email;
                if(tokenEmail === queryEmail){
                    bookings.find({email:queryEmail})
                    .toArray((error, documents)=>{
                        res.status(200).send(documents)
                    })
                }
            }).catch((error) => {
                res.status(401).send('un_authorized access');
            });
        }
        else{
            res.status(401).send('un_authorized access');
        }
 
    })

});


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(process.env.PORT || port)