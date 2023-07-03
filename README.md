# C Money Mobile app

<p align="center">
  <a href="https://creditvillegroup.com">
    <img width="160px" src="https://creditvillegroup.com/images/app-logo.png"><br/>
  </a>
  <h2 align="center">C Money Mobile App</h2>
</p>

<p align="center">
<a href="https://play.google.com/store/apps/details?id=com.creditville&hl=en_US&gl=US"><img src="https://cdn.worldvectorlogo.com/logos/get-it-on-google-play.svg"  style="width:100px" alt="Play Store"></a>
  <a href="https://apps.apple.com/us/app/c-money-savings-investment/id1547983942"><img src="https://cdn.worldvectorlogo.com/logos/available-on-the-app-store.svg" alt="App Store" style="width:100px"></a>

</p>

<p align="center">
React Native mobile digital banking app providing investment, savings, and loans powered by   <a href="https://creditvillegroup.com">CreditVille</a>
</p>

## Prerequisites

- [Node.js > 12](https://nodejs.org "Node Js")
- [Watchman](https://facebook.github.io/watchman "Watchman")
- [Xcode](https://developer.apple.com/xcode "Xcode")
- [Cocoapods](https://cocoapods.org "Cocoapods")
- [Android Studio and Android SDK](https://developer.android.com/studio "Android Studio")

## Base dependencies

- [axios](https://github.com/axios/axios "Axios") for networking.
- [react-navigation](https://reactnavigation.org/ "React Navigation") navigation library.
- [react-native-firebase/app](https://github.com/invertase/react-native-firebase/tree/main#readme "Firebase") as firebase implementation for React Native.
- [redux](https://redux.js.org/ "Redux") for state management.
- [redux-persist](https://github.com/rt2zz/redux-persist "Redux Persist") as persistance layer.
- [redux-thunk](https://github.com/gaearon/redux-thunk "Redux Thunk") to dispatch asynchronous actions.
<!-- - [jest](https://facebook.github.io/jest/) and [react-native-testing-library](https://callstack.github.io/react-native-testing-library/) for testing. -->

## Installation

Install the required packages in your React Native project

```bash
yarn
```

Installing dependencies into a bare React Native project

```bash
npx pod-install
```

Start up android application (production)

```bash
yarn prod  
```

Start up android application (Testing)

```bash
yarn beta  
```

<!-- Work on installation process -->

## Usage

## Folder structure

- `android`: Folder contains native android components.
- `ios`: Folder contains native ios components.
- `src/assets`: Folder contains static files like Images, Vector, Fonts and Styles.
- `src`: This folder is the main container of all the code inside your application.

  - `components`: Folder to store any common component that you use through your app (such as a generic Buttons, Inputs, Headers, etc)
  - `services`: This folder is a container for api endpoints, constants and utils

    - `api`: This folder contains custom all network logic; api configuration (axios), urls and network logs.
    - `constants`: This folder contains ui constants (color and device size) and text constants.
    - `utils`: This folder contains helper functions.

    - `navigation`: Folder to contain the root navigation flow of the app.
        - `index`: This is the root navigation of the application.
        - `app_navigator`: This is the main navigation of the application only accessible to authorized users.
        - `auth_navigator`: the authorization and authentication (login and signup) flow of the application.
        - `tour_navigator`: the onboarding introduction navigation flow

  - `redux`: This folder has all the reducers, and expose the combined result using its `store/index.js` file.
      - `action`: This folder contains all actions that can be dispatched to redux sujected to this screen and a types files
      - `reducer`
  - `screens`: Folder that contains all the top level application screens.

    - `[Screen]`: Each screen should be stored inside its folder and inside it a file for its code and a separate folder for its actions and reducers.
      - `[Screen]`
        - `Screen.js`

- `Index.js`: Main component that starts the whole application; this loads up static and config files and prepare the application resources.

## Project Structure
```
📦src
 ┣ 📂assets
 ┃ ┣ 📂fonts
 ┃ ┗ 📂images
 ┣ 📂components
 ┃ ┣ 📂atoms
 ┃ ┣ 📂molecules
 ┃ ┗ 📂organisms
 ┣ 📂navigations
 ┣ 📂redux
 ┃ ┣ 📂actions
 ┃ ┣ 📂reducers
 ┃ ┣ 📂store
 ┃ ┗ 📂types
 ┣ 📂screens
 ┃ ┣ 📂auth
 ┃ ┗ 📂dashboard
 ┃ ┗ 📂notifications
 ┃ ┗ 📂onboarding
 ┃ ┗ 📂savings
 ┃ ┗ 📂settings
 ┃ ┗ 📂shared
 ┣ 📂services
 ┣ 📂styles
 ┣ 📂utils
 ┗ 📜index.js
 ```

## Setup environments

## Generate production version

These are the steps to generate `.apk`, `.aab` and `.ipa` files

### Android

1. Place your keystore file into your android/app folder and enter the necessary key values in your build.gradle file
2. In the terminal cd to the android folder
4. Execute `./gradlew assemble[Env][BuildType]`

Predefined script
1. Run this command in your application root folder
```bash
    build-apk
```

### iOS

1. Go to the Xcode
2. Select the schema
3. Select 'Any iOS device' as target
4. Product -> Archive

# How to use it

## Components

Components are the basic blocks, all the components are at the same nesting level.

## Redux

Once the components are defined, they are tied to the management of information through the application. For this, Redux is implemented with the store-reducer-action structure as usual.

### services/network.js

Here is where all the helper functions in regards to making api calls are found.

### axiosClient.js

To keep the networking layer simple, the template uses a single Axios instance in the makeApiCall function in `network.js` file which uses Base64 to encode authorization.

## Screens

In this folder, you have the main objects to apply the composition architecture. Just create a folder for each screen in the application, call all the components and static resources you need to render the scene and finally use the corresponding hooks to interact with redux and create behaviors depending on the store.

# Contributors

| Role             | People                      |
| ---------------- | --------------------------- |
| Code 💻          | Toba, Afolabi, |
| Maintenance 🛠    | Afolabi, |
| Documentation 📖 | Afolabi                     |