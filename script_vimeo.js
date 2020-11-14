$(function () {
    const model_list = [
        'https://player.vimeo.com/external/479232028.source.mp4?s=6991002ec72507570cf3c616f10cf7173b3d4a60&download=1',
        'https://player.vimeo.com/external/479232043.hd.mp4?s=47a78e9bd1e2826af90cd1cac94b7a61e9a580c9&profile_id=174',
        'https://player.vimeo.com/external/479232063.hd.mp4?s=6001ac50e0e2a7aaf74599673814b2149acd9785&profile_id=174',
        'https://player.vimeo.com/external/479232095.hd.mp4?s=968108d4abc411f8ca3a155150be534e77f8a22d&profile_id=174',
        'https://player.vimeo.com/external/479232107.hd.mp4?s=09c4e25f87652ad8fa95d89736b6af020fb70377&profile_id=174',
        'https://player.vimeo.com/external/479232123.hd.mp4?s=389a78cc7980a95ab54300fd234fed84a48fc57d&profile_id=174',
        'https://player.vimeo.com/external/479232143.sd.mp4?s=875bb5f8c376bf27a73c82a0a691740b6c4580fb&profile_id=164',
        'https://player.vimeo.com/external/479232214.hd.mp4?s=78d616d7175bf9a6a80b0ee620aa28287dbbb9c3&profile_id=174',
        'https://player.vimeo.com/external/479232267.hd.mp4?s=52edfb9a3d29886ce7e0591a83ba3f36b93750f6&profile_id=174',
        'https://player.vimeo.com/external/479232235.hd.mp4?s=bfce82fa0218d6bd550ff7181fe8204288335ce1&profile_id=174',
        'https://player.vimeo.com/external/479232278.hd.mp4?s=3939113fc0f73835367ac5ee095cd473e9c9bb65&profile_id=174',
        'https://player.vimeo.com/external/479232289.hd.mp4?s=0573e4b9129d6951298a70e2f5d4af14c3684d74&profile_id=174',
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
                <video id="video${i+1}" src = "${model_list[i]}" class="model mx-auto my-auto" preload="auto">
                </div>`;
        document.getElementById(`video${i+1}`).addEventListener('canplay', function(event) {
            progress += 1;
            $('.progress-bar').css('width', progress / model_list.length * 100 + '%').attr("aria-valuenow", progress);
            // if (progress == model_list.length) {
                document.body.style.overflow = 'visible';
                $('.container').css('visibility', 'visible');
                $('.progress').css('display', 'none');
            // }
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
