<script lang="ts">
  import { onMount } from "svelte";

  import ChatRoom from "./ChatRoom.svelte";
  import { messageStore, sendWSMessage } from "./store";
  import { EVENTS } from "./constants";
  import type { Message, User } from "./interfaces";

  let isLoggedIn = false;
  let username = "";

  let siEmail: string = "";
  let siPassword: string = "";
  let suEmail: string = "";
  let suPassword: string = "";
  let suUsername: string = "";
  let siError: string = "";
  let suError: string = "";
  let suInfo: string = "";

  let messages: string[] = [];
  let room: string = "";

  onMount(() => {
    messageStore.subscribe((current) => {
      const received = JSON.parse(current) as Message;
      console.log(received);
      if (!shouldMessageBeDisplayed(received)) {
        processMetaEvent(received);
        return;
      }
      if (received.sender === username) {
        received.sender = "SELF";
      }
      messages = [...messages, `[${received.sender}]: ${received.payload}`];
    });
  });

  function shouldMessageBeDisplayed(msg: Message): boolean {
    return msg.header !== EVENTS.JOIN && msg.header !== EVENTS.LEAVE;
  }

  function processMetaEvent(msg: Message) {
    switch (msg.header) {
      case EVENTS.JOIN:
        room = msg.payload;
        //clear messages from old room
        messages = [];
        fetchLatestMessages();
		break;
	  case EVENTS.LEAVE:
		room = ""
		messages = []
    }
  }

  async function handleSignIn(e: SubmitEvent) {
    e.preventDefault();
    const response = await fetch("http://localhost:8000/auth", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ email: siEmail, password: siPassword }),
    });

    if (!response.ok && response.body) {
      siError = await response.text();
      return;
    }

    const user = (await response.json()) as User;

    username = user.username;
    sendWSMessage(
      JSON.stringify({
        header: EVENTS.SET_USERNAME,
        payload: username,
      })
    );
    isLoggedIn = true;
  }

  async function handleSignUp(e: SubmitEvent) {
    e.preventDefault();
    const response = await fetch("http://localhost:8000/users", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: suEmail,
        password: suPassword,
        username: suUsername,
      }),
    });
    if (!response.ok && response.body) {
      suError = await response.text();
      return;
    }

    suInfo = "Succesfully signed up. You can now sign in";
  }


  async function fetchLatestMessages() {
    const response = await fetch(`http://localhost:8000/messages?room=${room}`);
    if (!response.ok) return;
    const data = (await response.json()) as Message[];
    const formattedMessages = data.map((msg) => {
      if (msg.sender === username) {
        msg.sender = "SELF";
      }
      return `[${msg.sender}]: ${msg.payload}`;
    });
    messages = [...messages, ...formattedMessages];
  }
</script>

{#if isLoggedIn}
  <main>
    <div class="header">
      <h4>Welcome to chat app</h4>
      <p>
        <small
          >You can join rooms by using /join |roomName| command <br />
          You can leave your current room by using /leave room command></small
        >
      </p>
    </div>
    <ChatRoom {messages} room={room} />
  </main>
{:else}
  <main>
    <div class="form-container">
      <form type="submit" on:submit={handleSignIn}>
        <h3 class="form-title">Sign in to chat room</h3>
        <div class="input-container">
          <span>email</span>
          <input type="email" bind:value={siEmail} />
        </div>
        <div class="input-container">
          <span>password</span>
          <input type="password" bind:value={siPassword} />
        </div>
        <button>Sign in</button>
        <small>{siError}</small>
      </form>
      <form type="submit" on:submit={handleSignUp}>
        <h3 class="form-title">Sign up to chat room</h3>
        <div class="input-container">
          <span>email</span>
          <input type="email" bind:value={suEmail} />
        </div>
        <div class="input-container">
          <span>password</span>
          <input type="password" bind:value={suPassword} />
        </div>
        <div class="input-container">
          <span>username</span>
          <input type="name" bind:value={suUsername} />
        </div>
        <button>Sign up</button>
        {#if suInfo}
          <small class="info">{suInfo}</small>
        {:else}
          <small>{suError}</small>
        {/if}
      </form>
    </div>
  </main>
{/if}

<style>
  main {
    width: 100vw;
    height: 97vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .header {
    margin-bottom: 1rem;
  }

  .form-container {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    gap: 2rem;
    width: 50%;
    height: 50%;
    border: 1px solid gray;
  }

  form {
    display: flex;
    flex-direction: column;
    width: 50%;
    padding: 1rem;
  }

  .input-container {
    display: flex;
    flex-direction: column;
  }

  .form-title {
    text-align: center;
  }

  small {
    color: red;
  }

  .info {
    color: lime;
  }
</style>
