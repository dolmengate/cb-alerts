let socket = new WebSocket('wss://localhost:3000');

// ensure all data is sent and close the socket before leaving the page
window.onbeforeunload = () => {

    // close sockets before refresh
    if (window.performance) { // check browser compatibility
        if (performance.navigation.type === 1)
            console.info("This page is reloaded");
}

    if (socket.readyState !== WebSocket.CLOSED && !socket.bufferedAmount)
        socket.close();
    console.log('socket closed');
};


socket.onopen = () => {
    console.log('Socket open');
    socket.send('User connected.');
    document.getElementById('socket-status').setAttribute('class', 'badge badge-success');
};

socket.onerror = (err) => {
    console.log('There was an error with a socket connection ' + err);
    document.getElementById('socket-status').setAttribute('class', 'badge badge-danger');
};

socket.onmessage = (e) => {
    console.log('Socket message received ' + e.data);
    let data = JSON.parse(e.data);
    document.getElementById('mayer-multiple').innerText = data.mayerMultiple;
    document.getElementById('200dma').innerText = data.twoHundredDayMovingAverage;
    document.getElementById('current-price').innerText = data.currentPrice;
};

socket.onclose = (e) => {
    console.log('Socket closed');
    document.getElementById('socket-status').setAttribute('class', 'badge badge-warning');
};

if (document.getElementById('signup-btn') !== null) {
    document.getElementById('signup-btn').onclick = function (e) {
        e.preventDefault();
        $.post(
            '/calerts/signup',
            {
                emailAddress: document.getElementById('email').value,
                password: document.getElementById('password').value

            }, function (res) {
                console.log(res);
            }
        );
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
    };
}

document.getElementById('session-test-btn').onclick = function () {
    console.log('sess test');
    $.post( '/calerts/dashboard', { message: 'do a thing' } );
};

document.getElementById('logout-btn').onclick = function () {
    console.log('logout test');
    $.post( '/calerts/logout', { message: 'logout' } );
};
