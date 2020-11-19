const video_mp4_url = 'https://player.vimeo.com/external/479247194.source.mp4?s=8311637ec97a5f1170acfe5cbb05ee8762d5355d&download=1';
const time_per_frame = 0.04;
const per_enter_duration = document.documentElement.clientHeight * 0.5,
    per_center_duration = document.documentElement.clientHeight * 4,
    per_leave_duration = document.documentElement.clientHeight * 0.5;
const model_n = 12,
    frame_per_model = 250;
let progress = 0;
var wx = window.innerWidth,
    wy = window.innerHeight,
    w, h, ox, oy;

/*
 * Video
 */

document.body.innerHTML += `
<video id="video" style="display:none" playsinline autoplay muted>
    <source src = "${video_mp4_url}" type="video/mp4">
</video>`;
var video = document.getElementById('video');

function videoloaded(event) {
    resizeCanvas();
    document.body.style.overflow = 'visible';
    video.removeEventListener('canplaythrough', videoloaded);

    function showstarted() {
        $('.container').css('visibility', 'visible');
        $('.spinner-grow').css('display', 'none');

        window.addEventListener('resize', resizeCanvas, false);
        window.addEventListener('resize', redraw, false);
        document.getElementById(`canvas1`).getContext('2d').drawImage(video, ox, oy, w, h);
        window.requestAnimationFrame(redraw);
    }
    setTimeout(showstarted, 3000);

}
video.addEventListener('canplaythrough', videoloaded);

// Create scene and canvas
for (var i = 1; i <= model_n; i++) {
    document.body.innerHTML +=
        `<div id="scene${i}" class="container" style="visibility:hidden">
        <canvas id="canvas${i}" class="model">
    </div>`;
}

function resizeCanvas() {
    wx = window.innerWidth, wy = window.innerHeight;
    if (wx / wy >= 1920 / 1080) { //가로가 더 큰 경우라 세로에 맞춘다.
        w = wy * 1920 / 1080, h = wy;
        ox = (wx - w) / 2, oy = 0;
    } else {
        w = wx, h = wx * 1080 / 1920;
        ox = 0, oy = (wy - h) / 2;
    }

    for (var i = 0; i < model_n; i++) {
        var canvas = document.getElementById(`canvas${i+1}`);
        canvas.width = wx;
        canvas.height = wy;
    }
}

function redraw() {
    for (var i in focused_canvas) {
        document.getElementById(`canvas${i+1}`).getContext('2d').drawImage(video, ox, oy, w, h);
    }
    window.requestAnimationFrame(redraw);
}

/*
 * Scroll Animation
 */

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
    var enter_tween = TweenMax.to(`#scene${i+1}`, 1, {
        opacity: 1,
        onUpdate: function (model_name) {
            focused_canvas = [model_name, model_name + 1];
            video.currentTime = ((frame_per_model * model_name)) * time_per_frame;
            document.getElementById(`canvas${model_name+1}`).getContext('2d').drawImage(video, ox, oy, w, h);
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
            document.getElementById(`canvas${model_name+1}`).getContext('2d').drawImage(video, ox, oy, w, h);
        },
        onUpdateParams: [i]
    });

    var leave_tween = TweenMax.to(`#scene${i+1}`, 1, {
        opacity: 0,
        onUpdate: function (model_name) {
            focused_canvas = [model_name-1, model_name];
            video.currentTime = ((frame_per_model * model_name) + frame_per_model - 1) * time_per_frame;
            document.getElementById(`canvas${model_name+1}`).getContext('2d').drawImage(video, ox, oy, w, h);
        },
        onUpdateParams: [i]
    });

    // enter scene
    var enter_scene = new ScrollMagic.Scene({
            triggerElement: `#scene${i+1}`,
            triggerHook: "onEnter",
            offset: -per_enter_duration,
            duration: per_enter_duration,
        })
        .setTween(enter_tween)
        // .addIndicators({
        //     name: `enter model ${i+1}`
        // })
        .addTo(controller);

    // center scene
    var center_scene = new ScrollMagic.Scene({
            triggerElement: `#scene${i+1}`,
            duration: per_center_duration,
        })
        .setPin(`#scene${i+1}`)
        .setTween(center_tween)
        // .addIndicators({
        //     name: `center model ${i+1}`
        // })
        .addTo(controller);

    // leave scene
    var leave_scene = new ScrollMagic.Scene({
            triggerElement: `#scene${i+1}`,
            triggerHook: "onLeave",
            offset: per_center_duration,
            duration: per_leave_duration,
        })
        .setTween(leave_tween)
        // .addIndicators({
        //     name: `leave model ${i+1}`
        // })
        .addTo(controller);
}