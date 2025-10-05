export function useAuth() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const address = localStorage.getItem("address");

    return {
        token,
        role,
        address,
        isAuthenticated: !!token,
    };
}
