Steps to starting project--->


1.  git clone, yarn to add deps
2.  ONE TIME ONLY: create .env at root and add `GENERATE_SOURCEMAP=false`
3.  `yarn ganache` to start local chain
4.  open another terminal and `npx gsn start` to start local GSN
5.  delete any existing files inside in src/localGSNbuilds. copy all 6 json files from build/gsn into src/localGSNbuilds
6.  in a third terminal `truffle deploy`
7.  paste CaptureTheFlagContract address into App.js line 98
8.  in a fourth terminal `yarn start` to open in browser
9.  some of the rendering is buggy, possibly will need to refresh page to get button to work
10. open console to see processes/logs


the addresses of the contracts on deployment can definitely be optimized programtically.
