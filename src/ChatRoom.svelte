<script lang="ts">
import { onMount } from 'svelte';

import { EVENTS } from './constants';

import { sendWSMessage } from './store'
import { parseHeader } from './utils';



    let message:string = ""
    export let messages:string[] = []
    export let room:string = ""

    function sendMessage() {
        const codifiedMessage = {
            header: EVENTS.MESSAGE,

            payload: message
        }
        if(message.startsWith("/")) {
            const splitted = message.split(" ")
            if (splitted.length > 1) {
                const header = splitted[0].split("/")[1]
                codifiedMessage.header = parseHeader(header)
                codifiedMessage.payload = splitted[1]
            }
        }
        sendWSMessage(JSON.stringify(codifiedMessage))

        message =""
    }


    function handleKeyPress(e: KeyboardEvent) {
        if (e.key !== "Enter") return
        sendMessage()
    }

    function isSender(msg: string) {
        const splitted = msg.split(":")
        return splitted[0] === "[SELF]"
    }

</script>

<svelte:window on:keypress="{handleKeyPress}"/>

<main>
    {#if room}
    <h3>ROOM: {room}</h3>
    {/if}
    <ul>
        {#each messages as msg}
            <li style={`text-align: ${isSender(msg) ? 'right' : 'left' }; margin-right: ${isSender(msg) && '1rem'};`}>{msg}</li>
        {/each}
    </ul>
    <div class="input-send">
        <input type="text" bind:value={message} autofocus>
        <button on:click="{sendMessage}">Send</button>
    </div>
</main>


<style>
    main {
        width: 60%;
        display: flex;  
        flex-direction: column;
        justify-content: center;
        border: 1px solid gray;
        padding: 1rem;
    }
    ul {
        height: 20rem;
        width: 100%;
        overflow-y: scroll;
        align-self: flex-end;
        padding-left: .5rem;
        padding-right: .5rem;
    }

    .input-send{
        display: flex;
        height: 3rem;
        align-self: flex-end;
        width: 100%;
    }

    input {
        width: 100%;
    }

    button {
        max-height: 100%;
    }
</style>