'use strict';
const auth = require('../../server/middleware/auth');

module.exports = function(Sitter) {

    //protected route handlers
    //Sitter.beforeRemote('findAll', (ctx, _, next) => auth(ctx.req, ctx.res, next) );
    //Sitter.beforeRemote('filterBy', (ctx, _ , next) => auth(ctx.req, ctx.res, next));
    Sitter.beforeRemote('add', (ctx, _ , next) => auth(ctx.req, ctx.res, next));
    //Sitter.beforeRemote('getComments', (ctx, _ , next) => auth(ctx.req, ctx.res, next));

    const executeQuery = (query, params) => new Promise((resolve, reject ) => {
        Sitter.dataSource.connector.query(query, params, (err, data) => {
            if ( !err)
                return resolve(data);
            reject(err);
        });
    }) 


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


            sitters = sitters.map( ({ name ,  id, lastName, rating, photo, city }) => {

                const ratings = rating();

                const photos = photo();

                const total = ratings.reduce((sum,{ rating : value}) => sum + value, 0);
               
                const avg = rating.length ? Math.round( total / ratings.length ) : 0;

                const { name : cityName } = city() || { };

                const { name : state } = city()?.state() || { };
                
                return { 
                    id,
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


    Sitter.filterBy = async (req, res) => {
        try {

            const { city, name } = req.query;

            if ( !name && !city ) {
                res.status(400).send({ message: 'Query params were not provided' });
                return;
            }

            let query = `SELECT s.id,s.name, s.lastName, c.name as city, st.name as state, 
                round(avg (r.rating)) as rating FROM SITTERS s
                INNER JOIN CITIES c on c.id = s.city_id
                INNER JOIN STATES st on st.id = c.state_id
                INNER JOIN RATINGS r on r.sitter_id = s.id
                WHERE s.name like ? AND c.name like ?
                GROUP BY s.id
                ORDER BY s.name`;

            const sitters = await executeQuery(query, [`${name ? name : ''}%`, `${city ? city : ''}%`]); 

            res.status( 200 ).send( sitters );

        } catch( err ) {
            console.log(err)
            res.status(500).send({ error: err });
        }
    };

    Sitter.findSitter = async (req, res) => {
        try {

            const { id } = req.query;

            let query = `SELECT concat(s.name, ' ',s.lastName) as name, 
            s.description, 
            c.name as city,
            round(avg(r.rating)) as rating,
            group_concat(sk.description) as skills,
            group_concat(ph.photoUrl) as photos
            FROM SITTERS s
            INNER JOIN CITIES c on c.id = s.city_id
            INNER JOIN SKILLS sk on sk.sitter_id = s.id
            INNER JOIN PHOTOS ph on ph.sitter_id = s.id
            INNER JOIN RATINGS r on r.sitter_id = s.id
            WHERE s.id = ?
            GROUP BY s.id`;

            let sitter = await executeQuery(query, [id]);
            sitter = sitter[0];

            query = `SELECT r.id,
            r.comment, 
            r.created_at as date,
            u.address as location, 
            u.name,
            u.photoUrl 
            FROM RATINGS r
            INNER JOIN USERS u on u.id = r.user_id
            WHERE r.sitter_id = ?`;

            const comments = await executeQuery(query, [id]);
            
            sitter = {
                ...sitter,
                skills : sitter.skills.split(','),
                photos: sitter.photos.split(','),
                comments
            };

            res.status(200).send(sitter);

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

    Sitter.remoteMethod('filterBy', {
        http: {
            path: '/filterBy',
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

    Sitter.remoteMethod('findSitter', {
        http: {
            path: '/findsitter',
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