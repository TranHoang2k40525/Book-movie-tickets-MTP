const Joi = require('joi');
// Hàm kiểm tra định dạng email
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};


const movieIdSchema = Joi.object({
  id: Joi.number().integer().required()
});

const showtimesByCinemaSchema = Joi.object({
  movieId: Joi.number().integer().required(),
  cinemaId: Joi.number().integer().required(),
  date: Joi.date().iso().required()
});
module.exports = {
    isValidEmail,
    movieIdSchema,
    showtimesByCinemaSchema
};