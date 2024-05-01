//Steps -
//1. Open DB connection
//2. Create ObjectStore
//3. Make DB transactions - store captured/recorded data in DB
//4. Retrive stored data & display in gallery

let DataBase;
//By default version 1 DB will be first upgraded & then opened, if we dont mention any DB version. If same version is passed, no upgrade, only open.
//But once upgraded, donwgrading to a lower version will have no impact on already created DB with higher version.
//let openRequest = indexedDB.open("MyGalleryDB", 2);
let openRequest = indexedDB.open("MyGalleryDB");

//Need 3 event listeners on opening connection request to DB.
openRequest.addEventListener("success", (event) => {
    console.log("DB successfully opened..");
    DataBase = openRequest.result;  //2nd time onwards DataBase will be initialized by already existing DB.
})
openRequest.addEventListener("error", (event) => {
    console.log("DB ERROR during opening!");
})
openRequest.addEventListener("upgradeneeded", (event) => {
    console.log("DB upgraded..");
    DataBase = openRequest.result;  //first time DataBase will be initialized by upgradation.
    //objectstorag can only be created in upgrade event. "id" for an image/video will be unique & used as key for indexDB.
    DataBase.createObjectStore("video", {keyPath : "id"});  //name of storage - video
    DataBase.createObjectStore("image", {keyPath : "id"});  //name of storage - image

})

