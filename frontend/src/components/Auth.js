export async function hasSession() {
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
        if (cookie.includes("session=")) {
            var authData = await checkAuth(cookie.replace("session=", ""));
            if (authData.isAuthorized) {
                return authData;
            }
        }
    }
    return { isAuthorized: false };
}

const checkAuth = async (cookieId) => {
    try {
        const url = `http://localhost:8080/check-auth?cookieId=${cookieId}`;
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            return { isAuthorized: true, user: data };
        } else {
            return { isAuthorized: false };
        }
    } catch (error) {
        console.error("Error:", error);
        return { isAuthorized: false };
    }
};
