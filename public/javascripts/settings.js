
document.addEventListener('DOMContentLoaded', () => {
    console.log("Front-End: Page loaded!");
    fetchLinks();
    console.log("Front-End: Links loaded on page!");
});

function fetchLinks() {
    const section = document.getElementById('dashboardSelect').value;
    console.log(`Front-end: fetchLinsk() called for section: ${section}!`);
    fetch(`/data/${section}`)
        .then(response => response.json())
        .then(data => {
            const linksContainer = document.getElementById('dashboardLinks');
            linksContainer.innerHTML = ''; // Clear existing links
            data.links.forEach((link, index) => {
                const linkElement = document.createElement('div');
                linkElement.className = 'link-item';
                linkElement.innerHTML = `
                    <p>${link.url}</p>
                    <div class="edit-delete">
                        <button onclick="deleteLink(${index})">Delete</button>
                    </div>
                `;
                linksContainer.appendChild(linkElement);
            });
        });
}

function addLink() {
    const section = document.getElementById('dashboardSelect').value;
    const newLink = document.getElementById('newLinkInput').value;

    console.log(`Front-End: Sending request to add ${newLink} into section: ${section}`);
    if (!newLink) return;

    fetch(`/data/${section}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newLink })
    }).then(response => {
        if (response.ok) {
            console.log("Front-End: addLinks() response received!");
            fetchLinks(); // Refresh the list
            console.log(``);
            document.getElementById('newLinkInput').value = ''; // Clear input
        } else {
            console.error("Front-End: Error adding link:", response.statusText);
        }
    }).catch(error => {
        console.error("Front-End: Fetch error:", error);
    });
    console.log(`Front-End: addLink() finished!`);
}

function deleteLink(index) {
    const section = document.getElementById('dashboardSelect').value;
    console.log(`Front-End: Sending request to remove from section: ${section}`);


    fetch(`/data/${section}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: index })
    }).then(response => {
        if (response.ok) {
            fetchLinks(); // Refresh the list
        }
    });
    console.log("Front-End: deleteLink() finished!")
}
