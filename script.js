const mp4_fat = 'https://player.vimeo.com/external/482252434.source.mp4?s=4a243ed1863bc9b17ba67ff130bfc86de91e218c&download=1',
    mp4_tall = 'https://player.vimeo.com/external/482023415.source.mp4?s=7bdd36504d7b32e127a0959e1d171e52fccd8c70&download=1';

const time_per_frame = 0.04;
const model_n = 12,
    frame_per_model = 250;
let wx = window.innerWidth,
    wy = window.innerHeight,
    w, h, ox, oy;

function scrollTop() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}
scrollTop();
document.body.style.overflow = "hidden";

// Create canvas and canvas
for (var i = 1; i <= model_n; i++) {
    document.body.innerHTML += `<canvas id="canvas${i}" class="container" margin:="unset"></canvas>`;
}

let video_mp4_url = wx / wy >= 1920 / 1080 * 0.6 ? mp4_fat : mp4_tall;
let ratio = wx / wy >= 1920 / 1080 * 0.6 ? 1920 / 1080 : 1080 / 1920;
let video = document.getElementById('video');

// Video Loading
var req = new XMLHttpRequest();
req.addEventListener("progress", function (evt) {
    scrollTop();
    if (evt.lengthComputable) {
        var percentComplete = evt.loaded / evt.total;
        document.getElementById('loading_text').innerHTML = `${parseInt(percentComplete*100)}% Loading`;
        document.getElementById('loading_logo').style.opacity = percentComplete;

        if (percentComplete >= 1) {
            document.body.style.overflow = 'visible';
            document.getElementById("loading_logo").style.display = 'none';
            document.getElementById("loading_text").style.display = 'none';

            window.addEventListener('resize', resizeCanvas, false);
            window.addEventListener('resize', redraw, false);
            resizeCanvas();

            window.requestAnimationFrame(redraw);
        }
    }
}, true);
req.open('GET', video_mp4_url, true);
req.responseType = 'blob';
req.onload = function () {
    if (this.status === 200) {
        var videoBlob = this.response;
        var vid = URL.createObjectURL(videoBlob);
        video.src = vid;
    }
}
req.onerror = function () {
}
req.send();

function resizeCanvas() {
    console.log("resizing");
    wx = window.innerWidth, wy = window.innerHeight;
    if (wx / wy >= ratio) { //가로가 더 큰 경우라 세로에 맞춘다.
        w = wy * ratio, h = wy;
        ox = (wx - w) / 2, oy = 0;
    } else {
        w = wx, h = wx / ratio;
        ox = 0, oy = (wy - h) / 2;
    }

    for (var i = 0; i < model_n; i++) {
        var canvas = document.getElementById(`canvas${i+1}`);
        canvas.width = wx;
        canvas.height = wy;
    }
}

function redraw() {
    for (var focusing = 0; focusing < model_n; focusing++) {
        document.getElementById(`canvas${parseInt(focusing)+1}`).getContext('2d').drawImage(video, ox, oy, w, h);
    }
    window.requestAnimationFrame(redraw);
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
let focused_canvas = [0, 1];

for (var i = 0; i < model_n; i++) {
    currs[i] = {
        cur_frame: 0
    }

    // create tween
    var enter_tween = TweenMax.to(`#canvas${i+1}`, 1, {
        opacity: 1,
        onUpdate: function (model_name) {
            focused_canvas = [model_name, model_name - 1];
            video.currentTime = ((frame_per_model * model_name)) * time_per_frame;
            // document.getElementById(`canvas${model_name+1}`).getContext('2d').drawImage(video, ox, oy, w, h);
        },
        onUpdateParams: [i]
    });

    var center_tween = TweenMax.to(currs[i], 1, {
        cur_frame: frame_per_model - 1,
        roundProps: "cur_frame",
        repeat: 0,
        immediateRender: true,
        ease: Linear.easeNone, // show every image the same ammount of time
        onUpdate: function (model_name) {
            focused_canvas = [model_name];
            video.currentTime = ((frame_per_model * model_name) + currs[model_name].cur_frame) * time_per_frame;
            // document.getElementById(`canvas${model_name+1}`).getContext('2d').drawImage(video, ox, oy, w, h);
        },
        onUpdateParams: [i]
    });

    var leave_tween = TweenMax.to(`#canvas${i+1}`, 1, {
        opacity: 0,
        onUpdate: function (model_name) {
            video.currentTime = ((frame_per_model * model_name) + frame_per_model - 1) * time_per_frame;
            // document.getElementById(`canvas${model_name+1}`).getContext('2d').drawImage(video, ox, oy, w, h);
        },
        onUpdateParams: [i]
    });

    // enter canvas
    var enter_scene = new ScrollMagic.Scene({
            triggerElement: `#canvas${i+1}`,
            triggerHook: "onEnter",
            offset: -per_enter_duration,
            duration: per_enter_duration,
        })
        .setTween(enter_tween)
        .addTo(controller);

    // center canvas
    var center_scene = new ScrollMagic.Scene({
            triggerElement: `#canvas${i+1}`,
            duration: per_center_duration,
        })
        .setPin(`#canvas${i+1}`)
        .setTween(center_tween)
        .addTo(controller);

    // leave canvas
    var leave_scene = new ScrollMagic.Scene({
            triggerElement: `#canvas${i+1}`,
            triggerHook: "onLeave",
            offset: per_center_duration,
            duration: per_leave_duration,
        })
        .setTween(leave_tween)
        .addTo(controller);
}
