const fs = require('fs');
const path = require('path');
const flatten = require('flat');
const _ = require('lodash');

const data = fs.readFileSync(path.join(__dirname, 'output/activities.json'));

const json = JSON.parse(data);

const keys = [
    'activityId',
    'activityName',
    'activityType.key',
    'activitySummary.WeightedMeanMovingSpeed.value',
    'activitySummary.WeightedMeanMovingPace.value',
    'activitySummary.MaxHeartRate.value',
    'activitySummary.WeightedMeanHeartRate.value',
    'activitySummary.WeightedMeanHeartRate.percentMax.value',
    'activitySummary.WeightedMeanHeartRate.zones.value',
    'activitySummary.MaxSpeed.value',
    'activitySummary.MaxPace.value',
    'activitySummary.SumEnergy.value',
    'activitySummary.MaxRunCadence.value',
    'activitySummary.SumElapsedDuration.value',
    'activitySummary.WeightedMeanRunCadence.value',
    'activitySummary.SumMovingDuration.value',
    'activitySummary.WeightedMeanSpeed.value',
    'activitySummary.WeightedMeanPace.value',
    'activitySummary.SumDuration.value',
    'activitySummary.SumDistance.value',
    'activitySummary.MinHeartRate.value',
    'activitySummary.SumStep.value',
    'activitySummary.BeginTimestamp.value',
    'activitySummary.EndTimestamp.value',
    'activitySummary.MaxVerticalSpeed.value',
    'activitySummary.WeightedMeanStrideLength.value',
    'activitySummary.MaxElevation.value',
    'activitySummary.SumTrainingEffect.value',
    'activitySummary.DirectVO2Max.value',
];

const keyRenameMapping = {
    activityId: 'Activity ID',
    activityName: 'Activity name',
    'activityType.key': 'Activity key',
    'activitySummary.*': (key) => {
        const [, property] = key.split('.');
        return property.replace(/([A-Z])/g, ' $1').trim();
    },
};

const valueTransformMapping = {
};

function transformValue(key, val) {
    const transformation = Object.keys(valueTransformMapping).find(k => k === key);
    if (transformation) {
        return transformation(val);
    }
    return val;
}

function sanitizeKey(key) {
    const mappingKey = Object.keys(keyRenameMapping).find((k) => {
        const r = new RegExp(k);
        return r.test(key);
    });
    const mapping = keyRenameMapping[mappingKey];
    if (mapping) {
        return _.isFunction(mapping) ? mapping(key) : mapping;
    }
    return key;
}

const sanitized = json.map((a) => {
    const { activity } = a;
    const flat = flatten(activity);
    const filtered = Object.keys(flat).reduce((acc, k) => {
        if (!keys.includes(k)) {
            return acc;
        }
        return {
            ...acc,
            [sanitizeKey(k)]: transformValue(k, flat[k]),
        };
    }, {});
    return filtered;
});

fs.writeFileSync(path.join(__dirname, 'output/activities_sanitized.json'), JSON.stringify(sanitized, null, 2));
