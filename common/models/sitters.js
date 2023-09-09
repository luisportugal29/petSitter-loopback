'use strict';

module.exports = function(Sitters) {

    Sitters.findById = function(id, cb) {

        console.log(`id: ${id}`);

        cb(null, 'Hello from the sitters controller');
    };

    Sitters.remoteMethod('findById', {
        http: {
            path: '/:id',
            verb: 'get',
        },
        accepts: {
            arg: 'id',
            type: 'string',
            required: true,
            http: {
                source: 'path',
            }
        },
        returns: {
            arg: 'sitter',
            type: 'string',
        }
    });
};
