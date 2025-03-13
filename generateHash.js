const bcrypt = require('bcrypt');
const saltRounds = 10;
const plainPassword = 'admin123';

bcrypt.hash(plainPassword, saltRounds, function(err, hash) {
    if (err) return console.error(err);
    console.log('Password:', plainPassword);
    console.log('Hash:', hash);
});