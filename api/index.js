const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

console.log('Starting server...');

// Daily verses for April (dateLabel kept for reference but not displayed)
const aprilVerses = {
    '2025-04-01': { dateLabel: 'April 1', citation: 'Ephesians 4:1', text: '"Therefore I, the prisoner in the Lord, urge you to walk worthy of the calling you have received."' },
    '2025-04-02': { dateLabel: 'April 2', citation: 'Ephesians 4:2', text: '"bearing with one another in love,"' },
    '2025-04-03': { dateLabel: 'April 3', citation: 'Ephesians 4:3', text: '"making every effort to keep the unity of the Spirit through the bond of peace."' },
    '2025-04-04': { dateLabel: 'April 4', citation: 'Ephesians 4:12', text: '"to equip the saints for the work of ministry," (and to be equipped)' },
    '2025-04-05': { dateLabel: 'April 5', citation: 'Ephesians 4:13-14', text: '"until we all reach unity in the faith and in the knowledge of God’s Son, growing into maturity with a stature measured by Christ’s fullness. Then we will no longer be little children, tossed by the waves and blown around by every wind of teaching, by human cunning with cleverness in the techniques of deceit." "to reach unity in the faith, in the knowledge of God’s Son, growing into maturity"' },
    '2025-04-06': { dateLabel: 'April 6', citation: 'Ephesians 4:15', text: '"speaking the truth in love,"' },
    '2025-04-07': { dateLabel: 'April 7', citation: 'Ephesians 4:15', text: '"let us grow in every way into him who is the head—Christ."' },
    '2025-04-08': { dateLabel: 'April 8', citation: 'Ephesians 4:16', text: '"From him the whole body, fitted and knit together by every supporting ligament, promotes the growth of the body for building itself up in love by the proper working of each individual part." "build itself up in love"' },
    '2025-04-09': { dateLabel: 'April 9', citation: 'Ephesians 4:17', text: '"You should no longer walk as the Gentiles do, in the futility of their thoughts."' },
    '2025-04-10': { dateLabel: 'April 10', citation: 'Ephesians 4:19', text: '"They became callous and gave themselves over to promiscuity for the practice of every kind of impurity with a desire for more and more." "do not give in to promiscuity"' },
    '2025-04-11': { dateLabel: 'April 11', citation: 'Ephesians 4:20', text: '"But that is not how you came to know Christ," "know Christ"' },
    '2025-04-12': { dateLabel: 'April 12', citation: 'Ephesians 4:21', text: '"assuming you heard about him and were taught by him, as the truth is in Jesus" "be taught by him"' },
    '2025-04-13': { dateLabel: 'April 13', citation: 'Ephesians 4:22', text: '"take off your former way of life, the old self that is corrupted by deceitful desires,"' },
    '2025-04-14': { dateLabel: 'April 14', citation: 'Ephesians 4:23', text: '"be renewed in the spirit of your minds,"' },
    '2025-04-15': { dateLabel: 'April 15', citation: 'Ephesians 4:24', text: '"put on the new self, the one created according to God’s likeness in righteousness and purity of the truth."' },
    '2025-04-16': { dateLabel: 'April 16', citation: 'Ephesians 4:25', text: '"putting away lying,"' },
    '2025-04-17': { dateLabel: 'April 17', citation: 'Ephesians 4:25', text: '"speak the truth, each one to his neighbor,"' },
    '2025-04-18': { dateLabel: 'April 18', citation: 'Ephesians 4:26', text: '"Be angry and do not sin;"' },
    '2025-04-19': { dateLabel: 'April 19', citation: 'Ephesians 4:26', text: '"don’t let the sun go down on your anger,"' },
    '2025-04-20': { dateLabel: 'April 20', citation: 'Ephesians 4:27', text: '"don’t give the devil an opportunity."' },
    '2025-04-21': { dateLabel: 'April 21', citation: 'Ephesians 4:28', text: '"Let the thief no longer steal."' },
    '2025-04-22': { dateLabel: 'April 22', citation: 'Ephesians 4:28', text: '"do honest work with his own hands,"' },
    '2025-04-23': { dateLabel: 'April 23', citation: 'Ephesians 4:29', text: '"No foul language should come from your mouth,"' },
    '2025-04-24': { dateLabel: 'April 24', citation: 'Ephesians 4:29', text: '"only what is good for building up someone in need,"' },
    '2025-04-25': { dateLabel: 'April 25', citation: 'Ephesians 4:30', text: '"don’t grieve God’s Holy Spirit,"' },
    '2025-04-26': { dateLabel: 'April 26', citation: 'Ephesians 4:31', text: '"Let all bitterness, anger and wrath,... be removed from you,"' },
    '2025-04-27': { dateLabel: 'April 27', citation: 'Ephesians 4:31', text: '"Let all …, shouting and slander be removed from you,"' },
    '2025-04-28': { dateLabel: 'April 28', citation: 'Ephesians 4:31', text: '"along with all malice."' },
    '2025-04-29': { dateLabel: 'April 29', citation: 'Ephesians 4:32', text: '"be kind and compassionate to one another,"' },
    '2025-04-30': { dateLabel: 'April 30', citation: 'Ephesians 4:32', text: '"forgiving one another, just as God also forgave you in Christ."' }
};

// Function to get current date in CST
function getCSTDate() {
    const now = new Date();
    // Adjust for CDT (UTC-5, since April is in Daylight Saving Time)
    const cstOffset = -5 * 60; // CDT is UTC-5
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const cstDate = new Date(utc + (cstOffset * 60000));
    return cstDate;
}

// Function to get verse data based on date
function getVerseData() {
    const cstDate = getCSTDate();
    const currentHour = cstDate.getHours();
    let dateKey;

    console.log(`Current CST Date: ${cstDate.toISOString()}`);
    console.log(`Current Hour: ${currentHour}`);

    // Update at 2 AM CST: if before 2 AM, use previous day
    if (currentHour < 2) {
        cstDate.setDate(cstDate.getDate() - 1);
        console.log(`Adjusted to previous day: ${cstDate.toISOString()}`);
    }

    dateKey = cstDate.toISOString().split('T')[0];
    console.log(`Date Key: ${dateKey}`);

    // Get verse for the current day, default to April 1 if not found
    const verseData = aprilVerses[dateKey] || aprilVerses['2025-04-01'];
    console.log(`Selected Verse: ${verseData.dateLabel}: ${verseData.citation}`);

    return verseData;
}

// Route to serve verse data as JSON (for client-side fallback)
app.get('/api/get-verse', (req, res) => {
    const verseData = getVerseData();
    res.json(verseData);
});

// Route to serve the HTML with dynamic verse
app.get('/', (req, res) => {
    const verseData = getVerseData();
    const verseHtml = `<h1>${verseData.citation}</h1><p>${verseData.text}</p>`;

    // Read the HTML file and replace the placeholder
    fs.readFile(path.join(__dirname, '..', 'index.html'), 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading index.html: ${err}`);
            return res.status(500).send('Server error');
        }
        const updatedHtml = data.replace('{{VERSE_HERE}}', verseHtml);
        if (!updatedHtml.includes(verseHtml)) {
            console.error('Placeholder not found or not replaced in index.html');
        }
        res.send(updatedHtml);
    });
});

// Export the Express app (for Vercel)
module.exports = app;
