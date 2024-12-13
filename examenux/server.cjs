
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } = require('firebase/auth');
const app = express();
const port = 3000;
const uri = "mongodb+srv://uxadmin:2528@examenux2.c5ovy.mongodb.net/?retryWrites=true&w=majority&appName=examenux2";
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

var admin = require('firebase-admin');
var serviceAccount = require('./examen2ux-b6b74-firebase-adminsdk-4d6vb-54eb206e51.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
const auth = admin.auth();

const firebaseConfig = {
    apiKey: "AIzaSyBIit2NAtH8KJa_yy-OMiYnrs0aujceHME",
    authDomain: "examen2ux-b6b74.firebaseapp.com",
    projectId: "examen2ux-b6b74",
    storageBucket: "examen2ux-b6b74.firebasestorage.app",
    messagingSenderId: "876517539313",
    appId: "1:876517539313:web:1f15b01b7e9a47e01a1850",
    measurementId: "G-PK892NENJD"
  };

const firebaseApp = initializeApp(firebaseConfig);

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true
    }
});

async function connect(){
    try{
       await client.connect();
       console.log("Conectado a la base de datos");
    }catch(error){
       console.error("Error al conectar a la base de datos: ", error);
    }
   }

   app.listen(port, ()=>{
    console.log(`Server running on http://localhost:${port}`);
    connect();
})

app.get('/', (req, res) => {
    res.send('Server is running!');
});



// crear user
app.post('/createUser', async (req, res) => {
    try {
        const user = await auth.createUser({
            email: req.body.email,
            password: req.body.password,
        });
        res.status(200).send({
            resultado: user,
            mensaje: 'User created successfully',
        });
    } catch (error) {
        res.status(401).send({
            error: error.message,
        });
    }
});

// loginn fb
app.post('/logIn', async (req, res) => {
    const auth = getAuth(firebaseApp);
    signInWithEmailAndPassword(auth, req.body.email, req.body.password)
        .then((response) => {
            res.status(200).send({
                resultado: response,
            });
        })
        .catch((error) => {
            res.status(401).send({
                error: error.message,
            });
        });
});

// logout
app.post('/logOut', async (req, res) => {
    const auth = getAuth(firebaseApp);
    signOut(auth)
        .then(() => {
            res.status(200).send({
                mensaje: "Session closed",
            });
        })
        .catch((error) => {
            res.status(401).send({
                error: error.message,
            });
        });
});

// create mongo post
app.post('/createPost', async (req, res) => {
    try {
        const db = client.db("BaseExam");
        const collection = db.collection("Data");

        const response = await collection.insertOne({
            title: req.body.title,
            content: req.body.content,
            author: req.body.author,
        });

        res.status(200).send({
            resultado: response,
            mensaje: "Post created successfully",
        });
    } catch (error) {
        res.status(400).send({
            error: error.message,
        });
    }
});



// listar de mongo
app.get('/listPosts', async (req, res) => {
    try {
        const db = client.db("BaseExam");
        const collection = db.collection("Data");

        const response = await collection.find({}).toArray();

        res.status(200).send({
            resultado: response,
            mensaje: "Posts listed successfully",
        });
    } catch (error) {
        res.status(401).send({
            error: error.message,
        });
    }
});


// editar de mongo
app.put('/editPost/:id', async (req, res) => {
    try {
        const db = client.db("BaseExam");
        const collection = db.collection("Data");

        const response = await collection.updateOne(
            {
                _id: new ObjectId(req.params.id)
            },
            {
                $set: {
                    title: req.body.title,
                    content: req.body.content,
                    author: req.body.author,
                }
            }
        );

        res.status(200).send({
            resultado: response,
            mensaje: "Post updated successfully",
        });
    } catch (error) {
        res.status(401).send({
            error: error.message,
        });
    }
});

// borrar mongo
app.delete('/deletePost/:id', async (req, res) => {
    try {
        const db = client.db("BaseExam");
        const collection = db.collection("Data");

        const response = await collection.deleteOne({
            _id: new ObjectId(req.params.id)
        });

        if (response.deletedCount > 0) {
            res.status(200).send({
                mensaje: "Post deleted successfully",
                resultado: response,
            });
        } else {
            res.status(404).send({
                mensaje: "Post not found",
            });
        }
    } catch (error) {
        res.status(401).send({
            error: error.message,
        });
    }
});