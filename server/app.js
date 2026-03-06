const express = require('express');
const fs = require('fs');
const app = express();

app.use((req, res, next) => {
    const agent = req.headers['user-agent'].replace(/,/g, ';');
    const logEntry = [
        agent,
        new Date().toISOString(),
        req.method,
        req.url,
        'HTTP/'+req.httpVersion,
        res.statusCode
    ].join(',')+ '\n';
    console.log(logEntry);
    fs.appendFile('log.csv', logEntry, (err) => {
        if (err) console.error('Error writing to log file:', err);
    });
    next();
});

app.get('/', (req, res) => {
    res.status(200).send('ok');
});

app.get('/logs', (req, res) => {
    fs.readFile('log.csv', 'utf8', (err, data) => {
        if (err) console.error('Error reading log file:', err);
        
        const rows = data.trim().split('\n').map(line => line.split(','));
        const headers = rows[0];
        const logEntries = rows.slice(1).map(row => {
            const entry = {};
            headers.forEach((header, i) => {
                entry[header] = row[i];
            });
            return entry;
        });
        res.json(logEntries);
    });
});

module.exports = app;
