const express = require("express");
const { google } = require("googleapis");

const router = express.Router();

const auth = new google.auth.GoogleAuth({
    keyFile: "./config/google-service-account.json",
    scopes: [
        "https://www.googleapis.com/auth/drive.readonly"
    ],
});


router.get("/:fileId", async (req, res) => {

    try {

        const { fileId } = req.params;

        const authClient = await auth.getClient();

        const drive = google.drive({
            version: "v3",
            auth: authClient
        });


        // الحصول على معلومات الفيديو
        const fileInfo = await drive.files.get({
            fileId: fileId,
            fields: "size,mimeType"
        });


        const fileSize = Number(fileInfo.data.size);
        const mimeType = fileInfo.data.mimeType;


        const range = req.headers.range;


        if (!range) {

            const response = await drive.files.get(
                {
                    fileId,
                    alt: "media"
                },
                {
                    responseType: "stream"
                }
            );


            res.writeHead(200, {
                "Content-Type": mimeType,
                "Content-Length": fileSize
            });


            response.data.pipe(res);

            return;
        }


        const parts = range.replace(/bytes=/, "").split("-");

        const start = Number(parts[0]);

        const end = parts[1]
            ? Number(parts[1])
            : fileSize - 1;


        const chunkSize = end - start + 1;


        res.writeHead(206, {

            "Content-Range":
                `bytes ${start}-${end}/${fileSize}`,

            "Accept-Ranges":
                "bytes",

            "Content-Length":
                chunkSize,

            "Content-Type":
                mimeType
        });



        const response = await drive.files.get(

            {
                fileId,
                alt: "media"
            },

            {
                responseType: "stream",
                headers: {
                    Range: `bytes=${start}-${end}`
                }
            }

        );


        response.data.pipe(res);



    } catch (error) {

        console.error(
            "Google Drive Stream Error:",
            error.message
        );


        res.status(500).json({
            error: "Cannot stream video"
        });

    }

});


module.exports = router;