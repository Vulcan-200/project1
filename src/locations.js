async function loadLocations()
{
    const response = await fetch("/api/locations",
        {
            headers: { "Accept": "application/json" }
        });

        const locations = await response.json();
        renderLocations(locations);
}

function renderLocations(locations)
{
    const locList = document.querySelector("#locations-list");
    locList.innerHTML = "";

    locations.forEach(loc =>
    {
        const locationCard = document.createElement("div");
        locationCard.className = "location-card";

        const createdDate = loc.metadata?.addedAt ? new Date(loc.metadata.addedAt).toLocaleString() : "Unknown";

        locationCard.innerHTML = 
        `
        <div class="location-header">
            <div class="location-title">${loc.name}</div>
            <div class="location-date">${createdDate}</div>
        </div>

        <div class="location-details">
            <p><strong>Lat: </strong> ${loc.latitude}</p>
            <p><strong> Long: </strong> ${loc.longitude}</p>
            

            <p>${loc.description || "No description provided."}</p>

            ${(loc.photos || []).map(url => `
                <img src="${url}" alt="Location photo">
                `).join("")}

            <a class="goto-link" href="/index.html?loc=${loc.id}">Go to Location</a>

            <button class="btn" data-id=${loc.id}>Edit location</button>
        </div>
        `;

        // Expand/Collapse when clicking the card
        locationCard.addEventListener("click", (e) =>
        {
            if (e.target.classList.contains("delete-btn"))
            {
                return;
            }
            
            const details = locationCard.querySelector(".location-details");
            details.style.display = details.style.display === "block"? "none" : "block";
        });

        locList.appendChild(locationCard);

        const editBtn = locationCard.querySelector(".btn");

        editBtn.addEventListener("click", (e) =>
        {
            e.stopPropagation();

            openEditModal(loc);
        });
    })
}

function openEditModal(loc)
{
    document.querySelector("#update-location-modal").style.display = "flex";

    document.querySelector("#modal-name").value = loc.name;
    document.querySelector("#modal-lat").value = loc.latitude;
    document.querySelector("#modal-long").value = loc.longitude;
    document.querySelector("#modal-desc").value = loc.description;

    document.querySelector("#update-location-modal").dataset.editingId = loc.id;
}

// Event Listeners

document.querySelector("#modal-update-btn").addEventListener("click", async () =>
{
    const modal = document.querySelector("#update-location-modal");
    const editingId = modal.dataset.editingId;

    const name = document.querySelector("#modal-name").value.trim();
    const lat = parseFloat(document.querySelector("#modal-lat").value);
    const long = parseFloat(document.querySelector("#modal-long").value);
    const desc = document.querySelector("#modal-desc").value.trim();

    if (!name || isNaN(lat) || isNaN(long))
    {
        alert("Please enter a valid name and coordinates");
        return;
    }

    const updatedData =
    {
        name,
        latitude: lat,
        longitude: long,
        description: desc
    };

    await fetch(`/api/locations/${editingId}`,
        {
            method: "POST",
            headers:
            {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(updatedData)
        }
    );

    modal.style.display = "none";

    modal.dataset.editingId = "";

    // Clear fields
    document.querySelector("#modal-name").value = "";
    document.querySelector("#modal-lat").value = "";
    document.querySelector("#modal-long").value = "";
    document.querySelector("#modal-desc").value = "";

    loadLocations();
});

document.querySelector("#modal-cancel-btn").addEventListener("click", () =>
{
    const modal = document.querySelector("#update-location-modal");
    modal.style.display = "none";

    modal.dataset.editingId = "";
});

loadLocations();