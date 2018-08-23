var config = {
  production: {
    database: 'mongodb://navin27:navin2781@ds115592.mlab.com:15592/library',
    db: 'library'
  },
  development: {
    database: 'mongodb://navin27:navin2781@ds125502.mlab.com:25502/devlibrary',
    db: 'devlibrary'
  }
}
exports.get = function get(env) {
  return config[env] || config.development;
}
