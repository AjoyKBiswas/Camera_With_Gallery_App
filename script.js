let video_elem = document.querySelector("video");
let recordBtnCont = document.querySelector(".record-btn-cont");
let record_Btn = document.querySelector(".record-btn");
let captureBtnCont = document.querySelector(".capture-btn-cont");
let capture_Btn = document.querySelector(".capture-btn");
let filterColor;

let recorder;
let recordFlag = false;
let stream_data_chunks = [];
let constrainst = {
    video:true,
    audio:true
}
//navigator -> global browser window info
//MediaDevices -> Interface to connect to hardwares like camera & microphone
//getUserMedia() -> asks for permission to turn on camera & microphone & gives MediaSTream input

//returns a promise
navigator.mediaDevices.getUserMedia(constrainst).then(
    //passes a callback of MediaStream object
    (MediaStream) => {
        video_elem.srcObject = MediaStream;
        //sending MediaStream to MediaRecorder to record video.
        recorder = new MediaRecorder(MediaStream);
        recorder.addEventListener("start", (event) => {
            stream_data_chunks = [];  ///need to empty the array everytime new streaming starts
        })
        //once recorder has obtained some data chunk from media recorder device, store the data in storage array.
        recorder.addEventListener("dataavailable", (event) => {
            stream_data_chunks.push(event.data);
        })
        recorder.addEventListener("stop", (event) => {
            //convert media chunks to video
            let blob = new Blob(stream_data_chunks, {type:"video/mp4"});
            //Storing the reocrded video in IndexDB
            if(DataBase){
                let video_uid = shortid();  //generating short uid for keypath of video
                let DB_transaction = DataBase.transaction("video", "readwrite");  //transaction request
                let video_store = DB_transaction.objectStore("video");
                let video_entry = {
                    id:`vid-${video_uid}`,  //object key name for keypath should be same when creating object store.
                    blob_data:blob
                }
                video_store.add(video_entry); //putting the video_entry object in video object store.
            }
            //creating video url to download video to gallery
            // let video_url = URL.createObjectURL(blob);
            // let anchor = document.createElement("a");
            // anchor.href = video_url;
            // anchor.download = "Stream.mp4";
            // anchor.click();
        })
    }
)
recordBtnCont.addEventListener("click", (event) => {
    if(!recorder){
        return;
    }
    //toggle recordFlag for every click, initially false. false for every odd clicks, true for every even clicks.
    recordFlag = !recordFlag;
    if(recordFlag){
        //for every odd numbered click, will start recording
        recorder.start();
        startTimer();  //starting timer
        //to perfrom & display animations of record button on starting recording
        record_Btn.classList.add("scale-record-btn");
    }
    else{
        //for every even numbered click, will stop recording
        recorder.stop();
        stopTimer();  //stopping timer
        //to perfrom & display animations of capture button on stopping recording
        record_Btn.classList.remove("scale-record-btn");
    }
})
let sec_counter = 0;
let timerID;
let timer_elem = document.querySelector(".timer");

function startTimer(){
    timer_elem.style.display = "block";
    function displayTimer(){
        let total_secs = sec_counter;
        let hours = Number.parseInt(total_secs/3600);
        total_secs = (total_secs % 3600);
        let mins = Number.parseInt(total_secs/60);
        total_secs = (total_secs % 60);
        let secs = total_secs;

        //making the time double digited
        hours = (hours < 10 ? `0${hours}` : hours);
        mins = (mins < 10 ? `0${mins}` : mins);
        secs = (secs < 10 ? `0${secs}` : secs);
        timer_elem.innerHTML = `${hours}:${mins}:${secs}`;

        sec_counter++;  //counts seconds passed, to help calculate time elapsed since recording started.
    }
    timerID = setInterval(displayTimer, 1000);  //displayTimer() will be called every 1000ms/1sec

}
function stopTimer(){
    timer_elem.style.display = "none";
    clearInterval(timerID);
    timer_elem.innerText = "00:00:00";
    sec_counter = 0;
}

captureBtnCont.addEventListener("click", (event) => {
    capture_Btn.classList.add("scale-capture-btn");  //for animation when clicked for capturing image
    let canvas_elem = document.createElement("canvas");
    canvas_elem.width = video_elem.videoWidth;
    canvas_elem.height = video_elem.videoHeight;
    let tool = canvas_elem.getContext("2d");
    //video frame converted to image - ranging from (0,0) to (canvas_width, canvas_height)
    tool.drawImage(video_elem, 0, 0, canvas_elem.width, canvas_elem.height);
    //Applying filter on actual image snapshot.
    tool.fillStyle = filterColor;
    tool.fillRect(0, 0, canvas_elem.width, canvas_elem.height);
    let image_URL = canvas_elem.toDataURL();

    if(DataBase){
        let img_uid = shortid();  //generating short uid for keypath of image
        let DB_transaction = DataBase.transaction("image", "readwrite");  //transaction request
        let image_store = DB_transaction.objectStore("image");
        let image_entry = {
            id:`img-${img_uid}`,  //object key name for keypath should be same when creating object store.
            url:image_URL
        }
        image_store.add(image_entry); //putting the video_entry object in video object store.
    }
    setTimeout(() => {
        capture_Btn.classList.remove("scale-capture-btn");
    }, 500)
    //capture_Btn.classList.remove("scale-capture-btn");  //will not work due to swift code execution, so added in setTimeout().
    // let anchor = document.createElement("a");
    // anchor.href = image_URL;
    // anchor.download = "image.jpg";
    // anchor.click();
})

//UI Filtering operations
let all_filters = document.querySelectorAll(".filter");
let filter_layer_elem = document.querySelector(".filter-layer");
all_filters.forEach((filter_elem) => {
    filter_elem.addEventListener("click", (event) => {
        filterColor = getComputedStyle(filter_elem).getPropertyValue("background-color");
        filter_layer_elem.style.backgroundColor = filterColor;
        //console.log(filterColor);
    })
})