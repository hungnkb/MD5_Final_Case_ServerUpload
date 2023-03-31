import dotenv from 'dotenv'
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20'
import cookieSession from 'cookie-session';
dotenv.config();
import authRoute from './auth.js'
import google from 'googleapis'
import youtube from 'youtube-api';
import open from 'open';
import axios from 'axios';

const app = express();
const port = process.env.PORT || 9091;
app.use(cors());
app.use(express.static('public'))
app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb', parameterLimit: 50000 }));

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

let upload = multer({ storage: storage })

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/upload', upload.single('file'), async (req, res, next) => {
    try {
        const file = req.file
        const { title, description, tags } = req.body
        if (!file) {
            const error = new Error('Please upload a file')
            error.httpStatusCode = 400
            return next(error)
        }
        console.log(file);
        let upload = await axios({
            method: 'post',
            url: 'https://youtube.googleapis.com/youtube/v3/videos?id=104286973343247449036&part=snippet,status&key=AIzaSyAzX4Zxax8MpYca5e7eDKChHYo83Ec2ApI',
            headers:
                { 'Content-Type': 'video/mp4', Accept: 'application/json', Authorization: 'Bearer ya29.a0Ael9sCPNiww1Hz9NXJqxypnpJH4GnEYvJDYewEuSiyTa2u072nAgri5aEZnEKcrDzvRg4c9oHVEeFF77OhqeqwHtlH-nSBlaqlWk4LCPegOG-S-Ji5NtvV-qTyjy65g-pSoKgnBtw_YfKBAgqNqRs2PMXrWwaCgYKAfoSARASFQF4udJhSNhtyZXow64-fKn7LIN6RA0163' },
            snippet: {
                title,
                description,
                tags,
            },
            status: {
                privacyStatus: "private",
            },
            data: file

        })
        console.log(upload);
        res.send(file)
    } catch (e) {
        console.log(e);
    }
})


app.use(cookieSession(
    {
        name: 'session',
        keys: ['youtube'],
        maxAge: 24 * 60 * 60 * 100,
    }
))

app.use(passport.initialize());
app.use(passport.session());
app.use("/auth", authRoute);




app.listen(port, () => {
    console.log(`Example app listening on http://localhost:${port}`)
})


// ya29.a0Ael9sCOP-zNc9440us3ibar3ycRWMZQqu9Cj9mBk6bu0j0re_oGFs7j4cvAJHt8vAaEJVv73u_fdOAfeWfk12MJHWWmM44N1d9Igo29-6rV9QoTzVjaH-L9v0FPH1t5P026cjfp0BZ1x1DQqfOebKq0All4NaCgYKAV8SARASFQF4udJhgluu2OMnHtChGa1BW8oKuQ0163