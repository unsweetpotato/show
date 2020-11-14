$(function () {
    const video_url = 'https://player.vimeo.com/external/479247194.source.mp4?s=8311637ec97a5f1170acfe5cbb05ee8762d5355d&download=1';
    const time_per_frame = 1 / 25.0;
    const per_enter_duration = document.documentElement.clientHeight * 0.5,
        per_center_duration = document.documentElement.clientHeight * 4,
        per_leave_duration = document.documentElement.clientHeight * 0.5;
    const model_n = 12;
    let progress = 0;

    /*
     * Video Loading
     */
    document.body.innerHTML += `<video id="video" src = "${video_url}" class="model mx-auto my-auto" style="display:none">`;
    var video = document.getElementById('video');
    video.addEventListener('canplay', function (event) {
        progress += 1;
        // $('.progress-bar').css('width',  * 100 + '%').attr("aria-valuenow", progress);
        // if (progress == model_list.length) {
        document.body.style.overflow = 'visible';
        $('.container').css('visibility', 'visible');
        $('.progress').css('display', 'none');
        // }
    });

    for (var i = 0; i < model_n; i++) {
        // Create scene
        document.body.innerHTML +=
            `<div id="scene${i+1}" class="container" style="visibility:hidden">
                <canvas id="canvas${i+1}" class="model mx-auto my-auto">
            </div>`;

    }

    window.addEventListener('resize', resizeCanvas, false);

    function resizeCanvas() {
        for (var i = 0; i < model_n; i++) {
            var canvas = document.getElementById(`canvas${i+1}`);
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }
    resizeCanvas();
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

                var ctx = document.getElementById(`canvas${model_name+1}`).getContext('2d');
                ctx.drawImage(video, 0, 0);
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