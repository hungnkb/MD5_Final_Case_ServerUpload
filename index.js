import dotenv from 'dotenv'
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
dotenv.config();

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

app.post('/upload', upload.single('file'), (req, res, next) => {
    try {
        const file = req.file
        if (!file) {
            const error = new Error('Please upload a file')
            error.httpStatusCode = 400
            return next(error)
        }
        res.send(file)
    } catch (e) {
        console.log(e);
    }
})

app.listen(port, () => {
    console.log(`Example app listening on http://localhost:${port}`)
})