//console.log("In manage_gallery.js");
//The video retrieval block is within setTimeout, because it takes some time to retrive the video data from IndexedDB
setTimeout(()=> {
    if(DataBase){
        //Retrieve all videos
        let DB_transaction_vid = DataBase.transaction("video", "readonly");  //transaction request
        let video_store = DB_transaction_vid.objectStore("video");
        let video_request = video_store.getAll();  //returns an response event
        video_request.onsuccess = (event) => {  //as & when the response is successfully received, execute the CB function
            let video_result = video_request.result;
            //console.log(video_result);
            let gallery_cont_elem = document.querySelector(".gallery-cont");
            video_result.forEach((videoObj) => {
                let media_cont_elem = document.createElement("div");
                media_cont_elem.setAttribute("class", "media-cont");
                media_cont_elem.setAttribute("id", videoObj.id);
                let video_URL = URL.createObjectURL(videoObj.blob_data);  //creating an URL out of blob_data in videoObj.
                media_cont_elem.innerHTML = `
                    <div class="download action-btn">Donwload</div>
                    <div class="media">
                        <video autoplay controls loop src="${video_URL}"></video>
                    </div>
                    <div class="delete action-btn">Delete</div>`;
                gallery_cont_elem.appendChild(media_cont_elem);

                //for download & delete operations
                let download_btn = media_cont_elem.querySelector(".download");
                download_btn.addEventListener("click", download_listener);
                let delete_btn = media_cont_elem.querySelector(".delete");
                delete_btn.addEventListener("click", delete_listener);
            })
        }

        //Retrieve all images
        let DB_transaction_img = DataBase.transaction("image", "readonly");  //transaction request
        let image_store = DB_transaction_img.objectStore("image");
        let image_request = image_store.getAll();  //returns an response event
        image_request.onsuccess = (event) => {  //as & when the response is successfully received, execute the CB function
            let image_result = image_request.result;
            //console.log(image_result);
            let gallery_cont_elem = document.querySelector(".gallery-cont");
            image_result.forEach((imageObj) => {
                let media_cont_elem = document.createElement("div");
                media_cont_elem.setAttribute("class", "media-cont");
                media_cont_elem.setAttribute("id", imageObj.id);
                let image_URL = imageObj.url;  //getting URL out of blob_data in videoObj.
                media_cont_elem.innerHTML = `
                    <div class="download action-btn">Donwload</div>
                    <div class="media">
                        <img src="${image_URL}">
                    </div>
                    <div class="delete action-btn">Delete</div>`;
                gallery_cont_elem.appendChild(media_cont_elem);

                //for download & delete operations
                let download_btn = media_cont_elem.querySelector(".download");
                download_btn.addEventListener("click", download_listener);
                let delete_btn = media_cont_elem.querySelector(".delete");
                delete_btn.addEventListener("click", delete_listener);
            })
        }
    }
}, 100)

function delete_listener(event){
    //Remove data from DB
    //1. see if the item to be downloaded is image or video - id will have 'vid' or 'img' phrase
    //2. But id is an attribute of media-cont class, & download button is a child of media-cont class. So we need to get parent element.
    let media_obj_id = event.target.parentElement.getAttribute("id");
    //console.log("media_obj_id:", media_obj_id);
    let media_obj_type = media_obj_id.slice(0,3);
    if (media_obj_type === "vid"){
        let DB_transaction_vid = DataBase.transaction("video", "readwrite");  //transaction request
        let video_store = DB_transaction_vid.objectStore("video");
        video_store.delete(media_obj_id);
    }
    else if(media_obj_type === "img"){
        let DB_transaction_img = DataBase.transaction("image", "readwrite");  //transaction request
        let image_store = DB_transaction_img.objectStore("image");
        image_store.delete(media_obj_id);
    }
    //Remove HTML element from UI
    event.target.parentElement.remove();
}

function download_listener(event){
    let media_obj_id = event.target.parentElement.getAttribute("id");
    //console.log("media_obj_id:", media_obj_id);
    let media_obj_type = media_obj_id.slice(0,3);
    if (media_obj_type === "vid"){
        let DB_transaction_vid = DataBase.transaction("video", "readwrite");  //transaction request
        let video_store = DB_transaction_vid.objectStore("video");
        let target_video_request = video_store.get(media_obj_id);
        target_video_request.onsuccess = (event) => {
            target_video_result = target_video_request.result;
            //console.log(target_video_result);
            //creating video url to download video to gallery
            let target_video_url = URL.createObjectURL(target_video_result.blob_data);
            let anchor = document.createElement("a");
            anchor.href = target_video_url;
            anchor.download = "Stream.mp4";
            anchor.click();
        }
    }
    else if(media_obj_type === "img"){
        let DB_transaction_img = DataBase.transaction("image", "readwrite");  //transaction request
        let image_store = DB_transaction_img.objectStore("image");
        let target_image_request = image_store.get(media_obj_id);
        target_image_request.onsuccess = (event) => {
            target_image_result = target_image_request.result;
            //console.log(target_image_result);
            
            //creating download link for image
            let anchor = document.createElement("a");
            anchor.href = target_image_result.url;
            anchor.download = "image.jpg";
            anchor.click();
        }
    }
}
