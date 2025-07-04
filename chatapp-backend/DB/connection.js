const mongoose = require('mongoose');

const connection_string=process.env.connection_string


mongoose.connect(connection_string).then(() => {
    console.log('MongoDB connected successfully!');
})
.catch((error) => {
    console.error('MongoDB connection error:', error);
});