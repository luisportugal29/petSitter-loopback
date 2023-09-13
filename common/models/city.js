'use strict';

module.exports = function(City) {

    City.add = async(req, res) => {
        try {

            const { body } = req;

            const city = await City.create(body);

            res.status(201).send(city);

        } catch( err ) {
            res.send( err );
        }
    };

    City.findAll = async(req, res) => {
        try {

            const cities = await City.find();

            res.status(200).send(cities);

        } catch( err ) {
            res.send( err );
        }
    };

    City.remoteMethod('add', {
        http: {
            path: '/add',
            verb: 'post'
        },
        accepts: [
            {arg: 'req', type: 'object', http: { source: 'req' }},
            {arg: 'res', type: 'object', http: { source: 'res' }},
        ],
        returns: {
            arg: 'city',
            root: true,
            type: 'object'
        }
    });

    City.remoteMethod('findAll', {
        http: {
            path: '/findAll',
            verb: 'get'
        },
        accepts: [
            {arg: 'req', type: 'object', http: { source: 'req' }},
            {arg: 'res', type: 'object', http: { source: 'res' }},
        ],
        returns: {
            arg: 'cities',
            root: true,
            type: 'array'
        }
    });
};
