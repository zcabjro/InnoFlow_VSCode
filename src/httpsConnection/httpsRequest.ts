const vscode = require("vscode");
var https = require('https');

module.exports = function(data,callback) {
    var options = {
        host: 'innoflow.herokuapp.com',
        port: 443,
        path: '/api/innovation',
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        }
    };

    var req = https.request(options, function(res) {
        res.setEncoding('utf8');
        if (res.statusCode == 200) {
            vscode.window.showInformationMessage('Code sucessfully submitted to ' + options.path);
        } else {
            res.on('data',function(chunk) {
               vscode.window.showInformationMessage('Failed to submit code. Error:' + chunk);
            });
        }
    });

    req.end(data);
}