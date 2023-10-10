## Documentation
The full source code is well commented out, but inorder to respect the contest guidlines, I present the documentation for it.
The full webapp and server logic are implemented in javascript.
The server source code is located in `server` directory.

**App Description**
My contest entry app is a fictional movie ticket booking app that let users reserve cinema seats. It consists two pages one where users select movie and other which lets users select seat and pay for it. The live bot can be tested at [@phonics_submit_bot](https://t.me/phonics_submit_bot)

## Development setup

The repository can be cloned by running:
`git clone https://github.com/mickeymgk/movie.git`
Move to the root directory: 
`cd movie`
Then to install dependencies run: 
`npm install` 
To test inside a browser run: 
`npm run dev`

**Server configuration**
To configure the server you need a [CloudFlare](https://dash.cloudflare.com/) to host it.
Move to the server directory: 
`cd server`
Install dependencies: 
`npm install`
To run the server locally: 
`npm run dev`
To deploy the server: 
`npm run deploy`
after deployment copy the server url to and fill it to [index.html](https://github.com/mickeymgk/movie/blob/a5d36aa66823191bf425e11c05f44425f80867e0/index.html#L50C13-L50C13) file. 