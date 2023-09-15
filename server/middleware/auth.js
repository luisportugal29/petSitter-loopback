const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {   

        const token = req.header('Authorization').replace('Bearer ','');
    
        const decoded = jwt.verify(token, 'SECRET_KEY');
    
        next();

     } catch ( error ) {
    
        res.status(403).send({message: 'token missing'});
     }
};