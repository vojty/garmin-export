const request = require('request-promise');
const qs = require('querystring');
const _ = require('lodash');
// https://github.com/JakePartusch/garmin-node-api/blob/master/index.js


// API INFO http://sergeykrasnov.ru/subsites/dev/garmin-connect-statisics/

const theJar = request.jar();
const rq = request.defaults({ jar: theJar });

const BATCH_SIZE = 50;

const requestQuery = qs.stringify({
    service: 'https://connect.garmin.com/post-auth/login',
    clientId: 'GarminConnect',
    gauthHost: 'https://sso.garmin.com/sso',
    consumeServiceTicket: 'false',
});
const uri = `https://sso.garmin.com/sso/login?${requestQuery}`;

function login(username, password) {
    const loginQuery = {
        username,
        password,
        embed: 'false',
    };
    console.log('Logging to GarminConnect...');
    return rq({
        method: 'POST',
        uri,
        form: loginQuery,
        resolveWithFullResponse: true,
    })
        .then((response) => {
            if (!response.body.includes('Login Successful')) {
                throw new Error('Unauthorized - wrong username or password');
            }

            // https://github.com/petergardfjall/garminexport/blob/master/garminexport/garminclient.py#L129
            console.log('Getting legacy session...');
            return rq('https://connect.garmin.com/legacy/session');
        });
}

function getActivities(query = {}) {
    console.log(`Getting activities ${JSON.stringify(query)}...`);
    return rq({
        uri: 'https://connect.garmin.com/proxy/activity-search-service-1.2/json/activities',
        qs: query,
        json: true,
    });
}

function unwrapActivities(response) {
    const { activities } = response.results;
    return activities;
}

function loadAllActivities() {
    console.log('Loading all activities...');
    return getActivities({ start: 0, limit: BATCH_SIZE }).then((response) => {
        const { totalFound, currentPage, totalPages } = response.results;
        console.log(`Total found ${totalFound}`);
        const firstPage = Promise.resolve(unwrapActivities(response));

        let nextPages = [];
        if (currentPage < totalPages) {
            nextPages = _.range(currentPage, totalPages)
                .map(page => getActivities({ start: page * BATCH_SIZE, limit: BATCH_SIZE })
                    .then(r => unwrapActivities(r)));
        }

        return Promise.all([
            firstPage,
            ...nextPages,
        ]).then(results => _.flatten(results));
    });
}

module.exports = {
    login,
    loadAllActivities,
};
