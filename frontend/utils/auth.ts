"use client";

export function logout() {
    // Remove the token
    document.cookie = "finance_token=; Max-Age=0; path=/";

    // Optional: clear other data
    localStorage.clear();
    sessionStorage.clear();
}


export const isValidToken = (accessToken: string) => {
    if (!accessToken) {
        return false;
    }

    const decoded = jwtDecode(accessToken);

    const currentTime = Date.now() / 1000;

    return decoded.exp > currentTime;
};


export function jwtDecode(token: string) {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
        window
            .atob(base64)
            .split("")
            .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
            .join("")
    );

    return JSON.parse(jsonPayload);
}