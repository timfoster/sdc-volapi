/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 * Copyright (c) 2017, Joyent, Inc.
 */

var assert = require('assert-plus');

var errors = require('../errors');
var volumesModel = require('../models/volumes');

function loadVolumeObject(req, res, next) {
    assert.object(req, 'req');
    assert.object(req.params, 'req.params');
    assert.uuid(req.params.uuid, 'req.params.uuid');
    assert.optionalUuid(req.params.owner_uuid, 'req.params.owner_uuid');
    assert.object(res, 'res');
    assert.func(next, 'next');

    var volumeUuid = req.params.uuid;
    var ownerUuid = req.params.owner_uuid;

    req.log.debug({uuid: volumeUuid}, 'Loading volume');

    volumesModel.loadVolume(volumeUuid,
        function onVolumesLoaded(err, volumeObject) {
            if (err) {
                req.log.error({err: err},
                    'Error when loading volume object from moray');
                err = new errors.VolumeNotFoundError(volumeUuid);
            }

            if (!volumeObject) {
                err = new errors.VolumeNotFoundError(volumeUuid);
            } else {
                assert.object(volumeObject.value, 'volumeObject.value');

                if (ownerUuid !== undefined &&
                    volumeObject.value.owner_uuid !== ownerUuid) {
                    err = new errors.VolumeNotFoundError(volumeUuid);
                } else {
                    req.loadedVolumeObject = volumeObject;
                }
            }

            next(err);
        });
}

module.exports = {
    loadVolumeObject: loadVolumeObject
};