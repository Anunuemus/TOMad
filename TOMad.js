const fs = require('fs');
const X509 = require('crypto').X509Certificate;
const { execSync } = require('child_process');

const getopt = require('./getopt');

function readCert(path){
    let cert;
    try{
        cert = new X509(fs.readFileSync(path)); // wo soll das Zertifikat herkommen?
    } catch (e) {
        throw new Error('given certificate file does not exist.');
    }
    // console.log(cert);
    // console.log(cert.subjectAltName);

    const userID = cert.subjectAltName.split('UPN:')[1].split('@')[0];
    // console.log('UserID: ' + userID);

    const issuerDN = cert.issuer.split('\n').join(',');

    const rev = Buffer.from(cert.serialNumber, 'hex').reverse().toString('hex').toUpperCase();

    return `X509:<I>${issuerDN}<SR>${rev}`;
    
}

function main(){
    const test = getopt();

    console.log(test);

    // getting user throwing error if empty or not passed
    if('u' in test){
        if(!test.u){
            throw new Error('no user provided.')
        }
        console.log(test.u);
    }else{
        throw new Error('no user provided.');
    }

    // read sn, currently doing nothing
    if('r' in test){
        console.log(test.r);
    }

    // write sn, currently just reading from cert and formatting
    if('w' in test){
        for(let file of [...new Set(test.files)]) {
            const cert = readCert(file);
            
            try {
                const result = execSync(`powershell.exe -Command "Write-Output '${cert}'"`);
                console.log(`stdout: ${result}`);
            } catch (error) {
                console.error(`stderr: ${error.stderr}`);
            }
        }
    }

    // delete sn, currently doing nothing
    if('d' in test){
        console.log(test.d);
    }
}

main();