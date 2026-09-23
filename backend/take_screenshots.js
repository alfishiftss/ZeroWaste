const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './.env' });
const fs = require('fs');
const path = require('path');

const delay = ms => new Promise(res => setTimeout(res, ms));

async function run() {
    console.log("Connecting to DB...");
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    const users = db.collection('users');

    // Reset passwords for known accounts
    const plainPass = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(plainPass, salt);

    await users.updateOne({ email: 'admin@zerowaste.com' }, { $set: { password: hash } });
    await users.updateOne({ email: 'cafe@test.com' }, { $set: { password: hash } });
    await users.updateOne({ email: 'user@gmail.com' }, { $set: { password: hash } });
    console.log("Passwords updated.");

    console.log("Launching Puppeteer...");
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const screenshotsDir = path.join(__dirname, '../screenshots');
    if (!fs.existsSync(screenshotsDir)){
        fs.mkdirSync(screenshotsDir);
    }

    const takeScreenshot = async (name) => {
        const filePath = path.join(screenshotsDir, `${name}.png`);
        await page.screenshot({ path: filePath, fullPage: true });
        console.log(`Saved ${name}.png`);
    };

    const login = async (email) => {
        console.log(`Logging in as ${email}...`);
        await page.goto('http://localhost:3000/login');
        await page.waitForSelector('input[name="email"]');
        await page.type('input[name="email"]', email);
        await page.type('input[name="password"]', plainPass);
        await page.click('button[type="submit"]');
        await delay(2000); 
    };

    const logout = async () => {
        console.log("Logging out...");
        await page.click('.nav-logout-btn');
        await delay(1000);
    };

    try {
        await page.goto('http://localhost:3000/register');
        await delay(1000);
        await takeScreenshot('register_page');

        // Admin Flow
        await login('admin@zerowaste.com');
        await page.goto('http://localhost:3000/admin');
        await delay(1500);
        await takeScreenshot('admin_dashboard');
        
        await page.goto('http://localhost:3000/admin/moderation');
        await delay(1500);
        await takeScreenshot('admin_moderation');
        await logout();

        // Business Flow
        await login('cafe@test.com');
        await page.goto('http://localhost:3000/business/listings');
        await delay(1500);
        await takeScreenshot('business_dashboard');
        await logout();

        // Consumer Flow
        await login('user@gmail.com');
        await page.goto('http://localhost:3000/');
        await delay(2000);
        await takeScreenshot('consumer_home_feed');
        
        await page.goto('http://localhost:3000/dashboard');
        await delay(1500);
        await takeScreenshot('consumer_dashboard');
        
        await page.goto('http://localhost:3000/profile');
        await delay(1500);
        await takeScreenshot('profile_management');
        await logout();

    } catch (e) {
        console.error("Error during puppeteer execution:", e);
    }

    await browser.close();
    await mongoose.disconnect();
    console.log("Done!");
}

run();
