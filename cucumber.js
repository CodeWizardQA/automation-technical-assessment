module.exports = {
  default: {
    spec: [
      'tests/features/**/*.feature'
    ],
    require: [
      'tests/step-definitions/**/*.ts',
      'tests/step-definitions/**/*.js'
    ],
    requireModule: [
      'ts-node/register'
    ],
    format: [
      'progress',
      'html:reports/cucumber-report.html'
    ]
  }
};