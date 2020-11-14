$(function () {
    const video_mp4_url = 'https://player.vimeo.com/external/479247194.source.mp4?s=8311637ec97a5f1170acfe5cbb05ee8762d5355d&download=1';
    const video_ogg_url = 'https://player.vimeo.com/external/479258911.source.ogv?s=4139b3726bbeb296b2bc41e51d905269e67e166d&download=1';
    const time_per_frame = 1 / 25;
    const per_enter_duration = document.documentElement.clientHeight * 0.5,
        per_center_duration = document.documentElement.clientHeight * 4,
        per_leave_duration = document.documentElement.clientHeight * 0.5;
    const model_n = 12;
    let progress = 0;
    var wx = window.innerWidth,
        wy = window.innerHeight;
    if (wx / wy >= 1920 / 1080) { //가로가 더 큰 경우라 세로에 맞춘다.
        var w = wy * 1920 / 1080,
            h = wy;
        var ox = (wx - w) / 2,
            oy = 0;
    } else {
        var w = wx,
            h = wx * 1080 / 1920;
        var ox = 0,
            oy = (wy - h) / 2;
    }

    /*
     * Video Loading
     */
    document.body.innerHTML += `<video id="video" style="display:none">
    <source src = "${video_mp4_url}" type="video/mp4">
    <source src = "${video_ogg_url}" type="video/ogg">
    </video>`;
    var video = document.getElementById('video');

    function videoloaded (event) {
        progress += 1;
        // $('.progress-bar').css('width',  * 100 + '%').attr("aria-valuenow", progress);
        // if (progress == model_list.length) {
        document.body.style.overflow = 'visible';
        $('.container').css('visibility', 'visible');
        $('.progress').css('display', 'none');
        // }
        video.removeEventListener('canplay', videoloaded);
        resizeCanvas();
        for (var i = 0; i<model_n; i++) {
            var ctx = document.getElementById(`canvas${i+1}`).getContext('2d');
            ctx.drawImage(video, ox, oy, w, h);
        }

    }

    video.addEventListener('canplay', videoloaded);

    for (var i = 0; i < model_n; i++) {
        // Create scene
        document.body.innerHTML +=
            `<div id="scene${i+1}" class="container" style="visibility:hidden">
                <canvas id="canvas${i+1}" class="model mx-auto my-auto">
            </div>`;

    }

    console.log("2020-11-14 hi");

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
        for (var i = 0; i<model_n; i++){
            var ctx = document.getElementById(`canvas${i+1}`).getContext('2d');
            ctx.drawImage(video, ox, oy, w, h);
        }

    }
    resizeCanvas();
    
    window.addEventListener('resize', resizeCanvas, false);
    window.addEventListener('resize', redraw, false);
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

    for (var i = 0; i < model_n; i++) {
        currs[i] = {
            cur_frame: 0
        };

        // create tween
        var enter_tween = TweenMax.to(`#scene${i+1}`, 1, {
            opacity: 1
        });

        var center_tween = TweenMax.to(currs[i], 1 / model_n, {
            cur_frame: 250,
            roundProps: "cur_frame",
            repeat: 0,
            immediateRender: true,
            ease: Linear.easeNone, // show every image the same ammount of time
            onUpdate: function (model_name) {
                video.currentTime = ((250 * model_name) + currs[model_name].cur_frame) * time_per_frame;
                resizeCanvas();
                var ctx = document.getElementById(`canvas${model_name+1}`).getContext('2d');
                ctx.drawImage(video, ox, oy, w, h);
            },
            onUpdateParams: [i]
        });

        var leave_tween = TweenMax.to(`#scene${i+1}`, 1, {
            opacity: 0
        });

        // enter scene
        var enter_scene = new ScrollMagic.Scene({
                triggerElement: `#scene${i+1}`,
                triggerHook: "onEnter",
                offset: -per_enter_duration,
                duration: per_enter_duration,
            })
            .setTween(enter_tween)
            .addIndicators({
                name: `enter model ${i+1}`
            })
            .addTo(controller);

        // center scene
        var center_scene = new ScrollMagic.Scene({
                triggerElement: `#scene${i+1}`,
                duration: per_center_duration,
            })
            .setPin(`#scene${i+1}`)
            .setTween(center_tween)
            .addIndicators({
                name: `center model ${i+1}`
            })
            .addTo(controller);

        // leave scene
        var leave_scene = new ScrollMagic.Scene({
                triggerElement: `#scene${i+1}`,
                triggerHook: "onLeave",
                offset: per_center_duration,
                duration: per_leave_duration,
            })
            .setTween(leave_tween)
            .addIndicators({
                name: `leave model ${i+1}`
            })
            .addTo(controller);
    }
});