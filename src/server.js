import http from "http";
import url from "url";
import fs from "fs";
import path from "path";
import * as responses from "./responses.js";

const PORT = process.env.PORT || 3000;

// Load dataset at startup
const dataPath = path.join(process.cwd(), "data", "dataset.json");
let dataset = JSON.parse(fs.readFileSync(dataPath, "utf8"));

const onRequest = (request, response) =>
{
    const parsedURL = url.parse(request.url, true);

    switch (request.method)
    {
        case "GET":
            responses.handleGet(request, response, parsedURL, dataset);
            break;

        case "HEAD":
            responses.handleHead(request, response, parsedURL, dataset);
            break;

        case "POST":
            responses.handlePost(request, response, parsedURL, dataset);
            break;

        default:
            responses.notFound(request, response);
            break;
    }
}

http.createServer(onRequest).listen(PORT, () =>
{
    console.log(`Server running on http://localhost:${PORT}`);
})