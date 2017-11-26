const fs = require('fs');
const path = require('path');
const program = require('commander');
const api = require('./api');

program
    .on('--help', () => {
        console.log('');
        console.log('  Example:');
        console.log('');
        console.log('    $ node main.js -e email@email.com -p password');
        console.log('');
    })
    .option('-e, --email <email>', 'Email')
    .option('-p, --password <password>', 'Password')
    .parse(process.argv);

if (!program.email || !program.password) {
    console.log('Wrong usage, run --help to see how to use this.');
    process.exit(1);
}

api.login(program.email, program.password).then(() => {
    api.loadAllActivities().then((activities) => {
        const data = JSON.stringify(activities, null, 2);
        fs.writeFileSync(path.join(__dirname, 'activities.json'), data);
    });
});
