const commonRoutes = require('../modules/common');
const userRoutes = require('../modules/user');
const orderRoutes = require('../modules/order');

module.exports = [
  ...commonRoutes,
  ...userRoutes,
  ...orderRoutes
];
