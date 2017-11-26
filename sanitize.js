const fs = require('fs');
const path = require('path');

const data = fs.readFileSync(path.join(__dirname, 'activities.json'));

const json = JSON.parse(data);

const keys = [
    'activityId',
    'activityName',
    'displayname',
    'activityType',
    'activitySummary',
];

const sanitized = json.map((a) => {
    const { activity } = a;
    return Object.keys(activity).reduce((acc, key) => {
        if (keys.includes(key)) {
            return {
                ...acc,
                [key]: activity[key],
            };
        }
        return acc;
    }, {});
});

fs.writeFileSync(path.join(__dirname, '/activities_sanitized.json'), JSON.stringify(sanitized, null, 2));
