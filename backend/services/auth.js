const jwt=require('jsonwebtoken'); exports.token=u=>jwt.sign({id:u._id,role:u.role,studentId:u.studentId},process.env.JWT_SECRET,{expiresIn:'7d'});
