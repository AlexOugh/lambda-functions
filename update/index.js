
var AWS = require('aws-sdk');
var assume_role_provider = new (require('../lib/assume_role_provider'))();

exports.handler = function(event, context) {

  console.log('Received event:', JSON.stringify(event, null, 2));

  var roles = [];
  roles.push({roleArn:'arn:aws:iam::' + event.federateAccount + ':role/federate'});
  var admin_role = {roleArn:'arn:aws:iam::' + event.account + ':role/' + event.roleName};
  if (event.roleExternalId) {
    admin_role.externalId = event.roleExternalId;
  }
  roles.push(admin_role);
  console.log(roles);

  assume_role_provider.getCredential(roles, event.sessionName, event.durationSeconds, function(err, data) {
    if(err) {
      console.log("failed to assume roles: " + err);
      context.fail(err, null);
    }
    else {
      var params = {regin: event.region};
      if (data) params.credentials = data;
      var lambda = new AWS.Lambda(params);

      params = {
        FunctionName: event.functionName
      };
      if (event.description)  params.Description = event.description;
      if (event.handler)  params.handler = event.Handler;
      if (event.memorySize)  params.MemorySize = event.memorySize;
      if (event.role)  params.Role = event.role;
      if (event.timeout)  params.Timeout = event.timeout;
      if (event.zipFile)  params.ZipFile = event.zipFile;

      if (event.zipFile) {
        lambda.updateFunctionCode(params, function(err, data) {
          if (err) {
            console.log(err, err.stack);
            context.fail(err, null);
          }
          else {
            console.log(data);
            context.done(null, data);
          }
        });
      }
      else {
        lambda.updateFunctionConfiguration(params, function(err, data) {
          if (err) {
            console.log(err, err.stack);
            context.fail(err, null);
          }
          else {
            console.log(data);
            context.done(null, data);
          }
        });
      }
    }
  });
}
