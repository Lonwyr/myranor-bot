module.exports = Object.assign({
  help: require('./help'),
  template: require('./template'),
  issues: require('./issues'),
  wurf: require('./wurf'),
  at: require('./at'),
  fk: require('./fk'),
  pa: require('./pa'),
  aw: require('./aw'),
  taw: require('./taw'),
  zfw: require('./zfw'),
  switch: require('./switch'),
  init: require('./init')
},
require('./specificSkillsAndSpells'),
require('./meta'));
