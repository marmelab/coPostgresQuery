'use strict';

require('babel').transform('code', { optional: ['runtime'] });
module.exports = require('./co-event');
