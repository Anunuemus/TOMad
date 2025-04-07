const fs = require('fs');
const X509 = require('crypto').X509Certificate;
const { execSync } = require('child_process');

const getopt = require('./getopt');

function createEntry(path){
    let cert;
    try{
        cert = new X509(fs.readFileSync(path));
    } catch (e) {
        throw new Error('given certificate file does not exist.');
    }

    const upn = cert.subjectAltName.split('UPN:')[1].split('@')[0];

    const rev = Buffer.from(cert.serialNumber, 'hex').reverse().toString('hex').toUpperCase();

    const issuerDN = cert.issuer.split('\n').join(',');

    return [rev, issuerDN, upn];
    
}

function readEntry(upn){
    try{
        const path = 'PI.ps1';
        const result = execSync(`powershell -File "${path}" ${upn}`, { encoding: 'utf-8' }); // todo
        console.log(result);
        return [...result.matchAll(/<SR>([a-zA-Z0-9]+)/g)].map(m => m[1]);
    } catch (error){
        console.error(`stderr: ${error.stderr}`);
        throw new Error(error.stderr);
    }
}

function deleteEntry(upn){
    //todo
}

function main(){
    const opt = getopt();

    console.log(opt);

    if('r' in opt){
        const numbers = readEntry(opt.r);
        console.log(numbers);
        numbers.forEach(number => {
            console.log(`AD: ${number} \t Cert: ${Buffer.from(number, 'hex').reverse().toString('hex').toUpperCase()}`);
        });
    }

    if('w' in opt){

        for(let file of [...new Set(opt.files)]) {
            const temp = createEntry(file);
            console.log(temp);

            const numbers = readEntry(temp[2]);

            if(temp[0] === '' || numbers.includes(temp[0])){
                console.log('continue');
                continue;
            }

            try {
                const result = execSync(`powershell.exe -Command "Write-Output 'X509:<I>${temp[1]}<SR>${temp[0]}'"`);
                console.log(`stdout: ${result}`);
            } catch (error) {
                console.error(`stderr: ${error.stderr}`);
            }
        }
    }

    if('d' in opt){
        console.log(readEntry(opt.d));
    }
}

main();

//