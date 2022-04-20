let sToken, nPort;

$.ajax({
    url: '../data/config.json',
    async: false,
    dataType: 'json',
    success: function (response) {
        nPort = response.APP_PORT;
        sToken = response.TOKEN
    }
});

$('button.accueil').on('click', () => {
    window.location.href = '../../home/vue/index.html';
});

let vSocket = io(`ws://localhost:${nPort}`, {
    auth: {
        token: `${sToken}`
    }
});

let vIo = vSocket;

vIo.on('connect_error', (err) => {
    console.log(err.message);
});

vIo.on('vIsMasterMute', (vIsMasterMute) => {
    switch (vIsMasterMute) {
        case true:
            $('#vMuteMaster img').attr('src', '../../global/img/mute.png');
            break;
        case false:
            $('#vMuteMaster img').attr('src', '../../global/img/unmute.png');
            break;
        default:
            return;
            break;
    };
}); 

vIo.on('vWindowsActualVolume', (vWindowsActualVolume) => {
    $('#vVolumeValue').text(vWindowsActualVolume);
    $('#vMaster').val(vWindowsActualVolume);
});

vIo.on('vWindowsVolumeChange', (vWindowsVolumeChange) => {
    $('#vVolumeValue').text(vWindowsVolumeChange);
    $('#vMaster').val(vWindowsVolumeChange);
});

vIo.on('aSessions', (aSessions) => {
    $.each(aSessions, (nIndex, oVal) => {
        vIo.on('oAppBlocklist', (oAppBlocklist) => {
            if (oVal.name) {
                if (oAppBlocklist[`${oVal.name}`] == undefined || oAppBlocklist[`${oVal.name}`] == true) {
                    $('.vOtherSliders table tbody').append(`
                        <tr>
                            <td>
                                <label for="${oVal.name}">${oVal.name}</label>
                            </td>
                            <td>
                                <input class="vApp" id="vApp" type="range" min="0" max="100" step="1" name="${oVal.name}" data-vol="${oVal.name}">
                            </td>
                            <td>
                                <span id="${oVal.name}"></span>
                            </td>
                            <td>
                                <button class="vApp vMute" data-btn="${oVal.name}">
                                    <img src="../../global/img/mute.png" alt="">
                                </button>
                            </td>
                        </tr>`
                    );

                    let vOtherSlider = $(`[name="${oVal.name}"]`);
                    let vMuteButtons = $('button.vMute')

                    vMuteButtons.unbind().click(function() {
                        switch ($(this).find('img').attr('src')) {
                            case '../../global/img/mute.png':
                                $(this).find('img').attr('src', '../../global/img/unmute.png')
                                break;
                            case '../../global/img/unmute.png':
                                $(this).find('img').attr('src', '../../global/img/mute.png')
                                break;
                            default:
                                return;
                                break;
                        };

                        vIo.emit('vMuteButton', 
                        {
                            vApp: $(this).data('btn')
                        });
                        // alert("Bouton en cours de développement\nMerci à toi de patienter :)");
                        // window.location.href = "https://bit.ly/3x7indr"
                    });

                    vOtherSlider.on('touchmove mousemove', function() {
                        $(`[id="${ $(this).data('vol') }"]`).text($(this).val());
                        vIo.emit('ioVolumeApps', 
                        {
                            action: $(this).data('vol'),
                            volume: $(this).val()
                        });
                    });

                    vIo.on('vRefreshSliderValue', (vRefreshSliderValue) => {
                        console.error(vRefreshSliderValue);
                        if (oAppBlocklist[`${vRefreshSliderValue.sAppName}`] == undefined || oAppBlocklist[`${vRefreshSliderValue.sAppName}`] == true) {
                            if (vRefreshSliderValue.sAppName == oVal.name) {
                                $(`[name="${oVal.name}"]`).val(vRefreshSliderValue.vRefreshSliderValue);
                                $(`[id="${oVal.name}"]`).text(Math.round(vRefreshSliderValue.vRefreshSliderValue));

                                let vMuteBtn = $(`[data-btn="${oVal.name}"]`);

                                switch (vRefreshSliderValue.vIsAppMute) {
                                    case true:
                                        console.error(vMuteBtn.find('img').attr('src', '../../global/img/mute.png'));
                                        break;
                                    case false:
                                        console.error(vMuteBtn.find('img').attr('src', '../../global/img/unmute.png'));
                                        break;
                                    default:
                                        return;
                                        break;
                                };
                            };
                        };
                    });
                };
            };
        });
    });
});

$('button').on('click', function() {
    if ($(this).data('action') != 'vMuteMaster') {
        vIo.emit('ioActions', 
        {
            "action": $(this).data('action'),
        });
    } else if ($(this).data('action') == 'vMuteMaster') {
        vIo.emit('ioMasterMute', 
        {
            "action": $(this).data('action'),
        });
        
        switch ($(this).find('img').attr('src')) {
            case '../../global/img/mute.png':
                $('#vMuteMaster img').attr('src', '../../global/img/unmute.png');
                break;
            case '../../global/img/unmute.png':
                $('#vMuteMaster img').attr('src', '../../global/img/mute.png');
                break;
            default:
                return;
                break;
        };
    };
});

$('input').on('touchmove mousemove', function() {
    vIo.emit('ioVolumeMaster',
    {
        "action": $(this).data(),
        "volume": $(this).val(),
    });
    $('#vVolumeValue').text(parseInt($('input.vMaster').val()));
});