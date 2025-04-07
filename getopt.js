const {argv} = require('node:process');

function getopt() {
    const args = argv.slice(2);
    const opt = {};
    const files = [];
    const sn = [];
    const hexRegex = /^[0-9A-Fa-f]+$/;

    for(let i = 0; i < args.length; i++){
        const arg = args[i];
        
        if(arg.startsWith('--')){

            const split = arg.split('=');
            const val = split[0].slice(2);

            if (!['d', 'r'].includes(val)) {

                printHelp();
                process.exit(0);

            }

            opt[val] = split[1];

        }else if(arg.startsWith('-')){

            const val = arg.slice(1); 

            if (!['w'].includes(val)) {

                printHelp();
                process.exit(0);

            }

            opt[val] = true;

        }else{

            if(hexRegex.test(arg)){
                sn.push(Buffer.from(arg, 'hex').reverse().toString('hex'));
            }else{
                files.push(arg);
            }

        }

    }
    opt['files'] = files;
    opt['sn'] = sn;
    return opt;
}

function printHelp(){
    console.log('\n-------------Help message-------------\n');
    console.log('Usage: node TOMad.js [options] ...<SN> ...<PathToCert>\n');
    console.log('Options:');
    console.log('  -h, --h\tShow Help Message');
    console.log('  --r=<user>\tRead all SerialNumbers currently contained in the entry of <user>');
    console.log('  -w\t\tCreates and writes formatted entry with IssuerDN and SerialNumber from Positional Argument <PathToCert>');
    console.log('  --d=<user>\tDelete all SerialNumbers passed with Positional Arguments <SN> from the <user\'s> entry\n');
    console.log('Positional arguments:');
    console.log('  <SN>\t\tSerialNumber of a certificate, only necessary for delete');
    console.log('  <PathToCert>\tPath to certificate, only necessary for write\n');
}

module.exports = getopt;