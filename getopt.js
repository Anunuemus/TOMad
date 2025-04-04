const {argv} = require('node:process');

function getopt() {
    const args = argv.slice(2);
    const test = {};
    const files = [];

    for(let i = 0; i < args.length; i++){
        const arg = args[i];
        
        if(arg.startsWith('--')){

            const split = arg.split('=');
            const val = split[0].slice(2);

            if (!['d', 'u'].includes(val)) {

                console.log(split[0]);
                printHelp();
                process.exit(0);

            }

            test[val] = split[1];

        }else if(arg.startsWith('-')){

            const val = arg.slice(1); 

            if (!['r', 'w'].includes(val)) {

                console.log(split[0]);
                printHelp();
                process.exit(0);

            }

            test[val] = true;

        }else{

            files.push(arg);

        }

    }
    test['files'] = files;
    return test;
}

function printHelp(){
    console.log('Help message');
    console.log();
}

module.exports = getopt;