const json2csv = require('json2csv');
const fs = require('fs');
const path = require('path');

const data = fs.readFileSync(path.join(__dirname, 'output/activities_sanitized.json'));
const activities = JSON.parse(data);
const csv = json2csv({ data: activities, fields: Object.keys(activities[0]) });
fs.writeFileSync(path.join(__dirname, 'output/activities.csv'), csv);
