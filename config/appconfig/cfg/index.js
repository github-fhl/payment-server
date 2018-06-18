const
  part1 = require('./part1'),
  part2 = require('./part2'),
  account = require('./account')

module.exports = {...part1, ...part2, ...account}
