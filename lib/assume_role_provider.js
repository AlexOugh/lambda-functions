
var AWS = require('aws-sdk');

function AssumeRoleProvider() {

  var me = this;

  me.getCredential = function(roles, sessionName, durationSeconds, callback) {
    if (!roles || roles.length == 0) {
      callback(null, true);
      return callback(null, null);
    }
    assumeRole(null, 0, roles, sessionName, durationSeconds, callback);
  }

  function assumeRole(creds, idx, roles, sessionName, durationSeconds, callback) {
    role = roles[idx];
    var params = {};
    if (creds)  params.credentials = creds;
    var sts = new AWS.STS(params);
    var params = {
      RoleArn: role.roleArn,
      RoleSessionName: sessionName,
    }
    if (durationSeconds > 0)  params.DurationSeconds = durationSeconds;
    if (role.externalId)  params.ExternalId = role.externalId;
    sts.assumeRole(params, function(err, data) {
      if (err) {
        console.log(err, err.stack);
        callback(err, null);
      }
      else {
        console.log("successfully assumed role, '" + role.roleArn + "'");
        console.log(data);
        if (++idx == roles.length) {
          console.log("successfully completed to assume all roles");
          //me.expiration = Date.parse(data.Credentials.Expiration);
          me.Credentials = data.Credentials;
          creds = new AWS.Credentials({
            accessKeyId: data.Credentials.AccessKeyId,
            secretAccessKey: data.Credentials.SecretAccessKey,
            sessionToken: data.Credentials.SessionToken
          });
          callback(null, creds);
        }
        else {
          creds = new AWS.Credentials({
            accessKeyId: data.Credentials.AccessKeyId,
            secretAccessKey: data.Credentials.SecretAccessKey,
            sessionToken: data.Credentials.SessionToken
          });
          assumeRole(creds, idx, roles, sessionName, durationSeconds, callback);
        }
      }
    });
  }
}

module.exports = AssumeRoleProvider
