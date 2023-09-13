'use strict';

module.exports = function(Sitter) {

    Sitter.findAll = async ( req, res ) => {
        try {

            let sitters = await Sitter.find({ 
                include: [
                    {
                        relation: 'rating',
                        scope: {
                            fields: ['id', 'rating']
                        },
                    },
                    {
                        relation: 'photo',
                        scope: {
                            fields: ['photoUrl'],
                            limit: 1
                        }
                    },
                    {
                        relation: 'city',
                        scope: {
                            include: {
                                relation: 'state'
                            }
                        }
                    }
                ]
            });


            sitters = sitters.map( ({ name , lastName, rating, photo, city }) => {

                const ratings = rating();

                const photos = photo();

                const total = ratings.reduce((sum,{ rating : value}) => sum + value, 0);
               
                const avg = rating.length ? Math.round( total / ratings.length ) : 0;

                const { name : cityName } = city() || { };

                const { name : state } = city()?.state() || { };
                
                return { 
                    city: cityName ? cityName : '',
                    state: state ? state : '',
                    photoUrl: photos.length ? photos[0].photoUrl : null,
                    name: `${name} ${lastName}`,
                    rating: avg,
                };

            });

            res.status(200).send(sitters);

        } catch (err) {
            console.log(err);
            res.status( 404 ).send([]);
        }
    };

    Sitter.add = async(req, res) => {
        try {
            const { body } = req;

            const sitter = await Sitter.create(body);

            res.status( 201 ).send(sitter);

        } catch ( err ) {
          
            res.status( 401 ).send({error: err});
        }
    };

    Sitter.filterByCity = async (req, res) => {
        try {

            const { city, name } = req.query;

            if ( !name && !city ) {
                res.status(400).send({ message: 'Query params were not provided' });
                return;
            }

            let query;

            if ( city && name ) {
                query = {
                    where: { name : { like : `${name}%`}},
                    include: {
                        relation: 'city',
                        scope: {
                            where: { name : { like: `${city}%` } }
                        }
                    }
                };
            }

           if ( city && !name ) {
                query = {
                    include: {
                        relation: 'city',
                        scope: {
                            where: { name : { like: `${city}%`}}
                        }
                    }
                };
           }

           if ( name && !city ) {
                query = {
                    where: { name : { like : `${name}%`}},
                };
           }
        
           let sitters = await Sitter.find( query );

           sitters =  !city ? sitters : sitters.filter(sitter => sitter.city());

            res.status( 200 ).send( sitters );

        } catch( err ) {
           c
            res.status(500).send({ error: err });
        }
    };

    Sitter.getComments = async (req, res) => {
        try {

            const { id } = req.query;

            if ( !id ) {
                res.status(404).send({message: 'id was not provided'});
                return;
            }

            const sitter = await Sitter.findOne({ 
                where: { id },
                include: {
                    relation: 'rating',
                    scope: {
                        fields: ['id', 'comment', 'rating']
                    }
                }
            });

            const ratings = sitter.rating();

            const ratingTotal = ratings.reduce((sum, { rating: value }) => sum + value, 0);

            const avg = Math.round( ratingTotal / sitter.rating.length );

            res.status(200).send({ avg, comments: ratings});

        } catch( err ) {
            console.log(err);
        }
    };

    Sitter.remoteMethod('add', {
        http: {
            path: '/add',
            verb: 'post'
        },
        accepts: [
            {arg: 'req', type: 'object', http: { source: 'req' }},
            {arg: 'res', type: 'object', http: { source: 'res' }},
        ],
        returns: {
            arg: 'sitter',
            root: true,
            type: 'object'
        }
    });

    Sitter.remoteMethod('findAll', {
        http: {
            path: '/findAll',
            verb: 'get'
        },
        accepts: [
            {arg: 'req', type: 'object', http: { source: 'req' }},
            {arg: 'res', type: 'object', http: { source: 'res' }},
        ],
        returns: {
            arg: 'sitter',
            root: true,
            type: 'object'
        }
    });

    
    Sitter.remoteMethod('filterByCity', {
        http: {
            path: '/filterByCity',
            verb: 'get'
        },
        accepts: [
            {arg: 'req', type: 'object', http: { source: 'req' }},
            {arg: 'res', type: 'object', http: { source: 'res' }},
        ],
        returns: {
            arg: 'sitters',
            root: true,
            type: 'object'
        }
    });

    Sitter.remoteMethod('getComments', {
        http: {
            path: '/comments',
            verb: 'get'
        },
        accepts: [
            {arg: 'req', type: 'object', http: { source: 'req' }},
            {arg: 'res', type: 'object', http: { source: 'res' }},
        ],
        returns: {
            arg: 'sitter',
            root: true,
            type: 'object'
        }
    });

};
