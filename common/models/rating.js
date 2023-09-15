'use strict';
const { differenceInYears } = require('date-fns');

module.exports = function(Rating) {

    Rating.getLastComments = async(req, res) => {
        try {

            let ratings = await Rating.find({
                where: { rating: 5 },
                fields: ['id', 'rating','comment','user_id'],
                order: 'created_at desc',
                limit: 5,
                include: {
                    relation: 'customuser',
                }
            });

            ratings = ratings.map( ({id, rating, comment, customuser}) => {
                const { name, birthDate} = customuser();

                return { id, rating, comment, name, age: differenceInYears(new Date(), birthDate)};
            });
            
            res.status(200).send(ratings);

        } catch( err ) {
            console.log(err)
            res.status(500).send({message: 'A nasty error just happened'});
        }
    };

    Rating.remoteMethod('getLastComments', {
        http: {
            path: '/lastcomments',
            verb: 'get'
        },
        accepts: [
         {arg: 'req', type: 'object', http: { source: 'req' }},
         {arg: 'res', type: 'object', http: { source: 'res' }},
        ],
        returns: {
            arg: 'rating',
            root: true,
            type: 'object'
        }
    });

};
