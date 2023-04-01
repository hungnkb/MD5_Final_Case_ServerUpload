import express, { Router } from "express";
import passport from "passport";
import dotenv from 'dotenv';
import GoogleStrategy from 'passport-google-oauth20'
dotenv.config();

const router = express.Router();

const CLIENT_URL = "http://localhost:3000";

let { rToken, aToken, dataUser } = '';

router.get("/login/success", (req, res) => {
    if (rToken && aToken && dataUser) {
        res.status(200).json({ 
            rToken, aToken, dataUser
        });
    }
       
});

router.get("/login/failed", (req, res) => {
    res.status(401).json({
        success: false,
        message: "failure",
    });
});

router.get("/logout", (req, res) => {
    req.logout();
    res.redirect(CLIENT_URL);
});

router.get("/google", passport.authenticate("google", { scope: ["profile", 'https://www.googleapis.com/auth/youtube.upload', "https://www.googleapis.com/auth/youtube.force-ssl", "https://www.googleapis.com/auth/youtube"], accessType: 'offline' }));

router.get(
    "/google/callback",
    passport.authenticate("google", {
        successRedirect: CLIENT_URL,
        failureRedirect: "/login/failed",
        session: false
    })
);
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    callbackURL: '/auth/google/callback '
}, function (accessToken, refreshToken, profile, done) {
    rToken = refreshToken; aToken = accessToken; dataUser = profile;
    done(null, profile, accessToken, refreshToken);
}))

export default router;
