import fs from "fs";
import path from "path";

// ---------- Static Files ----------

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

export function serveConfigJS(request, response)
{
    const filePath = path.join(process.cwd(), "src", "config.js");
    const js = fs.readFileSync(filePath, "utf8");

    response.writeHead
    (
        200,
        {
            "Content-Type": "application/javascript",
            "Content-Length": Buffer.byteLength(js)
        }
    );

    response.end(js);
}

export function serveLocationJS(request, response)
{
    const filePath = path.join(process.cwd(), "src", "locations.js");
    const locjs = fs.readFileSync(filePath, "utf8");

    response.writeHead
    (
        200, 
        { 
            "Content-Type": "application/javascript"
        }
    );

    response.end(locjs);
}

export function serveLocations(request, response)
{
    const filePath = path.join(process.cwd(), "client", "locations.html");
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

export function serveAPIDocs(request, response)
{
    const filePath = path.join(process.cwd(), "client", "api-doc.html");
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

export function serveAllLocations(request, response, dataset, query)
{
    let locations = [...dataset];

    // Searching
    if (query.search)
    {
        const term = query.search.toLowerCase();
        locations = locations.filter(i => i.name.toLowerCase().includes(term));
    }

    // Sorting
    if (query.sort === "alpha")
    {
        locations.sort((a, b) => a.name.localeCompare(b.name));
    }
    else
    {
        locations.sort((a,b) => b.id - a.id); // sorts with newest first
    }

    const body = JSON.stringify(locations);
    response.writeHead
    (
        200, 
        {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body)
        }
    );

    response.end(body);
}

export function serveAllLocationNames(request, response, dataset, query)
{
    const names = dataset.map(location => location.name);

    const body = JSON.stringify(names);

    response.writeHead
    (
        200,
        {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body)
        }
    );

    response.end(body);
}

export function serveLocationById(request, response, dataset, id)
{
    const location = dataset.find(loc => loc.id == id);

    if (!location)
    {
        return notFound(request, response);
    }

    const body = JSON.stringify(location);
    response.writeHead
    (
        200, 
        {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body)
        }
    );

    response.end(body);
}

export function serveRandomLocation(request, response, dataset)
{
    if (dataset.length === 0)
    {
        const body = JSON.stringify
        (
            {
                error: "No locations available",
                id: "noLocations"
            }
        );

        response.writeHead
        (
            404,
            {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(body)
            }
        );

        return response.end(body);
    }

    const randomIndex = Math.floor(Math.random() * dataset.length);
    const randomLocation = dataset[randomIndex];

    const redirectingURL = `/index.html?loc=${randomLocation.id}`;

    response.writeHead
    (
        302,
        {
            "Location": redirectingURL,
            "Content-Length": 0
        }
    );

    response.end();
}

export function addLocation(request, response, dataset)
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
            response.writeHead
            (
                400, 
                { 
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(body)
                }
            );

            response.end(JSON.stringify({ error: "Invalid JSON" }));
            return;
        }

        if (!body.name || !body.latitude || !body.longitude)
        {
            response.writeHead
            (
                400, 
                { "Content-Type": "application/json"}
            );
            response.end(JSON.stringify({ error: "Missing required field: name" }));
            return;
        }

        const newLocation = 
        {
            id: Date.now(),
            name: body.name,
            latitude: parseFloat(body.latitude),
            longitude: parseFloat(body.longitude),
            description: body.description || "",
            photos: body.photos || [],
            metadata:
            {
                addedAt: new Date().toISOString()
            }
        };

        dataset.push(newLocation);

        const responseBody = JSON.stringify(newLocation);
        response.writeHead
        (
            201,
            {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(responseBody)
            }
        );

        response.end(responseBody); 
    });
}

export function notFound(request, response)
{
    const body = JSON.stringify({ error: "The resource you were looking for could not be found", id: "notFound" });
    response.writeHead
    (
        404, 
        {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body)
        }
    );

    response.end(body);
}



export function handleGet(request, response, parsedURL, dataset)
{
    const pathname = parsedURL.pathname;

    if (pathname === "/" || pathname === "/index.html" || pathname === "/home.html") 
    {
        return serveIndex(request, response); 
    }

    if (pathname === "/style.css")
    {
        return serveCSS(request, response);
    }

    if (pathname === "/src/config.js")
    {
        return serveConfigJS(request, response);
    }

    if (pathname === "/src/locations.js")
    {
        return serveLocationJS(request, response);
    }

    if (pathname === "/locations.html")
    {
        return serveLocations(request, response);
    }

    if (pathname === "/api-doc.html")
    {
        return serveAPIDocs(request, response);
    }

    if (pathname === "/api/locations")
    {
        return serveAllLocations(request, response, dataset, parsedURL.query);
    }

    if (pathname === "/api/locationNames")
    {
        return serveAllLocationNames(request, response, dataset);
    }

    if (pathname.startsWith("/api/locations/"))
    {
        const id = pathname.split("/")[3];
        return serveLocationById(request, response, dataset, id);
    }

    if (pathname.startsWith("/api/randomLocation"))
    {
        return serveRandomLocation(request, response, dataset);
    }

    return notFound(request, response);
}

