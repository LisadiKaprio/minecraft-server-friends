Rough synopsis:
This has to be a chrome extension, where I can enter the IP of my minecraft server, and it should display 

What I need to build:
- chrome extension
- simple usage: 
    - should open a dropdown-panel when I click on the extension's icon in the toolbar panel
    - should in red circle under the extension's icon be able to show a number
    - should be able to display a small non-intrusive notification with text

- user should be able to save their user-inputs in the extension's panel:
    - IP of the minecraft server they are interested in + the name they give to the server
        - there can be a list of multiple server IPs + name pairs, but the user should be able to pick one as their primary, which then determines the server from which the amount of users is shown in the red circle near extension icon.
    - when saved, it should be obscured when displayed in the panel, because it's sensitive info (click to copy/reveal or something like that)
    - another user-input: list of names of favourite friends
    - there should also be a toggle/checkbox saying "all friends are favourite"
    

- the chrome extension should make an api call every minute to https://api.mcsrvstat.us/3/<address>
    - when making the call, it will receive an answer similar to this, in this case we see there is one player on the server named elacxeto with a unique id:
    ```
    {"ip":"(IP-hidden)","port":25565,"debug":{"ping":true,"query":false,"bedrock":false,"srv":false,"querymismatch":false,"ipinsrv":false,"cnameinsrv":false,"animatedmotd":false,"cachehit":false,"cachetime":1773081200,"cacheexpire":1773081320,"apiversion":3,"error":{"query":"Failed to read from socket."}},"motd":{"raw":["A Minecraft Server"],"clean":["A Minecraft Server"],"html":["A Minecraft Server"]},"players":{"online":1,"max":20,"list":[{"name":"elacxeto","uuid":"932716b9-8d8d-434f-af3a-8d2f8ed89ed1"}]},"version":"1.21.11","online":true,"protocol":{"version":774,"name":"1.21.11"},"software":"Paper","eula_blocked":false}
    ```
    - if answer looks different, the extension should say that the server is offline, and no number should appear next to extension name
    - in red circle under extension's icon in the toolbar, it should show the amount of friends currently on the server
    - in this case, if the friend "elacxeto" was saved in the list of user's favourite friends, then the extension should show a non-intrusive notification saying "elacxeto joined <server-name>" when he first appears, and there should also be a notification saying "elacxeto left <server-name>" when he leaves.
    - if "all friends are favourite" is toggled on, then the user should receive a notification for every player that joins or leaves.

- if a minecraft server is saved, and the user clicked on the extension's icon, he should see a panel which should display a list of players on the server
    - in the list, display avatars of the players (accessible with the api call https://minotar.net/avatar/<user-id>) and their names.

Important rules:
- only use vanilla html + css + javascript, when possible

--------------------------

right now, the dashboard only shows list of players / server status of the primary server. i want it to instead show it for all the servers the user has saved in settings. i think for that popup.js should add the server-status element dynamically for each server?
also, make sure that if there are more than 5 players in the server, then the list shows only 5 players and then you have to click a button to expand to show all other players on the server.
make sure to pay attention when you have to replace an html "id" with an html "class"