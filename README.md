Steps to starting project--->

set Up Prokject
1.  git clone, yarn to add deps
2.  ONE TIME ONLY: create .env at root and add `GENERATE_SOURCEMAP=false`

Start Local Development
3.  `yarn ganache` to start local chain
4.  open another terminal and `npx gsn start` to start local GSN
5.  delete any existing files inside in src/localGSNbuilds. copy all 6 json files from build/gsn into src/localGSNbuilds
6.  in a third terminal `truffle deploy`
7.  in a fourth terminal `yarn start` to open in browser
8.  Make sure Metamask is connect to localhost:8545
9.  open console to see processes/logs
10. some of the rendering is buggy, possibly will need to refresh page to get button to work
