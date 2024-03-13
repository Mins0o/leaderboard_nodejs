# Get started  
There are only three major files.
 - index.js
 - public/source.js
 - public/elo\_page.html
The main logic is at the bottom of source.js.  
The bottom of the source.js is a good place to start.
 - If you want to know how the webpage receives and sends data to the server, read `class ServerComm`  
 - If you want to know how the ELO ratings is calculated, read `class Elo`  
 - If you are interested in how the webpage elements are updated, read `class ElementsController`

# How to run
1. Install npm on your system.  
   https://nodejs.org/en/learn/getting-started/how-to-install-nodejs
2. Go to the project's root folder and run
   ``` bash
   node index.js
   ```
3. By default, the page is served to [localhost:3000](http://localhost:3000)

# How it works
 - Code in the `index.js` is the server logic
 - Code in the `public/` is what gets served to the client side
