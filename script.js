$(function () {
    const model_list = [
        './assets/abstract01.mp4',
        './assets/abstract02.mp4',
        './assets/abstract03.mp4',
        './assets/abstract04.mp4',
        './assets/abstract05.mp4',
        './assets/abstract06.mp4',
        './assets/abstract07.mp4',
        './assets/abstract08.mp4',
        './assets/abstract09.mp4',
        './assets/abstract10.mp4',
        './assets/abstract11.mp4',
        './assets/abstract12.mp4',
    ];
    const time_per_frame = 1 / 25.0;
    const per_enter_duration = document.documentElement.clientHeight * 0.5,
        per_center_duration = document.documentElement.clientHeight * 4,
        per_leave_duration = document.documentElement.clientHeight * 0.5;

    let progress = 0;

    /*
     * Video Loading
     */
    for (var i = 0; i < model_list.length; i++) {
        // Create scene
        document.body.innerHTML +=
            `<div id="scene${i+1}" class="container" style="visibility:hidden">
                <video id="video${i+1}" src = "${model_list[i]}" class="model mx-auto my-auto">
                </div>`;
        document.getElementById(`video${i+1}`).addEventListener('canplay', function(event) {
            progress += 1;
            $('.progress-bar').css('width', progress / model_list.length * 100 + '%').attr("aria-valuenow", progress);
            if (progress == model_list.length) {
                document.body.style.overflow = 'visible';
                $('.container').css('visibility', 'visible');
                $('.progress').css('display', 'none');
            }
        });
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
    let currs = new Array(model_list.length);

    for (var i = 0; i < model_list.length; i++) {
        currs[i] = {
            cur_frame: 0
        };

        // create tween
        var enter_tween = TweenMax.to(`#scene${i+1}`, 1, {
            opacity: 1
        });

        var center_tween = TweenMax.to(currs[i], 1 / model_list.length, {
            cur_frame: 249,
            roundProps: "cur_frame",
            repeat: 0,
            immediateRender: true,
            ease: Linear.easeNone, // show every image the same ammount of time
            onUpdate: function (model_name) {
                document.getElementById(`video${model_name+1}`).currentTime = currs[model_name]
                    .cur_frame * time_per_frame;
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
