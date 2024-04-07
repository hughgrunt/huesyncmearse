Requires Electron or Electron Forge
https://www.electronforge.io/

1) Open Terminal in the directory you want the app to be
2) Init Electron-App, clone repository: 
    npm init electron-app@latest HueSyncMeArseDev
    cd HueSyncMeArseDev
    git clone https://github.com/hughgrunt/huesyncmearse.git
3) Copy files to the app, the githubfiles need to go in the the app files
4) Build App
    npm run make
5) Find it in the out-folder of the electron app, then do whatever the arse you like with it

ATM there is a bug which means before step 4 you need to put the login data into the config.json manually:
{"ip":"xxx.xxx.x.xx","key":"xxxxxxx"}
