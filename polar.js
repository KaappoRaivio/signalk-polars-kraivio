const fs = require("fs");


exports.getPolarFunction = path => {
    const polarFile = fs.readFileSync(path, "utf-8");
    const polarRows = polarFile.split("\n");

    const separator = /[;,]{1}/;

    const rawPolarData = polarRows.slice(1).map(row => row.trim().split(separator).slice(1));

    const definedWindSpeeds = polarRows[0].trim().split(separator).slice(1).concat("0");
    const definedWindAngles = polarRows.map(row => row.trim().split(separator)[0]).slice(1);

    const polar = {};
    definedWindSpeeds.forEach(speed => polar[speed] = {})

    for (let y = 0; y < definedWindSpeeds.length; y++) {
        for (let x = 0; x < definedWindAngles.length; x++) {
            polar[definedWindSpeeds[y]][definedWindAngles[x]] = rawPolarData[x][y] || 0;
        }
    }

    return (windSpeed, windAngle) => {
        const sortedSpeeds = definedWindSpeeds.concat().sort((a, b) => a - b);
        const sortedAngles = definedWindAngles.concat().sort((a, b) => a - b);

        const closestWindSpeeds = {
            upper: getClosest("up")(sortedSpeeds, windSpeed),
            lower: getClosest("down")(sortedSpeeds, windSpeed)
        };

        const closestWindAngles = {
            upper: getClosest("up")(sortedAngles, windAngle),
            lower: getClosest("down")(sortedAngles, windAngle)
        };

        const speedPercentage = (windSpeed - closestWindSpeeds.lower)
            / (closestWindSpeeds.upper - closestWindSpeeds.lower);

        const anglePercentage = (windAngle - closestWindAngles.lower)
            / (closestWindAngles.upper - closestWindAngles.lower);


        const polarSpeedMatrix = {
            upperAngle: {
                upperSpeed: polar[closestWindSpeeds.upper][closestWindAngles.upper],
                lowerSpeed: polar[closestWindSpeeds.lower][closestWindAngles.upper]
            },
            lowerAngle: {
                upperSpeed: polar[closestWindSpeeds.upper][closestWindAngles.lower],
                lowerSpeed: polar[closestWindSpeeds.lower][closestWindAngles.lower]
            }
        }
        const polarSpeedAngles = {
            upperAngle: polarSpeedMatrix.upperAngle.upperSpeed * speedPercentage
                + polarSpeedMatrix.upperAngle.lowerSpeed * (1 - speedPercentage),
            lowerAngle: polarSpeedMatrix.lowerAngle.upperSpeed * speedPercentage
                + polarSpeedMatrix.lowerAngle.lowerSpeed * (1 - speedPercentage)
        }
        // console.log(polarSpeedMatrix, speedPercentage, anglePercentage)

        return polarSpeedAngles.lowerAngle * (1 - anglePercentage)
            + polarSpeedAngles.upperAngle * anglePercentage
    }
}

const getClosest = (direction) => (values, value) => values.reduce((accumulator, current) => {
    if (direction === "up")
        if (current >= value && accumulator < value) {
            return current;
        } else {
            return accumulator;
        }
    else if (direction === "down") {
        if (current < value && accumulator < value) {
            return current;
        } else {
            return accumulator;
        }
    }
})
