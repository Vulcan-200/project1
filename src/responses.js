import fs from "fs";
import path from "path";

export function serveIndex(request, response)
{
    const filePath = path.join(process.cwd(), "client", "index.html");
    const html = fs.readFileSync(filePath);
    response.writeHead
    (
        200,
        {
        "Content-Type": "text/html",
        "Content-Length": html.length
        }
    );
    response.end(html);
}

export function serveCSS(request, response)
{
    const filePath = path.join(process.cwd(), "client", "style.css");
    const css = fs.readFileSync(filePath);
    response.writeHead
    (
        200,
        {
            "Content-Type": "text/css",
            "Content-Length": css.length
        }
    );
    response.end(css);
}

export function getAllItems(request, response, dataset)
{
    const body = JSON.stringify(dataset);
    response.writeHead(200, {"Content-Length": Buffer.byteLength(body) });
    response.end(body);
}

export function headItems(request, response)
{
    response.writeHead(200);
    response.end();
}

export function getItemById(request, response, dataset, id)
{
    const item = dataset.find(i => i.id == id);

    if (!item)
    {
        return notFound(request, response);
    }

    const body = JSON.stringify(item);
    response.writeHead(200, { "Content-Length": Buffer.byteLength(body)  });
    response.end(body);
}

export function addItem(request, response, dataset)
{
    let bodyData = "";

    request.on("data", chunk =>
    {
        bodyData += chunk;
    });

    request.on("end", () =>
    {
        let body;

        try
        {
            body = JSON.parse(bodyData);
        }
        catch
        {
            response.writeHead(400, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ error: "Invalid JSON" }));
            return;
        }

        if (!body.name)
        {
            response.writeHead(400, { "Content-Type": "application/json"});
            response.end(JSON.stringify({ error: "Missing required field: name" }));
            return;
        }

        const newItem = 
        {
            id: Date.now()
        };

        dataset.push(newItem);

        const responseBody = JSON.stringify(newItem);
        response.writeHead(201,
        {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(responseBody)
        });
        response.end(responseBody); 
    });
}

export function notFound(request, response)
{
    const body = JSON.stringify({ error: "Endpoint not found" });
    response.writeHead(404, { "Content-Length": Buffer.byteLength(body) });
    response.end(body);
}

export function handleGet(request, response, parsedURL, dataset)
{
    const pathname = parsedURL.pathname;

    if (pathname === "/")
    {
        return serveIndex(request, response);
    }

    if (pathname === "/style.css")
    {
        return serveCSS(request, response);
    }

    if (pathname === "/api/items")
    {
        return getAllItems(request, response, dataset);
    }

    if (pathname.startsWith("/api/items/"))
    {
        const id = pathname.split("/"[3]);
        return getItemById(request, response, dataset, id);
    }

    return notFound(request, response);
}

export function handleHead(request, response, parsedURL, dataset)
{
    const pathname = parsedURL.pathname;

    if (pathname === "/api/items")
    {
        response.writeHead(200);
        return response.end();
    }

    if (pathname.startsWith("/api/items/"))
    {
        const id = pathname.split("/")[3];
        const item = dataset.find(i => i,id == id);
        
        if (!item)
        {
            response.writeHead(404);
            return response.end();
        }

        response.writeHead(200);
        return response.end();
    }

    response.writeHead(404);
    response.end();
}

export function handlePost(request, response, parsedURL, dataset)
{
    const pathname = parsedURL.pathname;

    if (pathname === "/api/items")
    {
        return addItem(request, response, dataset);
    }

    return notFound(request, response);
}