export function headAllLocations(request, response, dataset, query)
{
    let locations = [... dataset];

    if (query.search)
    {
        const term = query.search.toLowerCase();
        locations = locations.filter(loc => loc.name.toLowerCase().includes(term));
    }

    if (query.sort === "alpha")
    {
        locations.sort((a, b) => a.name.localeCompare(b.name));
    }
    else
    {
        locations.sort((a, b) => b.id - a.id)
    }

    const body = JSON.stringify(locations);

    response.writeHead
    (
        200,
        {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body)
        }
    );

    response.end();
}

export function headLocationNames(request, response, dataset)
{
    const names = dataset.map(loc => loc.name);
    const body = JSON.stringify(names);

    response.writeHead
    (
        200,
        {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body)
        }
    );

    response.end();
}

export function headLocationById(request, response, dataset, id)
{
    const location = dataset.find(loc => String(loc.id) === String(id));

    if (!location)
    {
        const body = JSON.stringify
        (
            {
                error: "Location not found",
                id: "notFound"
            }
        );

        return response.end();
    }

    const body = JSON.stringify(location);

    response.writeHead
    (
        200,
        {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body)
        }
    );

    response.end();
}

export function headRandomLocation(request, response, dataset)
{
    if (dataset.length === 0)
    {
        const body = JSON.stringify
        (
            {
                error: "No locations available",
                id: "noLocations"
            }
        );

        response.writeHead
        (
            404,
            {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(body)
            }
        );

        return response.end();
    }

    const randomIndex = Math.floor(Math.random() * dataset.length);
    const randomLocation = dataset[randomIndex];
    const redirectingURL = `/index.html?loc=${randomLocation.id}`;

    response.writeHead
    (
        302,
        {
            "Location": redirectingURL,
            "Content-Length": 0
        }
    );

    response.end();
}

export function headNotFound(request, response)
{
    const body = JSON.stringify
    (
        {
            error: "Not Found",
            id: "notFound"
        }
    );

    response.writeHead
    (
        404,
        {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body)
        }
    );

    response.end();
}


export function handleHead(request, response, parsedURL, dataset)
{
    const pathname = parsedURL.pathname;

    if (pathname === "/api/locations")
    {
        return headAllLocations(request, response, dataset, parsedURL.query);
    }

    if (pathname === "/api/LocationNames")
    {
        return headLocationNames(request, response, dataset);
    }

    if (pathname.startsWith("/api/locations/"))
    {
        return headRandomLocation(request, response, dataset);
    }

    return headNotFound(request, response);
}

function parseBody(request, callback)
{
    let body = "";

    request.on("data", chunk =>
        {
            body += chunk;
        }
    );

    request.on("end", () =>
        {
            callback(body);
        }
    );
}

export function response400(response, message)
{
    const body = JSON.stringify
    (
        {
            error: message,
            id: "badRequest"
        }
    );

    response.writeHead
    (
        400,
        {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body)
        }
    );

    response.end(body);
}

export function updateLocation(request, response, dataset, id)
{
    parseBody(request, rawBody => 
    {
        let data;

        const contentType = request.headers['content-type'];

        try
        {
            if (contentType === "application/json")
            {
                data = JSON.parse(rawBody);
            }
            else if (contentType === "application/x-www-form-urlencoded")
            {
                data = Object.fromEntries(new URLSearchParams(rawBody));
            }
            else
            {
                return response400(response, "Incorrect content type");
            }
        }
        catch (error)
        {
            return response400(response, "Invalid JSON or WWW form")
        }

        const location = dataset.find(loc => String(loc.id) === String(id));

        if (!location)
        {
            return notFound(request, response);
        }

        if (!data.name && !data.latitude && !data.longitude)
        {
            return response400(response, "One or more required fields are not provided");
        }

        location.name = data.name;
        location.latitude = data.latitude;
        location.longitude = data.longitude;
        location.description = data.description;

        location.metadata = location.metadata || {};
        location.metadata.updatedAt = new Date().toISOString();

        response.writeHead
        (
            204,
            {
                "Content-Length": 0
            }
        );

        response.end();
    })
}

export function handlePost(request, response, parsedURL, dataset)
{
    const pathname = parsedURL.pathname;

    if (pathname === "/api/locations")
    {
        return addLocation(request, response, dataset);
    }

    if (pathname.startsWith("/api/locations/"))
    {
        const id = pathname.split("/")[3];
        return updateLocation(request, response, dataset, id);
    }

    return notFound(request, response);
}