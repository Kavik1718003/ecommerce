const userData =
    localStorage.getItem(
        "cartivaUser"
    );


if (!userData) {

    window.location.href =
        "login.html";
}


const user =
    JSON.parse(userData);


const profileContainer =
    document.getElementById(
        "profileContainer"
    );


profileContainer.innerHTML = `

    <div class="product-card">

        <div class="product-info">

            <h2>
                ${user.name}
            </h2>

            <p>
                Email:
                ${user.email}
            </p>

            <p>
                Phone:
                ${user.phone}
            </p>

            <p>
                Role:
                ${user.role}
            </p>

        </div>

    </div>

`;


// ===============================
// LOGOUT
// ===============================

function logout() {

    localStorage.removeItem(
        "cartivaUser"
    );


    window.location.href =
        "login.html";
}