const {_} = require("./node_modules/underscore/underscore.js");
const { getPolarFunction } = require("./polar.js");


module.exports = function (app) {
    var plugin = {};

    plugin.id = 'singalk-polars-kraivio';
    plugin.name = 'Polars';
    plugin.description = 'Plugin that does stuff';

    plugin.publishDeltas = function (polarSpeed, polarPercentage) {
        app.handleMessage(plugin.id, {
            updates: [
                {
                    values: [
                        {
                            path: "performance.polarSpeedRatio",
                            value: polarPercentage
                        },
                        {
                            path: "performance.polarSpeed",
                            value: polarSpeed
                        }
                    ]
                }
            ]
        })
    }

    let currentState = {
        "navigation.speedOverGround": null,
        "environment.wind.speedTrue": null,
        "environment.wind.angleTrueWater": null
    }

    const programmerFriendlyKeys = (state) => (
        {
            boatSpeed: state["navigation.speedOverGround"],
            windSpeed: state["environment.wind.speedTrue"],
            windAngle: state["environment.wind.angleTrueWater"]
        }
    )


    const onDelta = (delta, polarCalculator) => {
        delta.values.forEach(delta => {
            if (delta.path in currentState) {
                currentState[delta.path] = delta.value;
            }
        })

        propagateIfAllValuesPresent(programmerFriendlyKeys(currentState), state => calculatePolar(state, polarCalculator))
    }

    const propagateIfAllValuesPresent = (state, callback) => {
        const allValuesPresent = _.all(Object.values(state).map(x => x !== null));
        if (allValuesPresent) {
            callback(state);
        }
    }

    const calculatePolar = ({boatSpeed, windSpeed, windAngle}, polarCalculator) => {
        app.debug(boatSpeed, windSpeed, windAngle);
        const polarSpeed = polarCalculator(windSpeed, Math.abs(windAngle / Math.PI * 360));

        plugin.publishDeltas(polarSpeed, boatSpeed / polarSpeed)
    }

    let unsubscribes = [];

    plugin.start = function (options, restartPlugin) {
        const localSubscription = {
            context: "self",
            subscribe: Object.keys(currentState).map(path => ({
                path,
                period: 1000
            }))
        }

        app.debug(options)
        const polarCalculator = getPolarFunction(options.path_to_polar)

        app.subscriptionmanager.subscribe(
            localSubscription,
            unsubscribes,
            subscriptionEerror => app.error("Error: " + subscriptionEerror),
            delta => {
                delta.updates.forEach(update => onDelta(update, polarCalculator))
            }
        )
    };

    plugin.stop = function () {
        // Here we put logic we need when the plugin stops
        app.debug('Plugin stopped');
        unsubscribes.forEach(f => f());
        unsubscribes = [];
    };

    plugin.schema = {
        type: "object",
        required: ["path_to_polar"],
        properties: {
            path_to_polar: {
                type: "string",
                title: "Path to the .csv file containing the polar information",
                default: "~/.signalk/resources/polars/polar.csv"
            }
        }
    };

    return plugin;
};