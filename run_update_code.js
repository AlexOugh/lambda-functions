
var argv = require('minimist')(process.argv.slice(2));
var folder = argv['folder'];
var account = argv['account'];
var region = argv['region'];
if (!folder || !account || !region) {
  console.log("node run_upload_code --folder <folder name> --account <aws account id> --region <aws region>");
  return;
}
if (account.toString().length < 12) {
  account = "0" + account;
}
console.log('folder = ' + folder);
console.log('account = ' + account);
console.log('region = ' + region);

var fs = require("fs");
var data = fs.readFileSync(__dirname + '/' + folder + "/config.json", {encoding:'utf8'});
var input = JSON.parse(data);

input.bucketName = account + input.bucketName + region;
input.region = region;
console.log(input);

var updator = new (require('../aws-services/lib/lambda_code_updator'))();
updator.update(input, function(err, data) {
  if(err) {
    console.log("Error occurred during updating codes : " + JSON.stringify(err));
    process.exit(1);
  }
  else if(data) {
    console.log("Successfully updated codes");
    process.exit(0);
  }
  else {
    console.log("Failed to update codes");
    process.exit(1);
  }
});
