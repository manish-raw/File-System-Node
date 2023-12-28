import fs from "fs/promises";
import { Buffer } from "buffer";
//file descriptor - just a number assigned to an open file. unique to every open file

(async()=>{
    const commandFileHandler = await fs.open("./command.txt", "r");

    commandFileHandler.on("change", async ()=>{
        const size = (await commandFileHandler.stat()).size // this will give the size of your file (content inside it)
        const buff = Buffer.alloc(size);
        const offset = 0; // buff will start fill from this location
        const length = buff.byteLength;
        const position = 0; // position we want to start reading from our file

        await commandFileHandler.read(
            buff,
            offset,
            length,
            position
        )
        console.log(buff.toString("utf-8"));

    });

    const watchCommandFile = fs.watch("./command.txt");

    for await (const event of watchCommandFile){
        if(event.eventType === "change"){
            commandFileHandler.emit("change")
        }
    }
})();

//note: Node only understand a character encoder and decoder, it does not understand img,video etc
//decoder 01=>meaningful
//encoder meaningful=>01