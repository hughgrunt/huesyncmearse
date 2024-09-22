Requires Electron or Electron Forge
https://www.electronforge.io/

1) Open Terminal in the directory you want the app to be
2) Init Electron-App, clone repository: 

    npm init electron-app@latest HueSyncMeArseDev
   
    cd HueSyncMeArseDev
   
    git clone https://github.com/hughgrunt/huesyncmearse.git
4) Copy the cloned files into the root folder HueSyncMeArseDev and overwrite everything
5) Now you can use it by terminal with npm start, if you wanna build a distributable, continue:
6) Go into forge.config, remove in makers the "makers-deb"
7) Build App
    npm run make
8) Find it in the out-folder of the electron app, then do whatever the arse you like with it
