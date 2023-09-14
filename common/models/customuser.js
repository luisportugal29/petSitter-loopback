'use strict';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = function(Customuser) {

    Customuser.signup = async(req, res) => {
        try {

            const { email, password } = req.body;

            let user = await Customuser.findOne({ where : { email }});

            if ( user ) {
                res.status(400).send({ message: 'email already in use' });
                return;
            }

            const hashedPassword = await bcrypt.hash(password, 8);
        
            user = await Customuser.create({...req.body, password : hashedPassword});

            res.status(201).send(user);

        } catch( error ) {
            console.log(error);
            res.status(500).send({ message: 'a nasty error just happened'});
        }

    };

    Customuser.signin = async(req, res) => {
        try {
            const { email, password } = req.body;

            const user = await Customuser.findOne({where: { email }});

            if ( !user ) {
                res.status(400).send({message: 'bad request'});
                return;
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if ( !isMatch ) {
                res.status(400).send({mesagge: 'bad request'});
                return;
            }
            
            const token = jwt.sign({ id : user.id }, 'SECRET_KEY');

            res.send({user, token });

        } catch ( err ) {
            res.status(500).send({ message: 'a nasty error just happened' });
        }
    };

    Customuser.remoteMethod('signup',{
        http: {
            path: '/signup',
            verb: 'post'
        },
        accepts: [
            {arg: 'req', type: 'object', http: { source: 'req' }},
            {arg: 'res', type: 'object', http: { source: 'res' }},
        ],
        returns: {
            arg: 'user',
            root: true,
            type: 'object'
        }
    });

    Customuser.remoteMethod('signin',{
        http: {
            path: '/signin',
            verb: 'post'
        },
        accepts: [
            {arg: 'req', type: 'object', http: { source: 'req' }},
            {arg: 'res', type: 'object', http: { source: 'res' }},
        ],
        returns: {
            arg: 'user',
            root: true,
            type: 'object'
        }
    });
};
