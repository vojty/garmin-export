const fs = require('fs');
const path = require('path');
const flatten = require('flat');

const data = fs.readFileSync(path.join(__dirname, 'output/activities.json'));

const json = JSON.parse(data);

const dropKeysStarts = [
    'activitySummary.SumSample',
    'updatedDate',
    'uploadDate',
    'activitySummary.LossElevation',
    'activitySummary.GainElevation',
    'activityTimeZone',
    'eventType',
    'device',
    'activityDescription',
    'activityVideoUrl',
    'locationName',
    'isTitled',
    'isElevationCorrected',
    'isBarometricCapable',
    'isSwimAlgorithmCapable',
    'isVideoCapable',
    'isActivityEdited',
    'favorite',
    'ispr',
    'isAutoCalcCalories',
    'isParent',
    'parentId',
    'uploadApplication.display',
    'uploadApplication.key',
    'uploadApplication.version',
    'isDeviceReleased',
    'externalId',
    'privacy.display',
    'privacy.key',
    'privacy.fieldNameDisplay',
    'numTrackpoints',
    'totalLaps',
    'garminSwimAlgorithm',
    'userRoles',
    'activitySummary.GainUncorrectedElevation',
    'activitySummary.GainCorrectedElevation',
    'activitySummary.LossUncorrectedElevation',
    'activitySummary.EndLongitude',
    'activitySummary.MinRunCadence',
    'activitySummary.MinPace',
    'activitySummary.MaxDoubleCadence',
    'activitySummary.WeightedMeanDoubleCadence',
    'activitySummary.BeginLatitude',
    'activitySummary.MinSpeed',
    'activitySummary.BeginLongitude',
    'activitySummary.MaxCorrectedElevation',
    'activitySummary.MaxUncorrectedElevation',
    'activitySummary.MinUncorrectedElevation',
    'activitySummary.LossCorrectedElevation',
    'activitySummary.MinAirTemperature',
    'activitySummary.MaxFractionalCadence',
    'activitySummary.WeightedMeanFractionalCadence',
    'activitySummary.MaxAirTemperature',
    'activitySummary.EndLatitude',
    'activitySummary.WeightedMeanAirTemperature',
    'activitySummary.MinElevation',
    'localizedSpeedLabel',
    'localizedPaceLabel',
    'activityType.parent',
    'userId',
    'username',
    'activityType.fieldNameDisplay',
    'activityType.display',
    'displayname',
    'activitySummary.MaxHeartRate.percentMax',
];

const dropKeysEnds = [
    'fieldDisplayName',
    'display',
    'displayUnit',
    'withUnit',
    'unitAbbr',
    'withUnitAbbr',
];

function isDroppingKey(key) {
    return dropKeysStarts.some(d => key.startsWith(d)) ||
        dropKeysEnds.some(d => key.endsWith(d));
}

function sanitizeKey(key) {
    return key.replace(/^activitySummary\./, '');
}

const sanitized = json.map((a) => {
    const { activity } = a;
    const flat = flatten(activity);
    const filtered = Object.keys(flat).reduce((acc, k) => {
        if (isDroppingKey(k)) {
            return acc;
        }
        return {
            ...acc,
            [sanitizeKey(k)]: flat[k],
        };
    }, {});
    return filtered;
});

fs.writeFileSync(path.join(__dirname, 'output/activities_sanitized.json'), JSON.stringify(sanitized, null, 2));
