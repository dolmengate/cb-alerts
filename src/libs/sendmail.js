const child_process = require('child_process');
const db = require('../db');

/**
 * Use the Ubuntu Sendmail utility to send an email to someone
 * This also saves a copy of the sent email to the database collection Emails
 * TODO add logging to sendmail to be sure mail is actually being sent
 *
 * @param senderAddress: string:        email address (or name) of sender
 * @param subject: string:              subject line
 * @param recipientAddress: string:     email addresses of recipient
 * @param message: string:              the content of the email (the message itself)
 * @param callback
 */
exports.send = function (senderAddress, subject, recipientAddress, message, callback) {

    // construct email content
    let email =
        'To: ' + recipientAddress + '\n' +
        'Subject: ' + subject + '\n' +
        'From: ' + senderAddress + '\n' +
        '\n' +
        message;

    // set log level: -OLogLevel=9                  NO WORKY
    // specify log file: -D ./your/logfile.txt      NO WORKY

    let command = 'echo "' + message + '" | sendmail -f calerts@sroman.info ' + recipientAddress;
    console.log('Sending email to recipientAddress: ' + recipientAddress);
    console.log(command);
    child_process.exec(command, (err) => {
        if (err) throw err;
        callback();
    });

    // don't wait for async write to DB to complete
    db.saveEmail(recipientAddress, new Date().toISOString(), email);

};