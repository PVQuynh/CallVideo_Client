let peer;
let localStream;

$('#div-chat').hide();

// Hàm mở luồng video
function openStream() {
    const config = { audio: false, video: true };
    return navigator.mediaDevices.getUserMedia(config);
}

// Hàm chơi luồng video
function playStream(idVideoTag, stream) {
    const video = document.getElementById(idVideoTag);

    try {
        if (video.srcObject !== stream) {
            video.srcObject = stream;

            video.addEventListener('loadedmetadata', () => {
                video.play();
                console.log("22 video play")
            });
        } else {
            video.play().catch(error => {
                console.error('Không thể chơi video:', error);
            });
        }
    } catch (error) {
        console.error('Không thể phát luồng:', error);
    }
}

// Hàm đóng luồng video
function closeStream(stream) {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        console.log("38 close stream")
    }
}

// Hàm khởi tạo Peer
function initializePeer(id, usename) {
    if (peer) {
        peer.destroy();
    }

    // Cấu hình các máy chủ STUN và TURN
      peer = new Peer(id, {
        iceServers: [
            {
              urls: "stun:stun.relay.metered.ca:80",
            },
            {
              urls: "turn:global.relay.metered.ca:80",
              username: "2c0409f5b23e0ed330e1e237",
              credential: "30zIkaVkWht8+yDd",
            },
            {
              urls: "turn:global.relay.metered.ca:80?transport=tcp",
              username: "2c0409f5b23e0ed330e1e237",
              credential: "30zIkaVkWht8+yDd",
            },
            {
              urls: "turn:global.relay.metered.ca:443",
              username: "2c0409f5b23e0ed330e1e237",
              credential: "30zIkaVkWht8+yDd",
            },
            {
              urls: "turns:global.relay.metered.ca:443?transport=tcp",
              username: "2c0409f5b23e0ed330e1e237",
              credential: "30zIkaVkWht8+yDd",
            }
        ],
      });


    peer.on("open", () => {
        $('#div-dang-ky').hide();
        $('#div-chat').show();
        $('#my-peer').append(id); // lấy từ token ra gán id bằng email
        // ví dụ token có email: quynh123@gmail.com => id: quynh123
        console.log("55 peer open")
    });

    peer.on("error", (err) => {
        console.error("Peer connection error: ", err);
    });

    // Caller
    $('#btnCall').click(() => {
        const remoteId = $('#remoteId').val();// lấy từ api có email của bạn bè gán id bằng email
        // ví dụ api: /users/{id} để lấy thông tin bạn bè có email: quynh5689@gmail.com => id: quynh5689
        // khi đó quynh123 đã gọi được cho quynh5689

        openStream()
            .then(stream => {
                localStream = stream;
                console.log("69 localStream " + localStream)

                playStream('localStream', localStream);
                const call = peer.call(remoteId, localStream);
                call.on('stream', remoteStream => {
                    console.log(' 74 Remote Stream received:', remoteStream);
                    playStream('remoteStream', remoteStream);
                });

                call.on('error', error => {
                    console.error('Cuộc gọi bị lỗi:', error);
                    closeStream(localStream);
                });
            })
            .catch(error => {
                console.error('Không thể mở luồng:', error);
            });
    });

    // Receiver
    peer.on('call', call => {
        openStream()
            .then(stream => {
                localStream = stream;
                console.log("93 localStream " + localStream)

                $('#callConfirmation').show();

                $('#btnAccept').click(() => {
                    $('#callConfirmation').hide();
                    call.answer(localStream);

                    playStream('localStream', localStream);
                    call.on('stream', remoteStream => {
                        console.log(' 103 Remote Stream received:', remoteStream);
                        playStream('remoteStream', remoteStream)
                    });

                    call.on('error', error => {
                        console.error('Cuộc gọi bị lỗi:', error);
                    });
                });

                $('#btnReject').click(() => {
                    $('#callConfirmation').hide();
                    console.log('Người dùng từ chối cuộc gọi.');
                });
            })
            .catch(error => {
                console.error('Không thể mở luồng:', error);
            });
    });

    // End Call
    $('#btnEndCall').click(() => {
        closeStream(localStream);
        $('#localStream').get(0).srcObject = null;
        console.log("btnEndCall")
    });
}

// Sự kiện đăng ký
$('#btnSignUp').click(() => {
    const username = $('#txtUserName').val();
    const id = $('#id').val();
    console.log("id: " + id + ", name: " + username);

    initializePeer(id, username);
});
