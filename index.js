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
import { google } from 'googleapis'
import open from 'open';
import axios from 'axios';
import fs from 'fs';
import { log } from 'console';

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
        // let upload = await axios({
        //     method: 'post',
        //     url: 'https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=104286973343247449036&alt=json&key=AIzaSyAzX4Zxax8MpYca5e7eDKChHYo83Ec2ApI',
        //     headers:
        //         { 'Content-Type': 'video/mp4', Accept: 'video/mp4', Authorization: 'Bearer ya29.a0Ael9sCPoyQKQs-An3iDJy1yZnaCZ-Ri7Fd1Umb-9_Uf0AiFQrRrnApVzUdZ8Svwfo6rEQHoo3tti9419btn1OeyoW7JI2K6KywE4Hb5OzqEWJadj9kz2ra87mOLRDkAJI1IZAN5NUzC_L51ZNLsS3Ydrmk0eaCgYKAb4SARASFQF4udJhObQpYWX6WW5Gs9DLUkeyaQ0163' },
        //     snippet: {
        //         title,
        //         description,
        //         tags: [tags],
        //         defaultLanguage: 'en',
        //         categoryId: 22

        //     },
        //     status: {
        //         privacyStatus: "public",
        //         madeForKids: false,
        //     },
        //     fileDetails: {
        //         fileName:  file.originalname,
        //         fileType: 'video'
        //     },
        //     items: [{
        //         media: {
        //             body: file
        //         }
        //     }]
        // })


        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_OAUTH_CLIENT_ID,
            process.env.GOOGLE_OAUTH_CLIENT_SECRET,
            process.env.GOOGLE_OAUTH_REDIRECT
        )
        oauth2Client.setCredentials({ refresh_token: '1//0exN1kk_LpvdqCgYIARAAGA4SNwF-L9Irb9cw9dKwKAWjVva1t6pT6yTspAm07yZY0Ugaqri81tcX0tQO6IZItUupW4vKDeu8VD4' })
        const youtube = google.youtube({
            version: 'v3',
            auth: oauth2Client
        })

        const response = await youtube.videos.insert(
            {
                part: 'snippet, status',
                requestBody: {
                    snippet: {
                        title,
                        description,
                        tags: [tags],
                        defaultLanguage: 'en',
                        categoryId: 22,
                    },
                    status: {
                        privacyStatus: "public",
                        madeForKids: false,
                    },
                },
                media: {
                    body: fs.createReadStream(req.file.path)
                }
            },
            (err, data) => {
                if (err) {
                    console.log(err);
                }
                console.log('done ' + data);
                res.send(data)
            }
        )
        // youtube.insert(
        //     {
        //         resource: {
        //             snippet: {
        //                 title,
        //                 description,
        //                 tags: [tags],
        //                 defaultLanguage: 'en',
        //                 categoryId: 22

        //             },
        //             status: {
        //                 privacyStatus: "public",
        //                 madeForKids: false,
        //             },
        //         },
        //         part: 'snippet,status',
        //         media: {
        //             body: fs.createReadStream(req.file.path)
        //         }
        //     },
        //     (err, data) => {
        //         if (err) throw err;
        //         console.log("uploading video done");
        //         fs.unlinkSync(req.file.path)
        //         res.send('success')
        //     }
        // )
        // res.send(file)
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