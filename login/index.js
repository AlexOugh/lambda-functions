
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
      console.log(assume_role_provider.Credentials);
      context.done(null, assume_role_provider.Credentials);
    }
  });
}
