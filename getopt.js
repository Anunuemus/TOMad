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

                console.log(split[0]);
                printHelp();
                process.exit(0);

            }

            opt[val] = split[1];

        }else if(arg.startsWith('-')){

            const val = arg.slice(1); 

            if (!['w'].includes(val)) {

                console.log(split[0]);
                printHelp();
                process.exit(0);

            }

            opt[val] = true;

        }else{

            if(hexRegex.opt(arg)){
                sn.push(arg);
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
    console.log('Help message');
    console.log('Usage: node TOMad.js [options] <pos arg>');
    console.log('\n Positional arguments:');
    console.log('');
}

module.exports = getopt;