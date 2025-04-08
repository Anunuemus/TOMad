const fs = require('fs');
const path = require('path');
const X509 = require('crypto').X509Certificate;
const { execSync } = require('child_process');

const { getopt, printHelp } = require('./getopt');

function createEntry(path){
    let cert;
    try{
        cert = new X509(fs.readFileSync(path));
    } catch (e) {
        throw new Error('given certificate file does not exist.');
    }

    const upn = cert.subjectAltName.split('UPN:')[1].split('@')[0];

    const rev = Buffer.from(cert.serialNumber, 'hex').reverse().toString('hex');

    const issuerDN = cert.issuer.split('\n').join(',');

    return {sn : rev, issuer : issuerDN, upn : upn};
    
}

function readEntry(upn){
    try{
        const path = 'PI.ps1';
        const result = execSync(`powershell.exe -File "${path}" ${upn}`, { encoding: 'utf-8' });
        return [...result.matchAll(/<SR>([a-zA-Z0-9]+)/g)].map(m => m[1]);
    } catch (error){
        throw new Error(error.stderr);
    }
}

function deleteEntry(upn, sn){
    const entries = read(upn).slice(2, -1).split(/,\s*/);
    return entries.filter(number => {
        return !sn.includes(number);
    });
}

function read(upn){
    try{
        const path = 'PI.ps1';
        return execSync(`powershell.exe -File "${path}" ${upn}`, { encoding: 'utf-8' });
    } catch (error){
        throw new Error(error.stderr);
    }
}

function main(){
    const opt = getopt();

    if('r' in opt){
        const numbers = readEntry(opt.r);
        numbers.forEach(number => {
            console.log(`AD: ${number} \t Cert: ${Buffer.from(number, 'hex').reverse().toString('hex')}`);
        });
    }

    if('w' in opt){

        const files = [...new Set(opt.files)]

        let inputStr = files.length === 1 ? '@{' : '@(';
        let dict = {};

        for(let file of files) {
            const temp = createEntry(file);

            if(temp.sn === '' || readEntry(temp.upn).includes(temp.sn)){
                console.error(`${temp.sn} is already included.`);
                continue;
            }

            if(!dict[temp.upn]){
                dict[temp.upn] = inputStr.concat(`X509:<I>${temp.issuer}<SR>${temp.sn}`);
                // delete old entries
                const oldEntries = read(temp.upn);
                try {
                    const path = 'PI.ps1'
                    execSync(`powershell.exe -File "${path}" "${temp.upn}" "${oldEntries}"`, { encoding: 'utf-8' });
                } catch (error) {
                    throw new Error(error.stderr);
                }
            }else{
                dict[temp.upn] = dict[temp.upn].concat(',', `X509:<I>${temp.issuer}<SR>${temp.sn}`);
            }            
        }
        for(entry in dict){
            dict[entry] += files.length === 1 ? '}' : ')';
            
            try {
                const path = 'PI.ps1'
                execSync(`powershell.exe -File "${path}" "${entry}" "${dict[entry]}"`, { encoding: 'utf-8' });
                console.log(`added entries for ${entry}`);
            } catch (error) {
                throw new Error(error.stderr);
            }
        }
    }

    if('d' in opt){
        if(!opt.d || opt.sn.length < 1){
            console.error('No user or sn given.');
            console.error(`bad usage: node ${path.basename(process.argv[1])} ${process.argv.slice(2).join(' ')}`); // todo
            printHelp();
            process.exit(1);
        }
        const oldEntries = read(opt.d);
        const newEntries = deleteEntry(opt.d, opt.sn);
        const inputStr = newEntries.length === 1 ? '@{' + newEntries + '}' : '@(' + newEntries.join(',') + ')';
        try{
            // delete
            let path = 'PI.ps1'
            execSync(`powershell.exe -File "${path}" "${opt.d}" "${oldEntries}"`, { encoding: 'utf-8' });
            // write
            path = 'PI.ps1'
            execSync(`powershell.exe -File "${path}" "${opt.d}" "${inputStr}"`, { encoding: 'utf-8' });
        }catch (error) {
            throw new Error(error.stderr);
        }
    }
}

main();
