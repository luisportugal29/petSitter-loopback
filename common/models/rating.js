'use strict';

module.exports = function(Rating) {

    Rating.getLastComments = async(req, res) => {
        try {

            const ratings = await Rating.find({
                where: { rating: 5 },
                order: 'created_at desc',
                limit: 5
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
