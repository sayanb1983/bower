var semver = require('semver');
var mout = require('mout');

function minSatisfying(versions, range, strictMatch) {
    return getSatisfying(versions, range, strictMatch, true);
}

function maxSatisfying(versions, range, strictMatch) {
    return getSatisfying(versions, range, strictMatch, false);
}

function getSatisfying(versions, range, strictMatch, isMin) {
    var version;
    var filteredVersions;

    // Filter only valid versions, since semver.maxSatisfying() throws an error
    versions = versions.filter(function (version) {
        return semver.valid(version);
    });

    // Exact version & range match
    if (semver.valid(range)) {
        version = mout.array.find(versions, function (version) {
            return version === range;
        });
        if (version) {
            return version;
        }
    }

    range = typeof range === 'string' ? range.trim() : range;

    // When strict match is enabled give priority to non-pre-releases
    // We do this by filtering every pre-release version
    if (strictMatch) {
        filteredVersions = versions.map(function (version) {
            return !isPreRelease(version) ? version : null;
        });

        version = getSatisfyingVersion(filteredVersions, range, isMin);
        if (version) {
            return version;
        }
    }

    // Fallback to regular semver max satisfies
    return getSatisfyingVersion(versions, range, isMin);
}

function getSatisfyingVersion(versions, range, isMin) {
    if (isMin) {
        return semver.minSatisfying(versions, range);
    } else {
        return semver.maxSatisfying(versions, range);
    }
}

function maxSatisfyingIndex(versions, range, strictMatch) {
    var version = maxSatisfying(versions, range, strictMatch);

    if (!version) {
        return -1;
    }

    return versions.indexOf(version);
}

function minSatisfyingIndex(versions, range, strictMatch) {
    var version = minSatisfying(versions, range, strictMatch);

    if (!version) {
        return -1;
    }

    return versions.indexOf(version);
}

function clean(version) {
    var parsed = semver.parse(version);

    if (!parsed) {
        return null;
    }

    // Keep builds!
    return parsed.version + (parsed.build.length ? '+' + parsed.build.join('.') : '');
}

function isPreRelease(version) {
    var parsed = semver.parse(version);
    return parsed && parsed.prerelease && parsed.prerelease.length;
}

// Export a semver like object but with our custom functions
mout.object.mixIn(module.exports, semver, {
    maxSatisfying: maxSatisfying,
    maxSatisfyingIndex: maxSatisfyingIndex,
    minSatisfying: minSatisfying,
    minSatisfyingIndex: minSatisfyingIndex,
    clean: clean,
    valid: clean
});
