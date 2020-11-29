window.onerror = function(msg, url, linenumber) {
    alert('Error message: '+msg+'\nURL: '+url+'\nLine Number: '+linenumber);
    return true;
}
const mp4_fat = document.currentScript.getAttribute('mp4_fat');
const mp4_tall = document.currentScript.getAttribute('mp4_tall');
const model_n = document.currentScript.getAttribute('model_n');

const time_per_frame = 0.04,
    frame_per_model = 250;
let wx = window.innerWidth,
    wy = window.innerHeight,
    w, h, ox, oy,
    lastScrollTop = 0;
const minimumPlaybackRate = 0.0625;
let video_mp4_url = wx / wy >= 1920 / 1080 * 0.6 ? mp4_fat : mp4_tall;
let ratio = wx / wy >= 1920 / 1080 * 0.6 ? 1920 / 1080 : 1080 / 1920;
let curTime;
let video_array = new Array(model_n);

function scrollTop() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}
scrollTop();

// Create video tag
for (var i = 0; i < model_n; i++) {
    document.body.innerHTML += `<video id="video${i}" class="container" crossorigin="anonymous" playsinline autoplay muted></video>`;
}
for (var i = 0; i < model_n; i++) {
    video_array[i] = document.getElementById(`video${i}`);
}

// Video Loading
function videoloading() {
    var req = new XMLHttpRequest();
    req.addEventListener("progress", function (evt) {
        scrollTop();
        if (evt.lengthComputable) {
            var percentComplete = evt.loaded / evt.total;
            var downloaed = parseInt(evt.loaded / 1024 / 1024);
            var total = parseInt(evt.total / 1024 / 1024);
            document.getElementById('loading_text').innerHTML = `${parseInt(percentComplete*100)}% Loading<br>${downloaed}MB / ${total}MB`;
            if (percentComplete >= 1) {
                loading_end();
            }
        }
    }, true);
    req.open('GET', video_mp4_url, true);
    req.responseType = 'blob';
    req.onload = function () {
        if (this.status === 200) {
            var videoBlob = this.response;
            var vid = URL.createObjectURL(videoBlob);
            for (var i = 0; i < model_n; i++) {
                video_array[i].src = vid;
            }
        }
    }
    req.send();
}
function loading_end() {
    resize();
    focused_video.defaultPlaybackRate = minimumPlaybackRate;
    focused_video.playbackRate = minimumPlaybackRate;
    focused_video.play();
    document.body.style.overflow = 'visible';
    document.getElementById('loading_logo').style.display = 'none';
    document.getElementById('loading_text').style.display = 'none';
    window.addEventListener('scroll', function () {
        var st = window.pageYOffset;
        if (st > lastScrollTop) {
            focused_video.defaultPlaybackRate = minimumPlaybackRate;
            focused_video.playbackRate = minimumPlaybackRate;
        } else {
            focused_video.defaultPlaybackRate = 0;
            focused_video.playbackRate = 0;
        }
        lastScrollTop = st <= 0 ? 0 : st;
    }, false);
    window.addEventListener('resize', resize, false);
}
videoloading();

function resize() {
    wx = window.innerWidth, wy = window.innerHeight;
    if (wx / wy >= ratio) { //가로가 더 큰 경우라 세로에 맞춘다.
        w = wy * ratio, h = wy;
        ox = (wx - w) / 2, oy = 0;
    } else {
        w = wx, h = wx / ratio;
        ox = 0, oy = (wy - h) / 2;
    }

    for (var i = 0; i < model_n; i++) {
        var video = video_array[i];
        video.width = wx;
        video.height = wy;
        video.style.margin = 0;
    }
}

/*
 * Scroll Animation
 */
const per_enter_duration = document.documentElement.clientHeight * 0.5,
    per_center_duration = document.documentElement.clientHeight * 4,
    per_leave_duration = document.documentElement.clientHeight * 0.5;

// init controller
let controller = new ScrollMagic.Controller({
    globalSceneOptions: {
        triggerHook: 0
    }
});

// TweenMax can tween any property of any object. We use this object to cycle through the array
let currs = new Array(model_n);

for (var i = 0; i < model_n; i++) {
    currs[i] = {
        cur_frame: 0
    }

    // create tween
    var enter_tween = TweenMax.to(`#video${i}`, 1, {
        opacity: 1,
        onUpdate: function (model_name) {
            focused_video = video_array[model_name];
            curTime = frame_per_model * model_name * time_per_frame;
            focused_video.currentTime = curTime;
        },
        onUpdateParams: [i]
    });

    var center_tween = TweenMax.to(currs[i], 1, {
        cur_frame: frame_per_model - 1,
        roundProps: "cur_frame",
        repeat: 0,
        immediateRender: true,
        ease: Linear.easeNone,
        onUpdate: function (model_name) {
            focused_video = video_array[model_name];
            curTime = (frame_per_model * model_name + currs[model_name].cur_frame) * time_per_frame;
            focused_video.currentTime = curTime;
        },
        onUpdateParams: [i]
    });

    var leave_tween = TweenMax.to(`#video${i}`, 1, {
        opacity: 0,
    });

    // enter video
    var enter_scene = new ScrollMagic.Scene({
            triggerElement: `#video${i}`,
            triggerHook: "onEnter",
            offset: -per_enter_duration,
            duration: per_enter_duration,
        })
        .setTween(enter_tween)
        .addTo(controller);

    // center video
    var center_scene = new ScrollMagic.Scene({
            triggerElement: `#video${i}`,
            duration: per_center_duration,
        })
        .setPin(`#video${i}`)
        .setTween(center_tween)
        .addTo(controller);

    // leave video
    var leave_scene = new ScrollMagic.Scene({
            triggerElement: `#video${i}`,
            triggerHook: "onLeave",
            offset: per_center_duration,
            duration: per_leave_duration,
        })
        .setTween(leave_tween)
        .addTo(controller);

}