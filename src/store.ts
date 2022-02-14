import { writable } from 'svelte/store';

const messageStore = writable('');

let socket: WebSocket = null
 
socket = new WebSocket('ws://localhost:8000/ws');
socket.addEventListener("message", (e) => {
    messageStore.set(e.data)
})


const sendWSMessage = (message:string) => {
    if (socket.readyState <= 1) {
        console.log("sending message: ", message)
		socket.send(message);
	}
}


export {
    messageStore,
    sendWSMessage
}